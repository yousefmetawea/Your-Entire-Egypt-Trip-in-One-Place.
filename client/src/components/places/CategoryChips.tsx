import { useTranslation } from 'react-i18next';
import type { PlaceCategory } from '../../types';
import { cn } from '../../lib/cn';
import { PLACE_CATEGORIES, getCategoryLabelKey } from '../../lib/catalog';
import { Chip } from '../ui/Chip';
import { CompassIcon, LandmarkIcon, PaletteIcon, UtensilsIcon } from '../ui/icons';

export type CategoryChipValue = PlaceCategory | 'all';

export interface CategoryChipsProps {
  value: CategoryChipValue;
  onChange: (value: CategoryChipValue) => void;
  className?: string;
}

const categoryIcons: Record<PlaceCategory, typeof LandmarkIcon> = {
  history: LandmarkIcon,
  culture: PaletteIcon,
  adventure: CompassIcon,
  food: UtensilsIcon,
};

export function CategoryChips({ value, onChange, className }: CategoryChipsProps) {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('discover.filters.categoryLabel')}
      className={cn(
        'flex items-center gap-space-sm overflow-x-auto pb-space-xs scrollbar-none',
        className,
      )}
    >
      <Chip
        selected={value === 'all'}
        onClick={() => onChange('all')}
        icon={
          <CompassIcon className={value === 'all' ? 'text-secondary-fixed' : 'text-secondary'} />
        }
        className="shrink-0"
      >
        {t('home.chips.all')}
      </Chip>

      {PLACE_CATEGORIES.map((category) => {
        const Icon = categoryIcons[category];
        const selected = value === category;

        return (
          <Chip
            key={category}
            selected={selected}
            onClick={() => onChange(category)}
            icon={<Icon className={selected ? 'text-secondary-fixed' : 'text-secondary'} />}
            className="shrink-0"
          >
            {t(getCategoryLabelKey(category))}
          </Chip>
        );
      })}
    </div>
  );
}
