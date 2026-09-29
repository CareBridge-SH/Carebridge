import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  EditorialSplit,
  PlaceholderText,
  Plate,
  Rule,
  Section,
  SectionHeading,
} from '../components/ui';

const EVENT_IDS = [
  'fallWorkshop',
  'triviaNight',
  'christmasSale',
  'paLectures',
  'hospitalVisits',
] as const;

type EventId = (typeof EVENT_IDS)[number];

/**
 * Events' signature composition is **The Season Ledger** (ROUND4-PLAN §3.3):
 * an entry per event, the date in the rail and the entry in the wide column,
 * read *down* the page in order.
 *
 * This is not a card grid. An event is an entry in an ordered list, and the
 * list is an `<ol>` because the page asserts an order.
 */
export default function EventsPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="events" />
      <Section as="section" rhythm="loose" opening aria-labelledby="events-title">
        <h1
          id="events-title"
          className="page-turn font-serif text-display-2 font-semibold leading-[0.95] tracking-display text-balance text-white"
        >
          {t('events.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('events.intro')}
        </p>

        {/* The frontispiece: the season opens on a plate. */}
        <Plate slug="events" className="mt-10" />

        {/*
          The year every initiative on this page belongs to: ONE label for the
          whole ledger, above it, never repeated per entry. Styled as an eyebrow
          rather than a heading, because the event titles are the headings here.

          The guard is not decoration: `EVENT_IDS` is a compile-time constant
          today, so it never fires, but an empty list must not leave a dangling
          year above nothing. There is no empty-state copy in either locale, so
          "presentable when empty" means the page simply shows no ledger rather
          than an empty one — reported in the T24 report.
        */}
        {EVENT_IDS.length > 0 ? (
          <>
            <p
              id="events-year"
              className="mt-12 font-sans text-sm font-semibold tracking-wide text-cream uppercase"
            >
              {t('events.yearLabel')}
            </p>

            {/*
              `aria-labelledby` on a `<ol>`: `list` is a role whose name may come
              from the author, so naming the ledger after its year is valid here
              — unlike the `aria-label`-on-a-wrapper form this page used to avoid.
            */}
            <ol aria-labelledby="events-year" className="mt-6">
              {EVENT_IDS.map((id, index) => (
                <li key={id} className={index === 0 ? undefined : 'mt-10'}>
                  {/*
                    A hairline above EVERY entry, the first included — that is
                    what the ledger's rule does. It was previously drawn only
                    between entries, which left the first one unhung.
                  */}
                  <Rule className="mb-10" />
                  <EventEntry id={id} />
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </Section>
    </>
  );
}

function EventEntry({ id }: { id: EventId }) {
  const { t } = useTranslation();
  const titleId = `event-${id}-title`;

  return (
    <EditorialSplit
      as="article"
      aria-labelledby={titleId}
      rail={
        /*
         * The date rail is a LABEL, not a display moment.
         *
         * The operator, looking at the built page:
         *
         *   "The left column of Events page, in Gold, only signify the time of
         *    the events and are way too big. Remake the format of the page and
         *    make it smaller."
         *
         * They were right, and measured: the rail was `--text-display-3` —
         * 24 / 24 / 26.624 / 36.0 px at 375 / 768 / 1024 / 1440 — in a column a
         * third of the page. At 1440 the rail (36px) was LARGER than the event
         * title (30px), so the biggest thing in every entry after the `<h1>` was
         * a caption. A time is not a headline.
         *
         * It is now built like the page's own label — the same idiom, and the
         * same gold, as the `yearLabel` about fifty lines above: small, sans,
         * upper, tracked. The rail answers "when" the way the year label answers
         * "which year", so it belongs to that family.
         *
         * The strings are PROSE ("Week before Christmas", "Fridays, 90 minutes
         * per session"), and a previous task refused to split them into day and
         * month because that would have meant the operator authoring about ten
         * new strings. That refusal stands; the whole string is set in the one
         * voice, and nothing was invented.
         */
        <p className="font-sans text-sm font-semibold tracking-wide text-cream uppercase">
          {t(`events.items.${id}.when`)}
        </p>
      }
    >
      {/* The LONG title — deliberately distinct from the home page's short title. */}
      <SectionHeading id={titleId} level={2}>
        {t(`events.items.${id}.title`)}
      </SectionHeading>

      {id === 'hospitalVisits' ? (
        /*
          The status is a bracketed placeholder, rendered byte-identical and
          visually distinct from real copy — never reworded, never filled in
          with a plausible value.
        */
        <PlaceholderText as="p" className="mt-4 inline-block text-base">
          {t('events.items.hospitalVisits.status')}
        </PlaceholderText>
      ) : null}

      <p className="mt-3 max-w-3xl font-sans text-white">
        {t(`events.items.${id}.description`)}
      </p>

      {id === 'hospitalVisits' ? <HospitalTeam /> : null}
    </EditorialSplit>
  );
}

/**
 * The three `team.*` facts, as a clearly separated sub-block rather than one
 * run-on paragraph. A bullet list, because the locale provides the three values
 * but no "Team size" / "Schedule" / "Activities" label keys to hang a
 * definition list off — raised in T21's key list and not yet written.
 */
function HospitalTeam() {
  const { t } = useTranslation();

  return (
    <ul className="mt-4 list-disc space-y-2 border-l-2 border-lavender-dk pl-8">
      <li className="font-sans text-white">
        {t('events.items.hospitalVisits.team.size')}
      </li>
      <li className="font-sans text-white">
        {t('events.items.hospitalVisits.team.schedule')}
      </li>
      <li className="font-sans text-white">
        {t('events.items.hospitalVisits.team.activities')}
      </li>
    </ul>
  );
}
