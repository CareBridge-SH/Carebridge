import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import LedgerTable from '../components/LedgerTable';
import {
  Container,
  PlaceholderText,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';

/**
 * Six labelled entries, all at equal visual weight — this is an accounting
 * statement, not a donation page (§8). There is no CTA, no button, and no
 * money-requesting affordance anywhere on the page; the only mention of money
 * is the factual "where funds go" copy from the locale files.
 *
 * Each entry owns its rhythm and its container through `Section`, and the
 * entries are separated by a `Rule` — a hairline between *entries*, not a
 * `border-t` repeated six times on six blocks. Copy and both `[bracketed]`
 * placeholders are unchanged.
 */
export default function TransparencyPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="transparency" />

      <Section as="section" rhythm="default" aria-labelledby="transparency-title">
        <h1
          id="transparency-title"
          className="font-serif text-4xl font-semibold leading-tight text-balance text-white md:text-5xl"
        >
          {t('transparency.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('transparency.intro')}
        </p>
      </Section>

      {/* 1. Our Commitment */}
      <Section as="section" rhythm="tight" aria-labelledby="transparency-commitment">
        <SectionHeading id="transparency-commitment" level={2}>
          {t('transparency.commitment.title')}
        </SectionHeading>
        <p className="mt-3 max-w-3xl font-sans text-white">
          {t('transparency.commitment.body')}
        </p>
      </Section>

      <Container>
        <Rule />
      </Container>

      {/* 2. Receipts & 发票 — the ampersand + CJK render as text */}
      <Section as="section" rhythm="tight" aria-labelledby="transparency-receipts">
        <SectionHeading id="transparency-receipts" level={2}>
          {t('transparency.receipts.title')}
        </SectionHeading>
        <p className="mt-3 max-w-3xl font-sans text-white">
          {t('transparency.receipts.body')}
        </p>
      </Section>

      <Container>
        <Rule />
      </Container>

      {/* 3. Public Tracking */}
      <Section as="section" rhythm="tight" aria-labelledby="transparency-tracking">
        <SectionHeading id="transparency-tracking" level={2}>
          {t('transparency.tracking.title')}
        </SectionHeading>
        <p className="mt-3 max-w-3xl font-sans text-white">
          {t('transparency.tracking.body')}
        </p>
        <LedgerTable />
      </Section>

      <Container>
        <Rule />
      </Container>

      {/* 4. Per-Event Accounting */}
      <Section as="section" rhythm="tight" aria-labelledby="transparency-per-event">
        <SectionHeading id="transparency-per-event" level={2}>
          {t('transparency.perEvent.title')}
        </SectionHeading>
        <p className="mt-3 max-w-3xl font-sans text-white">
          {t('transparency.perEvent.body')}
        </p>
      </Section>

      <Container>
        <Rule />
      </Container>

      {/* 5. Where Funds Go */}
      <Section as="section" rhythm="tight" aria-labelledby="transparency-funds">
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
      </Section>

      <Container>
        <Rule />
      </Container>

      {/* 6. Questions About Our Finances? */}
      <Section as="section" rhythm="tight" aria-labelledby="transparency-questions">
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
      </Section>
    </>
  );
}
