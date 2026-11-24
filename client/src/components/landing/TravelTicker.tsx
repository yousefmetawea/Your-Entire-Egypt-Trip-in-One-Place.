import { useTranslation } from 'react-i18next';
import { Marquee } from '../motion/Marquee';

const EXPERIENCES_EN = [
  'Private Nile Dahabiya Cruises',
  'Exclusive Archaeological Viewings',
  'Desert Glamping & Stargazing',
  'Red Sea Coral Reef Sanctuaries',
  'Nubian Cultural Immersion',
  'Historic Islamic Architecture Tours',
  'Siwa Salt Lake Healing Springs',
  'Alexandrian Coastal Heritage',
  'Dedicated Private Chauffeur Transfers',
];

const EXPERIENCES_AR = [
  'رحلات نيلية خاصة على متن الذهبيات',
  'جولات أثرية خاصة في المعابد والمقابر',
  'مخيمات فاخرة وتأمل النجوم في الصحراء',
  'محميات الشعاب المرجانية في البحر الأحمر',
  'تجارب نوبية أصيلة في أسوان',
  'استكشاف روائع العمارة الإسلامية والتاريخية',
  'عيون الملح والاستشفاء في واحة سيوة',
  'التراث الساحلي وثقافة الإسكندرية',
  'خدمات نقل وسائق خاص على أعلى مستوى',
];

export function TravelTicker() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const items = isAr ? EXPERIENCES_AR : EXPERIENCES_EN;

  return (
    <div className="border-y border-hairline bg-surface-container-low py-space-md select-none overflow-hidden">
      <div className="flex items-center gap-space-lg">
        <span className="type-label-sm uppercase tracking-widest text-secondary font-bold shrink-0 ps-space-lg">
          {isAr ? '(التجارب)' : '(Experiences)'}
        </span>
        <div className="h-4 w-px bg-hairline shrink-0" aria-hidden="true" />
        <div className="flex-1 overflow-hidden">
          <Marquee
            items={items}
            speed={35}
            itemClassName="type-title-sm text-primary font-serif italic whitespace-nowrap"
            separator="✧"
          />
        </div>
      </div>
    </div>
  );
}
