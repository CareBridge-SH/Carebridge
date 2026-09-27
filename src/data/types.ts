/**
 * Build-time Instagram snapshot — the shape of one post.
 *
 * `src/data/instagram-posts.json` is a JSON array of these, imported at build
 * time. There is **no** network call, no API, no token and no `.env` — a live
 * Instagram integration was deliberately removed, so
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
   * (`scripts/check-instagram.mjs`) rejects those.
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

/**
 * One photograph in the operator-owned manifest — `src/data/photos.json`.
 *
 * **The manifest is `{}` in the repository, and it is meant to be.** No
 * photograph is committed; the site ships with every plate engraved, and it
 * gets better the moment the operator drops files in. `Plate` reads this map and
 * falls back to the engraved plate for any slug it cannot find.
 */
export interface PhotoEntry {
  /** Intrinsic width in px. With `height`, this is the plate's `aspect-ratio`. */
  width: number;
  /** Intrinsic height in px. Reserving the box is what keeps a photograph from
   *  reintroducing the layout shift T27 closed. */
  height: number;
  /** Full locale key for the alt text, e.g. `photos.fall-workshop.alt`. */
  altKey: string;
  /** Full locale key for the caption, e.g. `photos.fall-workshop.caption`. */
  captionKey: string;
  /** CSS `object-position`, e.g. `"50% 30%"` — which part survives the crop. */
  focus: string;
  /**
   * Set when `public/photos/<slug>@2x.webp` exists.
   *
   * Declared rather than detected, and that is deliberate: `public/` is not a
   * module tree, so a build cannot ask whether the file is there, and emitting a
   * `srcset` that points at a missing file is worse than emitting none — the
   * browser would pick the 2x candidate and paint nothing.
   */
  has2x?: boolean;
}

/** `slug -> entry`. Absent slug means engraved plate; that is a normal state, not an error. */
export type PhotoManifest = Record<string, PhotoEntry>;

/**
 * Build-time ledger snapshot — the financial ledger extracted from
 * `content/ledger.xlsx` by `scripts/build-ledger.mjs`. Non-visible sheets are
 * never included, so this is always a filtered projection, never the file.
 */
export interface LedgerRow {
  /** The real Excel row number this came from (1-based), for the on-page row rail. */
  sourceRow: number;
  /** Cell values in column order: number, string, date (YYYY-MM-DD), or null. */
  values: (string | number | null)[];
  /** Detected (never computed) totals row. */
  isTotal: boolean;
}

export interface LedgerSnapshot {
  /** The rendered sheet's name, or null when nothing has been uploaded yet. */
  sheetName: string | null;
  /** The header row, in display order (string or null). */
  columns: (string | null)[];
  rows: LedgerRow[];
  /** Visible sheets that were not rendered. */
  ignoredSheets: string[];
  /** The workbook's own last-saved time (provenance, not a build timestamp), or null. */
  workbookModifiedAt: string | null;
}
