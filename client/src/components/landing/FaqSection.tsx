import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SplitText } from '../motion/SplitText';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { LuxuryButton } from '../ui/LuxuryButton';
import { PlusIcon } from '../ui/icons';
import { cn } from '../../lib/cn';

interface FaqItem {
  id: string;
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'how-it-works',
    qEn: 'How does bespoke itinerary planning work on YourTrip?',
    qAr: 'كيف يعمل التخطيط المخصص للمسارات عبر يورتريب؟',
    aEn: 'Our intelligent planner creates a day-by-day itinerary tailored to your dates, travelers, pace, and interests across Egypt. You can rearrange activities with drag-and-drop, add custom stops, adjust visit durations, and choose luxury sanctuaries or private chauffeur transfers.',
    aAr: 'يقوم المخطط الذكي بإنشاء مسار يومي مفصل يناسب تواريخك، عدد المسافرين، وتفضيلاتك في مختلف مدن ومناطق مصر. يمكنك إعادة ترتيب الأنشطة بالسحب والإفلات، وإضافة محطات خاصة، واختيار أماكن الإقامة ووسائل النقل المناسبة بكل حرية.',
  },
  {
    id: 'customization',
    qEn: 'Can I customize the ready-made signature journeys?',
    qAr: 'هل يمكنني تعديل المسارات الجاهزة بالكامل؟',
    aEn: 'Yes, completely. Every signature journey can be duplicated into your personal draft where you can modify the duration, add or remove days, substitute temples or desert stops, and tailor every experience to your personal rhythm.',
    aAr: 'نعم بكل تأكيد. يمكنك استيراد أي مسار جاهز إلى مسودتك الخاصة والتعديل عليه: زيادة أو تقليل الأيام، تغيير الأماكن والأنشطة، واختيار الوتيرة التي تلائمك تماماً.',
  },
  {
    id: 'pricing-honesty',
    qEn: 'How are ticket prices and durations estimated?',
    qAr: 'كيف يتم حساب الأسعار وأوقات الزيارة التقديرية؟',
    aEn: 'We believe in complete transparency. All entrance fees, average visit lengths, and transfer rates are calculated using verified baseline research and clearly labeled with last-updated dates so you can plan your budget with total peace of mind.',
    aAr: 'نلتزم بالشفافية الكاملة؛ حيث يتم حساب رسوم الدخول ومتوسط مدة الزيارات بناءً على بيانات بحثية دقيقة ومحدثة، موضحة بالتاريخ لتتمكن من التخطيط المالي لرحلتك بثقة تامة.',
  },
  {
    id: 'private-transfers',
    qEn: 'How do private chauffeur and airport transfers operate?',
    qAr: 'كيف تعمل خدمات النقل الخاص والتوصيل من المطار؟',
    aEn: 'Through our Stay & Transport platform, you can submit managed transfer requests for airport pick-ups, intercity chauffeurs (e.g. Cairo to Alexandria, or Luxor to Aswan), or full-day private vehicles. Requests start as pending and are tracked directly in your My Trip dossier.',
    aAr: 'من خلال صفحة الإقامة والتنقل، يمكنك تقديم طلبات النقل المدار للتوصيل من/إلى المطار أو التنقل بين المدن (مثل القاهرة إلى الإسكندرية أو الأقصر إلى أسوان). تظهر جميع طلباتك في ملف رحلتك الرقمي للمتابعة الفورية.',
  },
  {
    id: 'best-season',
    qEn: 'What is the optimal season to travel across Upper Egypt and the deserts?',
    qAr: 'ما هو التوقيت الأنسب لزيارة صعيد مصر والصحاري؟',
    aEn: 'October through April offers ideal mild weather for exploring the temples of Luxor, Aswan, and the sands of the Western Desert. The Red Sea and Sinai remain world-class destinations year-round with crystal clear waters and steady sunshine.',
    aAr: 'تعتبر الفترة من أكتوبر حتى أبريل هي الأفضل من حيث درجات الحرارة المعتدلة لاستكشاف معابد الأقصر وأسوان ومحميات الصحراء الغربية وسيوة، بينما يتمتع البحر الأحمر وجنوب سيناء بأجواء رائعة طوال العام.',
  },
];

export function FaqSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [openId, setOpenId] = useState<string | null>('how-it-works');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <Section tone="surface" spacing="md" className="border-b border-hairline overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-2xl pb-space-lg border-b border-hairline">
          <div>
            <ScrollReveal>
              <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
                {isAr ? '(الأسئلة الشائعة)' : '(FAQ)'}
              </span>
            </ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight mt-space-xs">
              <SplitText>
                {isAr ? 'إجابات واضحة لرحلة استثنائية' : 'Frequently Asked Questions'}
              </SplitText>
            </h2>
          </div>

          <ScrollReveal delay={0.1}>
            <span className="type-label-sm uppercase tracking-wider text-on-surface-variant">
              {isAr ? 'دليل المسافر إلى مصر' : 'Traveler Guidance'}
            </span>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12 items-start">
          {/* FAQ Accordion List (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col divide-y divide-hairline">
            {FAQS.map((faq, index) => {
              const isOpen = openId === faq.id;
              const question = isAr ? faq.qAr : faq.qEn;
              const answer = isAr ? faq.aAr : faq.aEn;

              return (
                <ScrollReveal key={faq.id} delay={index * 0.08} className="py-space-md first:pt-0">
                  <button
                    type="button"
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-space-md text-start group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    <span className="font-serif text-xl sm:text-2xl text-primary font-medium group-hover:text-secondary transition-colors">
                      {question}
                    </span>

                    {/* Rotating Plus Icon */}
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-secondary transition-transform duration-300',
                        isOpen && 'rotate-45 bg-secondary text-on-secondary border-secondary',
                      )}
                      aria-hidden="true"
                    >
                      <PlusIcon className="size-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="type-body text-on-surface-variant pt-space-sm pb-space-xs leading-relaxed max-w-3xl">
                          {answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ScrollReveal>
              );
            })}
          </div>

          {/* OVO Legion Signature "Colored Block" CTA Card (col-span-4) */}
          <div className="lg:col-span-4">
            <ScrollReveal delay={0.25}>
              <div className="rounded-2xl border border-hairline bg-primary p-space-xl text-on-primary shadow-floating">
                <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold block mb-space-xs">
                  {isAr ? 'هل لديك استفسار آخر؟' : 'Still have questions?'}
                </span>
                <h3 className="font-serif text-2xl text-surface font-medium leading-snug">
                  {isAr
                    ? 'فريق يورتريب مستعد لمساعدتك في تنسيق رحلتك'
                    : 'Our concierge is ready to assist your bespoke journey.'}
                </h3>
                <p className="type-body text-surface-container-high/85 mt-space-sm text-sm leading-relaxed">
                  {isAr
                    ? 'سواء كنت ترغب في نصيحة حول حجز الذهبيات النيلية أو تنسيق سائق خاص، يسعدنا تقديم المساعدة.'
                    : 'Whether coordinating private Nile cruises, desert expeditions, or specialized transport, we are here to help.'}
                </p>

                <div className="mt-space-lg pt-space-md border-t border-white/20">
                  <LuxuryButton href="/plan" variant="secondary" size="md" className="w-full">
                    {isAr ? 'ابدأ التخطيط الآن' : 'Start Planning'}
                  </LuxuryButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
