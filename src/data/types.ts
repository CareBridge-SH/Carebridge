/**
 * Build-time Instagram snapshot — the shape of one post.
 *
 * `src/data/instagram-posts.json` is a JSON array of these, imported at build
 * time. There is **no** network call, no API, no token and no `.env` — a live
 * Instagram integration was deliberately removed (01-project-brief.md §4), so
 * this type describes static, hand-maintained data only.
 */
export interface InstagramPost {
  /** Unique id for the post. Used as the React key; must be unique in the file. */
  id: string;

  /**
   * Local path to the image, e.g. `/instagram/2026-10-fall-workshop.jpg`.
   *
   * MUST start with `/instagram/` and MUST NOT be an `http(s)` URL: Instagram CDN
   * URLs expire and would silently break the live site. Images live under
   * `public/instagram/` (see docs/INSTAGRAM.md).
   */
  image: string;

  /**
   * REQUIRED. Real, human-written alt text describing the photo (WCAG 1.1.1).
   * Never `""`, `"image"`, `"photo"` or `"instagram post"` — the validator
   * (`docs/team/check-instagram.mjs`) rejects those.
   */
  alt: string;

  /** When present, the tile links out to this URL in a new tab. */
  permalink?: string;

  /** Optional caption shown under the tile. */
  caption?: string;

  /** When true, a "Video" badge is shown on the tile. */
  isVideo?: boolean;

  /**
   * Informational only — shown under the tile, NEVER used for sort order. Array
   * order is the display order (most recent first by convention).
   */
  date?: string;

  /** Intrinsic image width (px). Optional, but avoids layout shift. */
  width?: number;

  /** Intrinsic image height (px). Optional, but avoids layout shift. */
  height?: number;
}
