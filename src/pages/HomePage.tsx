import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Button,
  Card,
  Container,
  Grid,
  Numeral,
  SectionHeading,
} from '../components/ui';
/*
 * The Instagram section renders `InstagramFeed` and nothing else -- no fetching,
 * skeleton, or empty-state logic lives here. Everything about *where* the posts
 * come from belongs to that component and `src/data/instagram-posts.json`.
 */
import { InstagramFeed } from '../components/InstagramFeed';
import { INSTAGRAM_PROFILE_URL } from '../data/site';

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
        <Container className="py-20 md:py-28">
          {/*
            The slogan is the "script" kicker: elegant serif italic in cream, led
            by a hairline rule. Left-aligned so the hero reads as an editorial
            masthead rather than a centred stack.
          */}
          <p className="flex items-center gap-4 font-serif text-xl italic text-cream md:text-2xl">
            <span aria-hidden="true" className="h-px w-12 shrink-0 bg-cream" />
            {t('common.slogan')}
          </p>

          <h1
            id="home-hero"
            className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-tight text-balance text-white sm:text-5xl lg:text-6xl"
          >
            {t('home.hero.headline')}
          </h1>

          <p className="mt-6 max-w-2xl font-sans text-lg text-white">
            {t('home.hero.subheadline')}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
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
            {IMPACT_IDS.map((id, index) => (
              <Card key={id} as="article" aria-labelledby={`impact-${id}-title`}>
                {/*
                  Wayfinding, not content: the heading immediately below names the
                  entry, so the figure is `decorative` and stays out of the
                  accessibility tree. It replaces the per-card icon — the same
                  decorative slot, now filled with structure instead of a glyph.
                */}
                <Numeral decorative size="sm">
                  {String(index + 1).padStart(2, '0')}
                </Numeral>
                <SectionHeading
                  id={`impact-${id}-title`}
                  level={3}
                  className="mt-2"
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
            A real link to the real profile, using the same canonical
            `INSTAGRAM_PROFILE_URL` the footer uses. This used to be a
            deliberately-marked placeholder on the grounds that the CTA had
            "no posts to land on yet" — but the profile has always existed, so
            a non-interactive "Follow Our Journey" was just an unfinished-looking
            dead end on the home page.

            The external hint goes INSIDE the link as `sr-only` text, never as
            `aria-label`: an `aria-label` here would replace the visible label and
            break WCAG 2.5.3 (Label in Name).
          */}
          <div className="mt-8">
            <Button
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noreferrer noopener"
              variant="secondary"
              size="lg"
            >
              {t('home.instagram.followCta')}
              <span className="sr-only"> {t('a11y.externalLink')}</span>
            </Button>
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
