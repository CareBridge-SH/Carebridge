#!/usr/bin/env node
/**
 * CareBridge Instagram post adder — one command to add a photo to the snapshot.
 *
 * Copies the image into `public/instagram/` under a date-prefixed slug (so a
 * reused filename can never serve a stale cached image), reads its real
 * dimensions, appends the post to `src/data/instagram-posts.json` at the top,
 * runs the validator, and rolls the whole change back if the validator rejects
 * it. Dependency-free.
 *
 *     node scripts/add-instagram-post.mjs \
 *       --image ~/pics/fall-workshop.jpg \
 *       --alt "Students painting pumpkins at a workshop table" \
 *       --caption "Our fall DIY workshop — bracelets and painted pumpkins." \
 *       --date 2026-10-24 \
 *       --permalink https://www.instagram.com/p/XXXX/
 *
 * Required: --image <path>, --alt "<text>". Optional: --caption, --date
 * (YYYY-MM-DD; defaults to today), --permalink. Exit 0 on success, 1 on any
 * error. `--help` prints this.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  rmSync,
} from 'node:fs';
import { dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = resolve(ROOT, 'src', 'data', 'instagram-posts.json');
const PUBLIC_INSTAGRAM = resolve(ROOT, 'public', 'instagram');
const CHECK_SCRIPT = resolve(ROOT, 'scripts', 'check-instagram.mjs');

/** Alt values that are placeholders, not descriptions (mirrors the validator). */
const PLACEHOLDER_ALTS = new Set(['', 'image', 'photo', 'instagram post']);

/** Return the image file extension for a magic-byte sniff, or null. */
function sniffType(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length >= 8 && b.toString('latin1', 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (b.length >= 12 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  if (b.length >= 6) {
    const sig = b.toString('latin1', 0, 6);
    if (sig === 'GIF87a' || sig === 'GIF89a') return 'gif';
  }
  return null;
}

/** Read intrinsic width/height from JPEG SOF / PNG IHDR / WebP / GIF headers. */
function readDimensions(b, type) {
  if (type === 'png' && b.length >= 24) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  if (type === 'gif' && b.length >= 10) {
    return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  }
  if (type === 'jpg') {
    let off = 2;
    while (off + 9 < b.length) {
      if (b[off] !== 0xff) {
        off += 1;
        continue;
      }
      const marker = b[off + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: b.readUInt16BE(off + 5), width: b.readUInt16BE(off + 7) };
      }
      const segLen = b.readUInt16BE(off + 2);
      if (segLen < 2) break;
      off += 2 + segLen;
    }
    return null;
  }
  if (type === 'webp' && b.length >= 30) {
    const chunk = b.toString('latin1', 12, 16);
    if (chunk === 'VP8X' && b.length >= 30) {
      return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
    }
    if (chunk === 'VP8L' && b.length >= 25) {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ' && b.length >= 30) {
      return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    }
  }
  return null;
}

/** A safe filename slug from the source basename. */
function slugify(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'post';
}

/** Local date as YYYY-MM-DD. */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exit(1);
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(
    [
      'Add a photo to the Instagram snapshot in one command.',
      '',
      'Required: --image <path>  --alt "<real alt text>"',
      'Optional: --caption "<text>"  --date YYYY-MM-DD  --permalink <url>',
      '',
      'Example:',
      '  node scripts/add-instagram-post.mjs --image ~/pics/fall-workshop.jpg \\',
      '    --alt "Students painting pumpkins at a workshop table" \\',
      '    --date 2026-10-24',
    ].join('\n'),
  );
  process.exit(0);
}

const imageSrc = arg('image');
const alt = arg('alt');
const caption = arg('caption');
const date = arg('date');
const permalink = arg('permalink');

// 1. Required fields.
if (!imageSrc) fail('--image <path> is required');
if (!alt || alt.trim() === '') fail('--alt "<real alt text>" is required');

const trimmedAlt = alt.trim();
if (PLACEHOLDER_ALTS.has(trimmedAlt.toLowerCase())) {
  fail(
    `--alt is a placeholder ("${alt}") — write a real description, e.g. "Students painting pumpkins at a workshop table"`,
  );
}

// 2. Read the source image and reject anything that is not really an image.
if (!existsSync(imageSrc)) fail(`--image: no such file: ${imageSrc}`);

const bytes = readFileSync(imageSrc);
const ext = sniffType(bytes);
if (!ext) {
  fail(
    `--image: not a recognised image (magic bytes ${bytes.subarray(0, 8).toString('hex')}) — only jpeg/png/webp/gif are accepted`,
  );
}

const dimensions = readDimensions(bytes, ext);

// 3. Date-prefixed slug and derived id.
const slug = slugify(basename(imageSrc, extname(imageSrc)));
const dateStr = (date || today()).trim();
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
  fail(`--date must be YYYY-MM-DD (got "${dateStr}")`);
}
const filename = `${dateStr}-${slug}.${ext}`;
const id = `${dateStr}-${slug}`;
const targetPath = resolve(PUBLIC_INSTAGRAM, filename);

// 4. Read the existing snapshot and refuse a duplicate id.
const originalJson = readFileSync(DATA_FILE, 'utf8');
let posts;
try {
  posts = JSON.parse(originalJson);
} catch (error) {
  fail(`cannot parse ${DATA_FILE}: ${error.message}`);
}
if (!Array.isArray(posts)) fail(`top level of ${DATA_FILE} must be an array`);
if (posts.some((post) => post && post.id === id)) {
  fail(`a post with id "${id}" already exists`);
}

// 5. Do the work: copy, append, write, validate — and roll back on failure.
copyFileSync(imageSrc, targetPath);

const post = { id, image: `/instagram/${filename}`, alt: trimmedAlt };
if (dimensions) {
  post.width = dimensions.width;
  post.height = dimensions.height;
}
if (caption) post.caption = caption;
if (dateStr) post.date = dateStr;
if (permalink) post.permalink = permalink;

posts.unshift(post);
writeFileSync(DATA_FILE, `${JSON.stringify(posts, null, 2)}\n`);

const check = spawnSync(process.execPath, [CHECK_SCRIPT], { stdio: 'inherit' });
if (check.status !== 0) {
  // Roll back the whole change — never leave a half-added post behind.
  rmSync(targetPath, { force: true });
  writeFileSync(DATA_FILE, originalJson);
  fail('check-instagram.mjs rejected the snapshot — rolled back; nothing was added.');
}

console.log(
  `Added post "${id}" (${filename}) at the top of src/data/instagram-posts.json (${posts.length} post(s) total).`,
);
console.log('Run `npm run build` to ship it.');
