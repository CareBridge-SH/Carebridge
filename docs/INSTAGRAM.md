# CareBridge Instagram — how to add or change a photo

> **The whole system in one sentence:** adding a photo means editing **one JSON
> file** and **dropping one image file** into a folder — nothing else, no code.
> This page is written so that anyone who has never seen this project can do it
> from these instructions alone.

---

## 1. The 30-second version

The feed the **browser** sees is a static snapshot: a JSON list of posts plus
image files, bundled into the site at build time. The browser never contacts
Instagram — see §9 for why that is not a limitation but the whole point.

To add a photo you touch exactly two things:

1. `public/instagram/` — the image file (a `.jpg`).
2. `src/data/instagram-posts.json` — add one entry for it.

Then rebuild. That's it.

You can also let this happen **automatically** from the real account — the
snapshot gets rebuilt every few hours by a scheduled job and committed back. That
needs a one-time credential (see §9). Setting it up is optional: the manual flow
above keeps working either way, and is the fallback if the credential ever lapses.

---

## 2. Add a photo — the exact steps

1. **Put the image in the folder** `public/instagram/`. Name it
   `YYYY-MM-<short-slug>.jpg`, e.g. `2026-10-24-fall-workshop.jpg`
   (see §4 for why the date is in the name).

2. **Open** `src/data/instagram-posts.json`. It starts as `[]`.

3. **Add one object** to the array. Copy this snippet and change the values:

   ```json
   {
     "id": "fall-workshop-2026",
     "image": "/instagram/2026-10-24-fall-workshop.jpg",
     "alt": "Students making fall bracelets at a workshop table",
     "permalink": "https://www.instagram.com/p/EXAMPLE/",
     "caption": "Our fall DIY workshop — bracelets and painted pumpkins.",
     "isVideo": false,
     "date": "24 October 2026",
     "width": 1080,
     "height": 1080
   }
   ```

4. **Newest first.** Put the newest post at the **top** of the array. The array
   order is the display order — the site never re-sorts by `date`.

5. **Check it** with the guard, then rebuild:

   ```bash
   npm run check:instagram   # must print PASS
   npm run build
   ```

   If `check:instagram` prints `FAIL`, read the message — it names the exact
   post and field that is wrong (see §5).

---

## 3. The field reference

| Field | Required? | Meaning | A bad value looks like |
|---|---|---|---|
| `id` | **yes** | Unique identifier for this post. Never repeat it. | `""`, or the same id as another post |
| `image` | **yes** | The image path, **starting with `/instagram/`**. Never an `http(s)` URL. | `"https://scontent…"` (expires), `"/img/1.jpg"` (wrong folder) |
| `alt` | **yes** | Real description of what the photo shows, for screen readers (WCAG 1.1.1). | `""`, `"image"`, `"photo"`, `"instagram post"` |
| `permalink` | no | The post's Instagram URL. When present, the tile links out in a new tab. | a made-up or non-Instagram URL |
| `caption` | no | A short caption under the tile. | — |
| `isVideo` | no | `true` shows a "Video" badge on the tile. | — |
| `date` | no | Shown under the tile. **Informational only** — never used for ordering. | — |
| `width` | no | Intrinsic image width in px. Avoids layout shift. | a string like `"1080"` (use a number) |
| `height` | no | Intrinsic image height in px. Avoids layout shift. | — |

**Why `alt` matters:** every image needs text that says what it shows. A screen
reader reads this aloud; if it's `"image"` or empty, a blind visitor hears
nothing useful. Write a sentence a human would say.

**Why `image` must be a local path, never a URL:** Instagram CDN URLs expire.
If the feed pointed at `https://scontent…`, the photo would silently break weeks
later with no warning. A local file in `public/instagram/` is served with the
site and never expires.

**Why `width`/`height` matter:** without them the page can't reserve space for
the image before it loads, so the layout jumps. They're optional — a missing
pair falls back to a square tile and the guard warns (not fails) — but include
them for a stable page.

---

## 4. Image guidelines

- **Folder:** `public/instagram/`. Nothing else lives there.
- **Format:** `.jpg` (or `.webp`/`.png` if you must). `.jpg` is preferred.
- **Target file size:** keep each image under **~250 KB** if you can. A 5 MB
  photo makes the page slow for everyone.
- **Max width:** **1080 px** is plenty (Instagram's own maximum). Larger files
  are just wasted bytes.
- **Naming rule:** `YYYY-MM-<short-slug>.jpg`. The date in the name is what
  busts the browser cache.

  > ⚠️ **Files in `public/` are not content-hashed.** If you replace a photo but
  > keep the same filename, some visitors will still see the *old* one because
  > their browser cached it. Always put the date in the name, and never reuse a
  > filename for a *different* photo.

---

## 5. The guard — `check-instagram.mjs`

Before a bad feed can reach the live site, run the validator:

```bash
npm run check:instagram
# or, directly:
node scripts/check-instagram.mjs
```

It is also wired as `prebuild`, so `npm run build` runs it automatically.

It checks, and **fails** (exit code 1) on:

- the JSON not being an array, or being invalid JSON;
- a post missing `id`, `image`, or `alt`;
- a **blank or placeholder `alt`** (`""`, `"image"`, `"photo"`, `"instagram post"`);
- a **duplicate `id`**;
- an `image` that is an `http://`/`https://` URL, or that does **not** start with
  `/instagram/`;
- an `image` whose file does **not exist** in `public/instagram/`.

It **warns** (but does not fail) on a missing `date` or a missing `width`/`height`.

`[]` (no posts) is **valid** — it prints `PASS … empty array is valid` and exits 0.

Every error message names the post and the field, e.g.:

```
FAIL  post "fall-workshop-2026": `alt` is required and must be real descriptive text (got "")
```

Fix what it names, run it again until it prints `PASS`.

---

## 6. Remove a photo

1. Open `src/data/instagram-posts.json`.
2. Delete the object for that post.
3. (Optional) Delete the image file in `public/instagram/`.
4. Run `npm run check:instagram` and `npm run build`.

The order of the remaining posts does not change.

---

## 7. The empty state

`[]` is the **correct, shipped state** until the club's first event photos exist.

While the list is empty, the home page's Instagram section shows
**"Photos coming soon"** and a short explanation — designed, not a placeholder
— and renders **no image at all**, so it can never show a broken image, a
spinner, or an error. This is the state a visitor sees first, and it is
deliberate.

---

## 8. The one line to change when the handle is known

The Instagram **profile** URL (used by the footer link) is a single constant:

```
INSTAGRAM_PROFILE_URL
```

It lives in `src/components/layout/Footer.tsx` and is currently:

```ts
export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/carebridge.shanghai/';
```

The real handle landed in `b700208` (`footer.instagramHandle`,
`@CAREBRIDGE.SHANGHAI`), so the line above now points at the live profile
(`https://www.instagram.com/carebridge.shanghai/` — the handle lowercased with
the `@` stripped). If the handle ever changes, change **this one line** to the
new profile URL. Do not add a second copy anywhere else — one constant, one
place.

---

## 9. Automatic refresh (optional) — `scripts/sync-instagram.mjs`

This is what makes the feed "live" without the browser ever talking to Instagram.
A scheduled job runs **outside China**, downloads the newest posts, writes them
into `public/instagram/` + `src/data/instagram-posts.json`, and commits. The site
then serves its own files. "Live" becomes "refreshed every 6 hours" — which is a
fair trade for a page that actually loads for visitors in China.

Run it yourself any time:

```bash
npm run sync:instagram
```

### Why the browser cannot do this directly

Two independent blockers, both fatal:

1. **Instagram is not reachable from mainland China.** A client-side embed would
   spin forever for exactly the audience this site is for.
2. **Instagram's image URLs are signed and expire.** They work for a while, then
   every tile breaks silently — everywhere, not just in China.

Fetching server-side on a schedule and committing the *bytes* sidesteps both: the
visitor's browser only ever requests `carebridge.../instagram/…`.

### Choosing a source (one is required)

The script tries these in order and uses the first one available:

| Priority | Source | What to set |
|---|---|---|
| 1 | A local file | `--from-file <path>` (a JSON fixture — handy for testing) |
| 2 | A hosted feed URL | `INSTAGRAM_FEED_URL` |
| 3 | The official Instagram Graph API | `INSTAGRAM_TOKEN` + `INSTAGRAM_USER_ID` |

**No credential-free source exists.** That was established by measurement, not
assumption: a logged-out `instagram.com/<user>/` page contains **zero** profile or
post data (only the app shell — every image on it is one of Instagram's own
icons), and the public JSON endpoints (`?__a=1`, `web_profile_info`) return
**429 / blocked**, as do the third-party mirrors that were tried
(`rsshub.app`, `behold`, `picuki`, `imginn` — all 403 from Cloudflare).
So pick one of the two real options:

- **Graph API** — get a long-lived token from the Instagram Graph API and the
  account's numeric user id. Token-free alternative: the account is a *Business*
  or *Creator* account, which is what the API requires.
- **Hosted feed URL** — a service that keeps its own token and hands you a URL.

Whichever you choose goes in the repository secrets, not in the code:

**Settings → Secrets and variables → Actions → New repository secret**

- `INSTAGRAM_TOKEN`
- `INSTAGRAM_USER_ID`
- or `INSTAGRAM_FEED_URL`

The scheduled workflow (`.github/workflows/sync-instagram.yml`) runs every 6
hours and on demand (Actions → *Sync Instagram snapshot* → Run workflow).

### What it refuses to do

- **Refuses to wipe the feed.** An empty result is almost always a broken
  credential, not a deleted account, so the script stops rather than commit `[]`
  over a working snapshot. Override deliberately with `--allow-empty`.
- **Refuses to store a non-image.** A CDN answering `200` with an HTML error page
  is not a photo; the bytes are sniffed, and a non-image is skipped with a
  warning.
- **Refuses to store a post with no usable `alt` text.** `alt` is taken from
  `src/data/instagram-alt-overrides.json` (keyed by shortcode) if present,
  otherwise from the caption. If neither yields real text the post is **skipped**
  with a loud warning — because `alt="Instagram post"` fails the guard, and a
  silent omission would ship an inaccessible page.
- **Rolls back on a failed check.** If `check-instagram.mjs` rejects the new
  snapshot, the previous one is restored.

### Useful flags

```bash
node scripts/sync-instagram.mjs --dry-run        # fetch and report, write nothing
node scripts/sync-instagram.mjs --from-file x.json
node scripts/sync-instagram.mjs --strict         # exit 1 instead of warning
node scripts/sync-instagram.mjs --allow-empty    # permit an empty snapshot
```

By default it is **fail-soft**: a network or credential problem warns and exits
`0`, so a flaky Instagram never turns into a red build. With no credential set at
all it exits `0` cleanly and prints the setup instructions above.

Tokens and token-shaped strings are scrubbed from all output, so the workflow log
is safe to read.

---

## 10. What this system deliberately does NOT do

- **No live request from the visitor's browser.** Everything the page needs is
  bundled or served from this site. The *only* thing that talks to Instagram is
  the scheduled job in §9 — and if that credential is absent or expires, the site
  keeps working with the last good snapshot (§2 still applies).
- **No automatic re-sorting.** Array order is display order. If you want a
  different order, move the entries in the file.
- **No fallback image.** A post with a missing or bad `image` fails the guard; it
  is never silently shown as a broken picture.
- **No caching surprises.** Renaming a photo means giving it a new dated filename
  (§4) — the system does not try to work around the browser cache for you.
