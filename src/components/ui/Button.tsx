import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Present -> renders a react-router `<Link to={to}>`. Beats `href`. */
  to?: string;
  /** Present (and no `to`) -> renders an `<a href={href}>`. */
  href?: string;
  /*
   * For links that leave the site. `target="_blank"` without
   * `rel="noreferrer noopener"` hands the opened page a `window.opener`
   * reference it can navigate us with, so always pass both together.
   */
  target?: '_blank' | '_self';
  rel?: string;
  onClick?: () => void;
  /** Only meaningful when rendered as a `<button>`. */
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  /*
   * Forwarded to whichever element renders as the root. Three explicit optional
   * props rather than a `{...rest}` spread: it covers
   * "name this thing" without reopening the type safety of every other attribute.
   */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-lavender text-navy-deep hover:bg-lavender-dk',
  secondary: 'border-2 border-lavender text-lavender hover:bg-navy-soft',
  ghost: 'text-lavender underline underline-offset-4 hover:text-cream',
};

const SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * The focus ring is never removed here — it comes from the global
 * `:focus-visible` outline in `src/index.css`, which is cream in both themes.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  target,
  rel,
  onClick,
  type = 'button',
  disabled = false,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ButtonProps) {
  const classes = [BASE, VARIANT[variant], SIZE[size], className]
    .filter(Boolean)
    .join(' ');

  const rootProps = {
    className: classes,
    onClick,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  };

  if (to) {
    return (
      <Link to={to} {...rootProps}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        /* react-router's `<Link>` has no equivalent, so `target`/`rel` live on
           this branch only — they are inert when the root is a `<button>`. */
        target={target}
        rel={rel}
        {...rootProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} {...rootProps}>
      {children}
    </button>
  );
}
