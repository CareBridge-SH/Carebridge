import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Button,
  Plate,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';
import { InstagramFeed } from '../components/InstagramFeed';
import { SiteMasthead } from '../components/SiteMasthead';
import { INSTAGRAM_PROFILE_URL } from '../data/site';

const EVENT_IDS = [
  'fallWorkshop',
  'triviaNight',
  'christmasSale',
  'paLectures',
  'hospitalVisits',
] as const;

const IMPACT_IDS = ['fundraising', 'awareness', 'directAction'] as const;

/** The lede measure, and the line box every paragraph of running text takes. */
const LEDE = { marginTop: 'var(--gap-heading-body)', lineHeight: 'var(--leading-prose)' };

/**
 * Home is **the split opening**.
 *
 * One screen holds the `<h1>`, the lede, the calls to action, and the field
 * **beside** them — type left, field right, nothing overlapping anything. There
 * is no full-bleed cover any more: a full-bleed ground was the thing that made
 * the five pages open the same way, and it is gone.
 *
 * **Home is the only page on the site that opens on `--text-display-1`.** Every
 * other page opens one step down or smaller. That single rule does more for the
 * "they all look the same" complaint than any ornament, and it is mechanically
 * checkable.
 *
 * On 2026-10-17 both display lines in this opening were judged too large, and
 * the headline should be relatively larger than the italic nameplate
 * above it. `--text-display-1` came down to `clamp(2.75rem, 7vw, 7rem)` (100.8px
 * at 1440, from 129.6) and the nameplate to ~60% of it. Home still opens on the
 * loudest step, so the rule above is untouched; only its size moved.
 *
 * The departure from the approved preview is that step: the preview's `<h1>` sat
 * one step below the largest. It is measured, not asserted — see the report for
 * the longest word against the left column at 1024 / 1280 / 1440.
 */
export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="home" />

      {/* ── The split opening ────────────────────────────────────────────── */}
      <Section as="section" aria-labelledby="home-hero" rhythm="loose" opening>
        <SiteMasthead />
        {/*
          `3fr / 2fr`: the type takes the wider column, because it is carrying a
          display line and the field beside it is a surface. The columns are
          explicit rather than a plain 1fr/1fr so the display line has the measure
          it needs — a `text-balance` headline in a half-width column is what
          would have forced the smaller step.
        */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <p className="flex items-center gap-4 font-serif text-xl italic text-cream md:text-2xl">
              <span aria-hidden="true" className="h-px w-10 shrink-0 bg-rule md:w-16" />
              {t('common.slogan')}
            </p>

            <h1
              id="home-hero"
              className="page-turn mt-6 font-serif text-display-1 font-semibold leading-[0.95] tracking-display text-balance text-white"
            >
              {t('home.hero.headline')}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white" style={LEDE}>
              {t('home.hero.subheadline')}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button to="/get-involved" variant="primary" size="lg">
                {t('home.hero.cta.join')}
              </Button>
              <Button to="/get-involved" variant="neutral" size="lg">
                {t('home.hero.cta.partner')}
              </Button>
              <Button href="#home-instagram" variant="ghost" size="lg">
                {t('home.hero.cta.follow')}
              </Button>
            </div>
          </div>

          {/*
            The plate beside the type.

            It shipped photo-free — a flat field with a computed
            `background-image: none` — and since then the reserved picture slots
            are to be filled with a rotating stand-in until
            real photographs exist. So this is a real `<img>` now, chosen at
            random from the pictures already in the repo by
            `scripts/rotate-plate-photos.mjs` (`npm run photos:rotate`), and
            cropped to the 3:2 the flat field already reserved so the hero cannot
            move when the picture changes. Delete the `photos.cover` entry from
            `src/data/photos.json` and this returns to the flat field.

            `priority` because it sits beside the `h1`, above the fold: lazy
            would delay the largest paint on the page for no benefit.
          */}
          <Plate slug="cover" priority className="w-full" />
        </div>
      </Section>

      {/* ── Our Impact — full-width rows, no figures ─────────────────────── */}
      <Section as="section" aria-labelledby="home-impact" rhythm="default">
        <SectionHeading id="home-impact" level={2}>
          {t('home.impact.title')}
        </SectionHeading>
        <p className="mt-3 max-w-2xl text-white" style={LEDE}>
          {t('home.impact.subtitle')}
        </p>

        {/*
          A list is not a diagram. The rows separate themselves with whitespace
          and a rule, and there is no numeral, bullet, tick, icon or arrow.
        */}
        <ul className="mt-8 flex flex-col">
          {IMPACT_IDS.map((id, index) => (
            <li key={id} className={index === 0 ? undefined : 'mt-8'}>
              {index === 0 ? null : <Rule className="mb-8" />}
              <SectionHeading id={`impact-${id}-title`} level={3}>
                {t(`home.impact.${id}.title`)}
              </SectionHeading>
              <p className="mt-2 max-w-3xl text-white" style={LEDE}>
                {t(`home.impact.${id}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Events preview — quiet: a ruled list, no boxes ────────────────── */}
      <Section as="section" aria-labelledby="home-events" rhythm="tight">
        <SectionHeading id="home-events" level={2}>
          {t('home.events.title')}
        </SectionHeading>
        <p className="mt-3 max-w-2xl text-white" style={LEDE}>
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
                {/* A date is a figure: sans, tabular, never the display serif. */}
                <p className="figures mt-1 text-sm font-medium text-cream">
                  {t(`home.events.items.${id}.date`)}
                </p>
                <p className="mt-2 text-white" style={LEDE}>
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

      {/* ── Instagram — a split with a band, not a full-bleed hero ────────── */}
      <Section as="section" aria-labelledby="home-instagram" rhythm="loose">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <SectionHeading id="home-instagram" level={2}>
              {t('home.instagram.title')}
            </SectionHeading>
            <p className="mt-3 max-w-xl text-white" style={LEDE}>
              {t('home.instagram.subtitle')}
            </p>
            {/*
              A real link to the real profile, using the same canonical
              `INSTAGRAM_PROFILE_URL` the footer uses. The external hint goes
              INSIDE the link as `sr-only` text, never as `aria-label`: an
              `aria-label` here would replace the visible label and break WCAG
              2.5.3.
            */}
            <div className="mt-8">
              <Button
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noreferrer noopener"
                variant="neutral"
                size="lg"
              >
                {t('home.instagram.followCta')}
                <span className="sr-only"> {t('a11y.externalLink')}</span>
              </Button>
            </div>
          </div>

          <div className="min-w-0">
            <InstagramFeed />
          </div>
        </div>
      </Section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <Section as="section" aria-labelledby="home-closing" rhythm="default" tone="tint">
        <div className="text-center">
          <SectionHeading id="home-closing" level={2} className="text-center">
            {t('home.closing.title')}
          </SectionHeading>
          <p className="mx-auto mt-4 max-w-2xl text-white" style={LEDE}>
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
