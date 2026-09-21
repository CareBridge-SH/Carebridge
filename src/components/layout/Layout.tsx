import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Non-blank Suspense fallback, so a lazy route never paints an empty white
 * flash. It carries no text on purpose -- there is no "loading" string in the
 * frozen key set, and inventing one is not allowed -- so it is a skeleton marked
 * `aria-hidden` instead. `motion-safe:` honours prefers-reduced-motion.
 */
function PageFallback() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8"
    >
      <div className="h-10 w-2/3 rounded bg-navy-soft motion-safe:animate-pulse" />
      <div className="mt-6 h-4 w-full rounded bg-navy-soft motion-safe:animate-pulse" />
      <div className="mt-2 h-4 w-5/6 rounded bg-navy-soft motion-safe:animate-pulse" />
    </div>
  );
}

/**
 * The shell. `Header` and `Footer` own the chrome; what must stay here is the
 * skip link as the first focusable element, the single `<main id="main">`, and
 * the `Suspense` boundary that keeps a lazy route from painting an empty flash.
 */
export function Layout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-navy text-white">
      {/* First focusable element in the document. `#main` has tabIndex={-1} so
          activating this actually moves focus, not just the scroll position. */}
      <a href="#main" className="skip-link">
        {t('a11y.skipToContent')}
      </a>

      <Header />

      <main id="main" tabIndex={-1} className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
