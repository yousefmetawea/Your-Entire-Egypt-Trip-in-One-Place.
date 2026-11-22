export interface TileProviderConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

/**
 * Supported tile providers.
 * Default is OpenStreetMap standard tile layer.
 * CARTO Positron and Esri are supported as env-only configurations.
 */
export const TILE_PROVIDERS: Record<string, TileProviderConfig> = {
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  cartoPositron: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  esri: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    maxZoom: 19,
  },
};

export function getActiveTileConfig(): TileProviderConfig {
  const envProvider = (import.meta.env.VITE_MAP_TILE_PROVIDER as string | undefined)?.toLowerCase();
  if (envProvider && TILE_PROVIDERS[envProvider]) {
    return TILE_PROVIDERS[envProvider];
  }

  const customUrl = import.meta.env.VITE_MAP_TILE_URL as string | undefined;
  const customAttribution = import.meta.env.VITE_MAP_TILE_ATTRIBUTION as string | undefined;

  if (customUrl) {
    return {
      url: customUrl,
      attribution: customAttribution || TILE_PROVIDERS.osm.attribution,
      maxZoom: 19,
    };
  }

  return TILE_PROVIDERS.osm;
}
