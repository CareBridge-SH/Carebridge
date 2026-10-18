#!/usr/bin/env node
/**
 * CareBridge Instagram snapshot validator.
 *
 * Fails loudly, before a bad feed reaches the live site. Dependency-free; run:
 *
 *     node scripts/check-instagram.mjs
 *     # or: npm run check:instagram
 *
 * Exit codes: 0 on a valid snapshot (including the empty array `[]`),
 * non-zero on any hard error. Missing `date` / per-picture `width` / `height` are
 * warnings, not errors.
 *
 * Schema note: a post holds `images: [{ src, alt, width, height }]` — the plural
 * is the point. These are carousels; a post-level `image` + `alt` (which this
 * validator used to accept) could not describe more than one photograph.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = resolve(ROOT, 'src', 'data', 'instagram-posts.json');
const PUBLIC_DIR = resolve(ROOT, 'public');

/** Alt values that are placeholders, not descriptions. */
const PLACEHOLDER_ALTS = new Set(['', 'image', 'photo', 'instagram post']);

let errors = 0;
let warnings = 0;

function fail(message) {
  errors += 1;
  console.error(`FAIL  ${message}`);
}

function warn(message) {
  warnings += 1;
  console.warn(`WARN  ${message}`);
}

function postLabel(post, index) {
  const id = typeof post?.id === 'string' && post.id.trim() !== '' ? post.id : `<no id, index ${index}>`;
  return `post "${id}"`;
}

// 1. Read and parse.
let raw;
try {
  raw = readFileSync(DATA_FILE, 'utf8');
} catch (error) {
  fail(`cannot read ${DATA_FILE}: ${error.message}`);
  console.error(`FAIL  ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

let posts;
try {
  posts = JSON.parse(raw);
} catch (error) {
  fail(`invalid JSON in ${DATA_FILE}: ${error.message}`);
  console.error(`FAIL  ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

// 2. Top level must be an array.
if (!Array.isArray(posts)) {
  fail(`top level must be an array, got ${posts === null ? 'null' : typeof posts}`);
  console.error(`FAIL  ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

// 3. The empty array is a valid, shipped state.
if (posts.length === 0) {
  console.log('PASS  instagram snapshot — empty array is valid (0 posts).');
  process.exit(0);
}

// 4. Validate every entry.
const seenIds = new Set();

for (const [index, post] of posts.entries()) {
  const label = postLabel(post, index);

  if (post === null || typeof post !== 'object' || Array.isArray(post)) {
    fail(`${label}: not an object`);
    continue;
  }

  // id — required, unique.
  if (typeof post.id !== 'string' || post.id.trim() === '') {
    fail(`${label}: \`id\` is required and must be a non-blank string`);
  } else if (seenIds.has(post.id)) {
    fail(`${label}: duplicate \`id\` "${post.id}"`);
  } else {
    seenIds.add(post.id);
  }

  // images — required, one or more pictures, each a local path under /instagram/.
  if (!Array.isArray(post.images) || post.images.length === 0) {
    fail(`${label}: \`images\` is required and must be a non-empty array`);
  } else {
    for (const [pictureIndex, image] of post.images.entries()) {
      const where = `${label} images[${pictureIndex}]`;

      if (image === null || typeof image !== 'object' || Array.isArray(image)) {
        fail(`${where}: not an object`);
        continue;
      }

      if (typeof image.src !== 'string' || image.src.trim() === '') {
        fail(`${where}: \`src\` is required and must be a non-blank string`);
      } else if (/^https?:\/\//i.test(image.src)) {
        fail(
          `${where}: \`src\` is a URL ("${image.src}") — Instagram CDN URLs expire; use a local /instagram/... path`,
        );
      } else if (!image.src.startsWith('/instagram/')) {
        fail(`${where}: \`src\` must start with "/instagram/" (got "${image.src}")`);
      } else if (!existsSync(resolve(PUBLIC_DIR, image.src.replace(/^\//, '')))) {
        fail(`${where}: image file not found on disk: ${image.src}`);
      }

      // alt — per picture, and a real description. Five pictures of five
      // different things need five sentences; one shared alt is indistinguishable
      // to anyone using a screen reader.
      const alt = typeof image.alt === 'string' ? image.alt.trim() : '';
      if (typeof image.alt !== 'string' || PLACEHOLDER_ALTS.has(alt.toLowerCase())) {
        fail(
          `${where}: \`alt\` is required and must be real descriptive text (got ${JSON.stringify(image.alt ?? '')})`,
        );
      }

      // Per-picture, because a carousel genuinely mixes shapes — 1080×1440 next
      // to 805×1073 — and one post-level ratio would shift the layout for the rest.
      if (image.width === undefined || image.height === undefined) {
        warn(`${where}: missing \`width\`/\`height\` — the picture has no intrinsic size`);
      }
    }
  }

  // The half-migrated file: post-level image/alt, left behind by a hand edit.
  if (post.image !== undefined || post.alt !== undefined) {
    fail(
      `${label}: post-level \`image\`/\`alt\` are gone — each picture carries its own \`src\`/\`alt\` inside \`images\``,
    );
  }

  // date — informational only; missing is a warning, not an error.
  if (post.date === undefined || post.date === null || post.date === '') {
    warn(`${label}: missing \`date\` (informational only — never used for sort order)`);
  }
}

// 5. Per-post summary.
console.log('');
console.log('Per-post summary:');
for (const [index, post] of posts.entries()) {
  const label = postLabel(post, index);
  const pictures = Array.isArray(post?.images) ? post.images.length : 0;
  const ok = seenIds.has(post?.id) && pictures > 0;
  console.log(`  ${ok ? 'ok ' : 'BAD'} ${label} — ${pictures} picture(s)`);
}

if (errors > 0) {
  console.error('');
  console.error(`FAIL  ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

console.log('');
console.log(`PASS  instagram snapshot — ${posts.length} post(s), ${warnings} warning(s).`);
process.exit(0);
