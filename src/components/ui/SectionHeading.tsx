import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  /** Target for the section's `aria-labelledby`. */
  id: string;
  /** Renders an `<h2>` or an `<h3>`. Never an `<h1>`: pages own their one `<h1>`. */
  level: 2 | 3;
  children: ReactNode;
  /** Optional small label rendered above the heading. Not a heading itself. */
  eyebrow?: ReactNode;
  className?: string;
  /*
   * INTERFACES.md §4 addendum. Deliberate difference from the other five
   * primitives:
   *
   * - `id` is NOT re-added here. This interface already requires `id: string`
   *   (above), and it already lands on the heading element, which is the target
   *   an `aria-labelledby` on the surrounding `<section>` should point at. A
   *   second `id?: string` would be a duplicate member.
   * - the two naming props go on the **heading**, not on the wrapper `<div>`:
   *   a bare `<div>` computes to role `generic`, and WAI-ARIA 1.2 lists `generic`
   *   as a role where naming is *prohibited*, so `aria-label` there would be an
   *   `aria-prohibited-attr` violation. `heading` may be named, so that is where
   *   they are valid.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Pairing every section with one of these is how "no skipped heading levels"
 * is enforced structurally rather than by discipline alone.
 */
export function SectionHeading({
  id,
  level,
  children,
  eyebrow,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SectionHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';

  const classes = [
    'font-serif font-semibold text-white',
    level === 2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      {eyebrow ? (
        <p className="mb-2 font-sans text-sm font-semibold tracking-wide text-cream uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Tag
        id={id}
        className={classes}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </Tag>
    </div>
  );
}
