import type { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  /**
   * A closed literal union, deliberately not `keyof JSX.IntrinsicElements`:
   * on React 19 the bare global `JSX` namespace does not exist (`@types/react`
   * moved it to `React.JSX`), so that form does not compile.
   */
  as?: 'div' | 'section' | 'main' | 'article';
  className?: string;
  /* Forwarded to the root element. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** `px-5` keeps ~20px of gutter at 375px, so text never runs edge to edge. */
const LAYOUT = 'mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8';

export function Container({
  children,
  as: Tag = 'div',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ContainerProps) {
  const classes = [LAYOUT, className].filter(Boolean).join(' ');

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
