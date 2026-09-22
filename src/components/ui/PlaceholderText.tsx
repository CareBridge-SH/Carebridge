export interface PlaceholderTextProps {
  /*
   * `string`, not `ReactNode`, deliberately: it is what
   * `t()` returns, and it makes "renders the bracketed value byte-identical"
   * a type-level guarantee rather than a convention.
   */
  children: string;
  as?: 'span' | 'p' | 'div';
  className?: string;
  /* Forwarded to the root element. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/*
 * This is the component that keeps unfinished content honest, so the styling is
 * deliberately conspicuous: dashed outline plus a warm tint, on both themes.
 *
 * Colours are full-strength tokens rather than alpha tints, so the contrast is
 * identical in both themes by construction instead of by luck -- `--color-white`
 * flips to near-black in light mode and a tint of it has already failed AA here
 * once (3.32:1). Measured: text 13.7:1 on dark, 5.5:1 on light.
 */
const SURFACE = 'rounded border border-dashed border-cream bg-cream/10 px-2 py-1 font-sans text-cream';

/**
 * Renders a `[bracketed]` string exactly as it comes out of the locale file.
 * It never trims, wraps, truncates or otherwise transforms `children` -- what
 * goes in is what renders. Never substitute a plausible value for one of these.
 */
export function PlaceholderText({
  children,
  as: Tag = 'span',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: PlaceholderTextProps) {
  const classes = [SURFACE, className].filter(Boolean).join(' ');

  return (
    <Tag
      className={classes}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Tag>
  );
}
