import { useTranslation } from 'react-i18next';
import manifestJson from '../../data/photos.json';
import type { PhotoEntry, PhotoManifest } from '../../data/types';

const manifest = manifestJson as PhotoManifest;

export interface PlateProps {
  /** Slug into `src/data/photos.json`. Absent from the manifest -> the flat field. */
  slug: string;
  /**
   * An **existing** locale key for the caption, when the plate has one.
   *
   * The caption survives the Round-6 removal: what the operator rejected was the
   * `PLATE 01` apparatus above it, not the sentence. Deleting it would lose real
   * content, and the row it sits in is the one place the Instagram band names
   * itself.
   */
  captionKey?: string;
  /** The hero plate: `loading="eager"` + `fetchpriority="high"` instead of lazy. */
  priority?: boolean;
  /** `sizes`, used only when the entry declares a `@2x` file. */
  sizes?: string;
  className?: string;
}

/**
 * One plate: a figure with a fixed-ratio box.
 *
 * **Round 6, T37 — the apparatus came off.** This component used to print a
 * `<figcaption>` reading `PLATE 01`, and before that it painted a diagonal dot
 * lattice inside the field. The operator:
 *
 *   "below the photo frames it says PLATE 01. Get rid of these as they look AI.
 *    Also, get rid of the dotted background and replace with something better."
 *
 * So the number prop is gone from the signature and from every call site, the
 * caption is gone, and the lattice is gone. What is left when there is no
 * photograph is ONE FLAT SURFACE — `--color-plate-field`, a 1px `--color-rule`
 * border and the plate shadow — and deliberately no pattern of any kind. Not a
 * subtler texture: ROUND6-PLAN §3.4 rejects a halftone, a noise overlay at a
 * different scale, and a "paper texture but smaller" as the same idea at a
 * different opacity.
 *
 * The component itself stays. It becomes worth keeping the moment the operator
 * supplies photographs (§4).
 */
export function Plate({
  slug,
  captionKey,
  priority = false,
  sizes,
  className,
}: PlateProps) {
  const { t } = useTranslation();
  const entry: PhotoEntry | undefined = manifest[slug];

  /* A photograph's own pixels decide the box ratio; the flat field has a fixed
     3:2, the shape the expected photographs will be, so a plate does not resize
     when a picture replaces it. */
  const ratio = entry ? `${entry.width} / ${entry.height}` : '3 / 2';

  return (
    <figure className={className}>
      {/*
        The flat field. `background-image` computes to `none` — the field is a
        colour, not a pattern — and the shadow is drawn outside the box, so
        `overflow-hidden` clips the plate's corners without clipping its lift.
      */}
      <div
        className="relative isolate overflow-hidden border border-rule bg-plate-field shadow-[var(--shadow-plate)]"
        style={{ aspectRatio: ratio }}
      >
        {entry ? (
          <Photo entry={entry} slug={slug} priority={priority} sizes={sizes} />
        ) : null}
      </div>

      {/*
        The caption only. There is no `PLATE n` beside it any more: the number,
        its label and the label voice they were set in were the apparatus, and
        the sentence is the content.
      */}
      {captionKey ? (
        <figcaption className="mt-3 font-sans text-sm text-white">
          {t(captionKey)}
        </figcaption>
      ) : null}
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
        srcSet={entry.has2x ? `${base}.webp 1x, ${base}@2x.webp 2x` : undefined}
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
      {/* Duotone, in CSS: the photograph keeps its own luminance and takes the
          publication's colour. Decoration; it never carries text. */}
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
