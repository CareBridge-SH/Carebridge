import { useTranslation } from 'react-i18next';
import manifestJson from '../../data/photos.json';
import type { PhotoEntry, PhotoManifest } from '../../data/types';

const manifest = manifestJson as PhotoManifest;

export interface PlateProps {
  /** Slug into `src/data/photos.json`. Absent from the manifest -> engraved plate. */
  slug: string;
  /** The plate number as it prints, e.g. `"01"`. A numeral, never a locale string. */
  number: string;
  /**
   * An **existing** locale key for the caption. Omit for a plate that needs none.
   *
   * For a photograph the caption comes from the manifest's own `captionKey`
   * instead; this prop is what the engraved plate is captioned with, so that a
   * photograph-free site still says something true rather than apologising.
   */
  captionKey?: string;
  /** The hero plate: `loading="eager"` + `fetchpriority="high"` instead of lazy. */
  priority?: boolean;
  /** `sizes`, used only when the entry declares a `@2x` file. */
  sizes?: string;
  className?: string;
}

/**
 * One plate: a figure with a fixed-ratio box and a caption.
 *
 * **Two states, one component.** With a photograph it renders the image from the
 * operator-owned manifest; without one it renders an *engraved plate* — a
 * deterministic dot field. The engraved state is not a fallback or an empty
 * state: it is what the site actually ships, and it is designed to be looked at.
 * There is never an empty-state box and never a committed placeholder
 * photograph.
 */
export function Plate({
  slug,
  number,
  captionKey,
  priority = false,
  sizes,
  className,
}: PlateProps) {
  const { t } = useTranslation();
  const entry: PhotoEntry | undefined = manifest[slug];

  /* The box ratio. A photograph's own pixels decide it; the engraved plate has
     a fixed 3:2, the same shape as the photographs the operator is expected to
     supply, so a plate does not resize when a picture replaces it. */
  const ratio = entry ? `${entry.width} / ${entry.height}` : '3 / 2';

  const caption = entry ? t(entry.captionKey) : captionKey ? t(captionKey) : null;

  return (
    <figure className={className}>
      {/*
        `shadow-[var(--shadow-plate)]` — T30b. `--shadow-plate` was defined in
        both themes and read by nothing, which is dead code; the plate is the
        case that earns the lift (DESIGN.md, the Earned-Lift Rule), so it is now
        the component that spends it. A plate sits ON the page rather than
        floating in it.
       *
        The shadow flips with the theme through the token, and it is drawn
        outside the box, so `overflow-hidden` clips the plate's corners without
        clipping its lift.
       */}
      <div
        className="relative isolate overflow-hidden border border-rule bg-plate-field shadow-[var(--shadow-plate)]"
        style={{ aspectRatio: ratio }}
      >
        {entry ? (
          <Photo entry={entry} slug={slug} priority={priority} sizes={sizes} />
        ) : (
          <EngravedField slug={slug} number={number} />
        )}
      </div>

      {/*
        The number and the caption sit BELOW the plate in both states, never over
        it. Over a photograph the label would land on an unknown background, and
        "PLATE 01" against an arbitrary picture is a contrast failure waiting for
        the first file the operator supplies.
      */}
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          aria-hidden="true"
          className="font-mono text-label tracking-label text-lavender uppercase"
        >
          {t('plate.label')} {number}
        </span>
        {caption ? (
          <span className="font-sans text-sm text-white">{caption}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

interface PhotoProps {
  entry: PhotoEntry;
  slug: string;
  priority: boolean;
  sizes?: string;
}

function Photo({ entry, slug, priority, sizes }: PhotoProps) {
  const { t } = useTranslation();

  /*
   * Assembled at RUNTIME, so Vite does not rewrite it — `BASE_URL` has to carry
   * the deploy prefix or every photograph 404s on the deployed site and nowhere
   * else. `BASE_URL` is always slash-terminated, so the concatenation is safe.
   * Same rule as the logo in `Header` and the Instagram tiles.
   */
  const base = `${import.meta.env.BASE_URL}photos/${slug}`;

  return (
    <>
      <img
        src={`${base}.webp`}
        srcSet={
          entry.has2x ? `${base}.webp 1x, ${base}@2x.webp 2x` : undefined
        }
        sizes={entry.has2x ? sizes : undefined}
        alt={t(entry.altKey)}
        width={entry.width}
        height={entry.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        style={{ objectPosition: entry.focus }}
        className="h-full w-full object-cover grayscale"
      />
      {/*
        Duotone, in CSS: a grayscale image with an accent layer blended over it
        keeps its own luminance and takes the publication's colour, so
        photographs from different sources read as one book. The layer is
        decoration and never carries text.
      */}
      <span
        aria-hidden="true"
        className="absolute inset-0 mix-blend-color"
        style={{
          backgroundColor: 'var(--color-lavender)',
          opacity: 'var(--plate-duotone-opacity)',
        }}
      />
    </>
  );
}

/*
 * ── The engraved plate ──────────────────────────────────────────────────────
 *
 * DETERMINISTIC, and that is a hard requirement: two builds must produce
 * byte-identical markup. Everything below is a pure function of integer loop
 * indices — no `Math.random`, no `Date`, no counter that survives a render, no
 * seed from anything that varies. `Math.sin` is the standard GLSL-style hash and
 * is exact for a given input on every engine.
 */
const TILE_W = 120;
const TILE_H = 80;
const COLS = 10;
const ROWS = 6;

function dotHash(i: number, j: number): number {
  const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Module-level, so it is computed once and cannot drift between renders. */
const DOTS = Array.from({ length: ROWS * COLS }, (_, k) => {
  const i = k % COLS;
  const j = Math.floor(k / COLS);
  return {
    cx: round2((i + 0.5) * (TILE_W / COLS)),
    cy: round2((j + 0.5) * (TILE_H / ROWS)),
    r: round2(0.45 + dotHash(i, j) * 1.15),
  };
});

interface EngravedProps {
  slug: string;
  number: string;
}

/**
 * The dot field, in the accent on the plate field.
 *
 * The pattern id is derived from the slug and number rather than from
 * `useId()`: two plates on one page must not share a pattern, and the id must be
 * the same on every build.
 */
function EngravedField({ slug, number }: EngravedProps) {
  const patternId = `plate-field-${slug}-${number}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${TILE_W * 4} ${TILE_H * 4}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full text-lavender"
    >
      <defs>
        <pattern
          id={patternId}
          width={TILE_W}
          height={TILE_H}
          patternUnits="userSpaceOnUse"
        >
          {DOTS.map((d) => (
            <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r={d.r} fill="currentColor" />
          ))}
        </pattern>

        {/*
          The vignette is what turns a texture into a plate. An even field read
          as wallpaper at bleed width; clearing the middle gives the plate a
          subject and a margin, the way an engraved plate is composed — engraved
          at the edges, open where the figure is.
        */}
        <radialGradient id={`${patternId}-vignette`} cx="50%" cy="46%" r="72%">
          <stop offset="0%" style={{ stopColor: 'var(--color-plate-field)', stopOpacity: 1 }} />
          <stop offset="52%" style={{ stopColor: 'var(--color-plate-field)', stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: 'var(--color-plate-field)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      <rect width="100%" height="100%" fill={`url(#${patternId}-vignette)`} />
    </svg>
  );
}
