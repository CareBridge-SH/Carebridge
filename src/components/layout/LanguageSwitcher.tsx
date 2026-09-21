import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '../../i18n/config';

export interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Each language is listed in **its own** language ("English", "中文（中国）"),
 * which is what a reader who cannot read the current UI language needs. That is
 * `Intl.DisplayNames` with the tag as both the locale and the argument, so no
 * per-language key is needed and adding a third language stays a config-only
 * change (`src/i18n/config.ts`).
 */
function autonym(tag: string): string {
  try {
    return new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/**
 * A native `<select>`: keyboard operable, shows the active language, and needs
 * no custom focus management. Its accessible name comes from a real `<label>`
 * rather than an `aria-label`, so the visible value is never replaced.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const selectId = useId();
  const current = i18n.resolvedLanguage ?? supportedLngs[0];

  const classes = [
    'rounded-md border border-lavender-dk bg-navy-deep px-2 py-2 font-sans text-sm font-semibold text-white',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex items-center">
      <label htmlFor={selectId} className="sr-only">
        {t('a11y.languageSwitcherLabel')}
      </label>
      <select
        id={selectId}
        className={classes}
        value={current}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
      >
        {supportedLngs.map((tag) => (
          <option key={tag} value={tag}>
            {autonym(tag)}
          </option>
        ))}
      </select>
    </div>
  );
}
