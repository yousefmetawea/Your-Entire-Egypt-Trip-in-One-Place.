# Phase 7: Interactive Map & Spatial Foundations

> Phase 7 implements the interactive Leaflet-powered maps on the Itinerary Builder (`/trip/:id`) and Destination Explorer (`/places/:slug`), verified geographic coordinates, straight-line distance calculations, and tile provider configuration.

---

## 1. Scope & Architecture

### Map Surfaces

1. **Itinerary Builder (`/trip/:id`)**:
   - `BuilderMap.tsx` acts as the lazy-loaded wrapper for `ItineraryMap.tsx`.
   - Renders the active Day's mapped stops with numbered luxury pins, category badges (H: History, C: Culture, A: Adventure, F: Food), and dashed polyline connecting stops in itinerary order.
   - Marker labels: always visible when a day has $\le 4$ mapped stops; visible for selected/hovered stops when $> 4$.
   - Interactive popups with stop number, category, start time, visit duration, and link to place details.
   - Unmapped activities notice: honest count of stops lacking geographic coordinates.
   - Mobile: tap-to-activate overlay (scroll-safe) and static bottom sheet for stop inspection.
   - Empty state: honest message when no activities or no mapped coordinates exist for that day.
2. **Destination Explorer (`/places/:slug`)**:
   - `MapPreview.tsx` acts as the lazy-loaded wrapper for `DestinationMap.tsx`.
   - Single luxury pin at the verified visitor entrance.
   - When coordinates are missing, renders the honest empty state ("Coordinates are not available for this demo place" with "No map location" badge).
   - Mobile: tap-to-activate overlay preventing accidental map interception while scrolling.
3. **Nearby Places**:
   - Implemented via Option C in `NearbyPlaces.tsx` and `useNearbyPlaces.ts`: uses `nearbyPlaceIds` if present, otherwise computes straight-line neighbors within 1.0 km (`NEARBY_RADIUS_KM`) from verified coordinates.
   - Labeled clearly as `"within ~1 km (straight-line)"` and `"[dist] straight-line"`.
   - No route time or road navigation claimed.

---

## 2. Tile Provider & Luxury Styling

### Tile Providers

- Default: **OpenStreetMap Standard Tile Layer** (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Configurable via environment variables without code modification:
  - `VITE_MAP_TILE_PROVIDER`: `osm` (default), `cartoPositron`, or `esri`.
  - Or custom `VITE_MAP_TILE_URL` and `VITE_MAP_TILE_ATTRIBUTION`.
- **Note on Alternative Tile Providers**:
  - CARTO Positron and Esri require verifying their current commercial and rate terms before any public deployment. OSM attribution must always remain visible and intact.

### Luxury Styling & Tokens

- Custom CSS in `client/src/styles/map.css`.
- Tile layer filter: `--map-tile-filter: brightness(0.97) contrast(1.05) saturate(0.85) sepia(0.08);` defined via CSS variable so it can be tuned or disabled globally.
- Zoom controls, attribution, and popups styled with design system tokens (`--color-surface`, `--color-secondary`, `--color-hairline`, `--font-sans`).
- Tile error overlay: gracefully catches tile network failures and provides a "Retry" button.

---

## 3. Adding Coordinates in the Future

When adding coordinates for places in future phases, apply these strict rules:

1. **Entrance location**: Record the visitor entrance gate or ticket pavilion, NOT the geographic centroid of a large archaeological site or compound.
2. **Lat/Lng order**: Ensure `lat` (~29.9 to 30.1) and `lng` (~31.1 to 31.3) are never swapped.
3. **Dual Source Verification**: Cross-check two independent sources (e.g. Wikidata and OpenStreetMap). Coordinates may only be written if both sources agree within 300 meters.
4. **Research log**: Record source URLs, retrieval dates, and confidence in `docs/data/places-research.md`.
5. **Missing coordinates**: If unverified or conflicting, leave `location: null` and include `'location'` in `placeholders`.

---

## 4. Mobile Testing & Lighthouse Procedure

### Firefox Manual Checks (Executed locally)

- Verify tap-to-activate overlay absorbs initial touches so page scrolling is not trapped.
- Verify tapping the overlay enables interactive panning/zooming.
- Verify clicking a stop marker displays the static bottom sheet with stop details and close button.
- Verify keyboard focus can tab into zoom buttons and popups without trapping focus.

### Step-by-Step Procedure for Mobile Lighthouse Audit on `/trip/:id`

1. Open Google Chrome or Chromium.
2. Navigate to `http://localhost:5173/plan` and generate a demo itinerary or navigate directly to `/trip/trip_demo_1`.
3. Open Chrome DevTools (`F12` or `Ctrl+Shift+I`).
4. Select the **Lighthouse** tab.
5. Set Device to **Mobile**, Categories to **Performance, Accessibility, Best Practices, SEO**.
6. Click **Analyze page load**.
7. Note: Lighthouse scores are run by the developer in Chrome DevTools; no synthetic score is fabricated in the repository.

---

## 5. Known Limitations

- **Leaflet LTR Canvas**: Leaflet's underlying canvas and coordinate system operate in LTR mode. The `.leaflet-container` is explicitly styled with `direction: ltr !important` to prevent map rendering distortion when RTL is toggled.
- **Straight-line distance only**: Distances in nearby places are computed via the Haversine formula and explicitly labeled "straight-line". No drive-time or transit routing is provided in this phase.
