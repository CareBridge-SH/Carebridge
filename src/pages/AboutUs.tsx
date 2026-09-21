import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Card,
  Container,
  Grid,
  SectionHeading,
} from '../components/ui';

const PILLAR_IDS = ['treasurer', 'outreach', 'event', 'design'] as const;

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="about" />
      <Container className="py-16 md:py-24">
        <h1
          id="about-title"
          className="font-serif text-4xl font-semibold text-white md:text-5xl"
        >
          {t('about.title')}
        </h1>

        {/* ── Our Story ─────────────────────────────────────────────────── */}
        <section aria-labelledby="about-story" className="mt-12">
          <SectionHeading id="about-story" level={2}>
            {t('about.story.title')}
          </SectionHeading>
          {/* The client supplied the real club story — rendered as body text. */}
          <p className="mt-4 max-w-3xl font-sans text-lg text-white">
            {t('about.story.body')}
          </p>
        </section>

        {/* ── Our Mission ───────────────────────────────────────────────── */}
        <section aria-labelledby="about-mission" className="mt-12">
          <SectionHeading id="about-mission" level={2}>
            {t('about.mission.title')}
          </SectionHeading>
          <p className="mt-4 max-w-3xl font-sans text-lg text-white">
            {t('about.mission.body')}
          </p>
        </section>

        {/* ── Our Structure ─────────────────────────────────────────────── */}
        <section aria-labelledby="about-structure" className="mt-12">
          <SectionHeading id="about-structure" level={2}>
            {t('about.structure.title')}
          </SectionHeading>
          <p className="mt-3 max-w-2xl font-sans text-white">
            {t('about.structure.intro')}
          </p>

          {/*
            Four pillars as four cards. 2x2 on tablet and desktop, single-column
            stack at 375 px. Each card is named by its own heading via the §4
            passthrough (aria-labelledby points at the SectionHeading's id).
          */}
          <Grid cols={{ base: 1, md: 2, lg: 2 }} gap="md" className="mt-8">
            {PILLAR_IDS.map((id) => (
              <Card
                key={id}
                as="article"
                aria-labelledby={`pillar-${id}-title`}
              >
                <SectionHeading id={`pillar-${id}-title`} level={3}>
                  {t(`about.structure.pillars.${id}.title`)}
                </SectionHeading>
                <p className="mt-2 font-sans text-white">
                  {t(`about.structure.pillars.${id}.description`)}
                </p>
              </Card>
            ))}
          </Grid>
        </section>
      </Container>
    </>
  );
}
