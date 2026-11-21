import { useState } from 'react';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Container } from '../components/ui/Container';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Section } from '../components/ui/Section';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import type { TabItem } from '../components/ui/Tabs';
import { SectionIntro } from './SectionIntro';

const mediaStyles: Record<string, string> = {
  basalt:
    'radial-gradient(circle at 24% 18%, rgba(176,141,87,0.42), transparent 42%), linear-gradient(135deg, #1f1f1f 0%, #060607 100%)',
  sand: 'radial-gradient(circle at 78% 20%, rgba(255,255,255,0.32), transparent 36%), linear-gradient(135deg, #775928 0%, #d9c7a3 100%)',
};

function MediaPlaceholder({
  label,
  tone = 'basalt',
}: {
  label: string;
  tone?: keyof typeof mediaStyles;
}) {
  return (
    <div
      className="relative flex aspect-[4/3] items-end overflow-hidden p-space-md"
      style={{ backgroundImage: mediaStyles[tone] }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
      <Badge tone="glass-dark" className="relative">
        {label}
      </Badge>
    </div>
  );
}

const districtOptions = [
  { value: 'giza', label: 'Giza Plateau' },
  { value: 'downtown', label: 'Downtown Cairo' },
  { value: 'islamic', label: 'Islamic Cairo' },
  { value: 'coptic', label: 'Coptic Cairo' },
  { value: 'zamalek', label: 'Zamalek & Gezira' },
] as const;

interface ChipOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const chipOptions: readonly ChipOption[] = [
  { value: 'all', label: 'All' },
  { value: 'history', label: 'History' },
  { value: 'culture', label: 'Culture' },
  { value: 'nile', label: 'Nile' },
  { value: 'desert', label: 'Desert', disabled: true },
];

const overviewTabs: readonly TabItem[] = [
  {
    value: 'overview',
    label: 'Overview',
    content: (
      <p className="type-body text-on-surface-variant">
        Pill tabs use the primary basalt fill for the active item, matching the day and segment
        selectors in the Stitch exports.
      </p>
    ),
  },
  {
    value: 'details',
    label: 'Details',
    content: (
      <p className="type-body text-on-surface-variant">
        The tab list supports arrow keys, Home, End, disabled items, and RTL direction without
        duplicating markup.
      </p>
    ),
  },
  {
    value: 'notes',
    label: 'Review notes',
    content: (
      <p className="type-body text-on-surface-variant">
        Each tab owns a labelled panel. Only the active panel is visible while the rest remain
        mounted and hidden.
      </p>
    ),
  },
];

const densityTabs: readonly TabItem[] = [
  {
    value: 'grid',
    label: 'Grid',
    content: (
      <p className="type-body text-on-surface-variant">
        Segmented controls sit on a muted track with a white active surface.
      </p>
    ),
  },
  {
    value: 'list',
    label: 'List',
    content: (
      <p className="type-body text-on-surface-variant">
        Use the segmented variant for compact view switching in itinerary and map surfaces.
      </p>
    ),
  },
];

export function ComponentsSection() {
  const [selectedChip, setSelectedChip] = useState('all');
  const [pillTab, setPillTab] = useState('overview');
  const [densityTab, setDensityTab] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Section id="components" tone="surface">
      <Container className="flex flex-col gap-space-2xl">
        <SectionIntro
          eyebrow="02 · Components"
          title="A compact, reusable interface kit."
          description="Every primitive is typed, keyboard accessible, and built from the approved tokens. The examples use neutral review copy rather than product content."
        />

        <Card id="buttons" padding="lg" className="flex flex-col gap-space-lg">
          <div className="flex flex-col gap-space-xs sm:flex-row sm:items-end sm:justify-between">
            <h3 className="type-title text-primary">Button</h3>
            <p className="type-small text-on-surface-variant">
              Four tones, three sizes, link and icon-slot support
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="bronze">Bronze</Button>
            <Button disabled>Disabled</Button>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm border-t border-hairline pt-space-lg">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <ButtonLink href="#buttons" variant="secondary" size="sm">
              Link button
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-primary-container p-space-md">
            <span className="type-label text-secondary-fixed">On basalt</span>
            <div className="flex flex-wrap gap-space-xs">
              <Button variant="inverse" size="sm">
                Inverse action
              </Button>
              <Button variant="bronze" size="sm">
                Bronze action
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex flex-col gap-space-xs sm:flex-row sm:items-end sm:justify-between">
            <h3 className="type-title text-primary">Card</h3>
            <p className="type-small text-on-surface-variant">
              Surface, elevated, and dark treatments
            </p>
          </div>

          <div className="mt-space-md grid gap-gutter-lg md:grid-cols-2 lg:grid-cols-3">
            <Card as="article" padding="none" interactive className="overflow-hidden">
              <MediaPlaceholder label="4:3 media slot" />
              <div className="p-space-lg">
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <Badge tone="bronze">Editorial</Badge>
                  <StatusBadge status="available">Available</StatusBadge>
                </div>
                <h4 className="type-card-title mt-space-md text-primary">Surface card</h4>
                <p className="mt-space-sm type-body text-on-surface-variant">
                  The default container for media, metadata, and one clear next action.
                </p>
                <Button variant="secondary" size="sm" className="mt-space-lg">
                  Card action
                </Button>
              </div>
            </Card>

            <Card as="article" variant="elevated" padding="lg">
              <Badge tone="outline">Elevated</Badge>
              <h4 className="type-card-title mt-space-md text-primary">Review panel</h4>
              <p className="mt-space-sm type-body text-on-surface-variant">
                A floating surface for detail panels and compact summaries.
              </p>

              <div className="mt-space-lg rounded-xl bg-surface-container-low p-space-md">
                <p className="type-label text-secondary">Estimated price</p>
                <p className="mt-space-xs type-small text-on-surface-variant">
                  Trust labels stay visible beside any price data.
                </p>
              </div>

              <div className="mt-space-lg flex flex-wrap gap-space-xs">
                <Badge tone="bronze">Estimated price</Badge>
                <Badge tone="outline">Last updated 21 Nov 2026</Badge>
              </div>
            </Card>

            <Card as="article" variant="dark" padding="lg">
              <Badge tone="glass-dark">Basalt</Badge>
              <h4 className="type-card-title mt-space-md text-on-primary">High-contrast moment</h4>
              <p className="mt-space-sm type-body text-surface-container-high">
                Reserved for editorial breaks and the most important decision on a screen.
              </p>

              <div className="mt-space-lg flex flex-wrap gap-space-xs">
                <Badge tone="glass-dark">External booking</Badge>
                <StatusBadge status="pending">Pending</StatusBadge>
              </div>

              <Button variant="inverse" size="sm" className="mt-space-lg">
                Dark action
              </Button>
            </Card>
          </div>
        </div>

        <div className="grid gap-gutter-lg lg:grid-cols-2">
          <Card padding="lg">
            <div className="flex flex-col gap-space-xs sm:flex-row sm:items-end sm:justify-between">
              <h3 className="type-title text-primary">Filter chips</h3>
              <p className="type-small text-on-surface-variant">Selected: {selectedChip}</p>
            </div>

            <div className="mt-space-md flex flex-wrap gap-space-xs">
              {chipOptions.map((chip) => (
                <Chip
                  key={chip.value}
                  selected={selectedChip === chip.value}
                  disabled={chip.disabled}
                  onSelectedChange={() => setSelectedChip(chip.value)}
                >
                  {chip.label}
                </Chip>
              ))}
            </div>

            <p className="mt-space-md type-small text-on-surface-variant">
              Chips expose their pressed state through{' '}
              <code className="font-sans font-semibold text-primary">aria-pressed</code>; the row
              can scroll horizontally when space is tight.
            </p>
          </Card>

          <Card padding="lg">
            <h3 className="type-title text-primary">Badges & status</h3>

            <div className="mt-space-md flex flex-wrap gap-space-xs">
              <Badge tone="bronze">Estimated price</Badge>
              <Badge tone="outline">Last updated</Badge>
              <Badge tone="neutral">Demo data</Badge>
              <Badge tone="dark">Curated</Badge>
              <Badge tone="success" dot>
                Available
              </Badge>
              <Badge tone="danger">Cancelled</Badge>
            </div>

            <div className="mt-space-lg flex flex-wrap gap-space-xs border-t border-hairline pt-space-lg">
              <StatusBadge status="pending">Pending confirmation</StatusBadge>
              <StatusBadge status="confirmed">Confirmed</StatusBadge>
              <StatusBadge status="cancelled">Cancelled</StatusBadge>
              <StatusBadge status="external">External booking</StatusBadge>
              <StatusBadge status="available">Available</StatusBadge>
            </div>

            <p className="mt-space-md type-small text-on-surface-variant">
              StatusBadge maps booking states to approved tones. The consuming UI supplies the
              visible label.
            </p>
          </Card>
        </div>

        <div className="grid gap-gutter-lg lg:grid-cols-2">
          <Card padding="lg" className="flex flex-col gap-space-lg">
            <div>
              <h3 className="type-title text-primary">Input</h3>
              <p className="mt-space-xs type-small text-on-surface-variant">
                White field, hairline border, and a bronze focus state.
              </p>
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="traveler@example.com"
              hint="Used for itinerary and booking updates in later phases."
              autoComplete="email"
            />

            <Input
              label="Email address"
              type="email"
              defaultValue="not-an-email"
              error="Enter a valid email address."
            />

            <Input label="Disabled field" defaultValue="Unavailable" disabled />
          </Card>

          <Card padding="lg" className="flex flex-col gap-space-lg">
            <div>
              <h3 className="type-title text-primary">Select</h3>
              <p className="mt-space-xs type-small text-on-surface-variant">
                Native control with a styled trigger and logical chevron.
              </p>
            </div>

            <Select label="District" options={districtOptions} defaultValue="giza" />

            <Select
              label="Filter shape"
              options={districtOptions}
              placeholder="Choose a district"
              shape="pill"
              defaultValue=""
            />

            <p className="type-small text-on-surface-variant">
              Native menus keep the control familiar and keyboard accessible on every platform.
            </p>
          </Card>
        </div>

        <div className="grid gap-gutter-lg lg:grid-cols-2">
          <Card padding="lg" className="flex flex-col gap-space-lg">
            <div>
              <h3 className="type-title text-primary">Tabs</h3>
              <p className="mt-space-xs type-small text-on-surface-variant">
                Pill and segmented variants share the same keyboard behavior.
              </p>
            </div>

            <Tabs
              items={overviewTabs}
              value={pillTab}
              onValueChange={setPillTab}
              ariaLabel="Component review tabs"
            />

            <div className="border-t border-hairline pt-space-lg">
              <Tabs
                items={densityTabs}
                value={densityTab}
                onValueChange={setDensityTab}
                ariaLabel="Preview density"
                variant="segmented"
              />
            </div>
          </Card>

          <Card padding="lg" className="flex flex-col items-start gap-space-md">
            <div>
              <h3 className="type-title text-primary">Modal</h3>
              <p className="mt-space-xs type-small text-on-surface-variant">
                Native dialog with focus management, Escape, and a backdrop click.
              </p>
            </div>

            <p className="type-body text-on-surface-variant">
              The panel uses the 24px overlay radius, white surface, and close control from the
              Stitch itinerary briefing.
            </p>

            <Button onClick={() => setModalOpen(true)}>Open modal</Button>

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Modal primitive"
              eyebrow="Overlay"
              description="The dialog handles focus, Escape, and background scroll while preserving the editorial surface."
              closeLabel="Close modal"
              footer={
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Close preview
                </Button>
              }
            >
              <div className="mt-space-md rounded-xl bg-surface-container-low p-space-md">
                <p className="type-label text-secondary">Implementation note</p>
                <p className="mt-space-xs type-body text-on-surface-variant">
                  Built on the native{' '}
                  <code className="font-sans font-semibold text-primary">&lt;dialog&gt;</code>{' '}
                  element. It is controlled by React state and does not require a portal.
                </p>
              </div>
            </Modal>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
