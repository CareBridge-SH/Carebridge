import type { ReactNode } from 'react';

export interface EditorialSplitProps {
  /**
   * The narrow column: a date, a numeral, a label. It is the **first** child in
   * the DOM, so `reverse` never changes what a screen reader hears first.
   */
  rail: ReactNode;
  /** The wide column: the entry itself. */
  children: ReactNode;
  /** Puts the rail on the right. Visual only — see the note below. */
  reverse?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
  className?: string;
  /* Forwarded to the root element. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/*
 * Full class strings, not interpolated names: Tailwind v4 resolves utilities by
 * scanning source text, so a computed class name compiles to nothing.
 *
 * T44: the rail was 1fr of a 1fr:2fr split — a THIRD OF THE PAGE — for what is now a
 * small label. It is capped at 12rem, so the column that carries the event title gets
 * everything else. The label column is content-sized rather than proportional, because
 * a proportion gives a caption a share of the page and a label only needs its words.
 *
 * `reverse` swaps BOTH the track sizes and the explicit column placement. Flipping
 * only the placement would land the content in the narrow track — the rail would
 * stay the wide one, which is the opposite of the intent.
 */
const COLS: Record<'normal' | 'reverse', string> = {
  normal: 'md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]',
  reverse: 'md:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]',
};

const RAIL_POS: Record<'normal' | 'reverse', string> = {
  normal: 'md:col-start-1 md:row-start-1',
  reverse: 'md:col-start-2 md:row-start-1',
};

const BODY_POS: Record<'normal' | 'reverse', string> = {
  normal: 'md:col-start-2 md:row-start-1',
  reverse: 'md:col-start-1 md:row-start-1',
};

/**
 * An asymmetric two-column split: a narrow rail beside a wide content column.
 *
 * **Accessibility — why this uses explicit grid placement rather than `order`.**
 * With `reverse` on, the rail is drawn on the right but stays *first* in the DOM,
 * so the reading order a screen reader follows is the order the content was
 * written in. Below `md` the split collapses to one column in DOM order, which
 * puts the rail (a date, a numeral, a label) above the entry it belongs to — that
 * is a kicker, not a reordering.
 *
 * `minmax(0, …)` on both tracks, plus `min-w-0` on both children, is what keeps a
 * long unbroken word in the wide column from blowing the grid out past the
 * viewport at 375px.
 */
export function EditorialSplit({
  rail,
  children,
  reverse = false,
  as: Tag = 'div',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: EditorialSplitProps) {
  const key = reverse ? 'reverse' : 'normal';

  const rootClasses = ['grid grid-cols-1 gap-4', COLS[key], className]
    .filter(Boolean)
    .join(' ');
  const railClasses = ['min-w-0', RAIL_POS[key]].filter(Boolean).join(' ');
  const bodyClasses = ['min-w-0', BODY_POS[key]].filter(Boolean).join(' ');

  return (
    <Tag
      className={rootClasses}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <div className={railClasses}>{rail}</div>
      <div className={bodyClasses}>{children}</div>
    </Tag>
  );
}
