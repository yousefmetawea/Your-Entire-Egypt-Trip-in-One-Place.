import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Input } from '../components/ui/Input';
import { Section } from '../components/ui/Section';
import { Select } from '../components/ui/Select';
import { SectionIntro } from './SectionIntro';

const rtlDistrictOptions = [
  { value: 'giza', label: 'Giza Plateau' },
  { value: 'downtown', label: 'Downtown Cairo' },
  { value: 'islamic', label: 'Islamic Cairo' },
] as const;

export function RtlSection() {
  return (
    <Section id="rtl" tone="canvas">
      <Container className="flex flex-col gap-space-xl">
        <SectionIntro
          eyebrow="04 · Direction"
          title="Direction without duplication."
          description="Layouts use logical spacing, alignment, and positioning utilities. This English sample is rendered right-to-left to verify the mirrored structure without inventing Arabic copy or typography."
        />

        <div className="flex flex-wrap items-center gap-space-sm">
          <Badge tone="outline">English content</Badge>
          <Badge tone="outline">dir=&quot;rtl&quot;</Badge>
          <Badge tone="bronze">Logical properties</Badge>
        </div>

        <Card padding="lg" dir="rtl" lang="en">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <Badge tone="bronze">RTL preview</Badge>
            <Button variant="secondary" size="sm">
              Secondary action
            </Button>
          </div>

          <h3 className="type-section mt-space-lg text-primary">Mirrored layout</h3>

          <div className="mt-space-xl grid gap-gutter-lg md:grid-cols-2">
            <Input label="Email address" type="email" placeholder="traveler@example.com" />

            <Select label="District" options={rtlDistrictOptions} defaultValue="giza" />
          </div>

          <div className="mt-space-lg flex flex-wrap items-center gap-space-xs border-t border-hairline pt-space-lg">
            <StatusBadge status="pending">Pending confirmation</StatusBadge>
            <StatusBadge status="confirmed">Confirmed</StatusBadge>
            <Badge tone="glass">Glass badge</Badge>
          </div>
        </Card>

        <p className="max-w-3xl type-small text-on-surface-variant">
          This preview does not add Arabic translations, choose an Arabic typeface, or approve a
          mirrored visual language. Those remain open decisions.
        </p>
      </Container>
    </Section>
  );
}
