import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Plate,
  Prose,
  ProseLead,
  PullQuote,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';

const PILLAR_IDS = ['treasurer', 'outreach', 'event', 'design'] as const;

/**
 * About's composition is **The Long Read** (round 4 §3.2) and its round-5
 * treatment is **The Spread** (round 5 §3): a printed two-page opening.
 *
 * Three things make it a spread rather than a column: a **drop initial** on the
 * lead, a **pull-quote at the third display step**, and **two columns at `lg`**.
 * The columns are the only structural change round 5 authorises, and they are
 * what the idea is.
 *
 * The `<h1>` sits outside the prose now. It is at `--text-display-1` — 129.6px
 * at 1440 — and a display line of that size cannot live inside a measure of 65
 * characters. The plate is the frontispiece beneath it.
 *
 * There are still no cards on this page and no panel boundaries: story, mission
 * and structure are one column of text, and the plate is the only box.
 */
export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="about" />
      <Section as="section" rhythm="loose" aria-labelledby="about-title">
        <h1
          id="about-title"
          className="page-turn font-serif text-display-1 font-semibold leading-[0.95] tracking-display text-balance text-white"
        >
          {t('about.title')}
        </h1>

        {/* The frontispiece. */}
        <Plate slug="about" className="mt-10" />

        {/*
          `lg:block` and `lg:columns-2` are what turn the measured column into a
          spread. `flex` and `flex-col` come from `Prose` and would stop the
          columns working, so they are overridden at `lg` only — below that the
          spread collapses back to the single measured column it always was.
        */}
        <Prose className="mt-14 lg:block lg:max-w-none lg:columns-2 lg:gap-14">
          {/* ── Our Story ─────────────────────────────────────────────── */}
          <SectionHeading id="about-story" level={2}>
            {t('about.story.title')}
          </SectionHeading>
          {/*
            The client supplied the real club story. It is the opening statement
            of the page, so it is the lead, and its first letter is a drop
            initial — a float, so it costs no layout shift.
          */}
          <ProseLead className="first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.7] first-letter:text-cream">
            {t('about.story.body')}
          </ProseLead>

          <Rule />

          {/* ── Our Mission ───────────────────────────────────────────── */}
          <SectionHeading id="about-mission" level={2}>
            {t('about.mission.title')}
          </SectionHeading>
          {/*
            The mission is the club's own formal statement, pulled out at the
            third display step — the page's one pull-quote. Same string, same
            locale key, restyled; nothing was written for it.
          */}
          <PullQuote className="text-display-3">
            {t('about.mission.body')}
          </PullQuote>

          <Rule />

          {/* ── Our Structure ─────────────────────────────────────────── */}
          <SectionHeading id="about-structure" level={2}>
            {t('about.structure.title')}
          </SectionHeading>
          <p>{t('about.structure.intro')}</p>

          {/*
            Four pillars, as four ruled entries in the column. They used to be a
            2x2 card grid; a card is a panel boundary, and this page is an
            article. The rules come from `border-t` on the `<li>` rather than
            from `Rule`, because only `<li>` may be a child of a `<ul>`.
          */}
          <ul className="flex flex-col">
            {PILLAR_IDS.map((id, index) => (
              <li
                key={id}
                className={
                  index > 0 ? 'mt-6 border-t border-lavender-dk pt-6' : undefined
                }
              >
                <SectionHeading id={`pillar-${id}-title`} level={3}>
                  {t(`about.structure.pillars.${id}.title`)}
                </SectionHeading>
                <p className="mt-1">
                  {t(`about.structure.pillars.${id}.description`)}
                </p>
              </li>
            ))}
          </ul>
        </Prose>
      </Section>
    </>
  );
}
