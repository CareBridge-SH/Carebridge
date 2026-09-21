import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import { Button, Card, Container, Grid, SectionHeading } from '../components/ui';

/**
 * T03 stub. T06 replaces this file wholesale -- everything below the hero CTAs
 * is scaffolding that exists so the six shared primitives are actually rendered
 * somewhere and can be checked in a browser and in both themes.
 */
export default function HomePage() {
  const { t } = useTranslation();

  const impact = ['fundraising', 'awareness', 'directAction'] as const;

  return (
    <>
      <RouteMeta namespace="home" />
      <Container className="py-16 md:py-24">
        <h1 className="font-serif text-4xl font-semibold text-white md:text-5xl lg:text-6xl">
          {t('home.hero.headline')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('home.hero.subheadline')}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button to="/get-involved" variant="primary" size="lg">
            {t('home.hero.cta.join')}
          </Button>
          <Button to="/get-involved" variant="secondary" size="lg">
            {t('home.hero.cta.partner')}
          </Button>
        </div>
      </Container>

      {/* T06 scaffolding -- do not treat this as the finished home page. */}
      <section aria-labelledby="home-impact" className="pb-16 md:pb-24">
        <Container>
          <SectionHeading id="home-impact" level={2}>
            {t('home.impact.title')}
          </SectionHeading>
          <p className="mt-3 font-sans text-white">{t('home.impact.subtitle')}</p>

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md" className="mt-8">
            {impact.map((pillar) => (
              <Card key={pillar} as="article">
                <SectionHeading id={`home-impact-${pillar}`} level={3}>
                  {t(`home.impact.${pillar}.title`)}
                </SectionHeading>
                <p className="mt-3 font-sans text-white">
                  {t(`home.impact.${pillar}.description`)}
                </p>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>
    </>
  );
}
