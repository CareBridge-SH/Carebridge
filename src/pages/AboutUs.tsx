import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import { Rule, Section, SectionHeading } from '../components/ui';

const PILLAR_IDS = ['treasurer', 'outreach', 'event', 'design'] as const;

/** The one column, and the line box every paragraph of running text takes. */
const COLUMN = 'max-w-[62ch]';
const PROSE = { lineHeight: 'var(--leading-prose)' };
const HEADING_GAP = 'var(--gap-heading-body)';

/**
 * About is **the calm article** (ROUND6-PLAN §3.1, the operator's choice A).
 *
 * This is the page the operator singled out, and the only one they described
 * twice: *"About us page is overloading and ugly"*, *"get rid of the photo frame
 * on About us Page"*, and *"the golden 'we support…healthcare' can have a better
 * font"*. Three complaints, one cause — the page carried four display devices
 * (a framed photograph, a drop initial, a decorated pull-quote, a four-item
 * structure) and none of them was the sentence that matters.
 *
 * So: **one column, no frame, no drop initial, one display moment.** Everything
 * that is not the argument is gone, and nothing replaced it.
 *
 * The display moment is the mission sentence, and it is set in the **text face**
 * — the serif is the headline voice and keeps every heading on the page.
 */
export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="about" />
      <Section as="section" rhythm="loose" aria-labelledby="about-title">
        {/*
          The opening is `<h1>`, then the lede, then straight into the argument —
          no frontispiece, no metadata line, and no rule immediately under the
          title. That absence is this page's identity in the round's "no two
          openings share a shape" rule.
        */}
        <div className={COLUMN}>
          <h1
            id="about-title"
            className="page-turn font-serif text-display-2 font-semibold leading-[0.95] tracking-display text-balance text-white"
          >
            {t('about.title')}
          </h1>

          {/* The lede: the club's own story, and the opening statement. */}
          <p
            className="mt-6 text-lg text-white"
            style={{ marginTop: HEADING_GAP, lineHeight: 'var(--leading-prose)' }}
          >
            {t('about.story.body')}
          </p>

          {/*
            ── The one display moment ────────────────────────────────────────
            The mission sentence, in the TEXT face at weight 500 and the display
            tracking, in cream.

            The operator asked for the font to change — *"the golden 'we
            support…healthcare' can have a better font"* — and the reason is
            structural: the serif is the heading voice, and it holds at heading
            sizes because its thin strokes are large enough to survive. A
            sentence of purpose set in the text face reads as a commitment; the
            same sentence in an ornamented display serif, in gold, reads as a
            caption someone styled.

            The size is fluid between the lede and --text-display-3:
            24 px at 375, 25.15 px at 768, 34 px at 1440. Tracking is the
            display tracking on the sans, which is the pairing that makes it a
            statement rather than body copy. The measure is 24ch so the sentence
            breaks as a sentence.
          */}
          <p
            className="max-w-[24ch] text-balance font-sans font-medium tracking-display text-cream text-[clamp(1.5rem,1.4vw+0.9rem,2.125rem)]"
            style={{ marginTop: 'calc(var(--gap-heading-body) * 2)', lineHeight: 1.25 }}
          >
            {t('about.mission.body')}
          </p>

          {/* ── Our Structure — ruled rows, no numerals ───────────────────── */}
          <Rule className="mt-14" />

          <SectionHeading id="about-structure" level={2} className="mt-10">
            {t('about.structure.title')}
          </SectionHeading>
          <p className="mt-0 text-white" style={{ marginTop: HEADING_GAP, ...PROSE }}>
            {t('about.structure.intro')}
          </p>

          {/*
            The four pillars as ruled rows — the same shape as `Our Impact` on the
            home page. No numerals, no card, no box, no icon; whitespace and a
            rule do the separating, because a list is not a diagram.
          */}
          <ul className="mt-10 flex flex-col">
            {PILLAR_IDS.map((id, index) => (
              <li key={id} className={index === 0 ? undefined : 'mt-8'}>
                {index === 0 ? null : <Rule className="mb-8" />}
                <SectionHeading id={`pillar-${id}-title`} level={3}>
                  {t(`about.structure.pillars.${id}.title`)}
                </SectionHeading>
                <p className="mt-2 text-white" style={{ marginTop: HEADING_GAP, ...PROSE }}>
                  {t(`about.structure.pillars.${id}.description`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
