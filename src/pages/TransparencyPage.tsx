import { useTranslation } from 'react-i18next';
import { RouteMeta } from '../components/RouteMeta';
import { Container } from '../components/ui';

/** T03 stub. T08 replaces this file. */
export default function TransparencyPage() {
  const { t } = useTranslation();

  return (
    <>
      <RouteMeta namespace="transparency" />
      <Container className="py-16 md:py-24">
        <h1 className="font-serif text-4xl font-semibold text-white md:text-5xl">
          {t('transparency.title')}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-lg text-white">
          {t('transparency.intro')}
        </p>
      </Container>
    </>
  );
}
