# Deployment

The site is a static bundle: no server, no runtime API calls, no secrets. Anything
that can serve files can host it. GitHub Pages is configured and ready; this page
is what to do, and what to check when it goes wrong.

## What is already in place

| Piece | Where | What it does |
|---|---|---|
| Base-path switch | `vite.config.ts` | `VITE_BASE_PATH` sets the asset prefix. Unset = `/`, so a local build is unchanged. |
| SPA deep-link fallback | `scripts/postbuild-pages.mjs` | Copies `dist/index.html` → `dist/404.html`. See below. |
| Jekyll opt-out | same script | Writes `dist/.nojekyll`. |
| Build + deploy | `.github/workflows/deploy-pages.yml` | On every push to `master`, and on demand. |

`npm run build` produces a deployable `dist/` on its own — the post-build step runs
automatically through npm's `postbuild` hook.

## Deploying to GitHub Pages — the whole procedure

1. **Create the repository** and push. The repo name becomes the URL path:
   `https://<user>.github.io/<repo>/`.
2. **Settings → Pages → Source: GitHub Actions.** One-time, once per repo.
3. **Push to `master`.** The workflow installs, builds, verifies the output, and
   publishes. The URL appears in the Actions run and in the `github-pages`
   environment.

Redeploys are a push. Nothing is ever committed to a `gh-pages` branch.

## The two things that go wrong, and why

### 1. A blank white page

This is almost always **a wrong base path**, and it is deceptive: the HTML arrives
fine, the tab title is right, and the page is empty. What has happened is that the
browser fetched `/assets/index-<hash>.js`, which on a project page is the wrong URL
— it needed `/<repo>/assets/index-<hash>.js`. The 404 is silent because a missing
script is not an error the page can report.

The guard: `scripts/postbuild-pages.mjs` prints the resolved first asset URL after
every build, and the workflow greps it into the log. A local `npm run build` (no
`VITE_BASE_PATH`) prints `/assets/...`; a Pages build must print
`/<repo>/assets/...`. If it prints the wrong one, the deploy is wrong, and you know
before the browser does.

| Target | `VITE_BASE_PATH` |
|---|---|
| Project page — `https://user.github.io/repo/` | `/repo/` (the workflow derives this automatically) |
| User/org page — `https://user.github.io/` | `/` |
| Custom domain — `https://carebridge.org/` | `/` |

### 2. A deep link 404s, or a refresh 404s

`BrowserRouter` puts routes in the *path* (`/about`, `/get-involved`). A static
host has no rewrite rules, so it looks for a file at `/about`, does not find one,
and serves its 404 — even though the app knows exactly what `/about` means.

The fix is `dist/404.html`: because it is a copy of the built app, a host that
serves `404.html` for unmatched paths ends up running the app, which reads the
path and routes correctly. The URL is preserved — no redirect, and no `#` in the
address.

This works on GitHub Pages, Netlify and Cloudflare Pages. Hosts with native SPA
rewrite config (Netlify `_redirects`, Vercel `vercel.json`) can use that instead.

## Previewing production output locally

```powershell
# PowerShell -- the project page layout
$env:VITE_BASE_PATH='/carebridge-website/'; npm run build; npm run preview
```

```bash
# bash / zsh
VITE_BASE_PATH=/carebridge-website/ npm run build && npm run preview
```

Then check two things a plain `npm run build` cannot: open a deep link directly
(`/about`) and press refresh on it. Both must render the page, not a 404.

## Anything else that serves files

`dist/` is the whole artifact — upload it anywhere. Requirements:

- Serve `index.html` for unmatched paths (or ship the `404.html` fallback).
- Serve over **HTTP(S)**, never `file://`. A single-page app opened from the file
  system is blocked by the browser's origin rules and shows a blank page. This is
  expected, not a bug in the site.
- HTTPS, because the site is served over TLS elsewhere and mixed content would
  break.
