/**
 * Pure locale rules — no i18next import, no DOM access, no side effects.
 *
 * Deliberately NOT inside `config.ts`: that module initialises i18next the moment it is
 * imported, so anything living there can only be exercised in a browser. These two rules
 * are exactly the kind of thing that needs a table of cases, so they live in a module a
 * plain Node script can import and run.
 */

/**
 * Languages whose own name is not the name `Intl.DisplayNames` returns.
 *
 * `Intl.DisplayNames` is the DEFAULT, because it is right for a language nobody here has
 * thought about yet. Chinese is the one exception: ICU returns "中文（中国）", and the
 * region qualifier is noise for the language this site is actually written in, so the
 * option must read exactly the two characters `中文`. This is a label override only — the
 * value submitted is still `zh-CN`, and every other language still goes through
 * `Intl.DisplayNames`.
 */
export const LANGUAGE_LABELS: Partial<Record<string, string>> = {
  'zh-CN': '中文',
};

/**
 * The name shown for a language option in its OWN language.
 *
 * Checks the override map first (see above), then falls back to `Intl.DisplayNames`, then
 * to the raw tag if the runtime has neither. Before this map existed the switch rendered
 * "中文（中国）"; it was reported as wrong because it reads as a *country*, not the language.
 */
export function languageLabel(tag: string): string {
  const override = LANGUAGE_LABELS[tag];
  if (override) return override;
  try {
    return new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/** Regions the site serves in Chinese, when nothing more specific is known. */
const CHINESE_REGIONS = ['CN', 'HK', 'MO', 'TW'];

/**
 * Resolve one detected language tag to a locale the site actually ships.
 *
 * The order is the contract, and it is the whole point of this function:
 *
 *   1. **A supported tag wins outright** — so a visitor's stored choice is returned
 *      unchanged whatever their browser claims. This matters more than it looks: the
 *      detector applies this hook to the STORED value as well as the detected one, which
 *      is only safe because this function is idempotent on every supported tag.
 *   2. **The language subtag** — `zh`, `zh-TW`, `zh-Hans`, `zh-Hant-TW` are all Chinese.
 *   3. **The region subtag** — an unrelated language (`de`, `fr`) in `CN`/`HK`/`MO`/`TW`
 *      gets `zh-CN`; anywhere else gets `en`.
 *
 * Nothing here performs a timezone lookup and nothing makes a network call, and nothing
 * may be added that does. The site makes zero external requests by design, so an
 * IP → country lookup would mean a third-party request on every first visit — a privacy
 * leak and a failure mode (offline, blocked, slow) bought for a default nobody asked for.
 * `navigator.language` is already local data.
 */
export function toSupportedLocale(
  detected: string | null | undefined,
  supported: readonly string[],
): string {
  const raw = (detected ?? '').trim();
  if (!raw) return 'en';

  // 1. A stored choice (or an explicitly tagged language) the site supports wins.
  const exact = supported.find((tag) => tag.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;

  const [language, ...rest] = raw.split('-');

  // 2. The language subtag beats the region: `zh-TW` is Chinese, not Taiwan-only.
  const lang = language.toLowerCase();
  if (lang === 'zh') return 'zh-CN';
  if (lang === 'en') return 'en';

  // 3. Only now the region, and only for regions the site publishes Chinese for.
  const region = rest.find((part) => /^[A-Za-z]{2}$/.test(part) || /^\d{3}$/.test(part));
  return region && CHINESE_REGIONS.includes(region.toUpperCase()) ? 'zh-CN' : 'en';
}
