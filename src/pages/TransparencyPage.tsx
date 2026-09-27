import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import LedgerTable from '../components/LedgerTable';
import {
  Container,
  PlaceholderText,
  SectionHeading,
} from '../components/ui';

/**
 * Six labelled sections, all at equal visual weight — this is an accounting
 * statement, not a donation page (§8). There is no CTA, no button, and no
 * money-requesting affordance anywhere on the page; the only mention of money
 * is the factual "where funds go" copy from the locale files.
 */
export default function TransparencyPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="transparency" />
      <Container className="py-16 md:py-24">
        <h1
          id="transparency-title"
          className="font-serif text-4xl font-semibold leading-tight text-balance text-white md:text-5xl"
        >
          {t('transparency.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('transparency.intro')}
        </p>

        <div className="mt-12 flex flex-col">
          {/* 1. Our Commitment */}
          <section aria-labelledby="transparency-commitment" className="border-t border-navy-soft pt-12 first:border-t-0 first:pt-0">
            <SectionHeading id="transparency-commitment" level={2}>
              {t('transparency.commitment.title')}
            </SectionHeading>
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.commitment.body')}
            </p>
          </section>

          {/* 2. Receipts & 发票 — the ampersand + CJK render as text */}
          <section aria-labelledby="transparency-receipts" className="border-t border-navy-soft pt-12 first:border-t-0 first:pt-0">
            <SectionHeading id="transparency-receipts" level={2}>
              {t('transparency.receipts.title')}
            </SectionHeading>
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.receipts.body')}
            </p>
          </section>

          {/* 3. Public Tracking */}
          <section aria-labelledby="transparency-tracking" className="border-t border-navy-soft pt-12 first:border-t-0 first:pt-0">
            <SectionHeading id="transparency-tracking" level={2}>
              {t('transparency.tracking.title')}
            </SectionHeading>
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.tracking.body')}
            </p>
            <LedgerTable />
          </section>

          {/* 4. Per-Event Accounting */}
          <section aria-labelledby="transparency-per-event" className="border-t border-navy-soft pt-12 first:border-t-0 first:pt-0">
            <SectionHeading id="transparency-per-event" level={2}>
              {t('transparency.perEvent.title')}
            </SectionHeading>
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.perEvent.body')}
            </p>
          </section>

          {/* 5. Where Funds Go */}
          <section aria-labelledby="transparency-funds" className="border-t border-navy-soft pt-12 first:border-t-0 first:pt-0">
            <SectionHeading id="transparency-funds" level={2}>
              {t('transparency.funds.title')}
            </SectionHeading>
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
          </section>

          {/* 6. Questions About Our Finances? */}
          <section aria-labelledby="transparency-questions" className="border-t border-navy-soft pt-12 first:border-t-0 first:pt-0">
            <SectionHeading id="transparency-questions" level={2}>
              {t('transparency.questions.title')}
            </SectionHeading>
            <p className="mt-3 max-w-3xl font-sans text-white">
              {t('transparency.questions.body')}
            </p>
            <a
              href={`mailto:${t('transparency.questions.email')}`}
              className="mt-4 inline-block font-sans text-lavender underline underline-offset-4 transition-colors hover:text-cream"
            >
              {t('transparency.questions.email')}
            </a>
          </section>
        </div>
      </Container>
    </>
  );
}
