import type { TransportOption } from '../../../types';

export const seedTransport: readonly TransportOption[] = [
  {
    id: 'transport_airport_transfer',
    name: { en: 'Cairo Airport Chauffeur Transfer' },
    type: 'transfer',
    description: {
      en: 'Private one-way airport transfer between Cairo International Airport and your accommodation with meet-and-greet service.',
    },
    estimatedPrice: {
      amount: 650,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    notes: {
      en: 'Managed transfer request. Flight tracking and greeting at arrivals hall included.',
    },
    bookable: 'internal',
    externalUrl: null,
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'transport_private_driver',
    name: { en: 'Greater Cairo Private Day Chauffeur' },
    type: 'private-car',
    description: {
      en: 'Dedicated air-conditioned vehicle and licensed professional driver for 8 hours within Greater Cairo and Giza.',
    },
    estimatedPrice: {
      amount: 2200,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    notes: {
      en: 'Covers fuel, parking, and driver waiting time. Direct external provider booking.',
    },
    bookable: 'external',
    externalUrl: 'https://example.com/cairo-private-driver',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'transport_cultural_coach',
    name: { en: 'Heritage Cultural Coach Service' },
    type: 'bus',
    description: {
      en: 'Comfortable scheduled shuttle service connecting Downtown Cairo, Giza Plateau, and the Grand Egyptian Museum.',
    },
    estimatedPrice: {
      amount: 350,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-23',
    },
    notes: {
      en: 'Fixed daily departure timetable with reserved seating. Booked via external coach operator.',
    },
    bookable: 'external',
    externalUrl: 'https://example.com/cultural-coach-cairo',
    isDemo: true,
    placeholders: [],
  },
  {
    id: 'transport_metro_network',
    name: { en: 'Cairo Metro Transit Network' },
    type: 'metro',
    description: {
      en: 'Informational guide for Greater Cairo Metro Lines 1, 2, and 3 connecting key historical quarters and transport hubs.',
    },
    estimatedPrice: null,
    notes: {
      en: 'Zoned fare stages between 8 and 20 EGP. Single-trip paper tokens or rechargeable smart cards purchased directly at stations.',
    },
    bookable: 'external',
    externalUrl: 'https://example.com/cairo-metro-info',
    isDemo: true,
    placeholders: ['estimatedPrice'],
  },
];
