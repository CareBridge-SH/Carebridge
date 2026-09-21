import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Container,
  PlaceholderText,
  SectionHeading,
} from '../components/ui';

/** T03 stub. T07 replaces this file. */
export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="about" />
      <Container className="py-16 md:py-24">
        <h1 className="font-serif text-4xl font-semibold text-white md:text-5xl">
          {t('about.title')}
        </h1>

        <section aria-labelledby="about-story" className="mt-10">
          <SectionHeading id="about-story" level={2}>
            {t('about.story.title')}
          </SectionHeading>
          <PlaceholderText as="p" className="mt-4 inline-block text-lg">
            {t('about.story.body')}
          </PlaceholderText>
        </section>
      </Container>
    </>
  );
}
