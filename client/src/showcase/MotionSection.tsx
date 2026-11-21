import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { staggerContainer, staggerItem } from '../lib/motion';
import { SectionIntro } from './SectionIntro';

const motionItems = [
  {
    number: '01',
    title: 'Entrance',
    detail: 'A short fade and rise introduces a section without delaying it.',
  },
  {
    number: '02',
    title: 'Cadence',
    detail: 'Children follow at an 80ms interval to create a quiet sequence.',
  },
  {
    number: '03',
    title: 'Restraint',
    detail: 'No ambient loops. Motion is reserved for a clear purpose.',
  },
] as const;

export function MotionSection() {
  const [replayKey, setReplayKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section id="motion" tone="dark" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 18%, rgba(176,141,87,0.22), transparent 38%), radial-gradient(circle at 12% 84%, rgba(217,199,163,0.1), transparent 42%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-gutter-lg lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro
              eyebrow="03 · Motion"
              title="Motion, held in reserve."
              description="The shared Framer Motion variants cover entrances, stagger, and scale-in. MotionConfig and the global stylesheet both honour the visitor's reduced-motion setting."
              inverted
            />

            <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
              <Button variant="inverse" onClick={() => setReplayKey((key) => key + 1)}>
                Replay sequence
              </Button>
              {prefersReducedMotion ? (
                <Badge tone="glass-dark" dot>
                  Reduced motion detected
                </Badge>
              ) : (
                <Badge tone="glass-dark" dot>
                  Motion enabled
                </Badge>
              )}
            </div>

            <p className="mt-space-md max-w-md type-small text-surface-container-high">
              Hover and focus transitions remain in CSS. Framer Motion is used only for choreography
              that benefits from coordinated variants.
            </p>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              key={replayKey}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid gap-space-sm sm:grid-cols-3"
            >
              {motionItems.map((item) => (
                <motion.div
                  key={item.number}
                  variants={staggerItem}
                  className="rounded-card border border-white/10 bg-white/[0.04] p-space-lg backdrop-blur-sm"
                >
                  <span className="type-label text-secondary-fixed">{item.number}</span>
                  <h3 className="type-card-title mt-space-md text-on-primary">{item.title}</h3>
                  <p className="mt-space-sm type-small text-surface-container-high">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-space-lg flex items-center gap-space-sm border-t border-white/10 pt-space-md">
              <span className="size-1.5 rounded-full bg-secondary-fixed" aria-hidden="true" />
              <p className="type-label text-secondary-fixed">
                Ease-out · 220–500ms · No ambient loops
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
