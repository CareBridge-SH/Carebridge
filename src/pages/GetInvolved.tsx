import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Button,
  EditorialSplit,
  Numeral,
  Plate,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';

const PATHWAY_IDS = ['join', 'hospital', 'partner'] as const;

type PathwayId = (typeof PATHWAY_IDS)[number];

/** `01` … — a numeral, not a translatable string: Arabic digits are the same in both locales. */
function pathwayNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/**
 * Get Involved's signature composition is **The Pathways** (ROUND4-PLAN §3.4):
 * numbered routes in, deliberately **uneven** — `01` is the front door and is
 * built larger than the other two, because a reader should be able to see which
 * door that is.
 *
 * Three equal boxes would say "these are interchangeable", which is the
 * opposite of what the page means. There is no 3-up grid here, and no donation
 * affordance anywhere on the page — not a button, not a link, not a sentence.
 */
export default function GetInvolved() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="involved" />
      <Section as="section" rhythm="loose" aria-labelledby="involved-title">
        <h1
          id="involved-title"
          className="page-turn font-serif text-display-1 font-semibold leading-[0.95] tracking-display text-balance text-white"
        >
          {t('involved.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('involved.intro')}
        </p>

        {/* The frontispiece: the routes open on a plate. */}
        <Plate slug="involved" number="03" className="mt-10" />

        <ol className="mt-12">
          <li>
            <Rule />
            <Pathway n={pathwayNumber(0)} id="join" primary>
              <p className="mt-2 max-w-2xl font-sans text-white">
                {t('involved.join.body')}
              </p>
              {/*
                A reassurance, not a price: rendered with a checkmark so it reads
                as "good news" rather than a cost line.
              */}
              {/*
                Cream, not the accent: the three pathway CTAs are the page's
                accent, and this reassurance is a statement of fact rather than
                an action.
              */}
              <p className="mt-4 flex items-center gap-2 font-sans text-sm font-medium text-cream">
                <CheckIcon />
                {t('involved.join.noFees')}
              </p>
              <PathwayCta to={t('involved.join.email')} variant="primary" />
            </Pathway>
          </li>

          <li className="mt-2">
            <Rule />
            <Pathway n={pathwayNumber(1)} id="hospital">
              {/*
                The commitment is a scannable fact, separated from the prose
                rather than buried in it.
              */}
              <p className="mt-2 inline-block border-l-2 border-lavender-dk pl-4 font-sans text-lg font-medium text-white">
                {t('involved.hospital.commitment')}
              </p>
              <p className="mt-3 max-w-2xl font-sans text-white">
                {t('involved.hospital.experience')}
              </p>
              {/*
                §3.4 asks every pathway to carry its own call to action. This
                pathway had none, and the club has exactly one contact address —
                so the action reuses `involved.join.email` rather than inventing
                a verb. A dedicated label (`involved.hospital.cta`) does not
                exist in either locale; reported, not guessed.
              */}
              <PathwayCta to={t('involved.join.email')} variant="ghost" />
            </Pathway>
          </li>

          <li className="mt-2">
            <Rule />
            <Pathway n={pathwayNumber(2)} id="partner">
              <p className="mt-2 max-w-2xl font-sans text-white">
                {t('involved.partner.body')}
              </p>
              <PathwayCta to={t('involved.partner.contact')} variant="ghost" />
            </Pathway>
          </li>
        </ol>
      </Section>
    </>
  );
}

interface PathwayProps {
  /** `01`, `02`, `03` — wayfinding, not content. */
  n: string;
  id: PathwayId;
  /** The front door: a larger numeral, more air, and the only filled-outline CTA. */
  primary?: boolean;
  children: ReactNode;
}

function Pathway({ n, id, primary = false, children }: PathwayProps) {
  const { t } = useTranslation();
  const titleId = `involved-${id}`;

  return (
    <EditorialSplit
      as="article"
      aria-labelledby={titleId}
      className={primary ? 'py-12' : 'py-8'}
      rail={
        /*
          Wayfinding only. The heading in the wide column already names the
          pathway, so the number stays out of the accessibility tree rather than
          being announced as content with no referent.
         *
         * T30: EVERY pathway now opens on an oversized numeral at plate scale —
         * `size="lg"` is `text-5xl md:text-6xl`, 60px at 1440. The primary is
         * still the larger pathway, but it no longer says so with the number:
         * it says it with a bigger title, twice the air, and the page's one
         * accent-filled control.
         */
        <Numeral decorative size="lg">
          {n}
        </Numeral>
      }
    >
      <SectionHeading
        id={titleId}
        level={2}
        className={primary ? 'text-3xl md:text-4xl' : undefined}
      >
        {t(`involved.${id}.title`)}
      </SectionHeading>
      {children}
    </EditorialSplit>
  );
}

interface PathwayCtaProps {
  /** A `mailto:` address. The visible label IS the address — see the note in `Pathway`. */
  to: string;
  /**
   * `primary` is an accent FILL, and T30 puts exactly one of them on the page:
   * the front door's. The other two pathways keep underlined ghost links, so the
   * accent fill is what says which door to walk through.
   */
  variant: 'primary' | 'secondary' | 'ghost';
}

/**
 * Every pathway's call to action is an email to the club, so the visible label
 * is the address itself — an existing locale key, not an invented verb.
 *
 * There is deliberately no `sr-only` verb and no `aria-label`: a verb would need
 * a key that does not exist in either locale (`involved.hospital.cta` and
 * friends, raised in T21's key list), and `aria-label` here would replace the
 * visible address as the accessible name, breaking WCAG 2.5.3.
 */
function PathwayCta({ to, variant }: PathwayCtaProps) {
  return (
    <div className="mt-6">
      <Button
        href={`mailto:${to}`}
        variant={variant}
        size={variant === 'secondary' ? 'lg' : 'md'}
      >
        {to}
      </Button>
    </div>
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
