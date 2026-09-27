import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Button,
  Container,
  Numeral,
  Rule,
  Section,
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

/**
 * Home's signature composition is **The Poster** (ROUND4-PLAN §3.1): one message
 * at display scale on the tinted ground, then a ruled band of figures, then
 * quiet, with the Instagram row running off the edge of the viewport.
 *
 * Everything that is not the poster or the bleed is deliberately plain —
 * `Section` + `Rule` + prose, no boxes. A page with two competing ideas reads as
 * an accident, not as a design.
 */
export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="home" />

      {/* ── The Poster ───────────────────────────────────────────────────── */}
      <Section
        as="section"
        aria-labelledby="home-hero"
        rhythm="loose"
        bleed="full"
        tone="tint"
        className="relative isolate"
      >
        {/*
          The poster's media slot.

          It is empty, and `aria-hidden`, because there is nothing to describe:
          §3.1 specifies a photograph as the poster's ground, `public/` holds
          none, and alt text for an image that does not exist would be invented
          copy. Structurally it is already where a photograph needs to be —
          absolutely positioned, full-bleed, behind the content — so filling it
          means adding the image utilities to this one element and a scrim above
          it. No layout change, no recomposition. `tone="tint"` keeps painting
          the ground underneath until then.
        */}
        <div aria-hidden="true" className="absolute inset-0 -z-10" />

        <Container>
          {/*
            The slogan, at display scale: the site's own words, in the display
            serif, led by a hairline rule. Not a new string — `common.slogan`.
          */}
          <p className="flex items-center gap-4 font-serif text-2xl italic text-cream md:text-3xl lg:text-4xl">
            <span
              aria-hidden="true"
              className="h-px w-10 shrink-0 bg-cream md:w-16"
            />
            {t('common.slogan')}
          </p>

          <h1
            id="home-hero"
            className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight text-balance text-white sm:text-5xl lg:text-6xl"
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
      </Section>

      {/* ── The numeral strip ────────────────────────────────────────────── */}
      <Section as="section" aria-labelledby="home-impact" rhythm="default">
        <SectionHeading id="home-impact" level={2}>
          {t('home.impact.title')}
        </SectionHeading>
        <p className="mt-3 max-w-2xl font-sans text-white">
          {t('home.impact.subtitle')}
        </p>

        {/*
          A ruled band, not a 3-up card grid. The three are peers with no primary
          item, so they share one row and are divided by rules rather than
          boxed — an `<ol>`, because the visible `01/02/03` claims an order and
          the markup should not contradict it.

          The numerals are `decorative`: each one's heading already names the
          entry, so announcing "01" first would be noise. The headings carry the
          meaning.
        */}
        <Rule className="mt-8" />
        <ol className="grid grid-cols-1 md:grid-cols-3">
          {IMPACT_IDS.map((id, index) => (
            <li
              key={id}
              className={[
                'flex flex-col md:border-l md:border-lavender-dk md:pl-8',
                'md:first:border-l-0 md:first:pl-0',
                index > 0
                  ? 'border-t border-lavender-dk pt-6 md:border-t-0 md:pt-0'
                  : 'pt-6',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Numeral decorative size="md">
                {String(index + 1).padStart(2, '0')}
              </Numeral>
              <SectionHeading id={`impact-${id}-title`} level={3} className="mt-3">
                {t(`home.impact.${id}.title`)}
              </SectionHeading>
              <p className="mt-2 font-sans text-white">
                {t(`home.impact.${id}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Events preview — quiet: a ruled list, no boxes ────────────────── */}
      <Section as="section" aria-labelledby="home-events" rhythm="tight">
        <SectionHeading id="home-events" level={2}>
          {t('home.events.title')}
        </SectionHeading>
        <p className="mt-3 max-w-2xl font-sans text-white">
          {t('home.events.subtitle')}
        </p>

        <div className="mt-8">
          {EVENT_IDS.map((id, index) => (
            <Fragment key={id}>
              {index > 0 ? <Rule /> : null}
              <div className="py-6 first:pt-0">
                <SectionHeading id={`event-${id}-title`} level={3}>
                  {t(`home.events.items.${id}.title`)}
                </SectionHeading>
                <p className="mt-1 font-sans text-sm font-medium text-lavender">
                  {t(`home.events.items.${id}.date`)}
                </p>
                <p className="mt-2 font-sans text-white">
                  {t(`home.events.items.${id}.summary`)}
                </p>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="mt-8">
          <Button to="/events" variant="ghost">
            {t('home.events.viewAll')}
          </Button>
        </div>
      </Section>

      {/* ── Instagram — the row bleeds off the viewport edge ─────────────── */}
      <Section
        as="section"
        aria-labelledby="home-instagram"
        rhythm="loose"
        bleed="full"
      >
        <Container>
          <SectionHeading id="home-instagram" level={2}>
            {t('home.instagram.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('home.instagram.subtitle')}
          </p>
        </Container>

        {/*
          No `Container` around the row: this is the full-bleed band. The row
          owns its own gutter so its first tile lines up with the text above,
          and the tiles past the viewport edge are cut — which is what says
          "there is more where this came from".
        */}
        <div className="mt-8">
          <InstagramFeed />
        </div>

        <Container>
          {/*
            A real link to the real profile, using the same canonical
            `INSTAGRAM_PROFILE_URL` the footer uses.

            The external hint goes INSIDE the link as `sr-only` text, never as
            `aria-label`: an `aria-label` here would replace the visible label
            and break WCAG 2.5.3 (Label in Name).
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
      </Section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      {/*
        `tone` is a two-value contract (`plain` | `tint`), and the closing needs
        a third ground, so the band's fill comes through `className` rather than
        by widening the primitive. Same token the page used before.
      */}
      <Section
        as="section"
        aria-labelledby="home-closing"
        rhythm="default"
        className="bg-navy-deep"
      >
        <div className="text-center">
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
        </div>
      </Section>
    </>
  );
}
