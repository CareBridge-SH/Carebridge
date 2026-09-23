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
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
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

// ---------------------------------------------------------------------------
// Guard: nothing in public/ may be referenced root-absolutely.
//
// Vite rewrites asset URLs it can see at build time -- `index.html`, `import`s --
// but NOT strings put together at runtime. `src="/logo.png"` in JSX survives the
// build verbatim and resolves against the ORIGIN root. This site is published
// under a subpath, so that root is the host itself, one level above the app: the
// request 404s at runtime and the build stays green. The header wordmark shipped
// that way, and its absence was only visible by loading the deployed site.
//
// So every FILE in public/ is hunted for in the built output as a root-absolute
// URL ("/name" or url(/name)). The correct form is always base-prefixed
// ("/Carebridge/name"), which cannot match. Silence means clean.
//
// DIRECTORIES under public/ are deliberately NOT checked here, and that is not a
// loophole being ignored -- it is a limit of what the bundle can tell us. A file
// in public/ can only be reached by a literal URL, so a root-absolute literal is
// always wrong. A directory (public/instagram/) holds data-driven content whose
// paths live in src/data/*.json as the string "/instagram/<file>", and the
// component prefixes BASE_URL to them at render time. That string is a PATH, not
// a URL, and it is supposed to look like that -- this check called it a violation
// the first time the feed actually had posts in it. Whether those paths get
// resolved correctly can only be judged by rendering the page, which is what the
// browser harness does (it fails on any request the page makes that 404s).
//
// This can only be judged when the build targets a subpath. At base "/" a
// root-absolute URL is exactly right, so the check stands down instead of
// reporting noise -- which does mean `npm run build` locally, without
// VITE_BASE_PATH, cannot catch it. The deploy workflow always sets it.
const BASE = (process.env.VITE_BASE_PATH ?? '/').replace(/\/*$/, '/')

if (BASE !== '/') {
  const publicDir = 'public'
  const publicFiles = existsSync(publicDir)
    ? readdirSync(publicDir, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name)
    : []

  const assetsDir = join(DIST, 'assets')
  const built = [
    index,
    join(DIST, '404.html'),
    ...(existsSync(assetsDir)
      ? readdirSync(assetsDir).map((f) => join(assetsDir, f))
      : []),
  ].filter((f) => existsSync(f) && /\.(?:html|js|css)$/.test(f))

  const offenders = []
  for (const file of built) {
    const text = readFileSync(file, 'utf8')
    for (const name of publicFiles) {
      // The opening delimiter is part of the needle and the closing one is NOT,
      // and both halves of that matter.
      //
      // Opening: a correct URL is base-prefixed ("/Carebridge/name"), so it can
      // never begin with a quote immediately followed by "/name". Requiring the
      // opening quote is what keeps "/Carebridge/name" from matching.
      //
      // Closing: deliberately omitted. The minifier picks the quote style for
      // us and does not pick what the source used -- these land in the bundle as
      // template literals, not double-quoted strings. Requiring the wrong
      // delimiter is precisely how the first version of this guard reported OK
      // on a build that still contained the bug. Verified by reintroducing the
      // bug and watching this fail; do the same if you touch this list.
      const needles = [`"/${name}`, `'/${name}`, '`/' + name, `url(/${name}`]
      for (const needle of needles) {
        if (text.includes(needle)) offenders.push({ name, needle, file })
      }
    }
  }

  if (offenders.length > 0) {
    console.error(
      `postbuild-pages: ${offenders.length} reference(s) to a public/ asset would 404 on the deployed site.`,
    )
    for (const { name, needle, file } of offenders) {
      console.error(`  ${name}  --  found as ${needle} in ${file}`)
    }
    console.error(
      'postbuild-pages: build the URL from import.meta.env.BASE_URL instead (see Header.tsx, InstagramFeed.tsx).',
    )
    process.exit(1)
  }

  console.log(
    `postbuild-pages: public/ asset paths OK (${publicFiles.length} file(s) checked against base ${BASE}).`,
  )
}
