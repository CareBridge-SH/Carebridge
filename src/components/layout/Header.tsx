import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export interface HeaderProps {
  className?: string;
}

const NAV_ITEMS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/events', key: 'nav.events' },
  { to: '/get-involved', key: 'nav.getInvolved' },
  { to: '/transparency', key: 'nav.transparency' },
] as const;

/*
 * `whitespace-nowrap` + `shrink-0`: a nav label must never break across two
 * lines. Without them a squeezed flex row splits "About Us" and "Get Involved",
 * which is exactly what happened at 768px (labels 56px tall against 36px for the
 * single-word ones, and an 80px header instead of 64px).
 */
const NAV_LINK_BASE =
  'shrink-0 rounded-md px-3 py-2 font-sans text-sm font-medium whitespace-nowrap transition-colors';

/**
 * `aria-current="page"` comes free from `NavLink`. The active item is also
 * underlined and emboldened, so the indication is never colour-only.
 */
function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    NAV_LINK_BASE,
    isActive
      ? 'font-semibold text-cream underline decoration-2 underline-offset-4'
      : 'text-white hover:text-lavender',
  ].join(' ');
}

export function Header({ className }: HeaderProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [renderedPath, setRenderedPath] = useState(location.pathname);

  // A menu left open across a navigation covers the page the user just asked
  // for. Two sources, so two mechanisms, and neither is redundant:
  //
  //  1. the links themselves close it on click (below) -- this is the only thing
  //     that fires when the destination is the route already showing, where the
  //     pathname never changes; and
  //  2. adjusting state during render when the pathname *does* change, which is
  //     React's documented pattern for "reset state when an input changes" and
  //     covers history navigation (back/forward) that no click preceded.
  if (renderedPath !== location.pathname) {
    setRenderedPath(location.pathname);
    setMenuOpen(false);
  }

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Escape closes it and hands focus back, so the keyboard user is never stranded.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const classes = ['bg-navy-deep', className].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        {/*
          The logo IS the visible wordmark, so its `alt` is the link's accessible
          name -- exactly one name, no `aria-label` anywhere near it (WCAG 2.5.3).
          `width`/`height` are the real intrinsic pixels (1008x454) so the header
          cannot reflow once the PNG arrives.
        */}
        <Link to="/" className="flex shrink-0 items-center">
          {/*
            Base-aware, and it has to be. Vite rewrites asset URLs it can see at
            build time (index.html, imports) but not strings assembled at runtime
            -- so a bare "/logo.png" here resolves against the ORIGIN root. This
            site is published under a subpath, so that root is `github.io`, one
            level above us: the request 404s and the wordmark is simply missing,
            with no build error to warn anyone. BASE_URL is always
            slash-terminated, so the concatenation is safe.
          */}
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            width={1008}
            height={454}
            alt={t('common.siteName')}
            className="h-9 w-auto rounded-md sm:h-10"
          />
        </Link>

        {/*
          `lg:`, not `md:`. The full desktop row needs ~752px of content width
          (logo 89 + nav ~461 + switcher 122 + toggle 40 + gaps 32); at the `md`
          breakpoint only 720px is available, so it does not fit. At `lg` (1024px)
          there is 960px, which fits with ~208px of slack for longer labels in a
          future locale. Below `lg` the hamburger handles it.
        */}
        <nav
          aria-label={t('a11y.mainNav')}
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={navLinkClass}
              onClick={closeMenu}
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-lavender-dk text-lavender transition-colors hover:bg-navy-soft lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="header-menu"
          aria-label={t('a11y.mainNav')}
          onClick={() => {
            setMenuOpen((open) => !open);
          }}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/*
        In-flow, not an overlay: it pushes the page down instead of covering it,
        so nothing behind it is scroll-locked and focus is never trapped. It is
        also `md:hidden` outright, so the two <nav> landmarks can never both be
        exposed whatever the state is when the window is widened.
      */}
      <div
        id="header-menu"
        className={menuOpen ? 'border-t border-lavender-dk lg:hidden' : 'hidden'}
      >
        <nav
          aria-label={t('a11y.mainNav')}
          className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-3 sm:px-6"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={navLinkClass}
              onClick={closeMenu}
            >
              {t(item.key)}
            </NavLink>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
