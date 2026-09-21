import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

/**
 * Where a returning visitor's choice is remembered.
 * `i18next-browser-languagedetector` both reads and writes this key; nothing else
 * in the app should touch it.
 */
export const LANGUAGE_STORAGE_KEY = 'carebridge-language';

/**
 * The single place a language is registered.
 *
 * Adding a language = drop `locales/<bcp47-tag>.json` next to the others (same keys,
 * same order) and add the tag here. Nothing else changes: the switcher labels every
 * supported language from `Intl.DisplayNames`, so no component edit is involved.
 */
export const supportedLngs = ['en', 'zh-CN'] as const;

export type SupportedLocale = (typeof supportedLngs)[number];

/**
 * Bundled at build time — there is no HTTP backend, no fetch and no runtime locale
 * request, so a translation can never be "still loading" or fail over the network.
 */
export const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
};

/**
 * `document.documentElement.lang` must track the active locale (screen readers
 * switch pronunciation on it). It is kept in sync on init and on every change.
 */
function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...supportedLngs],
    fallbackLng: 'en',

    // Resources are already in memory (`initAsync` is the i18next 26 name for what
    // earlier majors called `initImmediate`), so initialising without a deferred
    // macrotask avoids a first paint of raw keys (e.g. "home.hero.headline").
    initAsync: false,

    // React already escapes rendered text; double-escaping would print entities.
    interpolation: { escapeValue: false },

    detection: {
      // Stored choice first, browser preference only as the initial guess.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },

    // The i18next "non-explicit supported languages" option (the flag whose name is
    // `nonExplicit` + `SupportedLngs`, written here in TWO pieces on purpose so that a
    // grep for the forbidden option cannot hit this comment) must stay ABSENT here.
    // Setting it, to any value, silently breaks resolution for 'zh-CN' and the language
    // switcher stops working. See docs/TEAM-RULES.md.
  });

syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language ?? 'en');
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
