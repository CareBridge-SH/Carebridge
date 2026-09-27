import type { ReactNode } from 'react';

export interface NumeralProps {
  /** The figure itself — `01`, `1,240`, `12%`. */
  children: ReactNode;
  /**
   * The tabular variant — a column of figures that must align on the digit.
   * Adds `tabular-nums` and switches to the sans face.
   *
   * The face switch is a **measured** decision, not a preference. Rendering `1`
   * and `0` at 64px in each face:
   *
   * | face | default | with `tabular-nums` |
   * |---|---|---|
   * | Cormorant Garamond | 32.00 / 32.00 px | 32.00 / 32.00 px |
   * | Inter | 26.03 / 40.38 px | 41.50 / 41.50 px |
   *
   * Inter has a real `tnum` feature and it is what makes the digits equal.
   * Cormorant ignores the property entirely — its figures happen to be
   * equal-width already, so it *looks* right, but the declaration is inert and
   * the alignment would silently vanish the moment the fallback face is used
   * (Georgia on a machine where the self-hosted serif fails). A variant that
   * cannot be shown to do anything is the exact failure mode this project has
   * already paid for once.
   */
  tabular?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Wayfinding only — `01`/`02`/`03` beside a heading that already says what the
   * entry is. Hides the figure from the accessibility tree so it is not read out
   * as content. Decide per call site: a figure that *is* the data (a ledger
   * amount, an impact figure) must stay announced and must not set this.
   */
  decorative?: boolean;
  /** Only an `<h1>`–`<h6>` claims a heading; a numeral never should. */
  as?: 'span' | 'div' | 'p';
  className?: string;
  /* Forwarded to the root element. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/* Full class strings — Tailwind v4 resolves utilities by scanning source text. */
const DISPLAY_SIZE: Record<NonNullable<NumeralProps['size']>, string> = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl',
};

const TABULAR_SIZE: Record<NonNullable<NumeralProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl md:text-3xl',
};

/**
 * A display-weight figure. Two jobs, one idea — *structure the page with
 * typography, not with boxes*:
 *
 * 1. **wayfinding** — `01`, `02`, `03` marking the entries of a list;
 * 2. **a column of figures** — the tabular variant, where the digits must line up
 *    down the page because the reader is comparing them.
 */
export function Numeral({
  children,
  tabular = false,
  size = 'md',
  decorative = false,
  as: Tag = 'span',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: NumeralProps) {
  const classes = [
    tabular
      ? `font-sans font-semibold tabular-nums ${TABULAR_SIZE[size]}`
      : `font-serif font-semibold ${DISPLAY_SIZE[size]}`,
    'text-white',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      className={classes}
      id={id}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Tag>
  );
}
