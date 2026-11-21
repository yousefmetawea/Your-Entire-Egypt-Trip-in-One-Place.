import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';

export interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  phase: string;
  children?: ReactNode;
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  phase,
  children,
}: PagePlaceholderProps) {
  return (
    <Section tone="canvas" spacing="md" className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 84% 8%, rgba(176,141,87,0.14), transparent 32%), radial-gradient(circle at 10% 92%, rgba(217,199,163,0.18), transparent 36%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <Badge tone="outline">{eyebrow}</Badge>
          <h1 className="type-display mt-space-lg">{title}</h1>
          <p className="type-body-lg mt-space-md max-w-2xl text-on-surface-variant">
            {description}
          </p>
        </div>

        <Card padding="lg" className="mt-space-2xl max-w-2xl">
          <Badge tone="bronze">{phase}</Badge>
          <p className="type-body mt-space-md text-on-surface-variant">
            This route is part of the Phase 2 app shell. The screen content is planned for {phase}.
          </p>
        </Card>

        {children ? <div className="mt-space-2xl">{children}</div> : null}
      </Container>
    </Section>
  );
}
