import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import LedgerTable from '../components/LedgerTable';
import {
  Numeral,
  PlaceholderText,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';

/**
 * Transparency's signature composition is **The Document** (ROUND4-PLAN §3.5):
 * numbered sections, grouped by a rule, with the ledger table reading as a
 * ledger rather than as a bordered card.
 *
 * This page is the one that started the round — six identical "hairline +
 * heading + paragraph" blocks in a row. Numbers alone would not have fixed
 * that, so the six are also **grouped** into three bands:
 *
 *   01–02  how we record what happens      (commitment, receipts)
 *   03–04  how you can inspect it          (public tracking, per-event)
 *   05–06  where it goes, and asking us    (funds, questions)
 *
 * A band is opened by a `Rule` and its entries sit 40px apart inside it, against
 * 88px between bands — so the grouping is visible without inventing a group
 * heading. Real group *names* would be client copy and do not exist in either
 * locale; that is reported, not guessed.
 *
 * **The banding is not only visual (D-2).** Each band is a real `region`
 * landmark — a `<section>` named by `aria-labelledby` pointing at its FIRST
 * entry's heading, which is existing copy. A screen reader therefore gets three
 * named groups of two headings rather than six equal peers, which is what the
 * page shows. The entries themselves are plain `<div>`s: making them regions too
 * would put a `region` named "Our Commitment" inside a `region` also named "Our
 * Commitment", and axe's `landmark-unique` is right to call that a defect.
 * A structure that is implied to the eye must be real in the accessibility tree,
 * or it must not be implied at all.
 *
 * There is no CTA, no button, and no money-requesting affordance anywhere on the
 * page; the only mention of money is the factual "where funds go" copy.
 */
export default function TransparencyPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="transparency" />
      <Section as="section" rhythm="loose" aria-labelledby="transparency-title">
        <h1
          id="transparency-title"
          className="font-serif text-4xl font-semibold leading-tight text-balance text-white md:text-5xl"
        >
          {t('transparency.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('transparency.intro')}
        </p>

        {/* ── Band 1 — how we record ──────────────────────────────────────── */}
        <Rule className="mt-12" />
        <DocBand labelledBy="transparency-commitment" className="mt-10">
          <DocEntry
            n="01"
            id="transparency-commitment"
            title={t('transparency.commitment.title')}
          >
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.commitment.body')}
            </p>
          </DocEntry>

          {/* Receipts & 发票 — the ampersand + CJK render as text */}
          <DocEntry
            n="02"
            id="transparency-receipts"
            title={t('transparency.receipts.title')}
          >
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.receipts.body')}
            </p>
          </DocEntry>
        </DocBand>

        {/* ── Band 2 — how you can inspect it ─────────────────────────────── */}
        <Rule className="mt-12" />
        <DocBand labelledBy="transparency-tracking" className="mt-10">
          <DocEntry
            n="03"
            id="transparency-tracking"
            title={t('transparency.tracking.title')}
          >
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.tracking.body')}
            </p>
            <LedgerTable />
          </DocEntry>

          <DocEntry
            n="04"
            id="transparency-per-event"
            title={t('transparency.perEvent.title')}
          >
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.perEvent.body')}
            </p>
          </DocEntry>
        </DocBand>

        {/* ── Band 3 — where it goes, and asking us ───────────────────────── */}
        <Rule className="mt-12" />
        <DocBand labelledBy="transparency-funds" className="mt-10">
          <DocEntry
            n="05"
            id="transparency-funds"
            title={t('transparency.funds.title')}
          >
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.funds.body')}
            </p>
            {/* Bracketed placeholder — the organisations are still TBD. */}
            <PlaceholderText as="p" className="mt-4 inline-block">
              {t('transparency.funds.orgs')}
            </PlaceholderText>
            {/* Fudan Children's Hospital — the CJK renders verbatim. */}
            <p className="mt-4 max-w-3xl font-sans text-white">
              {t('transparency.funds.hospital')}
            </p>
          </DocEntry>

          <DocEntry
            n="06"
            id="transparency-questions"
            title={t('transparency.questions.title')}
          >
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.questions.body')}
            </p>
            <a
              href={`mailto:${t('transparency.questions.email')}`}
              className="mt-4 inline-block font-sans text-lavender underline underline-offset-4 transition-colors hover:text-cream"
            >
              {t('transparency.questions.email')}
            </a>
          </DocEntry>
        </DocBand>
      </Section>
    </>
  );
}

interface DocBandProps {
  /**
   * The `id` of this band's **first** entry heading. A named `<section>` is a
   * `region` landmark, and the name has to come from copy that already exists —
   * there is no key for a band name in either locale, and inventing one is not
   * allowed. So the band borrows the heading of the entry it opens with.
   *
   * ⚠ The caller must keep this equal to the first child's `id`. Binding the two
   * would mean restructuring the children, which is not worth what it would cost
   * the JSX's readability.
   */
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

/**
 * One band of the document: a real `region` so the grouping the page draws is
 * also the grouping a screen reader hears (D-2).
 */
function DocBand({ labelledBy, className, children }: DocBandProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={['flex flex-col gap-10', className].filter(Boolean).join(' ')}
    >
      {children}
    </section>
  );
}

interface DocEntryProps {
  /** `01` … `06` — a numeral, not a translatable string. */
  n: string;
  /** The heading's `id`. Its band points `aria-labelledby` at the first of these. */
  id: string;
  title: string;
  children: ReactNode;
}

/**
 * One numbered entry of the document: the number in a narrow aligned gutter, the
 * heading and body in the column beside it.
 *
 * A `<div>`, deliberately: its band is already a named `region`, and a second
 * region with the same name nested inside it would be a `landmark-unique`
 * defect rather than a structure.
 *
 * The number is `decorative`. Nothing on the page refers to "note 03", so the
 * number is wayfinding, not content, and the heading already names the entry —
 * announcing the number first would be noise.
 */
function DocEntry({ n, id, title, children }: DocEntryProps) {
  return (
    <div className="flex gap-5">
      <Numeral decorative size="sm" className="w-10 shrink-0 leading-tight">
        {n}
      </Numeral>
      <div className="min-w-0 flex-1">
        <SectionHeading id={id} level={2}>
          {title}
        </SectionHeading>
        {children}
      </div>
    </div>
  );
}
