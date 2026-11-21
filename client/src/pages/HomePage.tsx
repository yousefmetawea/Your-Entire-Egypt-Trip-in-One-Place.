import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FeaturedPlaces } from '../components/landing/FeaturedPlaces';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ReadyMadeTrips } from '../components/landing/ReadyMadeTrips';
import { TrustStrip } from '../components/landing/TrustStrip';
import { CategoryChips } from '../components/places/CategoryChips';
import type { CategoryChipValue } from '../components/places/CategoryChips';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { createDiscoverHref } from '../lib/discover';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleCategoryChange(value: CategoryChipValue): void {
    navigate(
      createDiscoverHref({
        filters: value === 'all' ? {} : { category: value },
      }),
    );
  }

  return (
    <>
      <Hero />

      <Section tone="surface" spacing="sm" aria-label={t('discover.filters.categoryLabel')}>
        <Container>
          <CategoryChips value="all" onChange={handleCategoryChange} />
        </Container>
      </Section>

      <FeaturedPlaces />
      <ReadyMadeTrips />
      <HowItWorks />
      <TrustStrip />
    </>
  );
}
