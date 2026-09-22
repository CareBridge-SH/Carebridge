import type { ReactNode } from 'react';

type ColCount = 1 | 2 | 3;

export interface GridProps {
  children: ReactNode;
  cols?: { base?: ColCount; md?: ColCount; lg?: ColCount };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  /* Forwarded to the root element. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/*
 * Full class strings, not interpolated names: Tailwind v4 finds utilities by
 * scanning source text, so `grid-cols-${n}` would compile to nothing.
 */
const BASE_COLS: Record<ColCount, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

const MD_COLS: Record<ColCount, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

const LG_COLS: Record<ColCount, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
};

const GAP: Record<NonNullable<GridProps['gap']>, string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export function Grid({
  children,
  cols = { base: 1, md: 2, lg: 3 },
  gap = 'md',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: GridProps) {
  const classes = [
    'grid',
    cols.base ? BASE_COLS[cols.base] : null,
    cols.md ? MD_COLS[cols.md] : null,
    cols.lg ? LG_COLS[cols.lg] : null,
    GAP[gap],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  );
}
