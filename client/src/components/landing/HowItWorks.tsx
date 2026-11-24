import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../common/SectionHeader';
import { Reveal } from '../motion/Reveal';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { CompassIcon, MapPinIcon, RouteIcon, SearchIcon } from '../ui/icons';

const steps = [
  {
    key: 'explore',
    Icon: CompassIcon,
    available: true,
    image:
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
    alt: 'Pyramids of Giza exploration',
  },
  {
    key: 'refine',
    Icon: SearchIcon,
    available: true,
    image:
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80',
    alt: 'Khan el-Khalili bazaar curation',
  },
  {
    key: 'shape',
    Icon: RouteIcon,
    available: false,
    image:
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80',
    alt: 'Nile felucca sailing and itinerary route',
  },
  {
    key: 'keep',
    Icon: MapPinIcon,
    available: false,
    image:
      'https://images.unsplash.com/photo-1771838877341-36157f26dd58?auto=format&fit=crop&w=600&q=80',
    alt: 'Siwa oasis Shali fortress retreat',
  },
] as const;

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <Section tone="canvas" spacing="md" aria-labelledby="how-heading">
      <Container>
        <SectionHeader
          eyebrow={t('home.how.eyebrow')}
          title={t('home.how.title')}
          description={t('home.how.description')}
          id="how-heading"
          align="center"
        />

        <Reveal className="mt-space-xl">
          <div className="grid grid-cols-1 gap-gutter-lg md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ key, Icon, available, image, alt }, index) => (
              <Card
                key={key}
                as="article"
                variant="surface"
                padding="md"
                interactive
                className="flex h-full flex-col overflow-hidden border border-hairline transition-all duration-500 hover:border-secondary hover:shadow-floating"
              >
                {/* Visual Photography Container — strictly NO text over image */}
                <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-hairline/60 bg-surface-container-low mb-space-md">
                  <img
                    src={image}
                    alt={alt}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="flex items-start justify-between gap-space-md">
                  <span
                    className="font-serif text-3xl font-medium text-secondary/40 leading-none"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="inline-flex size-9 items-center justify-center rounded-full bg-surface-container-low text-secondary [&_svg]:size-4"
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                </div>

                <h3 className="type-title mt-space-sm text-primary font-serif font-medium">
                  {t(`home.how.steps.${key}.title`)}
                </h3>
                <p className="type-small mt-space-xs text-on-surface-variant leading-relaxed">
                  {t(`home.how.steps.${key}.body`)}
                </p>
                <div className="mt-auto pt-space-md">
                  <Badge tone={available ? 'success' : 'outline'} size="sm">
                    {available ? t('home.how.available') : t('home.how.inDevelopment')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Reveal>

        <p className="type-small mt-space-lg text-center text-on-surface-variant">
          {t('home.how.note')}
        </p>
      </Container>
    </Section>
  );
}
