import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Button,
  Card,
  Container,
  Grid,
  PlaceholderText,
  SectionHeading,
} from '../components/ui';
/*
 * The Instagram section renders `InstagramFeed` and nothing else -- no fetching,
 * skeleton, or empty-state logic lives here. Everything about *where* the posts
 * come from belongs to that component and `src/data/instagram-posts.json`.
 */
import { InstagramFeed } from '../components/InstagramFeed';

const EVENT_IDS = [
  'fallWorkshop',
  'triviaNight',
  'christmasSale',
  'paLectures',
  'hospitalVisits',
] as const;

const IMPACT_IDS = ['fundraising', 'awareness', 'directAction'] as const;

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="home" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="home-hero">
        <Container className="py-20 text-center md:py-28">
          {/*
            The slogan is the "script" element: elegant serif italic in cream
            (--color-cream is the palette's soft yellow/cream accent), not an
            invented token.
          */}
          <p className="font-serif text-xl italic text-cream md:text-2xl">
            {t('common.slogan')}
          </p>

          <h1
            id="home-hero"
            className="mx-auto mt-4 max-w-4xl font-serif text-4xl font-semibold text-white sm:text-5xl lg:text-6xl"
          >
            {t('home.hero.headline')}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg text-white">
            {t('home.hero.subheadline')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button to="/get-involved" variant="primary" size="lg">
              {t('home.hero.cta.join')}
            </Button>
            <Button to="/get-involved" variant="secondary" size="lg">
              {t('home.hero.cta.partner')}
            </Button>
            <Button href="#home-instagram" variant="ghost" size="lg">
              {t('home.hero.cta.follow')}
            </Button>
          </div>
        </Container>
      </section>

      {/* ── Impact snapshot ──────────────────────────────────────────────── */}
      <section aria-labelledby="home-impact" className="py-16 md:py-24">
        <Container>
          <SectionHeading id="home-impact" level={2}>
            {t('home.impact.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('home.impact.subtitle')}
          </p>

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md" className="mt-8">
            {IMPACT_IDS.map((id) => (
              <Card key={id} as="article" aria-labelledby={`impact-${id}-title`}>
                <span
                  aria-hidden="true"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-lavender-dk text-lavender"
                >
                  <ImpactIcon id={id} />
                </span>
                <SectionHeading
                  id={`impact-${id}-title`}
                  level={3}
                  className="mt-4"
                >
                  {t(`home.impact.${id}.title`)}
                </SectionHeading>
                <p className="mt-2 font-sans text-white">
                  {t(`home.impact.${id}.description`)}
                </p>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ── Events preview ───────────────────────────────────────────────── */}
      <section aria-labelledby="home-events" className="py-16 md:py-24">
        <Container>
          <SectionHeading id="home-events" level={2}>
            {t('home.events.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('home.events.subtitle')}
          </p>

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md" className="mt-8">
            {EVENT_IDS.map((id) => (
              <Card key={id} as="article" aria-labelledby={`event-${id}-title`}>
                <SectionHeading id={`event-${id}-title`} level={3}>
                  {t(`home.events.items.${id}.title`)}
                </SectionHeading>
                <p className="mt-2 font-sans text-sm font-medium text-lavender">
                  {t(`home.events.items.${id}.date`)}
                </p>
                <p className="mt-3 font-sans text-white">
                  {t(`home.events.items.${id}.summary`)}
                </p>
              </Card>
            ))}
          </Grid>

          <div className="mt-8">
            <Button to="/events" variant="ghost">
              {t('home.events.viewAll')}
            </Button>
          </div>
        </Container>
      </section>

      {/* ── Instagram ────────────────────────────────────────────────────── */}
      <section aria-labelledby="home-instagram" className="py-16 md:py-24">
        <Container>
          <SectionHeading id="home-instagram" level={2}>
            {t('home.instagram.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('home.instagram.subtitle')}
          </p>

          <div className="mt-8">
            <InstagramFeed />
          </div>

          {/*
            Deliberately NOT a link yet. The footer already links the handle to
            the real profile (`INSTAGRAM_PROFILE_URL` in Footer.tsx); this home
            CTA waits until the account has posts to land on, so it stays a
            clearly-marked placeholder rather than a dead `#` link.
          */}
          <div className="mt-8">
            <PlaceholderText as="span">{t('home.instagram.followCta')}</PlaceholderText>
          </div>
        </Container>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section aria-labelledby="home-closing" className="bg-navy-deep">
        <Container className="py-16 text-center md:py-24">
          <SectionHeading id="home-closing" level={2} className="text-center">
            {t('home.closing.title')}
          </SectionHeading>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-white">
            {t('home.closing.body')}
          </p>
          <div className="mt-8">
            <Button to="/get-involved" variant="primary" size="lg">
              {t('home.closing.cta')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

type ImpactId = (typeof IMPACT_IDS)[number];

const ICON_CLASS = 'h-6 w-6';

/** Decorative icon -- `aria-hidden` + `focusable="false"`, no `<title>`. */
function ImpactIcon({ id }: { id: ImpactId }) {
  switch (id) {
    case 'fundraising':
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          className={ICON_CLASS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </svg>
      );
    case 'awareness':
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          className={ICON_CLASS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      );
    case 'directAction':
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          className={ICON_CLASS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </svg>
      );
  }
}
