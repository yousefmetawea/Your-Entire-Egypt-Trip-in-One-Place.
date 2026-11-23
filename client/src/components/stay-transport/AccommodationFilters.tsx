import { useTranslation } from 'react-i18next';
import { Chip } from '../ui/Chip';

export interface AccommodationFiltersProps {
  type: string;
  amenity: string;
  onTypeChange: (type: string) => void;
  onAmenityChange: (amenity: string) => void;
}

export function AccommodationFilters({
  type,
  amenity,
  onTypeChange,
  onAmenityChange,
}: AccommodationFiltersProps) {
  const { t } = useTranslation();

  const types = [
    { id: 'all', label: 'All types' },
    { id: 'hotel', label: 'Hotels' },
    { id: 'hostel', label: 'Hostels' },
  ];

  const amenities = [
    { id: 'all', label: 'All amenities' },
    { id: 'wi-fi', label: 'Wi-Fi' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'pool', label: 'Pool' },
    { id: 'kitchen', label: 'Kitchen' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-2xl border border-hairline">
      {/* Type Filter */}
      <div className="flex items-center gap-space-xs flex-wrap">
        <span className="type-label-sm font-semibold text-primary me-1">
          {t('stayTransport.filters.type', 'Type:')}
        </span>
        {types.map((item) => (
          <Chip
            key={item.id}
            selected={type === item.id}
            onClick={() => onTypeChange(item.id)}
            size="sm"
          >
            {item.label}
          </Chip>
        ))}
      </div>

      {/* Amenity Filter */}
      <div className="flex items-center gap-space-xs flex-wrap">
        <span className="type-label-sm font-semibold text-primary me-1">
          {t('stayTransport.filters.amenity', 'Amenity:')}
        </span>
        {amenities.map((item) => (
          <Chip
            key={item.id}
            selected={amenity === item.id}
            onClick={() => onAmenityChange(item.id)}
            size="sm"
          >
            {item.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
