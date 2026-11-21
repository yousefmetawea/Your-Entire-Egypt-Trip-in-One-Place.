import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../common/SectionHeader';
import { Reveal } from '../motion/Reveal';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { CheckIcon, CompassIcon, InfoIcon, MapPinIcon } from '../ui/icons';

const items = [
  { key: 'focus', Icon: MapPinIcon },
  { key: 'demo', Icon: InfoIcon },
  { key: 'prices', Icon: CheckIcon },
  { key: 'planning', Icon: CompassIcon },
] as const;

export function TrustStrip() {
  const { t } = useTranslation();

  return (
    <Section tone="surface" spacing="md" aria-labelledby="trust-heading">
      <Container>
        <SectionHeader
          eyebrow={t('home.trust.eyebrow')}
          title={t('home.trust.title')}
          description={t('home.trust.description')}
          id="trust-heading"
          align="center"
        />

        <Reveal className="mt-space-xl">
          <Card variant="muted" padding="lg">
            <div className="grid grid-cols-1 gap-gutter-lg md:grid-cols-2 lg:grid-cols-4">
              {items.map(({ key, Icon }) => (
                <div key={key} className="flex items-start gap-space-md">
                  <span
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-secondary shadow-resting [&_svg]:size-5"
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                  <div>
                    <h3 className="type-title-sm text-primary">
                      {t(`home.trust.items.${key}.title`)}
                    </h3>
                    <p className="type-small mt-space-xs text-on-surface-variant">
                      {t(`home.trust.items.${key}.body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}
