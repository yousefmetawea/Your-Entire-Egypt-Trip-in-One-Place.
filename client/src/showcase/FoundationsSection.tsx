import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { SectionIntro } from './SectionIntro';

interface ColorToken {
  name: string;
  token: string;
  hex: string;
  role: string;
}

const colorTokens: readonly ColorToken[] = [
  {
    name: 'Basalt',
    token: 'primary',
    hex: '#060607',
    role: 'Primary text and interactive',
  },
  {
    name: 'Basalt soft',
    token: 'primary-container',
    hex: '#1F1F1F',
    role: 'Filled actions and dark surfaces',
  },
  {
    name: 'Bronze',
    token: 'secondary',
    hex: '#775928',
    role: 'Accessible accent and focus',
  },
  {
    name: 'Decorative bronze',
    token: 'bronze',
    hex: '#B08D57',
    role: 'Hairlines and ornament only',
  },
  {
    name: 'Sandstone',
    token: 'sand',
    hex: '#D9C7A3',
    role: 'Indicators and warm support',
  },
  {
    name: 'Canvas',
    token: 'surface-container-low',
    hex: '#F7F3EC',
    role: 'Page background',
  },
  {
    name: 'Ivory',
    token: 'surface',
    hex: '#FDF9F2',
    role: 'Section background',
  },
  {
    name: 'Card white',
    token: 'surface-container-lowest',
    hex: '#FFFFFF',
    role: 'Elevated surfaces',
  },
  {
    name: 'Success',
    token: 'success',
    hex: '#2E7D32',
    role: 'Availability and confirmation',
  },
  {
    name: 'Error',
    token: 'error',
    hex: '#BA1A1A',
    role: 'Validation and cancellation',
  },
];

interface TypeRow {
  name: string;
  meta: string;
  sample: string;
  typeClass: string;
}

const typeRows: readonly TypeRow[] = [
  {
    name: 'Display',
    meta: 'Playfair Display · 400',
    sample: 'Timeless Cairo',
    typeClass: 'type-display',
  },
  {
    name: 'Headline lg',
    meta: 'Playfair Display · 400',
    sample: 'Editorial hierarchy',
    typeClass: 'type-headline',
  },
  {
    name: 'Headline md',
    meta: 'Playfair Display · 500',
    sample: 'Section heading',
    typeClass: 'type-section',
  },
  {
    name: 'Headline sm',
    meta: 'Playfair Display · 600',
    sample: 'Card title',
    typeClass: 'type-card-title',
  },
  {
    name: 'Title lg',
    meta: 'Plus Jakarta Sans · 600',
    sample: 'Interface title',
    typeClass: 'type-title',
  },
  {
    name: 'Body lg',
    meta: 'Plus Jakarta Sans · 400',
    sample: 'The city reveals itself slowly.',
    typeClass: 'type-body-lg',
  },
  {
    name: 'Body md',
    meta: 'Plus Jakarta Sans · 400',
    sample: 'Supporting copy remains legible at small sizes.',
    typeClass: 'type-body',
  },
  {
    name: 'Label caps',
    meta: 'Plus Jakarta Sans · 700',
    sample: 'Curated district',
    typeClass: 'type-label',
  },
  {
    name: 'Label md',
    meta: 'Plus Jakarta Sans · 600',
    sample: 'Status metadata',
    typeClass: 'type-label-sm',
  },
];

const spacingTokens = [
  { name: 'xs', pixels: 4 },
  { name: 'sm', pixels: 8 },
  { name: 'md', pixels: 16 },
  { name: 'lg', pixels: 24 },
  { name: 'xl', pixels: 40 },
  { name: '2xl', pixels: 64 },
] as const;

const radiusTokens = [
  { name: '8px', className: 'rounded-lg' },
  { name: '12px', className: 'rounded-xl' },
  { name: '16px', className: 'rounded-2xl' },
  { name: '20px', className: 'rounded-card' },
  { name: 'Full', className: 'rounded-full' },
] as const;

export function FoundationsSection() {
  return (
    <Section id="foundations" tone="canvas">
      <Container className="flex flex-col gap-space-2xl">
        <SectionIntro
          eyebrow="01 · Foundations"
          title="Tokens with editorial restraint."
          description="The canonical Stitch palette, two self-hosted typefaces, an eight-point spacing rhythm, and warm elevation. Every value below is available as a Tailwind utility."
        />

        <div className="grid gap-gutter-lg lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h3 className="type-title text-primary">Color</h3>
            <div className="mt-space-md grid grid-cols-2 gap-space-sm sm:grid-cols-4">
              {colorTokens.map((color) => (
                <Card key={color.token} padding="sm">
                  <div
                    className="h-20 rounded-xl border border-black/5"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <p className="mt-space-sm type-label-sm text-primary">{color.name}</p>
                  <p className="type-small tabular-nums text-on-surface-variant">{color.hex}</p>
                  <p className="mt-space-xs type-small text-on-surface-variant">{color.role}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card variant="muted" padding="lg" className="lg:col-span-4">
            <Badge tone="bronze">Contrast rule</Badge>
            <h3 className="type-card-title mt-space-md text-primary">Bronze has two jobs.</h3>
            <p className="mt-space-sm type-body text-on-surface-variant">
              <span className="font-semibold text-primary">#775928</span> carries text, focus rings,
              and interactive states. Decorative bronze{' '}
              <span className="font-semibold text-primary">#B08D57</span> stays on ornament and
              hairlines, where it never has to carry meaning.
            </p>

            <div className="mt-space-lg grid grid-cols-2 gap-space-sm">
              <div>
                <div className="h-14 rounded-xl bg-secondary" aria-hidden="true" />
                <p className="mt-space-xs type-label-sm text-primary">6.2:1 on ivory</p>
                <p className="type-small text-on-surface-variant">Approved for text</p>
              </div>
              <div>
                <div className="h-14 rounded-xl bg-bronze" aria-hidden="true" />
                <p className="mt-space-xs type-label-sm text-primary">Decorative</p>
                <p className="type-small text-on-surface-variant">Not for small text</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="flex flex-col gap-space-xs sm:flex-row sm:items-end sm:justify-between">
            <h3 className="type-title text-primary">Typography</h3>
            <p className="type-small text-on-surface-variant">
              Playfair Display for narrative · Plus Jakarta Sans for operations
            </p>
          </div>

          <div className="mt-space-md grid gap-gutter-lg lg:grid-cols-12">
            <Card variant="surface" padding="lg" className="lg:col-span-5">
              <p className="type-label text-secondary">Display specimen</p>
              <p className="mt-space-md type-display text-primary">
                Cairo,
                <br />
                <span className="italic text-secondary">composed.</span>
              </p>
              <p className="mt-space-lg type-body text-on-surface-variant">
                High-contrast serif headlines hold the editorial voice. The geometric sans keeps
                itinerary data, controls, and labels quiet and legible.
              </p>
              <div className="mt-space-lg flex flex-wrap gap-space-xs">
                <Badge tone="outline">Playfair Display</Badge>
                <Badge tone="outline">Plus Jakarta Sans</Badge>
                <Badge tone="outline">Self-hosted</Badge>
              </div>
            </Card>

            <div className="lg:col-span-7">
              <div className="flex flex-col">
                {typeRows.map((row) => (
                  <div
                    key={row.name}
                    className="flex flex-col gap-space-xs border-b border-hairline py-space-md first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-space-lg"
                  >
                    <div className="flex shrink-0 flex-col gap-0.5 sm:w-40">
                      <span className="type-label-sm text-primary">{row.name}</span>
                      <span className="type-small text-on-surface-variant">{row.meta}</span>
                    </div>
                    <p className={`${row.typeClass} text-primary sm:text-end`}>{row.sample}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="type-title text-primary">Space, shape, depth</h3>
          <div className="mt-space-md grid gap-gutter-lg md:grid-cols-3">
            <Card padding="lg">
              <p className="type-label text-secondary">Spacing rhythm</p>
              <div className="mt-space-md flex flex-col gap-space-sm">
                {spacingTokens.map((space) => (
                  <div key={space.name} className="flex items-center gap-space-sm">
                    <span className="w-10 type-label-sm text-on-surface-variant">{space.name}</span>
                    <span
                      className="h-2 rounded-full bg-secondary"
                      style={{ width: `${space.pixels}px` }}
                      aria-hidden="true"
                    />
                    <span className="type-small tabular-nums text-on-surface-variant">
                      {space.pixels}px
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg">
              <p className="type-label text-secondary">Corner radii</p>
              <div className="mt-space-md flex flex-col gap-space-sm">
                {radiusTokens.map((radius) => (
                  <div key={radius.name} className="flex items-center gap-space-sm">
                    <span
                      className={`size-8 shrink-0 border border-hairline-strong bg-surface-container-low ${radius.className}`}
                      aria-hidden="true"
                    />
                    <span className="type-label-sm text-on-surface-variant">{radius.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg">
              <p className="type-label text-secondary">Elevation</p>
              <div className="mt-space-md flex flex-col gap-space-md">
                <div className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md shadow-resting">
                  <p className="type-label-sm text-primary">Resting</p>
                  <p className="type-small text-on-surface-variant">Cards and framed surfaces</p>
                </div>
                <div className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md shadow-floating">
                  <p className="type-label-sm text-primary">Floating</p>
                  <p className="type-small text-on-surface-variant">
                    Navigation and elevated controls
                  </p>
                </div>
                <div className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md shadow-hover">
                  <p className="type-label-sm text-primary">Hover</p>
                  <p className="type-small text-on-surface-variant">Interactive card lift</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
