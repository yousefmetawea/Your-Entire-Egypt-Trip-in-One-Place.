import { describe, expect, it } from 'vitest';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';

function createServices() {
  return createMockServices({
    latencyMs: 0,
    storage: createMemoryStorage(),
  });
}

describe('mock place service', () => {
  it('returns the approved demo places without invented details', async () => {
    const services = createServices();
    const places = await services.places.list();

    expect(places).toHaveLength(26);
    expect(places.slice(0, 12).map((place) => place.name.en)).toEqual([
      'Pyramids of Giza & Great Sphinx',
      'Grand Egyptian Museum',
      'Egyptian Museum',
      'Talaat Harb Street',
      'Khan el-Khalili',
      'Al-Muizz Street',
      'Hanging Church',
      'Ben Ezra Synagogue',
      'Cairo Opera House',
      'Cairo Tower',
      'Babylon Fortress',
      'Nilometer',
    ]);
    expect(places.every((place) => place.isDemo)).toBe(true);
    expect(places.every((place) => place.images.length > 0)).toBe(true);
    expect(places.every((place) => place.placeholders.includes('history'))).toBe(true);
  });

  it('filters places by area, category, and search text', async () => {
    const services = createServices();

    await expect(services.places.list({ area: 'zamalek' })).resolves.toHaveLength(2);
    await expect(services.places.list({ category: 'culture' })).resolves.toHaveLength(4);
    await expect(services.places.list({ search: 'museum' })).resolves.toHaveLength(3);
  });

  it('looks places up by id and slug and reports missing records', async () => {
    const services = createServices();
    const place = await services.places.getBySlug('cairo-tower');

    await expect(services.places.getById(place.id)).resolves.toMatchObject({
      name: { en: 'Cairo Tower' },
    });
    await expect(services.places.getBySlug('missing-place')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(services.places.getNearby(place.id)).resolves.toEqual([]);
  });

  it('returns seeded catalogs for accommodation, transport, and readyMadeTrips', async () => {
    const services = createServices();

    const accommodations = await services.accommodation.list();
    expect(accommodations.length).toBeGreaterThan(0);

    const transport = await services.transport.list();
    expect(transport.length).toBeGreaterThan(0);

    const readyMadeTrips = await services.readyMadeTrips.list();
    expect(readyMadeTrips).toHaveLength(3);
  });
});
