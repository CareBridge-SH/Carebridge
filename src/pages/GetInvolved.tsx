import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Container,
  PlaceholderText,
  SectionHeading,
} from '../components/ui';

export default function GetInvolved() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="involved" />
      <Container className="py-16 md:py-24">
        <h1
          id="involved-title"
          className="font-serif text-4xl font-semibold text-white md:text-5xl"
        >
          {t('involved.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('involved.intro')}
        </p>

        {/* ── Join the Team ─────────────────────────────────────────────── */}
        <section aria-labelledby="involved-join" className="mt-12">
          <SectionHeading id="involved-join" level={2}>
            {t('involved.join.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('involved.join.body')}
          </p>
          {/*
            A bracketed placeholder, rendered byte-identical — NOT a `mailto:`
            to an invented address (that would be a fabrication).
          */}
          <PlaceholderText as="p" className="mt-4 inline-block">
            {t('involved.join.email')}
          </PlaceholderText>
          {/*
            A reassurance, not a price: rendered with a checkmark so it reads as
            "good news" rather than a cost line.
          */}
          <p className="mt-4 flex items-center gap-2 font-sans text-sm font-medium text-lavender">
            <CheckIcon />
            {t('involved.join.noFees')}
          </p>
        </section>

        {/* ── Volunteer at Hospital Visits ───────────────────────────────── */}
        <section aria-labelledby="involved-hospital" className="mt-12">
          <SectionHeading id="involved-hospital" level={2}>
            {t('involved.hospital.title')}
          </SectionHeading>
          {/*
            The commitment is a scannable fact, separated from the prose rather
            than buried in it.
          */}
          <p className="mt-3 inline-block border-l-2 border-lavender-dk pl-4 font-sans text-lg font-medium text-white">
            {t('involved.hospital.commitment')}
          </p>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('involved.hospital.experience')}
          </p>
        </section>

        {/* ── Partner With Us ───────────────────────────────────────────── */}
        <section aria-labelledby="involved-partner" className="mt-12">
          <SectionHeading id="involved-partner" level={2}>
            {t('involved.partner.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('involved.partner.body')}
          </p>
          {/* Same bracketed placeholder as the join block — not a `mailto:`. */}
          <PlaceholderText as="p" className="mt-4 inline-block">
            {t('involved.partner.contact')}
          </PlaceholderText>
        </section>
      </Container>
    </>
  );
}

/** Decorative checkmark — `aria-hidden`, no `<title>`. */
function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
