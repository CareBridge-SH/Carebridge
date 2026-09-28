import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import { Section, SectionHeading } from '../components/ui';

const PATHWAY_IDS = ['join', 'hospital', 'partner'] as const;

type PathwayId = (typeof PATHWAY_IDS)[number];

/**
 * Get Involved's opening is **the three cards** (ROUND6-PLAN §3.3, the operator's
 * choice A). It replaces round 4's uneven pathway ledger, which round 5 then
 * dressed with oversized numerals.
 *
 * The opening is the `<h1>` at `--text-display-2` and the lede, and **nothing
 * else** — no frontispiece, no numerals, no metadata line. Then three equal
 * cards.
 *
 * **The numeral is gone** — ROUND6-PLAN §2 assigns its removal to this task, and
 * the ordering matters: the opening is built on what the removals leave behind,
 * so building it on figures meant to be gone would have been the failure the
 * ordering exists to prevent. `01 / 02 / 03` are not replaced by anything.
 *
 * **`--text-display-2`, not `--text-display-1`:** only one page sitewide opens on
 * the largest step and it is Home. This is the rule that does the most for the
 * sameness complaint, and it is mechanically checkable.
 *
 * No donation affordance anywhere on the page — not a button, not a link, not a
 * sentence.
 */
export default function GetInvolved() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="involved" />
      <Section as="section" rhythm="loose" aria-labelledby="involved-title">
        <div className="max-w-3xl">
          <h1
            id="involved-title"
            className="page-turn font-serif text-display-2 font-semibold leading-[0.95] tracking-display text-balance text-white"
          >
            {t('involved.title')}
          </h1>
          <p
            className="text-white"
            style={{ marginTop: 'var(--gap-heading-body)', lineHeight: 'var(--leading-prose)' }}
          >
            {t('involved.intro')}
          </p>
        </div>

        {/*
          Three equal cards. Equal is the whole point — round 4 argued the
          pathways were NOT interchangeable and made them deliberately uneven,
          and the operator chose the opposite variant. `md:grid-cols-3` stretches
          every card in a row to the tallest, and `flex-1` on the body pushes each
          card's address to its own bottom line, so a two-sentence card and a
          three-sentence card end together.
        */}
        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {PATHWAY_IDS.map((id) => (
            <PathwayCard key={id} id={id} />
          ))}
        </ul>
      </Section>
    </>
  );
}

interface PathwayCardProps {
  id: PathwayId;
}

function PathwayCard({ id }: PathwayCardProps) {
  const { t } = useTranslation();
  const titleId = `involved-${id}`;

  return (
    <li
      aria-labelledby={titleId}
      className="flex flex-col border-t border-rule-strong pt-6"
    >
      <SectionHeading id={titleId} level={2}>
        {t(`involved.${id}.title`)}
      </SectionHeading>

      {/* `flex-1` is what makes the cards agree on where they end. */}
      <div className="mt-3 flex flex-1 flex-col gap-3">
        <p className="text-white" style={{ lineHeight: 'var(--leading-prose)' }}>
          {id === 'join' ? t('involved.join.body') : null}
          {id === 'hospital' ? t('involved.hospital.experience') : null}
          {id === 'partner' ? t('involved.partner.body') : null}
        </p>

        {id === 'join' ? (
          <p className="text-white" style={{ lineHeight: 'var(--leading-prose)' }}>
            {t('involved.join.noFees')}
          </p>
        ) : null}

        {id === 'hospital' ? (
          /*
            The commitment is a scannable fact, separated from the prose rather
            than buried in it — and the numerals rule applies to it: `90` is a
            figure that is content, so it is set in the sans with tabular
            figures.
          */
          <p
            className="figures border-l-2 border-lavender-dk pl-4 font-medium text-white"
            style={{ lineHeight: 'var(--leading-prose)' }}
          >
            {t('involved.hospital.commitment')}
          </p>
        ) : null}
      </div>

      {/*
        The address, in the one treatment T37 defined for every `mailto:` link on
        the site. Nothing here restyles it — the operator's complaint was that
        these three looked different from each other because each context styled
        its own, and scoping it again would rebuild the bug.
      */}
      <p className="mt-6">
        <a href={`mailto:${t(`involved.${id === 'partner' ? 'partner.contact' : 'join.email'}`)}`}>
          {t(`involved.${id === 'partner' ? 'partner.contact' : 'join.email'}`)}
        </a>
      </p>
    </li>
  );
}
