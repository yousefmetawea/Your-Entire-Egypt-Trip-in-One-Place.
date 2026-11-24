import type { ReadyMadeTrip } from '../../../types';

export const seedReadyMadeTrips: readonly ReadyMadeTrip[] = [
  {
    id: 'trip_pharaohs_golden_route',
    title: {
      en: "The Pharaohs' Golden Route: Cairo to Luxor",
      ar: 'طريق الفراعنة الذهبي: من القاهرة إلى الأقصر',
    },
    description: {
      en: "An iconic 5-day journey connecting Egypt's monumental wonders, from the Pyramids of Giza and the Grand Egyptian Museum to the timeless royal tombs of Luxor.",
      ar: 'رحلة استثنائية تمتد لخمسة أيام تجمع أعظم معالم مصر الخالدة، من أهرامات الجيزة والمتحف الكبير إلى مقابر وادي الملوك ومعابد الأقصر.',
    },
    durationDays: 5,
    days: [
      {
        dayNumber: 1,
        placeIds: ['place_pyramids_of_giza', 'place_grand_egyptian_museum'],
      },
      {
        dayNumber: 2,
        placeIds: ['place_egyptian_museum', 'place_khan_el_khalili'],
      },
      {
        dayNumber: 3,
        placeIds: ['place_karnak_temple', 'place_luxor_temple'],
      },
      {
        dayNumber: 4,
        placeIds: ['place_valley_of_the_kings'],
      },
      {
        dayNumber: 5,
        placeIds: ['place_aswan_felucca_islands'],
      },
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'The Great Pyramids and ancient temples along the Nile',
          ar: 'أهرامات الجيزة والمعابد التاريخية على طول وادي النيل',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Golden Route',
      },
    ],
    isDemo: true,
  },
  {
    id: 'trip_desert_oasis_sanctuary',
    title: {
      en: 'Desert Mirage & Siwa Oasis Sanctuary',
      ar: 'ملاذ الواحات وسحر الصحراء: سيوة والصحراء البيضاء',
    },
    description: {
      en: "Escape into Egypt's serene western frontier: marvel at the wind-sculpted White Desert, float in the turquoise salt pools of Siwa, and explore the ancient fortress of Shali.",
      ar: 'مغامرة هادئة إلى سحر الصحراء الغربية: استكشف صخور الصحراء البيضاء الخلابة، واطفُ في بحيرات الملح الفيروزية، وتجول بين أطلال قلعة شالي بسيوة.',
    },
    durationDays: 4,
    days: [
      {
        dayNumber: 1,
        placeIds: ['place_white_desert_national_park'],
      },
      {
        dayNumber: 2,
        placeIds: ['place_shali_fortress'],
      },
      {
        dayNumber: 3,
        placeIds: ['place_siwa_salt_lakes'],
      },
      {
        dayNumber: 4,
        placeIds: ['place_citadel_of_qaitbay', 'place_bibliotheca_alexandrina'],
      },
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1771838877353-c1a58cfd399f?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Turquoise waters of Siwa salt lakes amidst golden sand dunes',
          ar: 'مياه بحيرات الملح الفيروزية وسط الكثبان الرملية الذهبية بسيوة',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Siwa Mirage',
      },
    ],
    isDemo: true,
  },
  {
    id: 'trip_nile_and_red_sea_odyssey',
    title: {
      en: 'Nile Serenity & Red Sea Odyssey',
      ar: 'ملحمة النيل وسحر البحر الأحمر: أسوان والغردقة وسيناء',
    },
    description: {
      en: 'A 7-day coast-to-river expedition through southern Egypt: island sanctuaries in Aswan, monumental Nile temples, vibrant coral reefs of Giftun Island, and the holy summit of Mount Sinai.',
      ar: 'رحلة ملهمة لمدة 7 أيام تجمع بين سكينة النيل وروعة البحر الأحمر: جزر ومعابد أسوان، والشعاب المرجانية البكر بجزيرة الجفتون، وقمة جبل موسى بسيناء.',
    },
    durationDays: 7,
    days: [
      {
        dayNumber: 1,
        placeIds: ['place_philae_temple', 'place_aswan_felucca_islands'],
      },
      {
        dayNumber: 2,
        placeIds: ['place_abu_simbel'],
      },
      {
        dayNumber: 3,
        placeIds: ['place_karnak_temple', 'place_luxor_temple'],
      },
      {
        dayNumber: 4,
        placeIds: ['place_valley_of_the_kings'],
      },
      {
        dayNumber: 5,
        placeIds: ['place_giftun_island'],
      },
      {
        dayNumber: 6,
        placeIds: ['place_blue_hole_dahab'],
      },
      {
        dayNumber: 7,
        placeIds: ['place_mount_sinai'],
      },
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        alt: {
          en: 'Red Sea coral coast meeting the ancient serenity of Egypt',
          ar: 'سواحل البحر الأحمر الفيروزية وسكينة الحضارة المصرية العريقة',
        },
        width: 1200,
        height: 800,
        credit: 'Unsplash / Red Sea Odyssey',
      },
    ],
    isDemo: true,
  },
];
