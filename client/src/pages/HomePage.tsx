import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Hero } from '../components/landing/Hero';
import { EditorialIntro } from '../components/landing/EditorialIntro';
import { DestinationsShowcase } from '../components/landing/DestinationsShowcase';
import { TravelTicker } from '../components/landing/TravelTicker';
import { CuratedJourneysSection } from '../components/landing/CuratedJourneysSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FaqSection } from '../components/landing/FaqSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
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
      {/* 1. Cinematic Hero with Layered Egypt Photography Deck & Infinite Marquee */}
      <Hero />

      {/* 2. Category Quick Filters */}
      <Section tone="surface" spacing="sm" aria-label={t('discover.filters.categoryLabel')}>
        <Container>
          <CategoryChips value="all" onChange={handleCategoryChange} />
        </Container>
      </Section>

      {/* 3. Editorial Philosophy & Brand Narrative */}
      <EditorialIntro />

      {/* 4. Asymmetrical Destinations Showcase (OVO Legion Selected Work Pattern) */}
      <DestinationsShowcase />

      {/* 5. Travel Dimensions Moving Ticker */}
      <TravelTicker />

      {/* 6. Signature Curated Journeys Showcase */}
      <CuratedJourneysSection />

      {/* 7. How It Works (Bespoke Planning Process) */}
      <HowItWorks />

      {/* 8. Interactive FAQ with Animated Accordions */}
      <FaqSection />

      {/* 9. Final Cinematic Call-to-Action */}
      <FinalCtaSection />

      {/* 10. Honesty & Transparency Strip */}
      <TrustStrip />
    </>
  );
}
