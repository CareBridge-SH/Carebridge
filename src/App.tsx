import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GetInvolved = lazy(() => import('./pages/GetInvolved'));
const TransparencyPage = lazy(() => import('./pages/TransparencyPage'));

/**
 * Seven route entries: five pages and two redirects.
 *
 * `/donate` is a redirect only -- it renders no page and no donation UI, because
 * CareBridge takes no donations on this site. It exists
 * solely so old shared links do not 404.
 *
 * `BrowserRouter` lives here rather than in `main.tsx` because `main.tsx` is a
 * fixed contract this task may not edit.
 *
 * **`basename` is not decoration, and its absence was a live defect.** The site is
 * served from `/Carebridge/` on GitHub Pages, and `BASE_URL` is the only thing that
 * knows it. Without a basename the router reads `pathname = "/Carebridge/about"`,
 * matches none of the five paths, falls through to `*`, and `Navigate to="/"`
 * rewrites the address bar to the origin root -- so **every deep link, and every
 * refresh on a page other than Home, silently landed on Home.**
 *
 * It could not be seen locally: `BASE_URL` is `/` there, so the paths match by
 * accident. Six rounds of headless-Chrome verification, every one of them against a
 * local preview, therefore never exercised it. Measured on the deployed build with
 * `--dump-dom`: `/Carebridge/about` and `/Carebridge/events` both returned Home's
 * `<h1>` with `aria-current` on Home.
 *
 * `replace(/\/+$/, '')` drops the trailing slash React Router does not want;
 * `|| '/'` keeps the local build a real basename instead of an empty string.
 */
const BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/get-involved" element={<GetInvolved />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/donate" element={<Navigate to="/transparency" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
