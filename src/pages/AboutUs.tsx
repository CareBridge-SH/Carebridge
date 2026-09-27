import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import {
  Card,
  Container,
  Grid,
  Prose,
  ProseLead,
  PullQuote,
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
          className="font-serif text-4xl font-semibold leading-tight text-balance text-white md:text-5xl"
        >
          {t('about.title')}
        </h1>

        {/* ── Our Story ─────────────────────────────────────────────────── */}
        <section aria-labelledby="about-story" className="mt-12">
          {/*
            Editorial offset: the heading sits in the left column and the body
            runs in the right two-thirds, so a prose section does not read as the
            same "heading over paragraph" stack as the card grids.
          */}
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-8">
            <SectionHeading id="about-story" level={2}>
              {t('about.story.title')}
            </SectionHeading>
            {/*
              The client supplied the real club story — rendered as body text in
              the long-read scope: it is the opening statement of the page, so it
              is the lead, and the scope caps the measure at ~65ch.
            */}
            <Prose className="lg:col-span-2">
              <ProseLead>{t('about.story.body')}</ProseLead>
            </Prose>
          </div>
        </section>

        {/* ── Our Mission ───────────────────────────────────────────────── */}
        <section aria-labelledby="about-mission" className="mt-12">
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-8">
            <SectionHeading id="about-mission" level={2}>
              {t('about.mission.title')}
            </SectionHeading>
            {/*
              The mission is the club's own formal statement, pulled out at
              display scale rather than set as another paragraph — the one
              pull-quote on the page. Same string, same locale key, restyled.
            */}
            <Prose className="lg:col-span-2">
              <PullQuote>{t('about.mission.body')}</PullQuote>
            </Prose>
          </div>
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
