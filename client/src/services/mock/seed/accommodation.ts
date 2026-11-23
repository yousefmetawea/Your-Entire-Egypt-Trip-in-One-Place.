import type { Accommodation } from '../../../types';
export const seedAccommodation: readonly Accommodation[] = [
  {
    id: 'stay_grand_citadel_retreat',
    name: {
      en: 'The Grand Citadel Retreat',
      ar: 'منتجع القلعة الكبير',
    },
    type: 'hotel',
    priceRange: {
      min: 3200,
      max: 4800,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Courtyard Garden', 'Breakfast Included', 'Rooftop Terrace'],
    location: {
      lat: 29.985,
      lng: 31.25,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Courtyard gardens and arches of the Grand Citadel Retreat',
          ar: 'الفناء والأقواس التراثية في منتجع القلعة',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Luxury Stays',
      },
    ],
    externalUrl: 'https://example.com/grand-citadel-retreat',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_nile_breeze_residency',
    name: {
      en: 'Nile Breeze Boutique Residency',
      ar: 'إقامة نسيم النيل الفندقية',
    },
    type: 'hotel',
    priceRange: {
      min: 4500,
      max: 7200,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Nile View Balcony', 'Concierge Desk', 'Breakfast Included'],
    location: {
      lat: 30.055,
      lng: 31.22,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Nile river view balcony from luxury suite',
          ar: 'شرفة بإطلالة بانورامية على النيل من الجناح الفاخر',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Nile Stays',
      },
    ],
    externalUrl: 'https://example.com/nile-breeze-residency',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_midan_heritage_house',
    name: {
      en: 'Midan Heritage House',
      ar: 'بيت الميدان التراثي',
    },
    type: 'hotel',
    priceRange: {
      min: 2100,
      max: 3400,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Heritage Library', 'Air Conditioning'],
    location: {
      lat: 30.048,
      lng: 31.24,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Classic downtown heritage high-ceiling lounge',
          ar: 'صالون تراثي بأسقف عالية في وسط البلد',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Heritage House',
      },
    ],
    externalUrl: 'https://example.com/midan-heritage-house',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_pyramid_horizon_villa',
    name: {
      en: 'Pyramid Horizon Villa',
      ar: 'فيلا أفق الأهرام',
    },
    type: 'hotel',
    priceRange: {
      min: 3800,
      max: 6000,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Pyramids View', 'Pool', 'Airport Shuttle Service'],
    location: {
      lat: 29.98,
      lng: 31.13,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Private terrace overlooking the Great Pyramids at sunset',
          ar: 'تراس خاص يطل على أهرامات الجيزة عند المغيب',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Pyramid Views',
      },
    ],
    externalUrl: 'https://example.com/pyramid-horizon-villa',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_old_cairo_haven',
    name: {
      en: 'Old Cairo Travelers Haven',
      ar: 'نزل مسافري القاهرة القديمة',
    },
    type: 'hostel',
    priceRange: {
      min: 650,
      max: 1100,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Shared Kitchen', 'Luggage Storage', 'Bicycle Rental'],
    location: {
      lat: 30.01,
      lng: 31.232,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Sunlit tranquil courtyard with historic stone arches',
          ar: 'فناء مشمس هادئ بأقواس حجرية تاريخية',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Historic Haven',
      },
    ],
    externalUrl: 'https://example.com/old-cairo-haven',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_lotus_oasis_hostel',
    name: {
      en: 'Lotus Oasis Eco-Hostel',
      ar: 'نزل واحة اللوتس البيئي',
    },
    type: 'hostel',
    priceRange: {
      min: 800,
      max: 1400,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Garden Cafe', 'Coworking Space'],
    location: {
      lat: 30.06,
      lng: 31.222,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Green courtyard garden cafe at the eco-hostel',
          ar: 'حديقة ومقهى داخلي بالنزل البيئي',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Garden Hostel',
      },
    ],
    externalUrl: 'https://example.com/lotus-oasis-hostel',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_babylon_courtyard_inn',
    name: {
      en: 'Babylon Courtyard Inn',
      ar: 'نزل فناء بابليون',
    },
    type: 'hotel',
    priceRange: null,
    amenities: ['Wi-Fi', 'Historic Courtyard', 'Quiet Zone'],
    location: {
      lat: 30.005,
      lng: 31.23,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Courtyard patio within historic Babylon neighborhood',
          ar: 'فناء خارجي في حي بابليون التاريخي',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Babylon Inn',
      },
    ],
    externalUrl: 'https://example.com/babylon-courtyard-inn',
    isDemo: true,
    placeholders: ['priceRange'],
  },
  {
    id: 'stay_lantern_quarters',
    name: {
      en: 'Al-Muizz Lantern Quarters',
      ar: 'نزل قناديل المعز',
    },
    type: 'hostel',
    priceRange: {
      min: 750,
      max: 1200,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: [],
    location: {
      lat: 30.052,
      lng: 31.26,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Historic lanterns hanging in the quiet quarter of Al-Muizz',
          ar: 'قناديل تاريخية معلقة في ممر هادئ بحي المعز',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Lantern Quarters',
      },
    ],
    externalUrl: 'https://example.com/lantern-quarters',
    isDemo: true,
    placeholders: ['amenities'],
  },
  {
    id: 'stay_luxor_palace_heritage',
    name: {
      en: 'Luxor Palace Nile Heritage',
      ar: 'قصر الأقصر التراثي على النيل',
    },
    type: 'hotel',
    priceRange: {
      min: 4200,
      max: 6800,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Nile Riverfront Pool', 'Royal Gardens', 'Valley View Suites'],
    location: {
      lat: 25.698,
      lng: 32.637,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Grand palace gardens and colonnades overlooking the Nile in Luxor',
          ar: 'حدائق القصر الفخمة والأروقة المطلة على النيل بالأقصر',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Palace Luxury',
      },
    ],
    externalUrl: 'https://example.com/luxor-palace-heritage',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_nubian_lotus_ecolodge',
    name: {
      en: 'Nubian Lotus Island Sanctuary',
      ar: 'ملاذ اللوتس النوبي البيئي بأسوان',
    },
    type: 'hostel',
    priceRange: {
      min: 2800,
      max: 4500,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Nubian Organic Breakfast', 'Private Felucca Dock', 'Rooftop Stargazing'],
    location: {
      lat: 24.085,
      lng: 32.885,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Earthy Nubian domes and clay architecture right by the Nile rapids',
          ar: 'القباب النوبية البيئية والعمارة الطينية على ضفاف نيل أسوان',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Nubian Stays',
      },
    ],
    externalUrl: 'https://example.com/nubian-lotus-ecolodge',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_red_sea_coral_sanctuary',
    name: {
      en: 'Red Sea Coral Beach Sanctuary',
      ar: 'منتجع مرجان البحر الأحمر',
    },
    type: 'hotel',
    priceRange: {
      min: 5500,
      max: 9200,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: ['Wi-Fi', 'Private Coral Reef Beach', 'Scuba Diving Center', 'Infinity Pool'],
    location: {
      lat: 27.228,
      lng: 33.845,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Infinity swimming pool overlooking the turquoise Red Sea waters',
          ar: 'مسبح إنفينيتي مطل على مياه البحر الأحمر الفيروزية',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Coral Resort',
      },
    ],
    externalUrl: 'https://example.com/red-sea-coral-sanctuary',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'stay_siwa_salt_oasis_lodge',
    name: {
      en: 'Siwa Salt Oasis Ecolodge',
      ar: 'إيكولودج واحة الملح بسيوة',
    },
    type: 'hotel',
    priceRange: {
      min: 2400,
      max: 3900,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    amenities: [
      'Wi-Fi',
      'Kershef Mud Salt Suites',
      'Natural Hot Spring Pool',
      'Desert Safari Guide',
    ],
    location: {
      lat: 29.195,
      lng: 25.525,
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Authentic candlelit kershef salt lodge surrounded by olive and date palms',
          ar: 'غرف فندقية مبنية من صخور الملح والكرشيف بسيوة',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Siwa Lodge',
      },
    ],
    externalUrl: 'https://example.com/siwa-salt-oasis-lodge',
    isDemo: true,
    placeholders: [],
  },
];
