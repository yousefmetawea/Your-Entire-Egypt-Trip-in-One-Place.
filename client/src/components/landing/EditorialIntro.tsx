import { useTranslation } from 'react-i18next';
import { SplitText } from '../motion/SplitText';
import { ScrollReveal } from '../motion/ScrollReveal';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { LuxuryButton } from '../ui/LuxuryButton';
import { ArrowRightIcon } from '../ui/icons';

export function EditorialIntro() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <Section tone="canvas" spacing="md" className="border-b border-hairline overflow-hidden">
      <Container>
        {/* Top Header Block */}
        <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12 mb-space-2xl">
          {/* Eyebrow and Tag */}
          <div className="lg:col-span-3">
            <ScrollReveal>
              <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
                {isAr ? '(رؤيتنا للسفر)' : '(The Philosophy)'}
              </span>
            </ScrollReveal>
          </div>

          {/* Large Editorial Headline */}
          <div className="lg:col-span-9">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight leading-[1.15] max-w-4xl">
              <SplitText>
                {isAr
                  ? 'نبتكر رحلات مصرية استثنائية، تجمع بين فخامة الإقامة وعراقة التاريخ لتترك أثراً لا يُنسى في الوجدان.'
                  : 'We curate bespoke Egyptian journeys that unite timeless heritage with modern luxury, leaving an indelible mark.'}
              </SplitText>
            </h2>

            <div className="mt-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-2 pt-space-lg border-t border-hairline">
              <ScrollReveal delay={0.15}>
                <p className="type-body-lg text-on-surface-variant leading-relaxed font-sans">
                  {isAr
                    ? 'من بهو أعمدة الكرنك الشامخة إلى بحيرات سيوة الفيروزية الهادئة، نساعدك على استكشاف مصر كما تحب: بمسارات مخصصة، إقامات مختارة بعناية، ووسائل تنقل خاصة وموثوقة.'
                    : 'From the awe-inspiring colonnades of Karnak to the surreal chalk sculptures of the White Desert, YourTrip empowers you to experience Egypt your way: through tailored itineraries, handpicked sanctuaries, and effortless private transit.'}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.25} className="flex flex-col justify-between gap-space-md">
                <div className="flex flex-wrap items-center gap-space-lg">
                  <div>
                    <span className="font-serif text-3xl font-medium text-primary block">26+</span>
                    <span className="type-small text-on-surface-variant">
                      {isAr ? 'وجهة معتمدة' : 'Curated Destinations'}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-hairline" aria-hidden="true" />
                  <div>
                    <span className="font-serif text-3xl font-medium text-primary block">13</span>
                    <span className="type-small text-on-surface-variant">
                      {isAr ? 'منطقة سياحية' : 'Nationwide Regions'}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-hairline" aria-hidden="true" />
                  <div>
                    <span className="font-serif text-3xl font-medium text-primary block">100%</span>
                    <span className="type-small text-on-surface-variant">
                      {isAr ? 'مخصص بالكامل' : 'Customizable'}
                    </span>
                  </div>
                </div>

                <div className="pt-space-xs">
                  <LuxuryButton
                    href="/plan"
                    variant="primary"
                    size="md"
                    endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
                  >
                    {isAr ? 'صمّم رحلتك الخاصة' : 'Design Your Journey'}
                  </LuxuryButton>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* Asymmetrical Editorial Photography Diptych — STRICTLY NO text overlaid on images */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-end pt-space-md">
          {/* Main Landscape Photo: Philae Temple Sanctuary, Aswan */}
          <div className="md:col-span-7">
            <ScrollReveal delay={0.2}>
              <div className="group block">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-hairline bg-surface-container-low shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80"
                    alt={
                      isAr
                        ? 'معبد فيلة على ضفاف جزيرة النيل بأسوان وقت الغروب'
                        : 'Temple of Isis on Philae island on the Nile, Aswan at sunset'
                    }
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="mt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                  <span>
                    {isAr ? '(٠١ / معبد فيلة — أسوان)' : '( 01 / PHILAE SANCTUARY — ASWAN )'}
                  </span>
                  <span>{isAr ? 'نهر النيل الخالد' : 'THE NILE VALLEY'}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Staggered Vertical Photo: Surreal Chalk Monoliths, White Desert */}
          <div className="md:col-span-5">
            <ScrollReveal delay={0.35}>
              <div className="group block">
                <div className="aspect-[4/3] md:aspect-[4/5] w-full overflow-hidden rounded-2xl border border-hairline bg-surface-container-low shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?auto=format&fit=crop&w=1000&q=80"
                    alt={
                      isAr
                        ? 'تكوينات الصخور الطباشيرية الطبيعية المنحوتة بالرياح في الصحراء البيضاء'
                        : 'Surreal wind-sculpted natural chalk rock monoliths in the White Desert'
                    }
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="mt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                  <span>{isAr ? '(٠٢ / الصحراء البيضاء)' : '( 02 / WHITE DESERT MONOLITHS )'}</span>
                  <span>{isAr ? 'واحات مصر الغربية' : 'WESTERN DESERT'}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
