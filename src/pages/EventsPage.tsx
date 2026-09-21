import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Container,
  PlaceholderText,
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

export default function EventsPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="events" />
      <Container className="py-16 md:py-24">
        <h1
          id="events-title"
          className="font-serif text-4xl font-semibold text-white md:text-5xl"
        >
          {t('events.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('events.intro')}
        </p>

        <div className="mt-12 flex flex-col gap-10">
          {EVENT_IDS.map((id) => (
            <EventArticle key={id} id={id} />
          ))}
        </div>
      </Container>
    </>
  );
}

function EventArticle({ id }: { id: EventId }) {
  const { t } = useTranslation();
  const titleId = `event-${id}-title`;

  return (
    <article aria-labelledby={titleId} className="border-b border-lavender-dk pb-10 last:border-b-0">
      {/* The LONG title — deliberately distinct from the home page's short title. */}
      <SectionHeading id={titleId} level={2}>
        {t(`events.items.${id}.title`)}
      </SectionHeading>

      {id === 'hospitalVisits' ? (
        /*
          The status is a bracketed placeholder, rendered byte-identical and
          visually distinct from real copy — never reworded.
        */
        <PlaceholderText as="p" className="mt-4 inline-block text-base">
          {t('events.items.hospitalVisits.status')}
        </PlaceholderText>
      ) : null}

      <p className="mt-3 font-sans text-sm font-medium text-lavender">
        {t(`events.items.${id}.when`)}
      </p>
      <p className="mt-3 max-w-3xl font-sans text-white">
        {t(`events.items.${id}.description`)}
      </p>

      {id === 'hospitalVisits' ? <HospitalTeam /> : null}
    </article>
  );
}

/**
 * The three `team.*` facts, as a clearly separated sub-block rather than one
 * run-on paragraph. A bullet list, because the locale provides the three values
 * but no "Team size" / "Schedule" / "Activities" label keys to hang a
 * definition list off.
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
