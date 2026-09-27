import type { ReactNode } from 'react';

export interface RuleProps {
  /**
   * A small label set beside the line. This is the *only* thing a `Rule` ever
   * announces — see the note on `aria-hidden` below. Do not pass a label whose
   * text is already the adjacent heading: it would be read out twice.
   */
  label?: ReactNode;
  /**
   * **Round 5: two weights instead of one.**
   *
   * `hairline` (the default) is one pixel at the round-4 strength. T27 briefly
   * made it quieter than round 4 and that changed how four existing pages look;
   * T30 reverted it on the Lead's instruction. `strong` is the same colour at
   * two pixels, for a rule that has to carry emphasis rather than just separate.
   *
   * A rule is never a highlight; that is what the accent is for, and the accent
   * is rationed to three uses a page.
   */
  weight?: 'hairline' | 'strong';
  className?: string;
}

/*
 * Full class strings, not interpolated names: Tailwind v4 resolves utilities by
 * scanning source text, so a computed class name compiles to nothing.
 *
 * Both weights name a token rather than a literal colour, and neither is a
 * low-alpha tint of a flipping token: a tint measures differently in each
 * theme, and this project has already shipped a 3.32:1 AA failure that way.
 *
 * A rule is decoration, not a UI component, so WCAG 1.4.11 does not apply to
 * it — the contrast figures are recorded because this project measures rather
 * than assumes, not because a rule is owed a contrast budget.
 */
const LINE: Record<NonNullable<RuleProps['weight']>, string> = {
  /*
   * `--color-rule-strong` carries the round-4 strength, so pointing the hairline
   * back at it restores the previous appearance WITHOUT changing a token value —
   * which this round forbids. `--color-rule` (T27's quieter hairline) therefore
   * has no consumer today; it stays defined rather than deleted, because
   * removing a token is as much a change as editing one.
   */
  hairline: 'border-t border-rule-strong',
  strong: 'border-t-2 border-rule-strong',
};

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
export function Rule({ label, weight = 'hairline', className }: RuleProps) {
  if (label === undefined || label === null) {
    return (
      <hr aria-hidden="true" className={[LINE[weight], className].filter(Boolean).join(' ')} />
    );
  }

  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <hr aria-hidden="true" className={[LINE[weight], 'flex-1'].join(' ')} />
      {/* The label voice — small, loose and monospaced, per §2.5. */}
      <span className="font-mono text-label tracking-label text-lavender uppercase">
        {label}
      </span>
    </div>
  );
}
