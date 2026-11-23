# Decisions

**Status:** Phase 10 — Back-End and Real Data implemented; pending review
**Last updated:** 2026-11-23

## Product

- Working name: **Discover Cairo**. The final name and logo are not decided.
- No logo has been created. A text-only wordmark may be used temporarily only after explicit approval.
- Audience: international visitors to Greater Cairo (Cairo and Giza).
- Visual direction: luxury modern, editorial, calm, using the Stitch design system.
- Booking model: hybrid — internal requests plus external provider links.
- Primary priority: the travel experience, with the front end as the main graduation evaluation.
- Full product scope and requirements remain in `docs/PLAN.md`.

## Repository

- Single monorepo using npm workspaces.
- Workspaces: `client/` and `server/`. Shared project documentation stays in `docs/`.
- `design/` contains the Stitch source material and is not modified by application work.
- Phases 0–6 are local-only. Hosting providers are undecided.
- Base branch: `main`. Phase work uses dedicated branches: `phase-0-setup`, `phase-1-design-system`, `phase-2-app-shell`, `phase-3-landing-discover`, `phase-4-destination-explorer`, `phase-5-trip-creator`, and, currently, `phase-6-itinerary-builder`.
- Phases 0–5 are committed on their phase branches. Phase 6 is implemented on `phase-6-itinerary-builder` but remains uncommitted and unpushed pending review.

## Tooling

- Node.js requirement: `>=22.12.0`. Development was verified with Node `v26.13.1` and npm `11.20.0`.
- Package manager: npm with a single root `package-lock.json`.
- Client: Vite, React, TypeScript strict mode, Tailwind CSS v4 through `@tailwindcss/vite`.
- Server: Express 5, TypeScript strict mode, ESM with `NodeNext` module resolution, `tsx` for development, `dotenv` for environment loading.
- TypeScript is pinned to the 6.0.x line because `typescript-eslint` does not yet support TypeScript 7. Revisit only after the ESLint parser declares support.
- Linting: ESLint flat config in each workspace, with Prettier compatibility.
- Formatting: Prettier at the root. `design/` and `docs/PLAN.md` are excluded from formatting.
- Development ports: client `5173`, server `4000`.
- Server health endpoint: `GET /api/health` returning `{ "status": "ok" }`.
- The root `npm run dev` command starts both applications with `concurrently`.
- React Router `7.18.6` provides the Phase 2 client router.
- MongoDB, Mongoose, authentication, CORS, rate limiting, and product API routes are deferred to their planned phases.
- Vitest `5.1.1` runs client-side service and pure-logic tests in a Node environment through `npm test`. No component-testing dependencies were added.
- Phase 1 added Framer Motion and self-hosted Fontsource packages for Playfair Display and Plus Jakarta Sans. No icon library was added.
- Phase 2 added React Router and Vitest. No data-fetching or client-state library was added.
- Phase 3 added no dependencies. Landing and Discover use the existing services, React Router, i18next, Framer Motion, and inline SVG icons.
- Phase 4 added no dependencies. The Destination Explorer reuses the existing services, design-system primitives, React Router, i18next, and inline SVG icons.
- Phase 5 added no dependencies. The trip creator reuses React Router, i18next, the design-system primitives, the service layer, and Vitest.
- Phase 6 adds `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` for the approved itinerary drag-and-drop interaction. No other dependency was added.

## Design system (Phase 1)

- Tailwind CSS v4 tokens are configured CSS-first in `client/src/styles/theme.css` from the Stitch design system. There is no `tailwind.config.*`.
- The canvas is `#F7F3EC`; primary surfaces use `#1F1F1F` (`#060607` is the primary token), and secondary/interactive text is `#775928`. `#B08D57` and `#D9C7A3` are decorative bronze/sand aliases and are not used for text or interactive contrast.
- Typography is Playfair Display for editorial/display text and Plus Jakarta Sans for interface and body text, self-hosted through Fontsource. This resolves the `docs/PLAN.md` §3 Inter reference in favor of `DESIGN.md` and the Stitch exports.
- Implemented primitives: Container, Section, Button, Card, Chip, Badge/StatusBadge, Input, Select, Tabs, and Modal. Navbar and Footer remain presentational; optional link components allow router-aware links without coupling the components directly to React Router.
- Phase 3 adds Skeleton. Slider, DatePicker, and Toast remain deferred until their screen designs exist.
- Component APIs are typed. Styling uses a small `cn` class joiner; no CVA, `tailwind-merge`, or icon library was added.
- Framer Motion is limited to shared variants and coordinated entrances. CSS handles hover and focus transitions; `MotionConfig reducedMotion="user"` and global CSS honour reduced-motion preferences. There are no ambient loops.
- The Phase 1 showcase reviews tokens, typography, components, motion, and a static English RTL preview. In Phase 2 it moved to the dev-only `/design-system` route, outside the product layout, and is excluded from production builds.
- Phases 1 and 2 are committed. Phase 3 is committed. Phases 4–7 are implemented. Phase 8 implements the `/stay-transport` comparison page with Accommodation and Transportation tabs, fictional demo catalogs, internal airport transfer request flow with audit history and simulated confirmation, accommodation map, and builder summary stay integration.
- Phase work lives on dedicated branch `phase-8-stay-transport`. Changes are uncommitted pending review.

## App shell and mock data (Phase 2)

- The product routes are `/`, `/discover`, `/places/:slug`, `/plan`, `/trip/:id`, `/stay-transport`, `/my-trip`, `/login`, `/register`, and a catch-all 404. They currently share `SiteLayout`.
- `SiteLayout` reuses the Phase 1 Navbar and Footer. Navbar links point only to `/discover`, `/plan`, `/stay-transport`, and `/my-trip`; the CTA points to `/plan`; Footer links point only to existing routes. Phase 3 adds an accessible mobile disclosure menu with Escape and outside-click dismissal. Authentication routes can move to a separate layout later without changing the shell components.
- `RootLayout` provides the skip link, scroll restoration, route titles, and the outer Suspense boundary. `SiteLayout` provides the Navbar, semantic `<main id="main">`, an inner Suspense boundary, and the Footer. `RootErrorBoundary` is the route error boundary. Page routes are lazy-loaded; the 404 route is lazy as well.
- Navbar, Footer, and `ButtonLink` accept optional link components. The product shell supplies a React Router adapter, while the Phase 1 showcase keeps default anchor behavior.
- The Phase 1 showcase is registered only in development as `/design-system`; production builds do not include its route or chunk.
- Domain types live in `client/src/types/`. The client `User` type contains no password hash. Entities use stable string IDs, `LocalizedText` requires English and allows optional Arabic, and prices use explicit estimated/updated metadata.
- Trips have `startDate`/`endDate`, generated `TripDay` records, and ordered `TripActivity` records. Activity sources and booking request details are discriminated unions. Booking status history is recorded.
- Phase 2 seeds exactly 12 approved places across Giza, Downtown, Islamic Cairo, Coptic Cairo, Zamalek, and Old Cairo. No Food venue or Saqqara record was added. Factual fields remain null or empty and are listed in `placeholders`; every seeded record has `isDemo: true`. Images are empty until approved assets are supplied.
- Accommodation, transport, and ready-made trip seeds are empty. Their service contracts exist and return empty arrays; no fictional inventory was invented.
- Services are defined as interfaces in `client/src/services/contracts.ts` and implemented by `createMockServices`. The named `services` export in `client/src/services/index.ts` is the swappable singleton for later API replacement.
- Mock persistence uses `localStorage` with an in-memory fallback when storage is unavailable. The Phase 6 store uses `discover-cairo.mock-store.v2` and migrates valid v1 records; missing or invalid versioned records are recovered and reported. Only user-created trips and booking requests are stored. The default owner is the explicit `demo-user`; no personal information is seeded.
- Mock services simulate latency (about 120 ms by default), validate inputs, and throw typed `ServiceError` values with `NOT_FOUND`, `VALIDATION`, `STORAGE`, or `UNAVAILABLE` codes. `UNAVAILABLE` is reserved for future implementations.
- Phase 2 trip updates cover non-date fields only; date regeneration is deferred. Activity reordering requires every existing activity exactly once.
- Placeholder copy is English-only for Phase 2 and does not claim live data. The i18n foundation remains; Arabic product copy and mirrored layouts still require approval.
- Tests cover the date helpers, seeded catalog behavior, trip creation/persistence/validation, activity ordering, and booking request validation. They use Vitest's Node environment and the mock services directly.

## Landing and Discover (Phase 3)

- Landing (`/`) and Discover (`/discover`) are implemented. Discover has no dedicated Stitch export and is derived from the approved landing design. Inferred responsive behavior and the mobile disclosure Navbar were approved.
- Landing reuses the shared Navbar and Footer, shows a hero search, category shortcuts, five featured places, a ready-made-trips empty state, a how-it-works section, and a factual trust strip.
- The featured allowlist is fixed to `pyramids-of-giza`, `grand-egyptian-museum`, `khan-el-khalili`, `hanging-church`, and `cairo-tower`. No `featured` field was added to the domain model.
- Hero actions are separate: “Search places” submits the catalog search to Discover; “Plan My Trip” navigates to `/plan`.
- Discover state lives in the URL: `q`, `category`, `area`, and `duration` are filters; `from`, `to`, and `travelers` are trip context and do not filter places. Dates are validated as real ISO calendar dates, `to` cannot precede `from`, travelers must be a positive safe integer, invalid values are ignored, serialization is stable, and back/forward navigation is supported.
- Search is submit-based rather than live/debounced. Category chips on Landing navigate to Discover with the selected category; on Discover they update the URL filter.
- Duration buckets are `under-2h`, `2-4h`, and `over-4h`. Unknown durations are included only when no duration filter is selected; the UI discloses that seeded visit lengths are null and a duration filter may return no results.
- Place cards link to the existing `/places/:slug` placeholder. Missing details use “Visit length not listed” and “Details are being prepared for this place.”
- Place imagery is not supplied. Placeholders use token-based gradients and subtle arch linework; no remote images or Stitch screenshots are used as product imagery.
- Ready-made trips remain an empty state because the seed is empty. No fictional trips are shown; the carousel component is data-driven for future verified content.
- Landing and Discover keep demo disclosures visible. Prices are not claimed as live; the trust strip avoids unverified tourism claims.
- `Skeleton` is used for catalog loading states. No new dependencies were added; scroll-snap and inline SVG icons cover the UI needs.
- English Phase 3 copy lives in `client/src/i18n/locales/en.json`; no Arabic product copy was invented. Route titles and meta descriptions are set for Landing and Discover.
- Unit tests cover catalog helpers, URL parsing/serialization, filtering, and featured selection. Component and browser automation tests were not added.

## Destination Explorer (Phase 4)

- `/places/:slug` implements the Destination Explorer. It loads stored place data through `usePlace`, renders loading/not-found/error states with retry, and sets the route title and meta description.
- The gallery supports empty, single, pair, and three-plus-image layouts. The first image loads eagerly and the rest lazily. Empty galleries use the existing token-based `PlaceMedia` placeholder rather than inventing imagery.
- Clicking a gallery image opens a native `<dialog>` lightbox with a counter, previous/next controls, Escape/arrow/Home/End keys, backdrop dismissal, focus restoration, and credit/license/source links when supplied.
- Description and history render only when stored; otherwise a combined empty state explains that details are being prepared. Opening hours show a weekly list with a partial-data note. Estimated prices are formatted in their stored currency with a conditional `Estimated price` badge and a `Last updated` fallback; no conversion or live-price claim is made. Average visit duration uses the stored value or an explicit missing state.
- The map is a polished `MapPreview` placeholder with no provider or network integration. It indicates whether coordinates exist and labels the interactive map as a later phase.
- Nearby places load from `nearbyPlaceIds` via `places.getById` (up to three) and are hidden when no IDs exist. Errors show an inline retry state.
- Tips render only when stored; the seed has no tips. No tips, hours, prices, descriptions, coordinates, or nearby relationships were invented.
- Add to Trip uses `TripService.addPlaceToDraft(placeId, place?)`. The optional loaded place snapshot lets the dev-only fixture work without adding synthetic data to the production seed. It creates a draft titled “My Cairo trip” when none exists, adds to the first day at 09:00, stores `avgVisitMinutes` as `durationMin` (nullable), sets `travelMin` to null, and stores the ticket price as the estimated cost. Duplicate places are blocked across all days. Feedback is inline; there is no Toast.
- A trip with no days now appends a day containing the new activity instead of dropping the activity.
- The mobile action bar is fixed below `md`, hides near the footer via an IntersectionObserver sentinel, and is the only visible Add action on mobile. The in-flow action remains in the sticky practical-info card on desktop.
- The dev-only fixture at `/places/layout-fixture` uses synthetic copy, data-URI SVG images, and clearly labeled demo data. It is dynamically imported only under `import.meta.env.DEV`; production builds contain no fixture markers.
- English Phase 4 copy lives under `placeDetails` in `client/src/i18n/locales/en.json`. No Arabic product copy was invented.
- Tests cover price/time/date formatting, opening-hours summaries, gallery layout/keyboard helpers, and draft creation/duplicate/snapshot behavior. Component and browser automation tests were not added.
- Lighthouse mobile verification is blocked because Chrome/Chromium is unavailable. Visual and interaction checks were performed in Firefox instead; no Lighthouse score is claimed.

## Smart Trip Creator (Phase 5)

- `/plan` implements the six-step planner: Dates, Travelers, Budget, Interests, Stay, and Transport. It has a progress indicator, per-step validation, Back/Continue, a persistent “Trip summary” panel, and a generate action. Phase 5 initially implemented a minimal read-only itinerary at `/trip/:id`; Phase 6 replaces it with the editable builder.
- Dates are real ISO dates with start/end ordering and a 1–14 day limit. Travelers are whole numbers from 1 to 12. Budget tier is required and limited to Essential, Balanced, or Signature. Interests require at least one of History, Culture, or Adventure; Food is disabled and rejected because the seed has no food places. Stay and transport preferences accept the planned option sets, including “Any.”
- Budget tier is stored on the trip and shown in the UI, but it does not change the generated itinerary. No verified price data exists, so treating budget as a style preference avoids inventing costs. All prices remain estimated and labeled when present.
- Wizard progress is stored in `localStorage` under `discover-cairo.wizard.v1` with a versioned shape. Values, current step, generated trip ID, and the “include saved places” choice are persisted. The Hero “Plan My Trip” action prefills dates and travelers through `/plan?from=&to=&travelers=` using `createPlanHref`; the catalog search still uses Discover.
- The planner reuses a single local draft. If one exists, generation replaces its itinerary while preserving its ID and title. A confirmation dialog is shown before replacing an existing draft. “Start over” clears wizard answers only; it does not delete the draft.
- Saved places default to included. The generator prioritizes their areas, and the user can exclude them for a generation. The service returns warnings for omitted places, empty days, unmatched interests, missing details, and saved-place handling.
- The pure generator lives in `client/src/lib/planner/itinerary.ts`. It matches by category or exact tag, groups candidates by catalog area, schedules one area per day, caps activities at three per day, and allocates extra days to areas with remaining places. Start times are fixed at 09:00, 11:30, and 14:00. Duration and cost come from stored place data; travel time is null. IDs are deterministic, and the generator uses no randomness, current time, network, or storage.
- `TripService.createPlannedTrip` validates answers, finds the draft by `replaceTripId` or the first draft, derives saved place IDs from the draft, invokes the generator, blocks zero-match generation with a `VALIDATION` service error, and atomically creates or replaces the draft. It returns the trip, warnings, matched and omitted place IDs, and created/replaced flags.
- Phase 5 initially rendered a read-only trip page. Phase 6 replaces that page with the editable itinerary builder while retaining the loading, not-found, and error states.
- The planner and trip page have an inferred responsive layout because Stitch only provides a desktop Step 4-of-6 screen. The summary stacks below the step content on smaller screens; there is no sticky mobile action bar. Unsupported Stitch claims such as route feasibility, live transfer times, private chauffeur pricing, fixed five-day trips, and guide/pacing selectors were not implemented.
- English Phase 5 copy lives under `planner` and `trip` in `client/src/i18n/locales/en.json`. No Arabic product copy was invented.
- Tests cover planner validation, prefill, persistence, deterministic itinerary generation, and planned-trip service behavior. The suite passes 13 files and 94 tests. Component and browser automation tests were not added.
- Lighthouse mobile verification remains blocked because Chrome/Chromium is unavailable. Visual and interaction checks are limited to Firefox; no Lighthouse score is claimed.

## Itinerary Builder (Phase 6)

- `/trip/:id` is now the editable itinerary builder from `design/itinerary_builder_discover_cairo`. It uses a day timeline, an explicit order preview in place of a map, and a live summary. Actual map integration remains Phase 7.
- `TripActivity.startTime` is nullable so missing times survive storage and are shown honestly. Activity edits validate optional start times, 1–1,440 minute durations, and non-negative estimated costs.
- Editor state is a reducer with a 30-snapshot undo/redo history. It covers activity add/edit/remove, reorder, cross-day moves, day add/remove, and title changes. Non-changes do not create history entries.
- Activities can be added from the catalog or created as custom activities. Catalog price data is read-only; custom estimated costs are labeled as estimates dated to the day of entry. Duplicate catalog places are blocked across the trip.
- Reordering preserves stored start times. The UI flags missing times, out-of-order times, and overlaps instead of silently recalculating; travel times remain null because no verified data exists.
- Days are append-only, capped at 14, and only the last day can be removed. Removing a day with activities requires confirmation, as does removing any activity.
- Cost totals are grouped by currency without conversion and show both group and per-traveler estimates. The budget check compares matching-currency estimated activity costs with the stored numeric budget at 80% and 100% thresholds. Budget tier remains a preference and no stay or transport costs exist yet.
- Saving uses `TripService.saveItinerary(tripId, { title?, days })`, validates the complete itinerary, and queues saves sequentially in the hook. The header reports saving, saved, and failed states and offers retry. Data remains local to the browser.
- The mock store is version 2 under `discover-cairo.mock-store.v2`, migrates valid v1 data, validates trips and activities, recovers from corrupted records, and supports a local reset. The previously incorrect budget validation now accepts a non-null `Money` value.
- dnd-kit provides pointer and keyboard sorting with a 6px pointer activation distance. A pointer-first day-tab collision strategy fixes drops targeting the wrong tab. The activity edit form offers a non-drag day move for keyboard and assistive-technology users.
- The Phase 6 mobile layout is inferred and was approved as a stacked layout: timeline, order preview, then summary. No bottom sheet, map/list toggle, or sticky action bar is added without a dedicated mobile design and map provider.
- Unsupported Stitch controls such as PDF export, sharing, save-to-vault, bookings, and AI edits are omitted. Demo and estimated-price disclosures remain visible.
- English Phase 6 copy lives under `trip.builder` in `client/src/i18n/locales/en.json`. No Arabic product copy was invented.
- Unit tests cover editor history and validation, activity factories, timing warnings, summaries, budget thresholds, itinerary saves, and store migration/validation. The suite passes 18 files and 124 tests. Component and permanent browser automation tests were not added.
- Firefox manual/WebDriver checks covered the full edit loop, reload persistence, pointer reorder, cross-day drops, keyboard reorder, title/day flows, save status, and accessible button names. The mobile layout passed at Firefox's 500 CSS px minimum headless width; a true 390px viewport could not be set. Lighthouse remains blocked.

## Stay and Transport (Phase 8)

- `/stay-transport` implements Accommodation and Transportation tabs with URL persistence (`?tab=`).
- Fictional catalogs provide 8 accommodations and 4 transport options with `isDemo: true` and explicit currency/estimates.
- Airport transfer requests create internal `pending` booking requests with an immutable status audit history log. User can cancel while pending; demo confirmation simulation is gated behind `DEV` or `VITE_ENABLE_DEMO_ACTIONS`.
- Leaflet map shows accommodation pins across Greater Cairo with price popups and "Set as my stay" actions.

## My Trip Dashboard (Phase 9)

- `/my-trip` implements the central management dashboard from `design/my_trip_dashboard_discover_cairo`:
  - **Upcoming Trip Hero:** displays trip title, dates, travelers, status badge, and an accessible countdown matrix (Days, Hours, Minutes). Multiple trips are handled via an active/upcoming focus with a top `<select>` dropdown switcher.
  - **Trip Status Lifecycle:** hybrid model where stored `draft` or `cancelled` are preserved, while active/upcoming trips derive calendar phase (`upcoming`, `active`, `completed`). A modal allows users to cancel trips cleanly.
  - **Today's Itinerary:** displays the active day matching today's date during the trip, Day 1 preview before the trip starts, and completed summary after the trip. Activity cards link to place details and builder.
  - **Accommodation & Fleet:** displays selected stay details (`trip.accommodationId`) or an empty state with CTA to `/stay-transport`; lists transfer booking requests with `RequestStatusChip`, cancellation, and audit timeline.
  - **Budget Donut:** custom SVG donut chart calculating real totals from itinerary activities, selected stay, and transfers. Displays unpriced item counts, budget cap comparisons, and multi-currency disclosures. No external chart library was added.
  - **Saved Places:** renders places bookmarked in `trip.savedPlaceIds` using `PlaceCard` with a quick removal action and link to `/discover`. A subtle bookmark toggle was added to `PlaceCard` to populate saved places from the UI.
  - **Travel Passport:** deferred to Phase 12; no fake stamps or wax seals are fabricated.
  - **Sync:** synchronizes across tabs via the `storage` event and custom `discover-cairo:store-updated` events.

## Back-End and Real Data (Phase 10)

- **Database:** MongoDB Atlas with Mongoose 9. Schemas use stable string IDs (`User.id`, `Place.id`, `Accommodation.id`, `TransportOption.id`, `ReadyMadeTrip.id`, `Trip.id`, `BookingRequest.id`) with custom `toJSON` mapping `_id` to `id` for seamless client compatibility.
- **Password Security:** Argon2id hashing with timing-safe verification prevents timing side-channel attacks.
- **Authentication & Sessions:** JSON Web Tokens stored in 7-day `httpOnly`, `sameSite: 'lax'` cookies (`discover_cairo_token`). `secure: false` in development, `secure: true` in production. Tokens are never exposed to client-side JavaScript or stored in `localStorage`/`sessionStorage`.
- **CSRF & Origin Protection:** Centralized middleware validates `Origin` against configured `CLIENT_ORIGIN`, rejects `sec-fetch-site: cross-site`, blocks standard HTML form submissions, requires `Content-Type: application/json` on state-mutating payloads, and expects custom header `X-Requested-With: XMLHttpRequest`.
- **Seed Pipeline:** The database seed runner (`server/src/seed/seed.ts`) transpiles client seed files via TypeScript AST compilation, ensuring zero code duplication. Upserts by stable IDs ensure strict idempotency. Destructive database resets are permanently rejected when `NODE_ENV=production` without exception.
- **Core APIs:**
  - Places catalog with full-text search, area/category filtering, slug lookup, and nearby suggestions.
  - Accommodations, transport options, and ready-made trips catalogs.
  - User trips with ownership scoping, add-to-draft endpoint, and optimistic locking (`version` check).
  - User booking requests (hybrid model) with status lifecycle and audit log; simulation confirmation endpoint is strictly gated behind `ENABLE_DEMO_ACTIONS`.
- **Client Service Layer Integration:** `client/src/services/index.ts` defaults to `createApiServices()`, connecting the frontend to real backend endpoints with `credentials: 'include'`. The mock services layer is preserved for offline testing via `VITE_DATA_SOURCE=mock`.
- **Client Auth UI:** `AuthContext` restores sessions from `GET /api/auth/me`. `/login` and `/register` pages connect to backend auth endpoints. `ProtectedRoute` redirects unauthenticated users attempting to access `/my-trip` to `/login`.
- **Security Audit:** Zero vulnerabilities verified via `npm audit`.

## Localization

- English is the default language. Arabic is supported, including RTL direction.
- Localization uses `i18next` and `react-i18next`.
- The selected language is stored in `localStorage` under `discover-cairo.language`; English is used when no valid preference exists.
- The MVP does not use locale-prefixed URLs, preserving the route plan in `docs/PLAN.md`.
- Runtime language changes update `<html lang>` and `<html dir>` to `ltr` or `rtl`.
- UI copy lives in translation resources rather than hardcoded component strings. The Phase 1 showcase copy is review-only, Phase 2 placeholder copy is English-only, and Phase 3–6 product copy is English-only in `en.json` until Arabic copy is approved.
- Layouts will use flow-relative CSS/Tailwind properties and `rtl:` variants where necessary. No RTL-specific plugin is selected. Phase 1 adds logical-property RTL foundations and a static English RTL preview only.
- Dates, numbers, and currency will use built-in `Intl` APIs.
- Dynamic content such as place names and descriptions uses a localized shape (English required, Arabic optional, English fallback), defined in Phase 2. The API shape remains a Phase 10 concern.
- User-generated content will not be translated automatically.
- Arabic typography, Arabic product naming, translation voice/dialect, and mirrored visual layouts are not present in the Stitch exports. They require user approval before implementation.

## Deferred product decisions requested by `docs/PLAN.md` §9

- Final product name and logo.
- Project deadline and weekly available hours.
- Hosting for the client, server, and database.
- Map provider and API key.
- AI provider/key or rule-based fallback.
- Whether full smart budget alerts and PDF export are MVP or later. Phase 6 includes a limited numeric budget check; PDF export remains deferred.
- Source of final place content, photos, prices, and Arabic translations.
- Mobile-specific visual designs.
