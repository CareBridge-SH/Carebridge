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

Then rebuild. That's it.

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

## 9. What this system deliberately does NOT do

- **No API, no token, no `.env`, no live sync.** The club posts infrequently, so
  a hand-maintained snapshot is the right trade-off; a live Instagram Graph API
  integration was removed on purpose.
- **No automatic re-sorting.** Array order is display order. If you want a
  different order, move the entries in the file.
- **No fallback image.** A post with a missing or bad `image` fails the guard; it
  is never silently shown as a broken picture.
- **No caching surprises.** Renaming a photo means giving it a new dated filename
  (§4) — the system does not try to work around the browser cache for you.
