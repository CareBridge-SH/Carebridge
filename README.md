# CareBridge

CareBridge is the website for a **100% youth-led** non-profit club at SHSID that
supports, motivates and empowers children in healthcare. The site has five pages
— Home, About Us, Events & Initiatives, Get Involved, and Transparency — in
English and Simplified Chinese (zh-CN). Its slogan is `support, motivate, and
empower`; its hero headline is `Bridging Care and Compassion.`

> There is **no donation function** anywhere on this site. The `/donate` route
> only redirects to `/transparency`.

## Stack

- **React 19 + Vite + TypeScript** — SPA, client-side routing.
- **Tailwind CSS v4** — utilities backed by design tokens in `src/index.css`
  (dual dark/light theme, no dark-mode media query).
- **react-router-dom** — five routes plus two redirects (`/donate` → `/transparency`,
  `*` → `/`).
- **react-i18next** — every user-facing string lives in
  `src/i18n/locales/*.json`; nothing is hardcoded in components.
- **oxlint** — the linter.

There is **no test runner, no backend, no database, no accounts, no analytics,
and no Instagram API** (the Instagram feed is a build-time JSON snapshot).

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build (runs check:instagram as prebuild)
npm run preview    # serve the production build
npm run lint       # oxlint
```

The i18n gate is not an npm script — run it directly:

```bash
node docs/team/check-i18n.mjs            # locale parity + placeholder scan
node docs/team/check-i18n.mjs --placeholders   # placeholder inventory
```

## How to update the Instagram feed

There is no API. Adding a photo touches exactly two things: drop a `.jpg` into
`public/instagram/` and add one entry to `src/data/instagram-posts.json`, newest
first, then run `npm run check:instagram` (must print `PASS`) and `npm run build`.

Full runbook, field reference and guard rules: [`docs/INSTAGRAM.md`](docs/INSTAGRAM.md).

## How to add a language

1. Copy `src/i18n/locales/en.json` to `src/i18n/locales/<code>.json` and
   translate the values (never the keys, and never the `[Bracketed]`
   placeholders — those stay byte-identical).
2. Add the code to `supportedLngs` in `src/i18n/config.ts`.
3. Verify with `node docs/team/check-i18n.mjs`.

> **Do not** add `nonExplicitSupportedLngs` to `src/i18n/config.ts`. It silently
> breaks the language switcher (`docs/TEAM-RULES.md`).

## How to update written content

All copy lives in `src/i18n/locales/en.json` and `src/i18n/locales/zh-CN.json`.
Edit **both** files with the **same keys** — a key present in one locale but not
the other is an error. Strings inside `[square brackets]` are deliberate
placeholders: render them byte-identical and never translate them (see
[`docs/PLACEHOLDERS.md`](docs/PLACEHOLDERS.md)).

## Doc map

- [`docs/TEAM-RULES.md`](docs/TEAM-RULES.md) — team process and file ownership.
- [`docs/diagrams/`](docs/diagrams/README.md) — the five architecture diagrams,
  each validated by rendering.
- [`docs/PLACEHOLDERS.md`](docs/PLACEHOLDERS.md) — generated placeholder inventory.
- [`docs/INSTAGRAM.md`](docs/INSTAGRAM.md) — the Instagram feed runbook.
- [`docs/plans/`](docs/plans/README.md) — roadmap of deliberate future work.
