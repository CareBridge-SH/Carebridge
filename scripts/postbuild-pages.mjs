// Post-build step for static hosting (GitHub Pages and friends).
//
// Two things every static host needs and Vite does not emit for a SPA:
//
//   1. `404.html` -- a copy of the built `index.html`.
//      This site uses `BrowserRouter`, so `/about` is a real URL that only the
//      client-side router knows about. A static host has no rewrite rules, so a
//      visitor who opens a deep link (or refreshes one) gets the host's 404 page
//      instead of the site. Every static host that supports custom 404s will
//      serve `404.html` for any unmatched path; if that file *is* the app, the
//      app boots, reads the path, and routes correctly. The URL is preserved --
//      no redirect, no hash, no query string.
//
//   2. `.nojekyll` -- tells GitHub Pages to publish the directory as-is.
//      Without it, Pages runs the output through Jekyll, which silently drops
//      files and directories whose names begin with an underscore.
//
// Runs automatically via the `postbuild` npm hook, so `npm run build` and the
// deploy workflow both produce a deployable directory with no extra steps.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'

if (!existsSync(DIST)) {
  console.error(`postbuild-pages: no ${DIST}/ -- run the build first.`)
  process.exit(1)
}

const index = join(DIST, 'index.html')
if (!existsSync(index)) {
  console.error(`postbuild-pages: ${index} is missing, so there is nothing to copy.`)
  process.exit(1)
}

copyFileSync(index, join(DIST, '404.html'))
writeFileSync(join(DIST, '.nojekyll'), '')

// Report the resolved base, because a wrong one produces a blank page rather
// than an error -- this line is the cheapest place to notice that.
const html = readFileSync(index, 'utf8')
const asset = html.match(/(?:src|href)="([^"]*\/assets\/[^"]+)"/)
console.log(`postbuild-pages: wrote 404.html and .nojekyll into ${DIST}/`)
console.log(`postbuild-pages: first asset URL resolves to ${asset ? asset[1] : '(none found)'}`)
