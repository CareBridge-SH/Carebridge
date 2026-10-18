/**
 * Build-time Instagram snapshot — the shape of one post.
 *
 * `src/data/instagram-posts.json` is a JSON array of these, imported at build
 * time. There is **no** network call, no API, no token and no `.env` — a live
 * Instagram integration was deliberately removed, so
 * this type describes static, hand-maintained data only.
 */
/**
 * One picture inside an Instagram post.
 *
 * A post is one or more of these. One picture renders as a plain tile; more than
 * one renders as the same overlapping "deck" the Events page uses, at a much
 * higher overlap (see `src/components/ui/deck.ts`).
 */
export interface InstagramImage {
  /**
   * Local path, e.g. `/instagram/2026-09-10-DdGw-3.webp`.
   *
   * MUST start with `/instagram/` and MUST NOT be an `http(s)` URL: Instagram CDN
   * URLs expire and would silently break the live site. Files live under
   * `public/instagram/` (see docs/INSTAGRAM.md).
   */
  src: string;

  /**
   * REQUIRED, and per-picture — five photographs of five different things need
   * five descriptions, so there is no post-level `alt`. Real, human-written alt
   * text (WCAG 1.1.1); never `""`, `"image"`, `"photo"` or `"instagram post"`,
   * which the validator (`scripts/check-instagram.mjs`) rejects.
   */
  alt: string;

  /**
   * Intrinsic size in px, as measured from the file at ingest time.
   *
   * Per-picture rather than per-post because a carousel really does mix shapes —
   * treating the first picture's ratio as the post's would shift the layout for
   * every other picture in it.
   */
  width?: number;
  height?: number;
}

export interface InstagramPost {
  /** Unique id for the post. Used as the React key; must be unique in the file. */
  id: string;

  /**
   * The pictures, in display order. `images[0]` is what the tile shows first.
   *
   * This replaced a single `image` + post-level `alt` when the operator's first
   * carousel arrived: a post is a thing that can hold several photographs, and
   * five pictures under one alt sentence is five indistinguishable pictures for
   * anyone using a screen reader.
   */
  images: InstagramImage[];

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

/**
 * One photograph in the Events cover flow — `src/data/event-photos.json`.
 *
 * **The array is `[]` in the repository, and it is meant to be.** There are no
 * photographs yet, so the page renders no strip at all rather than an empty band:
 * the space goes back to the title and the ledger. Adding an entry is the whole
 * of "add a photograph".
 *
 * Deliberately *not* `PhotoEntry`. That shape carries `width`/`height` because a
 * `Plate` reserves its box from the intrinsic aspect ratio. A cover-flow card has
 * a fixed 4:3 box and crops into it, so there is nothing to reserve and nothing
 * an operator should have to measure. It also has no caption — the card is a
 * photograph, and the strip has no place to put words.
 */
export interface EventPhoto {
  /**
   * File name inside `public/photos/events/`. The `src` is assembled at runtime
   * with `import.meta.env.BASE_URL`, so this must stay a bare name — a leading
   * slash would resolve to the domain root and 404 under the Pages base path.
   */
  file: string;
  /** Full locale key for the alt text, e.g. `events.photos.items.visits1`. */
  altKey: string;
  /**
   * Optional `object-position` for photographs that do not survive a 4:3 crop
   * centred — a portrait frame loses more than half its height to fill a card,
   * and what it loses is usually the faces. `"50% 30%"` biases upwards; anything
   * CSS accepts works. Omit it and the crop is dead centre.
   */
  focus?: string;
}
