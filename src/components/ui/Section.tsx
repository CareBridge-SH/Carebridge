import type { ReactNode } from 'react';
import { Container } from './Container';

export interface SectionProps {
  children: ReactNode;
  /**
   * Vertical rhythm. `default` is byte-identical to the `py-16 md:py-24` the
   * pages had been hardcoding per block, so migrating a block onto `Section`
   * does not silently move it.
   */
  rhythm?: 'tight' | 'default' | 'loose';
  /**
   * `none` wraps the children in `Container`, so the section owns the gutter and
   * the page stops repeating `mx-auto max-w-6xl px-5` per block.
   *
   * `full` leaves them unwrapped. The section's own box is edge-to-edge either
   * way (a `<section>` is block-level, and `main` sets no width); `full` is about
   * the *content*, so a poster or a row that must be cut by the viewport can opt
   * out of the container and own its own gutters.
   */
  bleed?: 'none' | 'full';
  /**
   * `plain` inherits the page ground. `tint` fills with `--color-navy-soft` — a
   * full-strength token, never an alpha tint of the flipping `--color-white`,
   * which measures differently in each theme and has already shipped an AA
   * failure on this project (3.32:1).
   */
  tone?: 'plain' | 'tint';
  /** A `<section>` needs an accessible name; pass `aria-labelledby` at the call site. */
  as?: 'section' | 'div' | 'article';
  /**
   * The **first** band of a page, which opens nearer the header rather than on a
   * band of blank ground. It keeps the bottom half of its rhythm and drops the
   * top half.
   *
   * The operator asked for exactly this: "the same space that looks empty exists
   * in all other pages, and for all other pages, just remove that space and bring
   * the title & content higher, closer to the top bar."
   *
   * **Only ever set it on a page's first band.** A band in the middle of a page
   * is setting its distance from the band above it, and shrinking *that* would
   * read as a mistake. This prop means "there is nothing above me but the header".
   */
  opening?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const RHYTHM: Record<NonNullable<SectionProps['rhythm']>, string> = {
  tight: 'py-10 md:py-12',
  default: 'py-16 md:py-24',
  loose: 'py-20 md:py-32',
};

/**
 * The same rhythms, for a band that **opens** a page (`opening`).
 *
 * The rule is not "make the padding small", it is "stop the page starting on a
 * band of nothing": 80px at 375 and 128px at 768+ of empty ground under the header
 * was the largest blank space on the site, and on five pages out of five it was the
 * first thing a reader met.
 *
 * **The bottom half is byte-identical to `RHYTHM` on purpose.** Only the distance
 * to the header moves; no band's relationship to the band beneath it is disturbed,
 * so this cannot cascade into the rest of a page's rhythm.
 */
const RHYTHM_OPENING: Record<NonNullable<SectionProps['rhythm']>, string> = {
  tight: 'pt-8 pb-10 md:pt-10 md:pb-12',
  default: 'pt-10 pb-16 md:pt-12 md:pb-24',
  loose: 'pt-10 pb-20 md:pt-12 md:pb-32',
};

const TONE: Record<NonNullable<SectionProps['tone']>, string> = {
  plain: '',
  tint: 'bg-navy-soft',
};

/**
 * Owns the vertical rhythm and the container for one band of a page, so a page
 * reads as a sequence of bands with an intentional rhythm rather than as blocks
 * that each guessed their own `py-*`.
 */
export function Section({
  children,
  rhythm = 'default',
  bleed = 'none',
  tone = 'plain',
  opening = false,
  as: Tag = 'section',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SectionProps) {
  const classes = [TONE[tone], opening ? RHYTHM_OPENING[rhythm] : RHYTHM[rhythm], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      className={classes}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {bleed === 'full' ? children : <Container>{children}</Container>}
    </Tag>
  );
}
