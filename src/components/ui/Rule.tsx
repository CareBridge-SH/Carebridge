import type { ReactNode } from 'react';

export interface RuleProps {
  /**
   * A small label set beside the line. This is the *only* thing a `Rule` ever
   * announces — see the note on `aria-hidden` below. Do not pass a label whose
   * text is already the adjacent heading: it would be read out twice.
   */
  label?: ReactNode;
  className?: string;
}

/*
 * `--color-lavender-dk` at full strength, not a low-alpha tint of a flipping
 * token: a tint measures differently in each theme, and this project has already
 * shipped a 3.32:1 AA failure that way. Against the page ground this hairline is
 * 4.48:1 on dark and 9.21:1 on light.
 *
 * It is nonetheless decoration, not a UI component, so WCAG 1.4.11 does not
 * apply to it — the numbers are recorded because this project measures rather
 * than assumes, not because a rule is owed a contrast budget.
 */
const LINE = 'border-t border-lavender-dk';

/**
 * A hairline that separates **entries**, not sections — the ruled-list
 * affordance. Between two `Section`s it is the boundary; inside a `Prose` column
 * it is a breath.
 *
 * **Accessibility.** A bare `Rule` is decoration and is `aria-hidden`, so it
 * does not add a `separator` to the accessibility tree between every pair of
 * list entries. When it carries a `label`, the line stays hidden and only the
 * label is announced.
 */
export function Rule({ label, className }: RuleProps) {
  if (label === undefined || label === null) {
    return <hr aria-hidden="true" className={[LINE, className].filter(Boolean).join(' ')} />;
  }

  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <hr aria-hidden="true" className={[LINE, 'flex-1'].join(' ')} />
      <span className="font-sans text-xs font-semibold tracking-wide text-lavender uppercase">
        {label}
      </span>
    </div>
  );
}
