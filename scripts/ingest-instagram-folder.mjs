#!/usr/bin/env node
/**
 * Ingest a folder of Instagram posts into the site, in one command.
 *
 *     node scripts/ingest-instagram-folder.mjs --from "<folder>"
 *     node scripts/ingest-instagram-folder.mjs --from "<folder>" --force
 *     node scripts/ingest-instagram-folder.mjs --from "<folder>" --dry
 *
 * The folder is the thing the operator actually has: one subfolder per post,
 * named for its date, holding that post's pictures in order.
 *
 *     instagram-posts/
 *       20260904/
 *         1.jpg           the picture(s), in filename order
 *         link.txt        optional — the post's permalink
 *         caption.txt     optional — the caption
 *         alt.txt         optional — one description per line, one per picture
 *       20260910/
 *         1.jpg … 5.jpg
 *         link.txt
 *
 * Why a folder rather than `add-instagram-post.mjs` (which still exists, and is
 * the right tool for a single photo): the operator's posts arrive in batches,
 * and a carousel has to be added as ONE post with several pictures. Running the
 * single-photo command five times would create five posts.
 *
 * This script:
 *   1. reads each dated subfolder,
 *   2. downscales + re-encodes every picture to WebP (≤1080 px wide) via Pillow,
 *   3. writes them to `public/instagram/<date>-<shortcode>-<n>.webp`,
 *   4. merges the posts into `src/data/instagram-posts.json`, newest first,
 *   5. runs `check-instagram.mjs`,
 *   6. rolls the whole run back if the validator rejects it.
 *
 * It is idempotent: a post whose id is already in the snapshot is skipped, so
 * re-running after adding one more folder only touches the new folder. `--force`
 * re-ingests (picks up a fixed picture or corrected alt text); `--dry` prints
 * what it would do and writes nothing.
 *
 * The source folder is never modified — no renaming, no deleting, no moving.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = resolve(ROOT, 'src', 'data', 'instagram-posts.json');
const PUBLIC_INSTAGRAM = resolve(ROOT, 'public', 'instagram');
const CHECK_SCRIPT = resolve(ROOT, 'scripts', 'check-instagram.mjs');
const PY_SCRIPT = resolve(ROOT, 'scripts', 'lib', 'instagram-image.py');

/** Image formats the encoder can actually read. HEIC is deliberately absent. */
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Instagram's own upload ceiling, and plenty for a 320 px tile. */
const MAX_WIDTH = 1080;

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exit(1);
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(
    [
      'Ingest a folder of Instagram posts (one dated subfolder per post).',
      '',
      'Required: --from "<folder>"',
      'Optional: --force  (re-ingest posts that already exist)',
      '          --dry    (print the plan, write nothing)',
      '',
      'Example:',
      '  node scripts/ingest-instagram-folder.mjs \\',
      '    --from "D:\\桌面\\Carebridge-internal\\samples\\instagram-posts"',
    ].join('\n'),
  );
  process.exit(0);
}

const from = arg('from');
const force = process.argv.includes('--force');
const dry = process.argv.includes('--dry');

if (!from || from === true) fail('--from "<folder>" is required');
if (!existsSync(from)) fail(`--from: no such folder: ${from}`);
if (!statSync(from).isDirectory()) fail(`--from: not a folder: ${from}`);

/**
 * `1.jpg, 2.jpg, 10.jpg` — numeric-aware, because the folder names pictures the
 * way a phone does and a plain string sort puts 10 before 2, which silently
 * puts a carousel's tenth picture second.
 */
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function readOptional(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

/** `20260910` → `2026-09-10`. */
function folderDate(name) {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(name);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Reject 20260231: Date rolls it forward to March, so compare the parts back.
  if (date.toISOString().slice(0, 10) !== `${y}-${m}-${d}`) return null;
  return `${y}-${m}-${d}`;
}

/**
 * The shortcode from a post permalink — the /p/<code>/ segment.
 *
 * Query parameters are stripped, which matters: a permalink copied from the app
 * is `…/p/DdGw…/?igsh=…&utm_source=qr`, and those tracking tokens are ephemeral
 * and ugly in a published href. The share sheet's `igsh` is not part of the post.
 */
function shortcodeOf(link) {
  if (typeof link !== 'string') return null;
  const match = /\/p\/([A-Za-z0-9_-]+)/.exec(link);
  return match ? match[1] : null;
}

function cleanLink(link) {
  if (typeof link !== 'string') return null;
  const trimmed = link.split(/\s+/)[0];
  return trimmed.split(/[?#]/)[0].replace(/\/?$/, '/');
}

// ---------------------------------------------------------------------------
// 1. Read the folder.
// ---------------------------------------------------------------------------

const folders = readdirSync(from)
  .filter((name) => statSync(join(from, name)).isDirectory())
  .sort(collator.compare);

if (folders.length === 0) fail(`no subfolders in ${from} — expected one dated folder per post`);

const found = [];
const skipped = [];

for (const name of folders) {
  const dir = join(from, name);
  const date = folderDate(name);

  if (!date) {
    skipped.push(`${name} — folder name is not YYYYMMDD`);
    continue;
  }

  const files = readdirSync(dir);
  const pictures = files
    .filter((file) => EXTENSIONS.has(extname(file).toLowerCase()))
    .sort(collator.compare);

  if (pictures.length === 0) {
    skipped.push(`${name} — no jpg/png/webp pictures`);
    continue;
  }

  const heic = files.filter((file) => extname(file).toLowerCase() === '.heic');
  if (heic.length > 0) {
    skipped.push(`${name} — ${heic.length} HEIC file(s); export as JPEG and re-run`);
  }

  const link = cleanLink(readOptional(join(dir, 'link.txt')));
  const code = shortcodeOf(link);
  const id = `${date}-${code ?? name}`;

  const caption = (readOptional(join(dir, 'caption.txt')) ?? '').trim();

  /*
   * One description per line, one line per picture.
   *
   * There is no honest fallback here. A generic alt ("a photograph") is worse
   * than useless to someone who cannot see the picture, and inventing one would
   * be fabrication — so a post with no alt.txt gets a warning that names the file
   * to create, and its pictures carry a bracketed placeholder so the validator
   * (and therefore the build) still fails visibly rather than silently shipping.
   */
  const altLines = (readOptional(join(dir, 'alt.txt')) ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  found.push({ name, dir, date, pictures, link, caption, altLines, id });
}

if (found.length === 0) {
  fail(`nothing to ingest. Skipped:\n  ${skipped.join('\n  ') || '(none)'}`);
}

// ---------------------------------------------------------------------------
// 2. Decide what is new.
// ---------------------------------------------------------------------------

const originalJson = readFileSync(DATA_FILE, 'utf8');
let existing;
try {
  existing = JSON.parse(originalJson);
} catch (error) {
  fail(`cannot parse ${DATA_FILE}: ${error.message}`);
}
if (!Array.isArray(existing)) fail(`top level of ${DATA_FILE} must be an array`);

const existingIds = new Set(existing.map((post) => post?.id));

const work = found.filter((post) => force || !existingIds.has(post.id));
const unchanged = found.filter((post) => !work.includes(post));

if (work.length === 0) {
  console.log(`Nothing to do — all ${found.length} post(s) are already in the snapshot.`);
  console.log('Re-run with --force to rebuild them.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 3. Encode. One Python process for every picture, not one per picture.
// ---------------------------------------------------------------------------

const jobs = [];
for (const post of work) {
  post.images = post.pictures.map((file, index) => ({
    src: join(post.dir, file),
    dst: resolve(PUBLIC_INSTAGRAM, `${post.id}-${index + 1}.webp`),
    maxWidth: MAX_WIDTH,
  }));
  jobs.push(...post.images);
}

if (dry) {
  console.log('DRY RUN — nothing written.\n');
  for (const post of work) {
    console.log(`${post.id}  ${post.date}  ${post.pictures.length} picture(s)`);
    for (const [index, file] of post.pictures.entries()) {
      console.log(`  ${index + 1}. ${file}`);
    }
    console.log(`  caption: ${post.caption ? 'yes' : 'no'}   link: ${post.link ?? 'none'}`);
    console.log(`  alt lines: ${post.altLines.length} (need ${post.pictures.length})`);
  }
  console.log(`\n${work.length} post(s), ${jobs.length} picture(s) would be encoded.`);
  process.exit(0);
}

const python = spawnSync('python', ['-X', 'utf8', PY_SCRIPT], {
  input: JSON.stringify(jobs),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 32,
  /*
   * `-X utf8` and PYTHONUTF8 are load-bearing on Windows, not tidiness.
   *
   * Python's default stdin/stdout encoding here follows the ANSI code page
   * (cp936 on a Chinese Windows install), so a JSON path containing 桌面
   * arrives at the encoder mangled and every job fails with
   * FileNotFoundError on a path that plainly exists. Forcing UTF-8 mode on the
   * child is the only part of this the parent controls.
   */
  env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
});

if (python.error) {
  fail(
    `cannot run \`python\`: ${python.error.message}. The encoder needs Python 3 with Pillow (scripts/lib/instagram-image.py).`,
  );
}
if (python.status !== 0) {
  fail(`image encoding failed:\n${python.stderr.trim()}`);
}

let encoded;
try {
  encoded = JSON.parse(python.stdout);
} catch {
  fail(`image encoder returned something unreadable:\n${python.stdout.slice(0, 400)}`);
}

const writtenFiles = encoded.map((result) => result.dst);

// ---------------------------------------------------------------------------
// 4. Build the posts and merge.
// ---------------------------------------------------------------------------

const placeholderNote = [];

let cursor = 0;
for (const post of work) {
  const dimensions = encoded.slice(cursor, cursor + post.pictures.length);
  cursor += post.pictures.length;

  post.images = post.images.map((image, index) => {
    const result = dimensions[index];
    const alt = post.altLines[index];

    if (!alt) {
      placeholderNote.push(`${post.id} picture ${index + 1} (${post.pictures[index]})`);
    }

    return {
      src: `/instagram/${post.id}-${index + 1}.webp`,
      /*
       * The fallback says where the picture is from, not what is in it, because
       * the script cannot see the picture and guessing would be fabrication.
       * It is a safe floor, not a description: the warning at the end of the run
       * names every picture still sitting on it.
       */
      alt:
        alt ??
        `CareBridge post of ${post.date}, picture ${index + 1} of ${post.pictures.length}.`,
      width: result.width,
      height: result.height,
    };
  });
}

/*
 * One line per picture, or the whole thing is refused — checked before anything
 * is written. Taking line 1 for every picture in a five-picture carousel is how
 * five different photographs end up with the same description, the exact failure
 * the plural schema exists to prevent.
 */
for (const post of found) {
  if (post.altLines.length > post.pictures.length) {
    fail(
      `${post.dir}: alt.txt has ${post.altLines.length} lines for ${post.pictures.length} picture(s) — one line per picture, in picture order`,
    );
  }
}

const kept = existing.filter((post) => !work.some((item) => item.id === post?.id));

const merged = [...kept, ...work.map((post) => {
  const entry = { id: post.id, date: post.date, images: post.images };
  if (post.caption) entry.caption = post.caption;
  if (post.link) entry.permalink = post.link;
  return entry;
})];

// Newest first, and the id as the tie-break so the order is stable between runs.
merged.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.id.localeCompare(b.id));

mkdirSync(PUBLIC_INSTAGRAM, { recursive: true });
writeFileSync(DATA_FILE, `${JSON.stringify(merged, null, 2)}\n`);

// ---------------------------------------------------------------------------
// 5. Validate, and roll everything back if it fails.
// ---------------------------------------------------------------------------

const check = spawnSync(process.execPath, [CHECK_SCRIPT], { stdio: 'inherit' });
if (check.status !== 0) {
  rmSync(writtenFiles, { force: true });
  writeFileSync(DATA_FILE, originalJson);
  fail('check-instagram.mjs rejected the snapshot — rolled back; nothing was added.');
}

// ---------------------------------------------------------------------------
// 6. Report.
// ---------------------------------------------------------------------------

const totalBytes = encoded.reduce((sum, result) => sum + result.bytes, 0);

console.log('');
console.log(`Ingested ${work.length} post(s), ${encoded.length} picture(s), ${(totalBytes / 1024).toFixed(0)} KB.`);
for (const post of work) {
  console.log(`  ${post.id} — ${post.images.length} picture(s)${post.caption ? '' : ', no caption'}`);
}
if (unchanged.length > 0) {
  console.log(`  (${unchanged.length} post(s) already present, left untouched — --force to rebuild)`);
}

if (placeholderNote.length > 0) {
  console.log('');
  console.log('⚠  NO ALT TEXT — these pictures shipped with a "CareBridge post of <date>" fallback:');
  for (const item of placeholderNote) console.log(`     ${item}`);
  console.log('   Put one real description per line in alt.txt in each folder, then re-run with --force.');
}

console.log('');
console.log('Run `npm run build` to ship it.');
