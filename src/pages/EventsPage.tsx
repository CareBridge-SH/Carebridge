import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Container,
  PlaceholderText,
  SectionHeading,
} from '../components/ui';

/** T03 stub. T07 replaces this file. */
export default function EventsPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="events" />
      <Container className="py-16 md:py-24">
        <h1 className="font-serif text-4xl font-semibold text-white md:text-5xl">
          {t('events.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('events.intro')}
        </p>

        <section aria-labelledby="events-hospital-visits" className="mt-10">
          <SectionHeading id="events-hospital-visits" level={2}>
            {t('events.items.hospitalVisits.title')}
          </SectionHeading>
          <PlaceholderText as="p" className="mt-4 inline-block text-lg">
            {t('events.items.hospitalVisits.status')}
          </PlaceholderText>
        </section>
      </Container>
    </>
  );
}
