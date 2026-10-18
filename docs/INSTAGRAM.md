# CareBridge Instagram — how to add or change a photo

> **The whole system in one sentence:** adding a photo means editing **one JSON
> file** and **dropping one image file** into a folder — nothing else, no code.
> This page is written so that anyone who has never seen this project can do it
> from these instructions alone.

---

## 1. The 30-second version

There is **no Instagram API, no token, no `.env`, and no network request.** The
feed is a static snapshot: a JSON list of posts plus image files, bundled into
the site at build time.

To add a photo you touch exactly two things:

1. `public/instagram/` — the image file (a `.jpg`).
2. `src/data/instagram-posts.json` — add one entry for it.

Then rebuild. That's it. Both steps are done for you by
`add-instagram-post.mjs` (one picture) or `ingest-instagram-folder.mjs` (a whole
folder of posts, including carousels) — see §2.

---

## 2. Add a photo — two ways

Pick whichever fits where you are. Both land in the same two files: the image in
`public/instagram/` and one object at the top of `src/data/instagram-posts.json`.

### A. One command — the script

```bash
node scripts/add-instagram-post.mjs \
  --image path/to/fall-workshop.jpg \
  --alt "Students painting pumpkins at a workshop table" \
  --date 2026-10-24 \
  --caption "Our fall DIY workshop — bracelets and painted pumpkins." \
  --permalink https://www.instagram.com/p/XXXX/
```

The script copies the image into `public/instagram/` under a date-prefixed name
(`2026-10-24-fall-workshop.jpg`), reads its real dimensions, adds the post at the
top of the JSON, runs the guard, and rolls the whole change back if the guard
fails. `--image` and `--alt` are required; `--date` (defaults to today),
`--caption` and `--permalink` are optional. Run
`node scripts/add-instagram-post.mjs --help` for the full flag list.

### B. On a phone — GitHub's web UI

1. **Upload the image** to `public/instagram/` (Add file → Upload files). Name it
   `YYYY-MM-<short-slug>.jpg`, e.g. `2026-10-24-fall-workshop.jpg` (see §4 for
   why the date goes in the name).

2. **Paste one object** at the top of `src/data/instagram-posts.json` — inside
   the array, before the closing `]`. Copy this snippet and change the values:

   ```json
   {
     "id": "fall-workshop-2026",
     "images": [
       {
         "src": "/instagram/2026-10-24-fall-workshop.jpg",
         "alt": "Students making fall bracelets at a workshop table",
         "width": 1080,
         "height": 1440
       }
     ],
     "permalink": "https://www.instagram.com/p/EXAMPLE/",
     "caption": "Our fall DIY workshop — bracelets and painted pumpkins.",
     "date": "2026-10-24"
   }
   ```

   A post with several pictures simply has more objects in `images` — they render
   as the overlapping deck (§3). `width`/`height` are per picture and optional;
   the guard only warns, not fails, when they are absent.

3. **Commit** both files together.

### C. A whole folder of posts — the batch path

When the posts arrive as folders (one folder per post, named for its date), this
is one command instead of N:

```bash
node scripts/ingest-instagram-folder.mjs --from "D:\path\to\instagram-posts"
```

```
instagram-posts/
  20260904/
    photo.jpg          the picture(s), in filename order
    link.txt           the post's permalink
    alt.txt            one description per line, one per picture (see below)
  20260910/
    1.jpg … 5.jpg
    link.txt
```

It downscales and re-encodes each picture to WebP (≤1080 px wide) with Pillow,
writes `public/instagram/<date>-<shortcode>-<n>.webp`, merges the posts into the
JSON newest-first, runs the guard, and rolls everything back if the guard fails.
It is idempotent (a post already in the snapshot is skipped), `--force` rebuilds
one, `--dry` prints the plan and writes nothing. The source folder is never
modified.

**`alt.txt` is the one thing the script cannot do for you.** It cannot see the
pictures, so a post with no `alt.txt` ships with a fallback that says where the
picture came from, not what is in it:

> `CareBridge post of 2026-09-10, picture 3 of 5.`

That is a floor, not a description — it tells a screen-reader user that a
photograph exists and nothing else. Write one line per picture, in picture order,
then re-run with `--force`.

### Either way

- **Newest first.** The newest post goes at the **top** of the array. Array order
  is the display order — the site never re-sorts by `date`.
- **Check it.** `npm run check:instagram` must print `PASS` before
  `npm run build`. If it prints `FAIL`, read the message — it names the exact
  post and field that is wrong (see §5). The script (A) already runs the guard for
  you; the web UI (B) runs it as part of the build.

## 3. The field reference

| Field | Required? | Meaning | A bad value looks like |
|---|---|---|---|
| `id` | **yes** | Unique identifier for this post. Never repeat it. | `""`, or the same id as another post |
| `images` | **yes** | A **non-empty array**, one object per picture, in display order. One picture renders as a plain tile; more than one renders as the overlapping deck. | `[]`, or the old post-level `image`/`alt` pair (see below) |
| `images[].src` | **yes** | The picture's path, **starting with `/instagram/`**. Never an `http(s)` URL. | `"https://scontent…"` (expires), `"/img/1.jpg"` (wrong folder) |
| `images[].alt` | **yes** | Real description of **that** picture, for screen readers (WCAG 1.1.1). Five pictures need five sentences — there is no post-level `alt`. | `""`, `"image"`, `"photo"`, `"instagram post"` |
| `images[].width` / `height` | no | That picture's intrinsic size in px. Avoids layout shift. Per picture, because a carousel mixes shapes. | a string like `"1080"` (use a number) |
| `permalink` | no | The post's Instagram URL. On a single-picture tile the whole tile links out; on a carousel it becomes the corner `↗` control (a tile cannot be both a link and a carousel). | a made-up or non-Instagram URL |
| `caption` | no | A short caption, revealed over the tile on hover/focus. | — |
| `isVideo` | no | `true` shows a "Video" badge on the tile. | — |
| `date` | no | Shown under the caption. **Informational only** — never used for ordering. | — |

> ⚠️ **`image` and `alt` at post level no longer exist.** They were replaced by
> `images[]` when the first carousel arrived: one `alt` cannot describe five
> different photographs. A file that still has them fails the guard with a message
> saying exactly that. `add-instagram-post.mjs` writes the new shape, so re-adding
> a picture that way is the quickest fix.

**How a carousel renders.** A post with more than one picture becomes a deck at
**85% overlap** — the same rolling method as the Events page, at `DECK_OVERLAP`
in `InstagramFeed.tsx`, with the arithmetic shared through
`src/components/ui/deck.ts` so the two decks cannot drift apart. Each neighbour
shows a 15% edge, the `n/N` counter says how many there are, and `‹ ›` (or the
arrow keys) step through. A carousel tile is **1.3× as wide** as a single-post
tile and the same height: the extra width is the room the fanned edges need, and
the photograph inside stays exactly the same size as a single post's.

A carousel tile cannot also be a link — a button inside an anchor is invalid
markup — so its `permalink` becomes the `↗` control in the corner instead of
wrapping the whole tile.

**Why `alt` matters:** every image needs text that says what it shows. A screen
reader reads this aloud; if it's `"image"` or empty, a blind visitor hears
nothing useful. Write a sentence a human would say.

**Why `alt` is per picture:** these are carousels. One sentence covering five
photographs is five photographs nobody who cannot see them can tell apart — and
the deck's whole job is stepping between them.

**Why `src` must be a local path, never a URL:** Instagram CDN URLs expire.
If the feed pointed at `https://scontent…`, the photo would silently break weeks
later with no warning. A local file in `public/instagram/` is served with the
site and never expires.

**Why `width`/`height` matter:** without them the page can't reserve space for
the image before it loads, so the layout jumps. They're optional — a missing
pair falls back to the card's own 3:4 box and the guard warns (not fails) — but
include them for a stable page.

---

## 4. Image guidelines

- **Folder:** `public/instagram/`. Nothing else lives there.
- **Format:** `.jpg` for `add-instagram-post.mjs` (or `.webp`/`.png` if you must).
  The folder ingest writes `.webp`, because it re-encodes anyway.
- **Target file size:** keep each image under **~250 KB** if you can. A 5 MB
  photo makes the page slow for everyone. The ingest lands 1080-wide pictures at
  about 130 KB.
- **Max width:** **1080 px** is plenty (Instagram's own maximum). The ingest
  downscales anything wider.
- **Naming rule:** `YYYY-MM-<short-slug>.jpg` from `add-instagram-post.mjs`, or
  `<date>-<shortcode>-<n>.webp` from the folder ingest. Either way the date leads.

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
- a post missing `id`, or whose `images` is not a non-empty array;
- a **blank or placeholder `alt`** on any picture (`""`, `"image"`, `"photo"`,
  `"instagram post"`);
- the old **post-level `image`/`alt`** — the schema moved into `images[]`;
- a **duplicate `id`**;
- a picture `src` that is an `http://`/`https://` URL, or that does **not** start
  with `/instagram/`;
- a picture `src` whose file does **not exist** in `public/instagram/`.

It **warns** (but does not fail) on a missing `date` or missing per-picture
`width`/`height`.

`[]` (no posts) is **valid** — it prints `PASS … empty array is valid` and exits 0.

Every error message names the post and the field, e.g.:

```
FAIL  post "fall-workshop-2026" images[0]: `alt` is required and must be real descriptive text (got "")
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

While the list is empty, the home page's Instagram section shows the engraved
**plate band**, captioned with the club's real handle — a composed band, not an
apology — and renders **no image at all**, so it can never show a broken image,
a spinner, or an error.

---

## 8. The one line to change when the handle is known

The Instagram **profile** URL (used by the footer link) is a single constant:

```
INSTAGRAM_PROFILE_URL
```

It lives in `src/data/site.ts` and is currently:

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

## 9. What this system deliberately does NOT do

- **No API, no token, no `.env`, no live sync.** The club posts infrequently, so
  a hand-maintained snapshot is the right trade-off; a live Instagram Graph API
  integration was removed on purpose.
- **No automatic re-sorting.** Array order is display order. If you want a
  different order, move the entries in the file.
- **No fallback image.** A post with a missing or bad picture `src` fails the
  guard; it is never silently shown as a broken picture.
- **No caching surprises.** Renaming a photo means giving it a new dated filename
  (§4) — the system does not try to work around the browser cache for you.
