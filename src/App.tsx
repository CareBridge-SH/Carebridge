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
 */
export default function App() {
  return (
    <BrowserRouter>
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
