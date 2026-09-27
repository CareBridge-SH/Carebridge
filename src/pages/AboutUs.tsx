import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Prose,
  ProseLead,
  PullQuote,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';

const PILLAR_IDS = ['treasurer', 'outreach', 'event', 'design'] as const;

/**
 * About's signature composition is **The Long Read** (ROUND4-PLAN §3.2): one
 * measured column, ~65ch, that reads as an article.
 *
 * There are **no cards on this page and no panel boundaries** — the story, the
 * mission and the structure are the same column continuing, separated by rhythm
 * and a `Rule` rather than by boxes. The four pillars are a ruled list inside
 * that column, not a 2x2 grid.
 *
 * The `<h1>` is deliberately *inside* the measured column: a full-width title
 * over a 65ch column would be two competing measures on one page.
 */
export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="about" />
      <Section as="section" rhythm="loose" aria-labelledby="about-title">
        <Prose>
          <h1
            id="about-title"
            className="font-serif text-4xl font-semibold leading-tight text-balance text-white md:text-5xl"
          >
            {t('about.title')}
          </h1>

          {/* ── Our Story ─────────────────────────────────────────────── */}
          <SectionHeading id="about-story" level={2} className="mt-6">
            {t('about.story.title')}
          </SectionHeading>
          {/*
            The client supplied the real club story — rendered as body text. It
            is the opening statement of the page, so it is the lead.
          */}
          <ProseLead>{t('about.story.body')}</ProseLead>

          <Rule />

          {/* ── Our Mission ───────────────────────────────────────────── */}
          <SectionHeading id="about-mission" level={2}>
            {t('about.mission.title')}
          </SectionHeading>
          {/*
            The mission is the club's own formal statement, pulled out at display
            scale — the page's one pull-quote. Same string, same locale key,
            restyled; nothing was written for it.
          */}
          <PullQuote>{t('about.mission.body')}</PullQuote>

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
