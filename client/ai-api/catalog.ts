import type { Place } from '../src/types/index.js';
import { seedPlaces } from '../src/services/mock/seed/places.js';

/**
 * The server reads the SAME Discover catalog the website uses
 * (src/services/mock/seed/places.ts). There is no second copy of the data.
 */
export function getServerPlaces(): readonly Place[] {
  return seedPlaces;
}

export interface CatalogEntry {
  id: string;
  name: string;
  area: string;
  category: string;
  tags: string[];
  description: string;
  lat?: number;
  lng?: number;
  avgVisitMinutes?: number;
  ticket?: string;
}

function trimTo(text: string | undefined, max: number): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function toCatalogEntry(place: Place): CatalogEntry {
  const entry: CatalogEntry = {
    id: place.id,
    name: place.name.en,
    area: place.area,
    category: place.category,
    tags: place.tags.slice(0, 6),
    description: trimTo(place.description?.en, 240),
  };
  if (place.location) {
    entry.lat = Math.round(place.location.lat * 100) / 100;
    entry.lng = Math.round(place.location.lng * 100) / 100;
  }
  if (place.avgVisitMinutes !== null) entry.avgVisitMinutes = place.avgVisitMinutes;
  if (place.ticketPrice) {
    entry.ticket = `${place.ticketPrice.amount} ${place.ticketPrice.currency}`;
  }
  return entry;
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
