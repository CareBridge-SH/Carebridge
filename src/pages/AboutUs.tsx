import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import { Rule, Section, SectionHeading } from '../components/ui';

const PILLAR_IDS = ['treasurer', 'outreach', 'event', 'design'] as const;

/** The one column, and the line box every paragraph of running text takes. */
const COLUMN = 'mx-auto w-full max-w-[var(--measure-article)]';
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
            ── The one display moment — REVERSED in T45 ──────────────────────
            This sentence was set in the TEXT face — Inter, weight 500, display
            tracking, 24-34px — and this comment argued for it: a sentence in the
            text face reads as a commitment, while the ornamented serif reads as
            a caption someone styled.

            **The operator saw that rendered and overruled it**, verbatim: *"the
            Golden sentence below looks too big and informal. Try to use fonts
            with curly edges and with a smaller font and Italics for that."* The
            old argument is recorded rather than deleted — the next reader needs
            to know it was made and lost, not that nobody made it.

            So it is Cormorant Garamond 500 italic: the only italic the site
            loads, and not a new voice — `HomePage` sets its cream serif italic
            line in it at 20-24px, and `Prose` sets a pull-quote in it at
            24-30px.

            Size is `clamp(1.625rem, 1vw + 1.25rem, 2rem)` — 26 / 27.7 / 32px at
            375 / 768 / 1440, against the old 24 / 25.15 / 34. It cannot go much
            smaller than this: the page's section headings are 30px at 1440 and
            the acceptance keeps this sentence the SECOND-LARGEST text on the
            page, so "smaller" and "second-largest" leave about two pixels of
            room between them. Cormorant's smaller x-height does the rest — the
            operator asked for smaller, not for a caption.
          */}
          <p
            className="mx-auto max-w-[26ch] text-balance font-serif font-medium italic text-cream text-[clamp(1.625rem,1vw+1.25rem,2rem)]"
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
