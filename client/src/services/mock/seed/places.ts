import type { Place, PlacePlaceholderField } from '../../../types';

const placeholders: readonly PlacePlaceholderField[] = [
  'description',
  'history',
  'images',
  'location',
  'openingHours',
  'ticketPrice',
  'avgVisitMinutes',
  'nearbyPlaceIds',
];

function createDemoPlace(input: Pick<Place, 'id' | 'slug' | 'name' | 'area' | 'category'>): Place {
  return {
    ...input,
    description: null,
    history: null,
    images: [],
    location: null,
    openingHours: null,
    ticketPrice: null,
    avgVisitMinutes: null,
    tags: [],
    nearbyPlaceIds: [],
    isDemo: true,
    placeholders: [...placeholders],
  };
}

export const seedPlaces: readonly Place[] = [
  createDemoPlace({
    id: 'place_pyramids_of_giza',
    slug: 'pyramids-of-giza',
    name: { en: 'Pyramids of Giza & Great Sphinx' },
    area: 'giza',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_grand_egyptian_museum',
    slug: 'grand-egyptian-museum',
    name: { en: 'Grand Egyptian Museum' },
    area: 'giza',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_egyptian_museum',
    slug: 'egyptian-museum',
    name: { en: 'Egyptian Museum' },
    area: 'downtown',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_talaat_harb_street',
    slug: 'talaat-harb-street',
    name: { en: 'Talaat Harb Street' },
    area: 'downtown',
    category: 'culture',
  }),
  createDemoPlace({
    id: 'place_khan_el_khalili',
    slug: 'khan-el-khalili',
    name: { en: 'Khan el-Khalili' },
    area: 'islamic-cairo',
    category: 'culture',
  }),
  createDemoPlace({
    id: 'place_al_muizz_street',
    slug: 'al-muizz-street',
    name: { en: 'Al-Muizz Street' },
    area: 'islamic-cairo',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_hanging_church',
    slug: 'hanging-church',
    name: { en: 'Hanging Church' },
    area: 'coptic-cairo',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_ben_ezra_synagogue',
    slug: 'ben-ezra-synagogue',
    name: { en: 'Ben Ezra Synagogue' },
    area: 'coptic-cairo',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_cairo_opera_house',
    slug: 'cairo-opera-house',
    name: { en: 'Cairo Opera House' },
    area: 'zamalek',
    category: 'culture',
  }),
  createDemoPlace({
    id: 'place_cairo_tower',
    slug: 'cairo-tower',
    name: { en: 'Cairo Tower' },
    area: 'zamalek',
    category: 'adventure',
  }),
  createDemoPlace({
    id: 'place_babylon_fortress',
    slug: 'babylon-fortress',
    name: { en: 'Babylon Fortress' },
    area: 'old-cairo',
    category: 'history',
  }),
  createDemoPlace({
    id: 'place_nilometer',
    slug: 'nilometer',
    name: { en: 'Nilometer' },
    area: 'old-cairo',
    category: 'history',
  }),
];
