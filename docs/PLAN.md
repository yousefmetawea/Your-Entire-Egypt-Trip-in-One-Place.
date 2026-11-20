# Discover Cairo: Full Build Plan (Zero to Finish)

> Hand this file to any AI coding tool. It contains the product definition, decisions already made, and the build phases in order.

---

## 0. Instructions for the AI building this project

1. **Work phase by phase, in order.** Finish a phase and meet its "Done when" checks before starting the next one.
2. **Ask the user when you do not know something.** Never invent missing information (logos, API keys, content, design details, business rules). Stop and ask. Use the **Open Questions** list in Section 9 and the questions listed inside each phase.
3. **Do not expand scope.** Anything in Section 8 (Out of Scope) must not be built.
4. **UI/UX is already designed in Google Stitch.** Treat those designs as the visual source of truth (Section 3). Do not redesign. If something is missing from the designs, ask the user. The user may replace Stitch with a better design tool later; if so, use whatever source they point to.
5. **Be honest in the product.** Demo data and estimated prices must be labeled as such in the UI (Section 5.4).
6. After each phase, give a short summary: what was built, what is mocked, what is next, and any questions.
7. The primary builder is a **solo front-end developer (student)**. Keep code simple, typed, readable, and well organized. Prefer fewer, well-chosen dependencies.
8. This is a **graduation project**. Evaluation leans mostly on the **front-end**, so visual quality, motion, and polish matter a lot. Backend should be clean and working but not over-engineered.

---

## 1. Product Overview

**Name (working title):** Discover Cairo (final name is an open question)
**Tagline:** Discover Cairo. Your Way.

An intelligent travel platform for **international visitors**. It brings destination discovery, personalized trip planning, accommodation, transportation, and travel experiences into one seamless journey. It is not just a booking site; it is a digital travel companion that makes visiting Cairo easier and more organized.

**Product principles**

| Principle | Meaning |
|---|---|
| Personalization | The traveler designs their own trip |
| Convenience | Every trip detail in one place |
| Confidence | Clear info, trustworthy prices and details |
| Experience | Refined, easy, enjoyable UX |

**Primary persona: Alex, international traveler (assumed persona, not a measured demographic)**
- First time in Cairo, 4 to 6 days.
- Wants history and Egyptian culture.
- Does not want to waste time searching many sites.
- Wants to compare services and prices before deciding.
- Wants control over the itinerary instead of a group tour.
- Pain points: cannot order places by location, unsure which transport to use, needs a total cost estimate, cannot trust online info and offers.

**Decisions already made**
- Audience: international tourists
- Visual identity: luxury (Luxury Modern)
- Booking model: hybrid (internal requests + external links)
- Scope: **Greater Cairo** (Cairo + Giza)
- Top priority: experience

---

## 2. Scope: Geography and Content

Greater Cairo experience (Cairo and Giza), because major sights such as the Pyramids and the Grand Egyptian Museum are in Giza.

| Area | Example experiences |
|---|---|
| Giza | Pyramids, Sphinx, Grand Egyptian Museum |
| Downtown Cairo | Egyptian Museum, historic streets |
| Islamic Cairo | Khan el-Khalili, historic mosques |
| Coptic Cairo | Religious and historical landmarks |
| Zamalek | Nile experiences, restaurants, galleries |
| Old Cairo | Cultural and heritage experiences |

**Content target:** 30 to 50 well-documented destinations with good photos and accurate info, rather than hundreds with weak data.

---

## 3. UI/UX Source of Truth: Google Stitch

The screens were designed in **Google Stitch** using this order: design system + landing page first, then one screen at a time.

**Screens designed (or to be designed) in Stitch**
1. Landing / Discover Cairo
2. Destination details (example: Grand Egyptian Museum)
3. Smart Trip Creator wizard
4. Itinerary Builder (core screen, three columns: timeline, map, summary)
5. Accommodation & Transportation (tabs)
6. My Trip dashboard
7. AI Travel Companion (right-side chat panel over the itinerary)
8. Mobile versions (landing, itinerary builder with map/list toggle and bottom sheet, my trip)

**What the AI must do with them**
- Ask the user to provide the Stitch exports for each screen: screenshots and, if available, the exported HTML/CSS, placed in a `/design` folder in the repo.
- Match layout, spacing, hierarchy, and components as closely as possible.
- If a screen was not designed yet, ask the user to generate it in Stitch, or ask whether to proceed using the design system below.

**Design system (use as tokens)**

| Token | Value |
|---|---|
| Background | Warm ivory `#F7F3EC` |
| Primary | Deep charcoal `#1F1F1F` |
| Accent | Muted bronze `#B08D57`, sand `#D9C7A3` |
| Surfaces | White cards, soft shadows, 16 to 20px radius |
| Heading font | Elegant serif (Playfair Display or Cormorant Garamond) |
| Body/UI font | Clean sans (Inter) |
| Photography | Cinematic, high quality, warm natural light |
| Navigation | Clean floating top nav with pill CTA "Plan My Trip" |
| Motion | Smooth, cinematic, subtle |

Style rules: luxury modern, editorial, calm. Avoid clichés (no gold pyramids, hieroglyph borders, papyrus textures). Only subtle Egyptian touches.

---

## 4. Tech Stack

**Front-end:** React, TypeScript, React Router, Tailwind CSS
**Back-end:** Node.js, Express, MongoDB (Mongoose), JWT authentication
**Deferred (do NOT add for MVP):** Socket.io, Redis

**Recommended defaults (confirm with the user before installing):**
- Build tool: Vite
- Animation: Framer Motion (and respect `prefers-reduced-motion`)
- Drag and drop: dnd-kit
- Data fetching: TanStack Query
- Light global state: Zustand
- Forms and validation: React Hook Form + Zod
- Map library: **ask the user** (Leaflet + OpenStreetMap is the simplest free option; Mapbox or Google Maps need keys)
- AI provider for the companion: **ask the user**
- PDF export: **ask the user** (client-side generation vs server-side)

---

## 5. Product Requirements

### 5.1 MVP modules

**01. Discover Cairo (must have):** cinematic hero, featured destinations, categories (History, Culture, Adventure, Food), recommended experiences, search and filters, ready-made trips.

**02. Destination Explorer (must have):** gallery, description and history, location, visiting hours, ticket price with "last updated" date, average visit duration, nearby places, Add to Trip.

**03. Smart Trip Creator (must have):** wizard with steps: travel dates, number of travelers, budget, interests, accommodation preferences, transportation preferences. Ends with suggestions matching the choices.

**04. Itinerary Builder (core differentiator):** organize places by day, drag to reorder, add/remove activities, see places on the map, estimated visit and travel times, estimated total cost. The whole plan updates visually on every change.

**05. Interactive Map (must have):** map linked to the itinerary, markers for places and hotels, category filters, popup per place, daily route display, nearby places.

**06. Accommodation & Transportation (must have):** hotels and hostels with price ranges, amenities, location, external booking links. Airport transfers, private cars, tourist buses, metro info. Phase 1 uses curated, reviewed data with clearly estimated prices and no claim of live prices.

**07. My Trip Dashboard (must have):** upcoming trip, daily itinerary, accommodation details, transportation requests, budget overview, saved places, trip status.

**08. AI Travel Companion (MVP Lite):** understands the trip and our place data. Can suggest and explain, and applies changes to the trip only **after user approval**. Example prompts: suggest places near my hotel, what should I visit tomorrow, find something for my budget, replace this activity with something cultural.

### 5.2 Nice-to-have (only after MVP is stable)
- Interactive Egypt Globe (3D landing visual)
- Smart weather suggestions (indoor instead of outdoor, if weather data is available)
- Smart budget alerts (when choices approach the budget)
- My Travel Memories / Digital Travel Passport with stamps
- Export My Trip as a polished PDF (itinerary, map, bookings, details)

Note: budget alerts and PDF export appear in the Itinerary Builder design, so decide with the user whether they are MVP or later.

### 5.3 Booking strategy (hybrid)

| Type | Services |
|---|---|
| Internal (managed in the platform) | Airport transfer request, guided tour reservation, booking status and history, customer details |
| External (link to provider) | Hotels, selected activities, external transport providers |

Important: an internal request such as an airport transfer is **not** a confirmed booking. It starts as **Pending** until a provider confirms. No real payment gateway.

Booking statuses: `Pending`, `Confirmed`, `Cancelled`, plus a badge `External booking` for outbound links.

### 5.4 Trust and honesty rules in the UI
- Prices show an `Estimated price` badge and a `Last updated` date.
- Demo data is clearly labeled in the app (for example a small "Demo data" note), so the graduation committee can see what is simulated and what links to external sources.
- No claim of live availability or live prices.

### 5.5 Quality requirements
- Mobile must stay fast and easy to use.
- Respect `prefers-reduced-motion`.
- Animations on three levels: cinematic (landing), interactive (trip building and map), micro-interactions (buttons, cards, forms).
- Accessibility basics: semantic HTML, keyboard navigation, focus states, alt text, sufficient contrast.

---

## 6. Data Model (starting point; adjust and confirm)

- **User:** name, email, passwordHash, role, createdAt
- **Place:** name, slug, area, category, description, history, images, location (lat/lng), openingHours, ticketPrice + priceUpdatedAt, avgVisitMinutes, tags, nearbyPlaceIds
- **Accommodation:** name, type (hotel/hostel), priceRange, amenities, location, images, externalUrl, priceUpdatedAt
- **TransportOption:** type (transfer/private car/bus/metro), description, estimatedPrice, notes, bookable (internal or external)
- **ReadyMadeTrip:** title, description, durationDays, days with place references
- **Trip:** userId, title, dates, travelers, budget, interests, preferences, status, days[ { date, activities[ { placeId or custom, startTime, durationMin, travelMin, estCost, order } ] } ], accommodationId, savedPlaceIds
- **BookingRequest:** userId, tripId, kind (airport transfer / guided tour), details, status (Pending/Confirmed/Cancelled), createdAt, statusHistory

## 7. API Outline (starting point)

- Auth: register, login, me, logout
- Places: list (filters and search), detail, nearby
- Ready-made trips: list, detail, "use this trip"
- Accommodation: list (filters), detail
- Transport: list
- Trips: create, list mine, get, update, delete, add/remove/reorder activities, cost summary
- Bookings: create request, list mine, get status
- Companion: chat endpoint that receives trip context and returns suggestions (changes applied only via trip endpoints after user approval)
- Export: trip PDF (if included)

---

## 8. Out of Scope (do not build)

Real-time driver tracking, multiple payment gateways, real payment processing, full hotel supplier integration, live booking for every provider, native mobile app, autonomous AI trip editing without user approval, Socket.io, Redis.

---

## 9. Open Questions (ask the user; do not guess)

1. Final product name and logo?
2. Project deadline and weekly hours available (to set the schedule)?
3. Map provider (Leaflet/OSM, Mapbox, Google Maps)? Is there an API key?
4. AI provider and key for the companion, or should the first version use rule-based suggestions?
5. Are budget alerts and PDF export in MVP or later?
6. Where will the content (30 to 50 places, photos, prices) come from? Does the user provide it, or should seed data be drafted for review?
7. Where will it be deployed (hosting for front-end, back-end, MongoDB Atlas)?
8. Languages: English only, or also Arabic (RTL)?
9. Are all eight Stitch screens finished, and can the user export them (images and code)?
10. Does the user prefer a monorepo or two separate repos?

---

## 10. Build Phases

### Phase 0: Alignment and Setup
**Goal:** Everything needed to start is known and the repo is ready.
- Ask the Open Questions in Section 9 that block this phase (name, designs, repo structure, hosting).
- Collect the Stitch exports into `/design`.
- Create the repo structure (for example `/client`, `/server`, `/design`, `/docs`).
- Set up linting, formatting, TypeScript strict mode, env files, `.gitignore`, README.
- Write `docs/decisions.md` recording the choices from Section 1 and Section 4.

**Done when:** project runs locally (empty client and server), designs are in the repo, decisions are documented.

### Phase 1: Design System in Code
**Goal:** Turn the Stitch design system into reusable code.
- Configure Tailwind tokens: colors, fonts, radii, shadows, spacing, breakpoints.
- Load fonts (heading serif + Inter).
- Build base components matching the designs: Button (primary, secondary, pill CTA), Card, Chip, Badge/StatusChip (Pending, Confirmed, External booking, Estimated price), Input, Select, Slider, DatePicker, Tabs, Modal, Toast, Skeleton, Navbar (floating), Footer.
- Set up motion utilities and a shared `prefers-reduced-motion` handling.
- Create a simple component showcase page for review.

**Done when:** the showcase page matches the Stitch design system visually; components are typed and reusable.

### Phase 2: App Shell, Routing, and Mock Data
**Goal:** A navigable app skeleton with fake data.
- React Router with layout, route structure, and 404.
- Routes: `/`, `/discover`, `/places/:slug`, `/plan` (wizard), `/trip/:id` (itinerary builder), `/stay-transport`, `/my-trip`, `/login`, `/register`.
- Define TypeScript types from the data model (Section 6).
- Create mock data layer (JSON + a thin service layer) that can later be swapped for the real API without changing UI code.
- Seed at least 10 places in mock data for development (full 30 to 50 comes later).

**Done when:** every route renders a placeholder inside the correct layout, with types and mock services in place.

### Phase 3: Landing and Discover
**Goal:** The first impression, pixel-faithful to Stitch.
- Cinematic hero with headline, floating search bar, "Plan My Trip" CTA.
- Category chips, featured destination cards, ready-made trips carousel, how-it-works, trust strip, footer.
- Discover page with search and filters (category, area, duration).
- Cinematic scroll and entrance animations; responsive and mobile layout.
- Optimize images (sizes, lazy loading).

**Done when:** matches the Stitch landing page on desktop and mobile; search/filter work on mock data; good Lighthouse performance on mobile.

### Phase 4: Destination Explorer
**Goal:** Rich place pages.
- Gallery, history, visiting hours, ticket price with `Estimated price` badge and `Last updated`, visit duration, tips.
- Embedded small map and nearby places row.
- "Add to Trip" action (works with a local draft trip until the backend exists).

**Done when:** any mock place renders a complete page; Add to Trip updates a draft trip visibly.

### Phase 5: Smart Trip Creator (Wizard)
**Goal:** Collect preferences and produce a starting itinerary.
- Multi-step wizard with progress indicator and live "Your trip so far" summary: dates, travelers, budget tiers, interests, accommodation preferences, transport preferences.
- Validation, back/next, and persistence of progress in the draft state.
- Rule-based itinerary generation (group places by area and interest, respect days and budget). Keep logic in a separate, testable module.
- "Generate My Itinerary" leads to the Itinerary Builder.

**Done when:** a user can complete the wizard and land on a sensible generated itinerary.

### Phase 6: Itinerary Builder (Core Feature)
**Goal:** The most important screen, built to the highest polish.
- Three-column desktop layout: day timeline, map, summary panel (as in Stitch). Map/list toggle with bottom sheet on mobile.
- Day tabs; draggable activity cards (time, duration, travel time, cost); reorder within and across days; add/remove activities.
- Cost summary with breakdown (activities, transport, stay) and budget alert banner (if in MVP).
- Everything updates live on each change (costs, times, map route).
- Undo for destructive changes.

**Done when:** the full edit loop (add, remove, reorder, move between days) works smoothly with correct recalculation and no layout glitches.

### Phase 7: Interactive Map
**Goal:** Map tightly integrated with the itinerary.
- Integrate the chosen map provider (ask the user, Section 9).
- Numbered markers per day, route line, category filters, place popups, nearby places layer, hotel markers.
- Two-way sync: selecting a card highlights the marker, selecting a marker highlights the card.
- Custom marker and map styling to match the luxury theme.

**Done when:** the map and itinerary stay in sync on desktop and mobile.

### Phase 8: Stay and Transport
**Goal:** Comparison pages that are honest about data.
- Tabs for Accommodation and Transportation.
- Hotel/hostel cards with filters (price range, amenities, location), `External booking` badge, and "View on provider" links.
- Transport cards (airport transfer, private car, tourist bus, metro info) with estimated prices.
- "Request Transfer" flow producing a `Pending` booking request with a clear status explanation.

**Done when:** filters work, all prices are labeled estimated with dates, and a transfer request flow creates a Pending request in the mock layer.

### Phase 9: My Trip Dashboard
**Goal:** The central place to manage a trip.
- Upcoming trip hero with countdown, today's itinerary, accommodation details, transport requests with status chips, budget donut chart, saved places grid.
- Travel Passport card with stamps only if the user chose to include it (ask).

**Done when:** the dashboard reflects the user's real draft/saved trip data and booking requests.

### Phase 10: Back-End and Real Data
**Goal:** Replace mocks with a real API.
- Express + TypeScript server, MongoDB models from Section 6, validation, error handling, CORS, rate limiting, env config.
- JWT auth (register, login, protected routes), password hashing.
- Implement the API outline in Section 7.
- Seed script with the final 30 to 50 places, accommodations, transport options, and ready-made trips (ask the user for content or draft it for review).
- Swap the front-end service layer from mock to API; add loading and error states everywhere.
- Basic tests for critical logic (trip cost calculation, itinerary generation, auth).

**Done when:** the whole app works end to end against the real API with seeded data and authenticated users.

### Phase 11: AI Travel Companion
**Goal:** A useful, safe assistant.
- Chat panel UI as designed (quick-prompt chips, suggestion cards with "Add to Day 2" and "Replace activity").
- Backend endpoint that sends trip context and our place data to the chosen AI provider (ask the user which one).
- The assistant only suggests; changes are applied **after explicit user confirmation**.
- Ground answers in our own data (do not invent places, prices, or hours); handle errors and rate limits; keep API keys server-side.
- If no AI key is available, ship a rule-based fallback and tell the user.

**Done when:** the four example prompts work, and nothing changes in a trip without confirmation.

### Phase 12: Nice-to-Have Features (only if time remains)
Pick with the user, in this suggested order:
1. Export My Trip as PDF
2. Smart budget alerts (if not already done)
3. Smart weather suggestions
4. Travel Memories / Digital Travel Passport
5. Interactive Egypt Globe

### Phase 13: Polish, Accessibility, and Performance
- Pass over every screen against the Stitch designs; fix spacing, typography, states.
- Motion polish: consistent easing, `prefers-reduced-motion` honored everywhere.
- Accessibility pass (keyboard, focus, contrast, labels, alt text).
- Performance: image optimization, code splitting, lazy loading, Lighthouse checks on mobile.
- Empty, loading, and error states for every data view.
- Cross-browser and real-device checks (at least one phone).cd

### Phase 14: Deployment
- Deploy front-end and back-end, connect MongoDB Atlas (ask the user about hosting).
- Environment variables and secrets handled safely.
- Production build check, basic monitoring or logging.
- Final seed of production data.

### Phase 15: Graduation Delivery
- Demo script: a clear 5 to 8 minute walkthrough following Alex's journey (discover, plan, build itinerary, compare stay/transport, request transfer, dashboard, companion).
- A page or slide that states plainly what is real and what is demo or externally linked.
- README with setup, architecture, and screenshots.
- Short architecture and feature documentation for the committee.
- Backup plan for demo day (seeded demo account, offline fallback screenshots or video).

---

## 11. Global Definition of Done (per feature)
- Matches the Stitch design on desktop and mobile.
- Typed, no console errors, handles loading, empty, and error states.
- Keyboard accessible and respects reduced motion.
- No fake claims: estimates and demo data are labeled.
- Summary posted with questions for the user before moving on.