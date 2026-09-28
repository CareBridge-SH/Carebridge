# CareBridge

The public website for CareBridge.

A static single-page application built with Vite, React and TypeScript, styled
with Tailwind CSS and translated with `i18next`.

## Requirements

- **Node.js 24** — the build and the helper scripts in `scripts/` use APIs that
  require a recent Node (verified on 24.x).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local development server |
| `npm run build` | Production build into `dist/` — validates the Instagram data first, then generates the static-host files |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | Lint with oxlint |
| `npm run check:instagram` | Validate `src/data/instagram-posts.json` |

## Deployment

Deployed to **GitHub Pages** by `.github/workflows/deploy-pages.yml` on every
push to `master` (and on manual dispatch).

See **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** for the base-path rules, the
two failure modes (blank page / deep-link 404) and the local preview commands.

> The site is served from a sub-path (`/<repo-name>/`), so `base` in
> `vite.config.ts` is set from the `VITE_BASE_PATH` environment variable. A
> wrong value produces a blank page, not an error.

## Project layout

| Path | Contents |
| --- | --- |
| `src/pages/` | One component per route |
| `src/components/` | Shared UI primitives and layout |
| `src/i18n/` | Locale files and i18n setup |
| `src/data/` | Build-time data (the Instagram snapshot) |
| `scripts/` | Build-time helpers invoked by npm |
| `docs/` | Deployment and data-contract documentation |

## Content and translations

The site is bilingual — **English** and **Simplified Chinese** (`zh-CN`).

All user-facing copy lives in the locale files, `src/i18n/locales/en.json` and
`src/i18n/locales/zh-CN.json`. Components read strings through the translation
function and must not hardcode user-visible text, so anything added to one
locale must be added to the other.

### Which language a first visit gets

A visitor's language is resolved in exactly this order, and the order is the contract:

1. **A stored choice** — whatever the visitor picked last. It wins over everything,
   including a browser that reports something else.
2. **The language subtag** — `zh`, `zh-TW`, `zh-Hans` are all Chinese (`zh-CN`); any
   `en…` tag is English.
3. **The region subtag** — an unrelated language (`de`, `fr`) in `CN`, `HK`, `MO` or
   `TW` gets `zh-CN`; anywhere else gets `en`.

The rule lives in one place — `toSupportedLocale` in `src/i18n/locale.ts` — and is wired
in as the language detector's `convertDetectedLanguage` hook in `src/i18n/config.ts`.
The detector runs that hook over the *stored* value as well as the detected one, which is
only safe because the rule returns every supported tag unchanged.

There is deliberately **no timezone lookup and no network call** anywhere in this path.
The site makes zero external requests, so resolving a visitor's country by IP address
would mean a third-party request on every first visit: a privacy leak, and a new failure
mode (offline, blocked, slow) bought only to guess a default. `navigator.language` is
already local data.

The switcher shows each language in its own language, named by `Intl.DisplayNames` — with
one override in `LANGUAGE_LABELS` (`src/i18n/locale.ts`): `zh-CN` reads `中文`, because
ICU would render `中文（中国）`, which names a country rather than the language.
