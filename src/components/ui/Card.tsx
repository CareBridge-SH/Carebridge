import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  as?: 'div' | 'article' | 'li';
  className?: string;
  /* Forwarded to the root element — see the INTERFACES.md §4 addendum. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * `border-lavender-dk` rather than a low-alpha tint of a flipping token: a tint
 * of `--color-white` (or of a token that flips near-black in light mode) measures
 * differently in each theme, and this project has already shipped a 3.32:1
 * failure that way. The border measured 3.8:1 on dark and 8.1:1 on light against
 * this card's own fill.
 */
const SURFACE =
  'flex h-full flex-col rounded-lg border border-lavender-dk bg-navy-soft p-6';

export function Card({
  children,
  as: Tag = 'div',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: CardProps) {
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
