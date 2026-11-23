# Phase 8: Stay & Transport Implementation Record

> Phase 8 implements the comparison page at `/stay-transport` with Accommodation and Transportation tabs, filterable demo catalogs, external booking notifications, internal airport transfer request flow with status tracking and simulated confirmation, accommodation map, and Itinerary Builder summary integration.

---

## 1. Architecture & Capabilities

### A. Route `/stay-transport`

- Two accessible tabs: `Accommodation` and `Transportation`.
- URL sync via query parameters (`?tab=accommodation` or `?tab=transportation`). Full keyboard navigation (`Home`, `End`, `ArrowLeft`, `ArrowRight`).
- Filter query persistence for type, area, and amenities.
- Fictional catalog with 8 accommodation choices and 4 transport options.

### B. Internal Request: Airport Transfer

- Managed request starting in `pending` status with initial audit history log.
- Accessible submission form: direction, date, time, passengers, optional flight number, pickup/drop-off, and notes.
- Status management: user cancellation while pending; demo simulation control (`simulateConfirm`) gated by `import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_ACTIONS === 'true'`.
- Status history timeline tracking all timestamped transitions.

### C. Itinerary Builder Integration

- Replaces `"Stay and transport are not added to this demo itinerary yet"` with:
  - Selected Stay name, area, and nightly rate.
  - Calculated total stay estimate: `nightly_min * nights` when trip dates are known.
  - Transfer requests counter and pending/confirmed status badges.
  - Currency-safe partial calculation without conversion.

### D. Interactive Accommodation Map

- Leaflet map displaying accommodation pins at demo coordinates in Greater Cairo.
- Interactive popups allowing the user to inspect rates and trigger "Set as my stay".

---

## 2. Testing & Verification

- Seed validation tests confirm all records have `isDemo: true`, prices have currency/estimates/dates, URLs are HTTPS, and coordinates fall within Greater Cairo bounds.
- Pure logic tests verify filter combinations, price calculations (nights vs no nights, unpriced items), booking request state machines (allowed vs illegal transitions), and corrupted storage recovery.
