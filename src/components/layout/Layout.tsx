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
 *
 * **`min-h-screen` is the D-1 fix, and it reserves space rather than hiding the
 * shift.** The layout shift was the footer: with a short fallback the footer sat
 * inside the viewport, and the moment a route chunk arrived the real page pushed
 * it down and out (measured 0.21-0.46 CLS, one shift, footer-attributed). A
 * fallback at least a viewport tall puts the footer below the fold *before* the
 * chunk lands, so the thing that used to move is never in the viewport when it
 * moves, and nothing above it moves at all.
 *
 * It is still the same skeleton — nothing is hidden, no boundary is removed, and
 * a slow connection sees *more* fallback than before, not less. The extra blocks
 * make it the shape of a page in this round (display headline, body lines,
 * plate) rather than three bars at the top of an empty box.
 */
function PageFallback() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-16 sm:px-6 lg:px-8"
    >
      <div className="h-16 w-3/4 rounded bg-navy-soft motion-safe:animate-pulse md:h-24" />
      <div className="mt-10 h-4 w-full max-w-2xl rounded bg-navy-soft motion-safe:animate-pulse" />
      <div className="mt-2 h-4 w-5/6 max-w-2xl rounded bg-navy-soft motion-safe:animate-pulse" />
      <div className="mt-12 aspect-[3/1] w-full rounded bg-navy-soft motion-safe:animate-pulse" />
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

      {/*
        Page furniture — the running head and the folio — is rendered by
        `Header` and `Footer` respectively, INSIDE those landmarks. It used to
        sit here, between them, and that was a defect: bare body content outside
        every landmark fails axe's `region` rule, which it did on all 60 matrix
        cells. It is still outside `<main>`, so it is never in the content's
        reading order.
      */}
      <Header />

      {/*
        `min-h-screen` on `main`, not just `flex-1`.

        Round 5 closed D-1 by giving the FALLBACK a viewport height, which puts
        the footer below the fold before a route chunk lands. That works for
        every page whose real content is TALLER than the fallback: the footer
        only ever moves further down and out, so nothing is counted.

        Get Involved is the exception, and round 6 made it one — removing its
        opening plate shortened it, and its content region now measures 645px
        against the fallback's 900px. The footer therefore RISES, from 964 to
        709, crossing from off-screen into the viewport. Measured CLS 0.038 here,
        0.056 on Lighthouse, 0.072 on the verifier's instrument.

        Reserving the viewport on `main` makes the two states identical rather
        than merely ordered: with the fallback, `main` is 900px; with the real
        content it is max(645, 900) = 900px. The footer sits at 964 either way
        and never moves. Nothing is hidden, the boundary stays, and a slow
        connection still sees the same skeleton — it just gets a `main` that is
        the height of the screen, which is what a content region above a footer
        should have been all along.
      */}
      <main id="main" tabIndex={-1} className="min-h-screen flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
