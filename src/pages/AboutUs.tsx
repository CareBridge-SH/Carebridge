import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import { Rule, Section, SectionHeading } from '../components/ui';

const PILLAR_IDS = ['treasurer', 'outreach', 'event', 'design'] as const;

/** The one column, and the line box every paragraph of running text takes. */
const COLUMN = 'mx-auto w-full max-w-[var(--measure-article)]';
const PROSE = { lineHeight: 'var(--leading-prose)' };
const HEADING_GAP = 'var(--gap-heading-body)';

/**
 * About is **the calm article**.
 *
 * This is the page that was singled out, and the only one described more than
 * once: it was overloaded and ugly, it wanted the photo frame gone, and the
 * golden "we support…healthcare" line needed a better face. Three complaints,
 * one cause — the page carried four display devices
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
      <Section as="section" rhythm="loose" opening aria-labelledby="about-title">
        {/*
          The opening is `<h1>`, then the lede, then straight into the argument —
          no frontispiece, no metadata line, and no rule immediately under the
          title. That absence is this page's identity in the "no two openings
          share a shape" rule.
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
        </div>

        {/*
          ── The one display moment — re-measured 2026-09-29 ──

          This sentence had been set in the TEXT face — Inter, weight 500,
          display tracking, 24-34px — and the comment argued for it: a sentence in
          the text face reads as a commitment, while the ornamented serif reads as
          a caption someone styled.

          **That was seen rendered and overruled.** The golden sentence below
          looked too big and informal; the ask was a face with curled edges, set
          smaller and in italics. So it became
          Cormorant Garamond 500 italic — the only italic the site loads, and not
          a new voice: `HomePage` sets its cream serif italic line in it at
          20-24px, and `Prose` sets a pull-quote in it at 24-30px. The old
          argument is recorded rather than deleted: the next reader needs to know
          it was made and lost, not that nobody made it.

          ── Still too narrow ─────────────────────────────────────────────────

          **Noted again on the built site:** the line was still too narrow on a
          computer page. It should fit the length of the page — potentially
          longer than the margins of other content, if there is space — with the
          font slightly, just slightly, smaller.

          So this sentence is the one element on About that is deliberately NOT
          inside `COLUMN`, and the only one that ignores a measure. `26ch` was the
          wrong unit for this job twice over: a narrow measure for Latin, and
          something close to *half* a measure for Chinese — a CJK glyph is about
          twice the width of the `0` that `ch` is derived from, so the same
          sentence wrapped to roughly thirteen characters a line. The measure is
          now the container's width for **every** locale. Body prose still obeys
          the certified 60-72ch band, because prose is not this.

          Size is `clamp(1.5rem, 0.9vw + 1.15rem, 1.875rem)` — 24 / 25.3 / 27.6 /
          30px at 375 / 768 / 1024 / 1440, against 26 / 27.7 / 30.2 / 32 before
          it: "slightly, just slightly, smaller". It now TIES the 30px section
          headings at 1440. The sentence stays the page's display moment by width
          and by voice — the only full-width italic band on the page — not by
          being two pixels larger. Recorded rather than hidden: the target was
          "second-largest", and this is the one clause the instruction overrode.
        */}
        {/*
          **Centred, from 2026-10-17.** It was not properly in the middle, and
          fixing that was the request. The block was already geometrically
          centred —
          measured at 1440/1024/768/375, its box centre matched the `<h1>`'s and the
          section's to the tenth of a pixel — but it was `text-align: start`, so the
          lines were ragged right and the band's visual mass sat left of centre. At
          1440 the first line ended 171px short of the block's own right edge; that
          gap is what reads as "not in the middle".
          
          So the fix is alignment, not position: `text-center`. With `text-balance`
          still on, the lines come out close to equal length and the band reads as a
          centred statement. This does NOT bring the sentence back inside `COLUMN`
          and does not impose a measure — the width argument above still stands, and
          the band is still the only full-width italic line on the page.
        */}
        <p
          className="text-balance text-center font-serif font-medium italic text-cream text-[clamp(1.5rem,0.9vw+1.15rem,1.875rem)]"
          style={{ marginTop: 'calc(var(--gap-heading-body) * 2)', lineHeight: 1.25 }}
        >
          {t('about.mission.body')}
        </p>

        <div className={COLUMN}>

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
