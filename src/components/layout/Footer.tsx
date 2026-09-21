import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PlaceholderText } from '../ui';

export interface FooterProps {
  className?: string;
}

/**
 * The project's single Instagram URL, frozen in `docs/team/INTERFACES.md` §5
 * and **canonically exported from here**. It is Instagram's real homepage, not
 * an invented profile -- the handle beside it stays a visible `[placeholder]`.
 *
 * `InstagramFeed.tsx` (T09) imports it from here rather than declaring a second
 * copy: two constants pointing at the same string is exactly how they silently
 * drift the day the real handle lands.
 */
export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/';

const NAV_ITEMS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/events', key: 'nav.events' },
  { to: '/get-involved', key: 'nav.getInvolved' },
  { to: '/transparency', key: 'nav.transparency' },
] as const;

const HEADING = 'font-serif text-base font-semibold text-white';
const BODY_LINK =
  'rounded font-sans text-sm text-white underline underline-offset-4 hover:text-lavender';

export function Footer({ className }: FooterProps) {
  const { t } = useTranslation();
  const classes = ['bg-navy-deep', className].filter(Boolean).join(' ');

  return (
    <footer className={classes}>
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-semibold text-white">
              {t('common.siteName')}
            </p>
            <p className="mt-2 max-w-xs font-sans text-sm text-white">
              {t('footer.tagline')}
            </p>
          </div>

          <nav aria-labelledby="footer-sitemap">
            <h2 id="footer-sitemap" className={HEADING}>
              {t('footer.sitemapTitle')}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={BODY_LINK}>
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-6">
            <div>
              <h2 id="footer-contact" className={HEADING}>
                {t('footer.contactTitle')}
              </h2>
              {/*
                A bracketed placeholder, rendered byte-identical and NOT turned
                into a `mailto:` -- there is no real address, and inventing one
                would be fabrication (01-project-brief.md §6).
              */}
              <PlaceholderText as="p" className="mt-3 inline-block">
                {t('footer.contactEmail')}
              </PlaceholderText>
            </div>

            <div>
              <h2 id="footer-instagram" className={HEADING}>
                {t('footer.instagramTitle')}
              </h2>
              {/*
                The visible handle is the accessible name; the new-tab hint is
                `sr-only` text INSIDE the link, never an `aria-label`, which
                would replace the visible label and break WCAG 2.5.3. That exact
                bug has shipped in this project before.
              */}
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-block"
              >
                <PlaceholderText as="span">
                  {t('footer.instagramHandle')}
                </PlaceholderText>
                <span className="sr-only">
                  {' '}
                  {t('a11y.externalLink')}
                </span>
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 font-sans text-sm text-white">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
