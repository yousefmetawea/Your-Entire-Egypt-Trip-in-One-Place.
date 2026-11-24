import { useState } from 'react';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { Badge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { ComponentsSection } from './ComponentsSection';
import { FoundationsSection } from './FoundationsSection';
import { MotionSection } from './MotionSection';
import { RtlSection } from './RtlSection';

const navLinks = [
  { label: 'Foundations', href: '#foundations' },
  { label: 'Components', href: '#components' },
  { label: 'Motion', href: '#motion' },
  { label: 'Direction', href: '#rtl' },
] as const;

const footerColumns = [
  {
    heading: 'Review',
    links: [
      { label: 'Foundations', href: '#foundations' },
      { label: 'Components', href: '#components' },
      { label: 'Motion', href: '#motion' },
      { label: 'RTL preview', href: '#rtl' },
    ],
  },
  {
    heading: 'Phase 1',
    links: [
      { label: 'Color tokens', href: '#foundations' },
      { label: 'Typography', href: '#foundations' },
      { label: 'Primitives', href: '#components' },
      { label: 'Review status', href: '#status' },
    ],
  },
] as const;

const statusItems = [
  'Canonical Stitch tokens',
  'Self-hosted typefaces',
  'Reusable primitives',
  'Motion foundation',
  'RTL foundations',
] as const;

export function DesignSystemShowcase() {
  const [newsletterStatus, setNewsletterStatus] = useState<string>();

  return (
    <div id="top" className="min-h-screen bg-surface-container-low">
      <a
        href="#main"
        className="sr-only fixed start-space-sm top-space-sm z-[60] rounded-full bg-primary px-space-md py-space-sm font-sans text-title-md text-on-primary focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-secondary"
      >
        Skip to content
      </a>

      <Navbar
        brandLabel="YourTrip"
        brandHref="#top"
        links={navLinks}
        cta={{ label: 'Review status', href: '#status' }}
        actions={<Badge tone="outline">Phase 1 review</Badge>}
        ariaLabel="Design system showcase sections"
        menuLabel="Open showcase navigation"
        closeMenuLabel="Close showcase navigation"
      />

      <main id="main" className="pt-24 md:pt-28">
        <section className="relative overflow-hidden bg-primary-container text-on-primary">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 82% 14%, rgba(176,141,87,0.28), transparent 36%), radial-gradient(circle at 8% 88%, rgba(217,199,163,0.12), transparent 40%)',
            }}
            aria-hidden="true"
          />

          <Container className="relative pb-space-2xl pt-space-xl md:pb-24 md:pt-20">
            <div className="grid items-center gap-gutter-lg lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-space-sm">
                  <span className="size-2 rounded-full bg-secondary-fixed" aria-hidden="true" />
                  <p className="type-label text-secondary-fixed">Phase 1 · Design-system review</p>
                </div>

                <h1 className="type-display mt-space-lg text-on-primary">
                  Design System <span className="italic text-secondary-fixed">Foundation.</span>
                </h1>

                <p className="mt-space-lg max-w-2xl type-body-lg text-surface-container-high">
                  A temporary review surface for the Discover Cairo visual language: canonical
                  Stitch tokens, two self-hosted typefaces, reusable primitives, and a restrained
                  motion foundation. No product pages, imagery, or live data.
                </p>

                <div className="mt-space-xl flex flex-wrap gap-space-sm">
                  <ButtonLink href="#foundations" variant="bronze" size="lg">
                    Explore foundations
                  </ButtonLink>
                  <ButtonLink href="#components" variant="inverse" size="lg">
                    Review components
                  </ButtonLink>
                </div>

                <div className="mt-space-xl flex flex-wrap gap-space-xs">
                  <Badge tone="glass-dark" dot>
                    Canonical tokens
                  </Badge>
                  <Badge tone="glass-dark" dot>
                    Playfair + Jakarta
                  </Badge>
                  <Badge tone="glass-dark" dot>
                    Reduced-motion aware
                  </Badge>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-card border border-white/10 bg-white/[0.04] p-space-lg shadow-modal backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <p className="type-label text-secondary-fixed">Type specimen</p>
                    <Badge tone="glass-dark">Two families</Badge>
                  </div>

                  <div className="mt-space-lg flex items-end justify-between gap-space-md border-b border-white/10 pb-space-lg">
                    <span className="font-display text-[5.5rem] leading-[0.8] text-on-primary md:text-[7rem]">
                      Aa
                    </span>
                    <div className="text-end">
                      <p className="font-display text-title-lg text-on-primary">Playfair Display</p>
                      <p className="mt-space-xs type-small text-surface-container-high">
                        Editorial display
                      </p>
                    </div>
                  </div>

                  <div className="mt-space-lg grid grid-cols-2 gap-space-md">
                    <div>
                      <p className="type-label text-secondary-fixed">Interface</p>
                      <p className="mt-space-xs font-sans text-title-md text-on-primary">
                        Plus Jakarta Sans
                      </p>
                      <p className="mt-space-xs type-small text-surface-container-high">
                        Operational clarity
                      </p>
                    </div>

                    <div>
                      <p className="type-label text-secondary-fixed">Canvas</p>
                      <div className="mt-space-xs flex items-center gap-space-xs">
                        <span
                          className="size-5 rounded-full border border-white/20 bg-surface-container-low"
                          aria-hidden="true"
                        />
                        <span className="type-label-sm tabular-nums text-on-primary">#F7F3EC</span>
                      </div>
                      <p className="mt-space-xs type-small text-surface-container-high">
                        Warm ivory
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-2xl grid grid-cols-2 gap-space-md border-t border-white/10 pt-space-lg sm:grid-cols-4">
              {[
                ['Tokens', 'Stitch generated'],
                ['Type', 'Playfair + Jakarta'],
                ['Direction', 'LTR + RTL'],
                ['Motion', 'Reduced-motion aware'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="type-label text-secondary-fixed">{label}</p>
                  <p className="mt-space-xs type-label-sm text-on-primary">{value}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <FoundationsSection />
        <ComponentsSection />
        <MotionSection />
        <RtlSection />

        <Section id="status" tone="muted" spacing="sm">
          <Container>
            <Card variant="surface" padding="lg" className="grid gap-gutter-lg lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="type-label text-secondary">Review status</p>
                <h2 className="type-section mt-space-sm text-primary">
                  Phase 1 is ready for review.
                </h2>
                <p className="mt-space-md max-w-3xl type-body-lg text-on-surface-variant">
                  The design system, showcase, and documentation are complete for this phase.
                  Slider, DatePicker, Toast, and Skeleton remain deferred until their actual screen
                  designs exist.
                </p>

                <div className="mt-space-lg flex flex-wrap gap-space-xs">
                  {statusItems.map((item) => (
                    <Badge key={item} tone="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-space-md lg:col-span-4">
                <div className="rounded-xl bg-surface-container-low p-space-md">
                  <p className="type-label text-secondary">Verification</p>
                  <p className="mt-space-xs type-small text-on-surface-variant">
                    Run <code className="font-sans font-semibold">lint</code>,{' '}
                    <code className="font-sans font-semibold">typecheck</code>, and{' '}
                    <code className="font-sans font-semibold">build</code> from the repository root
                    before approving the phase.
                  </p>
                </div>

                <ButtonLink href="#top" variant="secondary" size="sm">
                  Back to top
                </ButtonLink>
              </div>
            </Card>
          </Container>
        </Section>
      </main>

      <Footer
        brandLabel="YourTrip"
        brandHref="#top"
        description="A design-system review surface for the YourTrip platform. This page contains no product pages, bookings, prices, or live data."
        note="Design System · Foundations & Primitives"
        columns={footerColumns}
        newsletter={{
          heading: 'Newsletter pattern',
          description: 'A visual-only form for the review. No data is sent or stored.',
          emailLabel: 'Email address',
          emailPlaceholder: 'Your email address',
          submitLabel: 'Preview',
          onSubmit: () => {
            setNewsletterStatus('This showcase form does not send or store data.');
          },
          status: newsletterStatus,
        }}
        legal="© 2026 YourTrip. Design-system review build."
        metaLinks={[
          { label: 'Back to top', href: '#top' },
          { label: 'Review status', href: '#status' },
        ]}
      />
    </div>
  );
}
