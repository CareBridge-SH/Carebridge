#!/usr/bin/env node
/**
 * Fill the site's reserved picture slots with a photograph, at random.
 *
 *     node scripts/rotate-plate-photos.mjs            # re-roll every slot
 *     node scripts/rotate-plate-photos.mjs --dry      # say what it would pick
 *     node scripts/rotate-plate-photos.mjs --seed 7   # same pick every time
 *
 * ## What a "reserved picture slot" is
 *
 * `<Plate slug="…">` reserves a box on the page. `src/data/photos.json` is the
 * manifest: an entry means a photograph fills the box, no entry means the box
 * stays as the engraved flat field. Today the manifest is `{}`, so every slot
 * that renders is a blank box waiting for a picture.
 *
 * Only ONE slot renders blank in the current build — `cover`, the opening plate
 * on Home. The other two slugs in the code are deliberately left blank here:
 *
 *   ledger     only renders when the ledger has no rows; a photograph there
 *              would show a picture where a table of figures is missing, which
 *              is a stronger claim than an empty plate.
 *   instagram  only renders when the feed is empty; that band is a composed
 *              empty state, and a photograph would say "we have posts".
 *
 * So this fills what actually looks empty, and refuses to fill what would lie.
 *
 * ## "Random rotation"
 *
 * Asked for as a stand-in until real photographs exist, so there is no
 * taste in the choice: it takes the middle 3:2 band of a random photograph from
 * everything already in `public/`, writes it to `public/photos/<slug>.webp`, and
 * records the real pixel size in the manifest.
 *
 * The 3:2 crop is not arbitrary — it is the ratio the flat field already
 * reserves (Plate.tsx), so filling the slot cannot move anything on the page.
 * A 3:4 portrait forced into the box would otherwise either distort or reflow.
 *
 * Re-run it to re-roll. Nothing else in the repo changes when you do.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_FILE = resolve(ROOT, 'src', 'data', 'photos.json');
const PUBLIC_DIR = resolve(ROOT, 'public');
const PY_SCRIPT = resolve(ROOT, 'scripts', 'lib', 'image-encode.py');

/**
 * The slots this script will fill, and the shape each one reserves.
 *
 * `ratio` must match the box the Plate renders when empty, or the page moves
 * when the picture lands. `width` is 1.65× the largest rendered width of the
 * hero plate at 1440 (1088 px), enough for a retina screen without shipping a
 * 4 MB file for a picture that will be tinted one colour.
 */
const SLOTS = [
  {
    slug: 'cover',
    ratio: '3:2',
    width: 1800,
    altKey: 'photos.cover.alt',
    where: 'Home — the opening plate',
  },
];

/** Everything already on disk that a plate could use as a stand-in. */
const POOL_DIRS = [join(PUBLIC_DIR, 'photos', 'events'), join(PUBLIC_DIR, 'instagram')];
const POOL_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png']);

const has = (flag) => process.argv.includes(`--${flag}`);

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

if (has('help') || process.argv.includes('-h')) {
  console.log('Fill the reserved picture slots with a random photograph.');
  console.log('  --dry        print the pick, write nothing');
  console.log('  --seed <n>   deterministic pick');
  console.log('  --slug <s>   only this slot (default: every slot)');
  process.exit(0);
}

/* A seeded generator, so "random" can be reproduced when a lucky draw lands and
 * you want that exact photograph again. Mulberry32 — not cryptographic, not
 * trying to be. */
const seedArg = arg('seed');
const seed = seedArg && seedArg !== true ? Number(seedArg) : Math.floor(Math.random() * 2 ** 31);
let state = seed >>> 0;
function random() {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const pool = [];
for (const dir of POOL_DIRS) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (POOL_EXTENSIONS.has(extname(file).toLowerCase())) pool.push(join(dir, file));
  }
}

if (pool.length === 0) {
  console.error(`FAIL  no pictures to rotate — looked in:\n  ${POOL_DIRS.join('\n  ')}`);
  process.exit(1);
}

const only = arg('slug');
const slots = only && only !== true ? SLOTS.filter((slot) => slot.slug === only) : SLOTS;
if (slots.length === 0) {
  console.error(`FAIL  no slot called "${only}"`);
  process.exit(1);
}

const manifestPath = MANIFEST_FILE;
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

/*
 * Independent draws per slot, from the whole pool. A re-roll can land on the
 * same photograph as last time — with twelve candidates that is a 1-in-12
 * chance, and pretending otherwise would need the last pick stored in the
 * manifest, which is more state than a stand-in deserves. `--seed` is the
 * handle for "keep that one".
 */
const jobs = [];
const chosen = [];

for (const slot of slots) {
  const pick = pool[Math.floor(random() * pool.length)];
  chosen.push({ slot, pick });
  jobs.push({
    src: pick,
    dst: join(PUBLIC_DIR, 'photos', `${slot.slug}.webp`),
    crop: slot.ratio,
    width: slot.width,
    quality: 80,
  });
}

if (has('dry')) {
  console.log(`seed ${seed} — dry run, nothing written\n`);
  for (const { slot, pick } of chosen) {
    console.log(`${slot.slug}  ${slot.where}  ${slot.ratio}  <- ${basename(pick)}`);
  }
  console.log(`\n${pool.length} pictures in the pool.`);
  process.exit(0);
}

const python = spawnSync('python', ['-X', 'utf8', PY_SCRIPT], {
  input: JSON.stringify(jobs),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 32,
  // See ingest-instagram-folder.mjs: without UTF-8 mode a non-ASCII path reaches
  // Python mangled by the ANSI code page and every job dies on a path that exists.
  env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
});

if (python.error) {
  console.error(`FAIL  cannot run python: ${python.error.message}`);
  process.exit(1);
}
if (python.status !== 0) {
  console.error(`FAIL  encoding failed:\n${python.stderr.trim()}`);
  process.exit(1);
}

const results = JSON.parse(python.stdout);

chosen.forEach(({ slot, pick }, index) => {
  const result = results[index];
  manifest[slot.slug] = {
    width: result.width,
    height: result.height,
    altKey: slot.altKey,
  };
  console.log(
    `${slot.slug.padEnd(10)} <- ${basename(pick).padEnd(34)} ${result.width}×${result.height}  ${(result.bytes / 1024).toFixed(0)} KB`,
  );
});

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\nseed ${seed} — wrote src/data/photos.json and ${slots.length} picture(s).`);
console.log('Re-run to re-roll: node scripts/rotate-plate-photos.mjs');
