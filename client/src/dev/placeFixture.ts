import type { ImageAsset, Place } from '../types';

export const DEV_PLACE_FIXTURE_SLUG = 'layout-fixture';

function createFixtureImage(index: number, label: string, from: string, to: string): ImageAsset {
  const number = String(index).padStart(2, '0');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#g)"/><circle cx="1320" cy="210" r="170" fill="none" stroke="#f7f3ec" stroke-opacity=".22" stroke-width="3"/><circle cx="1320" cy="210" r="120" fill="none" stroke="#f7f3ec" stroke-opacity=".16" stroke-width="2"/><path d="M-80 860V560a260 260 0 0 1 520 0v300M440 860V500a220 220 0 0 1 440 0v360M880 860V610a190 190 0 0 1 380 0v250M1260 860V540a170 170 0 0 1 340 0v320" fill="none" stroke="#f7f3ec" stroke-opacity=".18" stroke-width="3"/><path d="M0 900h1600" stroke="#f7f3ec" stroke-opacity=".18" stroke-width="2"/><text x="100" y="180" fill="#f7f3ec" font-family="Georgia, serif" font-size="76">SYNTHETIC FIXTURE ${number}</text><text x="104" y="250" fill="#f7f3ec" fill-opacity=".72" font-family="Arial, sans-serif" font-size="30" letter-spacing="5">${label.toUpperCase()}</text><text x="104" y="940" fill="#f7f3ec" fill-opacity=".55" font-family="Arial, sans-serif" font-size="24" letter-spacing="3">DEVELOPMENT-ONLY LAYOUT TEST ASSET</text></svg>`;

  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    alt: { en: `Synthetic layout fixture image ${number}: ${label}` },
    width: 1600,
    height: 1000,
    credit: 'Synthetic layout fixture',
    license: 'Development-only test asset',
  };
}

const fixture: Place = {
  id: 'place_layout_fixture',
  slug: DEV_PLACE_FIXTURE_SLUG,
  name: { en: 'Synthetic Museum Courtyard Layout Fixture' },
  area: 'giza',
  category: 'culture',
  description: {
    en: 'Synthetic content for layout verification only. This record is not a real destination and is available only in development.\n\nIt exercises long-form description copy, gallery layouts, pricing metadata, opening hours, tips, and nearby cards. No part of this record is included in the production seed data.',
  },
  history: {
    en: 'This fixture exists so the destination page can be checked with every data section populated. It deliberately avoids real place facts, prices, and photographs.\n\nThe record is excluded from production builds and must never be used as destination content.',
  },
  images: [
    createFixtureImage(1, 'Main gallery panel', '#1f1f1f', '#775928'),
    createFixtureImage(2, 'Secondary gallery panel', '#775928', '#d9c7a3'),
    createFixtureImage(3, 'Detail gallery panel', '#271e06', '#1f1f1f'),
    createFixtureImage(4, 'Additional gallery panel', '#51452a', '#b08d57'),
  ],
  location: { lat: 0, lng: 0 },
  openingHours: [
    { day: 'monday', opens: '09:00', closes: '17:00' },
    { day: 'tuesday', opens: '09:00', closes: '17:00' },
    { day: 'wednesday', opens: '09:00', closes: '17:00' },
    { day: 'thursday', opens: '09:00', closes: '17:00' },
    { day: 'friday', opens: '09:00', closes: '17:00' },
    { day: 'saturday', opens: '09:00', closes: '17:00' },
    { day: 'sunday', opens: '09:00', closes: '17:00' },
  ],
  ticketPrice: {
    amount: 1250,
    currency: 'EGP',
    isEstimated: true,
    priceUpdatedAt: '2026-11-21',
  },
  avgVisitMinutes: 150,
  tags: ['synthetic', 'layout', 'fixture'],
  nearbyPlaceIds: [
    'place_grand_egyptian_museum',
    'place_pyramids_of_giza',
    'place_egyptian_museum',
  ],
  tips: [
    {
      title: { en: 'Synthetic tip one' },
      body: {
        en: 'This is test copy for a practical tip. It is not advice about a real destination.',
      },
    },
    {
      title: { en: 'Synthetic tip two' },
      body: {
        en: 'A second test card verifies the two-column tips layout and long-form wrapping.',
      },
    },
  ],
  isDemo: true,
  placeholders: [],
};

export function getDevPlaceFixture(): Place {
  return structuredClone(fixture);
}
