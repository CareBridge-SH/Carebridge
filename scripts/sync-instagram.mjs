#!/usr/bin/env node
/**
 * CareBridge Instagram snapshot sync.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT A LIVE WIDGET
 *
 * A live Instagram embed cannot work on this site, for two independent reasons:
 *
 *   1. Instagram is unreachable from mainland China, and the site is for a
 *      Shanghai club. A visitor there would see a spinner that never resolves.
 *   2. Instagram's CDN URLs are signed and expire. `types.ts` records that a
 *      direct integration was removed for exactly this: the images broke weeks
 *      later with nothing to warn anyone.
 *
 * Both problems disappear if the *browser* never talks to Instagram. So the
 * fetching happens here instead -- on a machine outside China's network, on a
 * schedule -- and everything it finds is copied into this repository: the post
 * metadata as JSON, and the actual image bytes into `public/instagram/`. The
 * site then serves its own files, which means the photographs are visible to a
 * visitor in Shanghai even though instagram.com is not.
 *
 * That is the trade: "live" becomes "refreshed on a schedule" (six hours by
 * default), in exchange for actually being reachable by the audience.
 *
 * USAGE
 *
 *   node scripts/sync-instagram.mjs                 # normal run (fail-soft)
 *   node scripts/sync-instagram.mjs --dry-run       # say what would change
 *   node scripts/sync-instagram.mjs --strict        # exit 1 on any failure
 *   node scripts/sync-instagram.mjs --from-file f   # read a recorded response
 *
 * SOURCES, in priority order (first one configured wins):
 *
 *   1. --from-file <path>      a JSON file, for offline/testing runs
 *   2. INSTAGRAM_FEED_URL      any JSON feed (e.g. a hosted feed service)
 *   3. INSTAGRAM_TOKEN         the official Instagram Graph API
 *                              (optionally with INSTAGRAM_USER_ID; default "me")
 *   4. nothing configured      prints setup instructions, exits 0
 *
 * Fail-soft is deliberate. If Instagram is down, or the token expired, or the
 * network is blocked, the previous snapshot stays exactly where it is and the
 * site keeps working. A stale photograph is a much smaller problem than an
 * empty section, and a red build every six hours trains people to ignore it.
 *
 * TWO THINGS THIS SCRIPT LEARNED THE HARD WAY, both now guarded below:
 *
 *   * A download that returns HTTP 200 is not necessarily an image. An SPA host
 *     answers unknown paths with the index page, and a CDN can answer with an
 *     HTML error page. Trusting `res.ok` stored HTML in a file named `.jpg`.
 *     The bytes are sniffed now, not the status line.
 *   * `process.exit()` while a fetch handle is still closing trips a libuv
 *     assertion on Windows ("UV_HANDLE_CLOSING") and the process dies with a
 *     nonsense exit code. This script sets `process.exitCode` and returns
 *     instead, and clears its own timeouts, so the loop drains on its own.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = join(ROOT, 'src', 'data', 'instagram-posts.json');
const ALT_OVERRIDES = join(ROOT, 'src', 'data', 'instagram-alt-overrides.json');
const IMAGE_DIR = join(ROOT, 'public', 'instagram');
const VALIDATOR = join(ROOT, 'scripts', 'check-instagram.mjs');

/** Files this script owns. It will never delete anything that does not match,
 *  so hand-added photographs under public/instagram/ are safe. */
const OWNED_PREFIX = 'ig-';

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? undefined : argv[i + 1];
};

const DRY_RUN = has('--dry-run');
const STRICT = has('--strict');
const FROM_FILE = valueOf('--from-file');
const LIMIT = Number(process.env.INSTAGRAM_LIMIT || 12);
const GRAPH_VERSION = 'v21.0';
const REQUEST_TIMEOUT_MS = 30000;

/** Thrown to stop early. Carries the exit code; never printed. */
class Stop extends Error {
  constructor(code) {
    super('stop');
    this.code = code;
  }
}

const warn = (m) => console.warn(`WARN  ${m}`);
const info = (m) => console.log(`      ${m}`);

/**
 * Strip a secret out of anything we are about to print. Tokens arrive in query
 * strings; the build logs of a public repository are public.
 */
function redact(text) {
  return String(text)
    .replace(/(access_token=)[^&\s]+/gi, '$1<redacted>')
    .replace(/\bIG[A-Za-z0-9]{20,}\b/g, '<redacted>');
}

function die(message) {
  console.error(`FAIL  ${message}`);
  if (STRICT) throw new Stop(1);
  console.error('      (fail-soft: the existing snapshot is untouched)');
  throw new Stop(0);
}

/**
 * fetch with an explicit AbortController rather than AbortSignal.timeout, so
 * the timer is cleared and nothing keeps the event loop alive after we are done.
 */
async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

async function fetchJson(url, label) {
  info(`fetching ${label}`);
  let res;
  try {
    res = await fetchWithTimeout(url, {
      headers: { accept: 'application/json', 'user-agent': 'CareBridge-Website-Sync' },
    });
  } catch (error) {
    die(`${label} could not be reached: ${error.name}: ${error.message}`);
  }
  const body = await res.text();
  if (!res.ok) die(`${label} returned ${res.status} ${res.statusText}: ${redact(body).slice(0, 300)}`);
  try {
    return JSON.parse(body);
  } catch {
    die(`${label} did not return JSON (first 200 chars): ${redact(body).slice(0, 200)}`);
  }
}

async function loadRaw() {
  if (FROM_FILE) {
    const path = resolve(process.cwd(), FROM_FILE);
    if (!existsSync(path)) die(`--from-file: no such file: ${path}`);
    info(`reading ${path}`);
    return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  }

  if (process.env.INSTAGRAM_FEED_URL) {
    return fetchJson(process.env.INSTAGRAM_FEED_URL, 'INSTAGRAM_FEED_URL');
  }

  const token = process.env.INSTAGRAM_TOKEN;
  if (token) {
    const userId = process.env.INSTAGRAM_USER_ID || 'me';
    const fields = [
      'id',
      'caption',
      'media_type',
      'media_url',
      'thumbnail_url',
      'permalink',
      'timestamp',
      'children{media_url,media_type}',
    ].join(',');
    const url =
      `https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(userId)}/media` +
      `?fields=${encodeURIComponent(fields)}&limit=${LIMIT}&access_token=${encodeURIComponent(token)}`;
    return fetchJson(url, 'the Instagram Graph API');
  }

  console.log('SKIP  no Instagram source is configured, so nothing to sync.');
  console.log('');
  console.log('      Set ONE of these and run again (see docs/INSTAGRAM.md):');
  console.log('        INSTAGRAM_TOKEN + INSTAGRAM_USER_ID   official Graph API');
  console.log('        INSTAGRAM_FEED_URL                    any hosted JSON feed');
  console.log('');
  console.log('      No credential-free source exists: Instagram serves no post data to');
  console.log('      logged-out requests, and the mirrors that used to are all behind bot');
  console.log('      challenges now. That was measured, not assumed.');
  throw new Stop(0);
}

// ---------------------------------------------------------------------------
// Normalising whatever the provider returned into our own shape
// ---------------------------------------------------------------------------

const firstOf = (...v) => v.find((x) => typeof x === 'string' && x.trim() !== '');

/** Accepts the Graph API shape, a hosted-feed shape, or a bare array. */
function rawItems(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['data', 'posts', 'items', 'media']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  die(`could not find a list of posts in the response (keys: ${Object.keys(payload || {}).join(', ') || 'none'})`);
}

function imageUrlOf(item) {
  const direct = firstOf(
    item.media_url,
    item.mediaUrl,
    item.image,
    item.imageUrl,
    item.thumbnail_url,
    item.thumbnailUrl,
  );
  if (direct) return direct;
  const child = item.children?.data?.[0] || item.children?.[0];
  return child ? firstOf(child.media_url, child.mediaUrl, child.image) : undefined;
}

/** Instagram permalinks end in /p/<shortcode>/ or /reel/<shortcode>/. */
function shortcodeOf(item) {
  const fromPermalink = firstOf(item.permalink)?.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)?.[1];
  return fromPermalink || String(item.id ?? '').trim() || undefined;
}

function isoDate(value) {
  if (!value) return undefined;
  const d = new Date(/^\d+$/.test(String(value)) ? Number(value) * 1000 : value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

/** Magic bytes. The status line and the Content-Type header both lie. */
function sniffImage(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (buf.length > 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'webp';
  }
  if (buf.length > 3 && buf.subarray(0, 3).toString('latin1') === 'GIF') return 'gif';
  return undefined;
}

/**
 * Intrinsic image size, read from the bytes. Instagram's API does not report
 * dimensions, and the tiles need them to reserve space before the image loads.
 * Dependency-free on purpose: JPEG and PNG cover what Instagram serves.
 */
function imageSize(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      const length = buf.readUInt16BE(i + 2);
      const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      i += 2 + length;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

try {
  // A hand-edited JSON file on Windows picks up a BOM sooner or later, and
  // JSON.parse rejects one outright with a message that does not mention it.
  const overrides = existsSync(ALT_OVERRIDES)
    ? JSON.parse(readFileSync(ALT_OVERRIDES, 'utf8').replace(/^\uFEFF/, ''))
    : {};
  const payload = await loadRaw();
  const items = rawItems(payload).slice(0, LIMIT);
  info(`${items.length} post(s) offered by the source`);

  if (!existsSync(IMAGE_DIR) && !DRY_RUN) mkdirSync(IMAGE_DIR, { recursive: true });

  const posts = [];
  const keepFiles = new Set();
  let skipped = 0;

  for (const item of items) {
    const shortcode = shortcodeOf(item);
    if (!shortcode) {
      skipped += 1;
      warn('a post has no id or shortcode and was skipped');
      continue;
    }

    const url = imageUrlOf(item);
    if (!url) {
      skipped += 1;
      warn(`post "${shortcode}": no image URL in the response, skipped`);
      continue;
    }

    /*
     * Alt text is REQUIRED by the validator, and an automated feed cannot write
     * a description of a photograph it has never seen. So, in order:
     *
     *   1. `src/data/instagram-alt-overrides.json` -- a human wrote it; trust it.
     *   2. the caption -- usually descriptive, and better than nothing.
     *   3. skip the post.
     *
     * Option 3 is the important one. `alt="Instagram post"` satisfies nothing
     * (the validator rejects it outright), and a silently undescribed image is
     * an inaccessible page. Better to leave the photograph out and say so
     * loudly, so a person can add an override.
     */
    const caption = firstOf(item.caption, item.prunedCaption, item.text);
    const alt = firstOf(overrides[shortcode], caption);
    if (!alt) {
      skipped += 1;
      warn(
        `post "${shortcode}": no caption and no entry in instagram-alt-overrides.json, ` +
          `so it was SKIPPED rather than published without a description`,
      );
      continue;
    }

    let buf;
    try {
      const res = await fetchWithTimeout(url, { headers: { accept: 'image/*' } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      buf = Buffer.from(await res.arrayBuffer());
    } catch (error) {
      skipped += 1;
      warn(`post "${shortcode}": image download failed (${error.message}), skipped`);
      continue;
    }

    // The bytes decide, not the status code. See the header comment.
    const format = sniffImage(buf);
    if (!format) {
      skipped += 1;
      warn(
        `post "${shortcode}": the response was ${buf.length} bytes but not an image ` +
          `(starts with ${JSON.stringify(buf.subarray(0, 40).toString('utf8').replace(/\s+/g, ' '))}). ` +
          `Skipped -- an error page stored under a .jpg name is worse than no image.`,
      );
      continue;
    }
    if (format === 'gif') {
      skipped += 1;
      warn(`post "${shortcode}": GIF images are not supported, skipped`);
      continue;
    }

    const filename = `${OWNED_PREFIX}${shortcode}.${format === 'jpeg' ? 'jpg' : format}`;
    keepFiles.add(filename);
    if (!DRY_RUN) writeFileSync(join(IMAGE_DIR, filename), buf);

    const size = imageSize(buf);
    if (!size) warn(`post "${shortcode}": could not read image dimensions; the tile will use a 1:1 box`);
    if (buf.length > 250 * 1024) {
      warn(`post "${shortcode}": image is ${Math.round(buf.length / 1024)} KB (guideline is 250 KB)`);
    }

    const mediaType = String(firstOf(item.media_type, item.mediaType, item.type) || '').toUpperCase();
    const date = isoDate(item.timestamp);

    posts.push({
      id: shortcode,
      image: `/instagram/${filename}`,
      alt,
      ...(firstOf(item.permalink) ? { permalink: item.permalink } : {}),
      ...(caption ? { caption } : {}),
      ...(mediaType === 'VIDEO' ? { isVideo: true } : {}),
      // ISO, deliberately: this string is rendered as-is on BOTH language pages,
      // so a human-formatted English date would read as untranslated text on the
      // Chinese one. See docs/INSTAGRAM.md before changing the format.
      ...(date ? { date } : {}),
      ...(size || {}),
    });
  }

  // Prune only the files this script owns and no longer references.
  let pruned = 0;
  if (existsSync(IMAGE_DIR)) {
    for (const name of readdirSync(IMAGE_DIR)) {
      if (!name.startsWith(OWNED_PREFIX) || keepFiles.has(name)) continue;
      pruned += 1;
      info(`pruning unused image ${name}`);
      if (!DRY_RUN) rmSync(join(IMAGE_DIR, name), { force: true });
    }
  }

  const next = JSON.stringify(posts, null, 2) + '\n';
  const previous = existsSync(DATA_FILE) ? readFileSync(DATA_FILE, 'utf8') : '';

  /*
   * A transient empty answer must not erase the section. Providers have bad
   * minutes; an account that has posts returning a 200 with no items is far more
   * likely to be a hiccup than a mass deletion, and the result would look like
   * "the photographs vanished" with nothing in the logs. Emptying a snapshot has
   * to be asked for explicitly.
   */
  const previousCount = (() => {
    try {
      const parsed = JSON.parse(previous);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  })();
  if (posts.length === 0 && previousCount > 0 && !has('--allow-empty')) {
    die(
      `the source returned no usable posts, but the current snapshot has ${previousCount}. ` +
        `Refusing to wipe it -- re-run with --allow-empty if that is genuinely correct.`,
    );
  }

  if (next === previous && pruned === 0) {
    console.log(`OK    snapshot already up to date (${posts.length} post(s)); nothing written.`);
    throw new Stop(0);
  }

  if (DRY_RUN) {
    console.log(`OK    dry run: would write ${posts.length} post(s), prune ${pruned} image(s).`);
    throw new Stop(0);
  }

  writeFileSync(DATA_FILE, next);
  console.log(`OK    wrote ${posts.length} post(s) to src/data/instagram-posts.json (${skipped} skipped)`);

  /*
   * Verify our own output before anyone commits it. This is the same validator
   * the build runs, so a snapshot the build would reject is rolled back here
   * rather than pushed.
   */
  const check = spawnSync(process.execPath, [VALIDATOR], { encoding: 'utf8' });
  if (check.status !== 0) {
    console.error(check.stdout || '');
    console.error(check.stderr || '');
    writeFileSync(DATA_FILE, previous);
    console.error('FAIL  the snapshot failed validation, so it was rolled back. See above.');
    throw new Stop(STRICT ? 1 : 0);
  }
  console.log('OK    check-instagram.mjs accepts the new snapshot');
} catch (error) {
  if (!(error instanceof Stop)) throw error;
  process.exitCode = error.code;
}
