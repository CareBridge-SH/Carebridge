import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// `base` is a deployment concern, not a development one.
//
// GitHub Pages serves a *project* site from `https://<user>.github.io/<repo>/`,
// so every absolute asset URL has to carry the `/<repo>/` prefix or the deployed
// page loads and then fetches its own JS from the root of the domain -- a blank
// white page, with nothing obviously wrong in the HTML. A *user* site
// (`https://<user>.github.io/`) or a custom domain is served from the root and
// needs no prefix.
//
// The default stays '/' so a plain `npm run build` stays byte-identical to the
// verified build. The deploy workflow is what sets the prefix:
//
//   VITE_BASE_PATH=/carebridge-website/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
})
