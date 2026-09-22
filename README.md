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
