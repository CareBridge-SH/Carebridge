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
 * non-zero on any hard error. Missing `date` / `width` / `height` are warnings,
 * not errors.
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

  // image — required, local path under /instagram/, never an http(s) URL.
  if (typeof post.image !== 'string' || post.image.trim() === '') {
    fail(`${label}: \`image\` is required and must be a non-blank string`);
  } else if (/^https?:\/\//i.test(post.image)) {
    fail(`${label}: \`image\` is a URL ("${post.image}") — Instagram CDN URLs expire; use a local /instagram/... path`);
  } else if (!post.image.startsWith('/instagram/')) {
    fail(`${label}: \`image\` must start with "/instagram/" (got "${post.image}")`);
  } else if (!existsSync(resolve(PUBLIC_DIR, post.image.replace(/^\//, '')))) {
    fail(`${label}: image file not found on disk: ${post.image}`);
  }

  // alt — required, real description.
  const alt = typeof post.alt === 'string' ? post.alt.trim() : '';
  if (typeof post.alt !== 'string' || PLACEHOLDER_ALTS.has(alt.toLowerCase())) {
    fail(`${label}: \`alt\` is required and must be real descriptive text (got ${JSON.stringify(post.alt ?? '')})`);
  }

  // date — informational only; missing is a warning, not an error.
  if (post.date === undefined || post.date === null || post.date === '') {
    warn(`${label}: missing \`date\` (informational only — never used for sort order)`);
  }

  // width/height — optional, but missing them causes layout shift.
  if (post.width === undefined || post.height === undefined) {
    warn(`${label}: missing \`width\`/\`height\` — the tile falls back to a 1:1 aspect box`);
  }
}

// 5. Per-post summary.
console.log('');
console.log('Per-post summary:');
for (const [index, post] of posts.entries()) {
  const label = postLabel(post, index);
  const ok = seenIds.has(post?.id) && typeof post?.image === 'string' && post.image.startsWith('/instagram/') && typeof post?.alt === 'string' && !PLACEHOLDER_ALTS.has(post.alt.trim().toLowerCase());
  console.log(`  ${ok ? 'ok ' : 'BAD'} ${label} — ${post?.image ?? '<no image>'}`);
}

if (errors > 0) {
  console.error('');
  console.error(`FAIL  ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

console.log('');
console.log(`PASS  instagram snapshot — ${posts.length} post(s), ${warnings} warning(s).`);
process.exit(0);
