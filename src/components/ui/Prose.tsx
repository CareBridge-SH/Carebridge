import type { ReactNode } from 'react';

export interface ProseProps {
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
  className?: string;
  /* Forwarded to the root element. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/*
 * The measure cap. `65ch` is the classic upper bound for a comfortable line —
 * DESIGN.md notes that Body copy has had no enforced line length until now, with
 * `Container`'s `max-w-6xl` as the only constraint, and names this as the gap a
 * later pass would want to close.
 *
 * Rhythm is a flex `gap`, not `space-y` on the children: `space-y-*` compiles to a
 * descendant selector with a higher specificity than a plain `mt-*` on a child,
 * so a pull-quote could not opt into extra air without fighting it. `gap` composes
 * with a child's own margin instead.
 */
const SCOPE =
  'flex max-w-[65ch] flex-col gap-5 font-sans text-white [&>blockquote]:my-6';

/**
 * A long-form text scope: the measure cap, paragraph rhythm, and the two pieces
 * of typographic furniture a long read needs — a lead paragraph and a pull-quote.
 *
 * Put plain `<p>` children directly inside it; they inherit the rhythm.
 */
export function Prose({
  children,
  as: Tag = 'div',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ProseProps) {
  return (
    <Tag
      className={[SCOPE, className].filter(Boolean).join(' ')}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Tag>
  );
}

export interface ProseLeadProps {
  children: ReactNode;
  className?: string;
}

/*
 * The opening paragraph of a long read: a step up in size, still the Body voice
 * per the Two-Voice Rule — sans, states a fact — never the serif.
 */
const LEAD = 'font-sans text-lg leading-relaxed text-white md:text-xl';

export function ProseLead({ children, className }: ProseLeadProps) {
  return <p className={[LEAD, className].filter(Boolean).join(' ')}>{children}</p>;
}

export interface PullQuoteProps {
  children: ReactNode;
  className?: string;
}

/*
 * `<blockquote>` is the element for a pulled quotation; the bar is the same
 * hairline `Rule` draws, at full strength rather than as a tint of a flipping
 * token. It carries no vertical margin of its own — `Prose` supplies the air
 * around it — so it can also sit directly in a grid column without drifting
 * out of alignment with the heading beside it.
 */
const QUOTE =
  'border-l-2 border-lavender-dk pl-5 font-serif text-2xl leading-snug text-white italic md:text-3xl';

export function PullQuote({ children, className }: PullQuoteProps) {
  return (
    <blockquote className={[QUOTE, className].filter(Boolean).join(' ')}>
      {children}
    </blockquote>
  );
}
