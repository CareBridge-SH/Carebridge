import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/useTheme';

export interface ThemeToggleProps {
  className?: string;
}

/**
 * The label is `aria-label` on an icon-only button, which is the correct use of
 * it: there is no visible text for it to replace, so WCAG 2.5.3 (label in name)
 * is not in play. It states the **action**, not the current state -- the label
 * flips with the theme.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();

  const label =
    theme === 'dark'
      ? t('a11y.themeToggleToLight')
      : t('a11y.themeToggleToDark');

  const classes = [
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-lavender-dk text-lavender transition-colors hover:bg-navy-soft',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={toggle}
      className={classes}
      aria-label={label}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
