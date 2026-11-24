import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SplitText } from '../motion/SplitText';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { LuxuryButton } from '../ui/LuxuryButton';
import { ArrowRightIcon } from '../ui/icons';

export function FinalCtaSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <Section tone="canvas" spacing="md" className="overflow-hidden">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[36px] bg-primary text-on-primary p-space-xl sm:p-space-2xl lg:p-space-3xl border border-hairline shadow-2xl">
          {/* Ambient decorative glow */}
          <div
            className="absolute -top-32 -right-32 size-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 items-center gap-space-2xl lg:grid-cols-12 relative z-10">
            {/* Text & Action (col-span-7) */}
            <div className="flex flex-col gap-space-md lg:col-span-7">
              <ScrollReveal>
                <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
                  {isAr ? '(رحلتك تبدأ هنا)' : '(Your Journey Begins)'}
                </span>
              </ScrollReveal>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-surface font-normal tracking-tight leading-[1.12]">
                <SplitText>
                  {isAr
                    ? 'مصر تنتظر شغفك لاكتشافها.. بطريقتك وتفاصيلك الخاصة.'
                    : 'Egypt is waiting to be experienced. Your way. In every detail.'}
                </SplitText>
              </h2>

              <ScrollReveal delay={0.15}>
                <p className="type-body-lg text-surface-container-high/90 max-w-xl leading-relaxed">
                  {isAr
                    ? 'أنشئ مسارك الشخصي في دقائق، اختر ملاذات الإقامة الفاخرة، ورتب تنقلاتك الخاصة عبر أرجاء مصر بكل سلاسة وثقة.'
                    : 'Craft your bespoke day-by-day itinerary in minutes, select handpicked sanctuaries, and arrange private transfers across Egypt with utter confidence.'}
                </p>
              </ScrollReveal>

              <ScrollReveal
                delay={0.25}
                className="pt-space-sm flex flex-wrap items-center gap-space-md"
              >
                <LuxuryButton
                  href="/plan"
                  variant="primary"
                  size="lg"
                  endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
                >
                  {isAr ? 'صمّم خطة رحلتك الآن' : 'Start Your Itinerary'}
                </LuxuryButton>

                <LuxuryButton href="/discover" variant="glass" size="lg">
                  {isAr ? 'تصفح الوجهات الـ 26' : 'Explore All Destinations'}
                </LuxuryButton>
              </ScrollReveal>
            </div>

            {/* Clean Photographic Showcase (col-span-5) — NO text over image */}
            <div className="lg:col-span-5">
              <ScrollReveal delay={0.2}>
                <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-container shadow-floating">
                  <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80"
                      alt={
                        isAr
                          ? 'غروب الشمس على نهر النيل ومعبد فيلة بأسوان'
                          : 'Sunset over the Nile and temple sanctuaries in Aswan'
                      }
                      className="h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-space-sm bg-primary/95 border-t border-white/20">
                    <p className="type-small text-surface-container-high text-xs italic">
                      {isAr
                        ? 'معبد فيلة ونهر النيل — أسوان'
                        : 'Philae Island Sanctuary & The Nile — Aswan'}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
