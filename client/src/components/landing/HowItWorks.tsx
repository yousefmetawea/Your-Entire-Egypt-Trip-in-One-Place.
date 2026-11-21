import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../common/SectionHeader';
import { Reveal } from '../motion/Reveal';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { CompassIcon, MapPinIcon, RouteIcon, SearchIcon } from '../ui/icons';

const steps = [
  { key: 'explore', Icon: CompassIcon, available: true },
  { key: 'refine', Icon: SearchIcon, available: true },
  { key: 'shape', Icon: RouteIcon, available: false },
  { key: 'keep', Icon: MapPinIcon, available: false },
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
            {steps.map(({ key, Icon, available }, index) => (
              <Card
                key={key}
                as="article"
                variant="surface"
                padding="lg"
                interactive
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between gap-space-md">
                  <span
                    className="font-display text-[3.5rem] leading-none text-secondary/30"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="inline-flex size-10 items-center justify-center rounded-full bg-surface-container-low text-secondary [&_svg]:size-5"
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                </div>

                <h3 className="type-title mt-space-md text-primary">
                  {t(`home.how.steps.${key}.title`)}
                </h3>
                <p className="type-small mt-space-sm text-on-surface-variant">
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
