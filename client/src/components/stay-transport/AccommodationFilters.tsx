import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export interface AccommodationFiltersProps {
  type: string;
  amenity: string;
  onTypeChange: (type: string) => void;
  onAmenityChange: (amenity: string) => void;
}

function PillGroup({
  group,
  label,
  items,
  value,
  onChange,
}: {
  group: string;
  label: string;
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <LayoutGroup id={group}>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
        <span className="me-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/50">
          {label}
        </span>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md">
          {items.map((item) => {
            const on = value === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(item.id)}
                className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                  on ? 'text-[#101C15]' : 'text-white/70 hover:text-white'
                }`}
              >
                {on ? (
                  <motion.span
                    layoutId="pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={
                      reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }
                    }
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
}

export function AccommodationFilters({
  type,
  amenity,
  onTypeChange,
  onAmenityChange,
}: AccommodationFiltersProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const types = [
    { id: 'all', label: isAr ? 'الكل' : 'All types' },
    { id: 'hotel', label: isAr ? 'فنادق' : 'Hotels' },
    { id: 'hostel', label: isAr ? 'نُزل' : 'Hostels' },
  ];

  const amenities = [
    { id: 'all', label: isAr ? 'كل المميزات' : 'All amenities' },
    { id: 'wi-fi', label: 'Wi-Fi' },
    { id: 'breakfast', label: isAr ? 'إفطار' : 'Breakfast' },
    { id: 'pool', label: isAr ? 'مسبح' : 'Pool' },
    { id: 'kitchen', label: isAr ? 'مطبخ' : 'Kitchen' },
  ];

  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <PillGroup
        group="type"
        label={t('stayTransport.filters.type', 'Type:').replace(/:$/, '')}
        items={types}
        value={type}
        onChange={onTypeChange}
      />
      <PillGroup
        group="amenity"
        label={t('stayTransport.filters.amenity', 'Amenity:').replace(/:$/, '')}
        items={amenities}
        value={amenity}
        onChange={onAmenityChange}
      />
    </div>
  );
}
