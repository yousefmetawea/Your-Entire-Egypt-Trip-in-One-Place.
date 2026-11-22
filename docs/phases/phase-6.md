# Phase 6 — Itinerary Builder

**Status:** Implemented; pending review
**Branch:** `phase-6-itinerary-builder`
**Date:** 2026-11-22

## Scope

Phase 6 turns the read-only `/trip/:id` page into the core editable itinerary builder. The full edit loop covers:

- Day tabs and adding/removing days.
- Adding catalog places or custom activities.
- Editing activity times, durations, costs, notes, and custom titles.
- Removing activities and days with confirmation.
- Reordering activities by pointer or keyboard drag.
- Moving activities between days by drag or from the edit form.
- Live cost, timing, missing-data, and budget summaries.
- Local persistence with save feedback and undo/redo.

The desktop reference is `design/itinerary_builder_discover_cairo/screen.png`. The Stitch export's map is a Phase 7 concern; the builder provides an explicit order preview instead of inventing geography, distances, or a map provider.

## What was built

- **Editor state:** `useReducer` history state in `client/src/lib/builder/editor.ts`, exposed through `useTripEditor`. The last 30 snapshots support undo/redo. Title changes, activity changes, day changes, and moves create history entries; non-changes do not.
- **Activity rules:** Catalog activities copy stored duration and price only. Custom activities store a title, optional start time, optional duration, optional per-traveler estimated cost, and notes. Editable start times are nullable; catalog price data remains read-only in the editor.
- **Days:** Days are appended only, limited to 14, and only the last day can be removed. Removing a day with activities requires confirmation. Adding a day selects it and updates the trip end date.
- **Scheduling:** Reordering preserves stored start times. The builder flags missing start times, out-of-order times, and overlaps instead of silently rewriting times. Travel times remain unavailable because no verified data exists.
- **Costs:** Totals are grouped by currency without conversion. The summary shows group and per-traveler costs, counts unpriced activities, and compares matching-currency estimated activity costs with the trip's numeric budget at 80% and 100% thresholds. Budget tier remains a preference.
- **Persistence:** `TripService.saveItinerary(tripId, { title?, days })` validates and saves the entire itinerary. The hook queues saves sequentially, coalesces save status to the latest request, and exposes retry on failure. Edits save in this browser; no server write exists.
- **Storage:** The mock store moved to version 2 under `discover-cairo.mock-store.v2`, with v1 migration, trip validation, corruption recovery, and a local reset path. The budget field is validated as a nullable `Money` value.
- **DnD:** `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` provide pointer and keyboard sorting. The pointer sensor uses a 6px activation distance. Day tabs are droppables; a pointer-first collision strategy ensures the tab under the pointer is selected rather than a neighboring tab. The edit form provides an explicit day move as an accessible alternative.
- **UI:** A header with save status, undo/redo, title editing, and demo disclosure; day tabs; inline-editable activity cards; add dialog with catalog/custom tabs; order preview map placeholder; and a summary panel. Mobile stacks the day panel, order preview, and summary with no sticky action bar.
- **Copy:** English builder copy lives under `trip.builder.*`. Every screen keeps demo and estimated-price disclosures visible. Unsupported controls such as PDF export, sharing, save-to-vault, bookings, and AI actions are omitted.

## Decisions

- dnd-kit dependencies were approved and added for this phase.
- The builder saves separate state snapshots sequentially rather than adding a second persistence mechanism or a state library.
- Activity start times may be null. Missing times are explicit, and scheduling warnings are informational rather than destructive.
- Only the last day may be removed. This keeps the itinerary contiguous and matches the append-only day model.
- The order preview is not a map. Actual markers, routes, coordinates, and map/list controls remain Phase 7 and require a provider choice.
- The mobile layout is inferred because no dedicated mobile design exists. It stacks the summary below the content and does not add a bottom sheet or map/list toggle.
- The numeric budget check is a lightweight alert only. It does not change generated itineraries or invent stay/transport costs.

## Verification

- `npm test`: 18 files, 124 tests passed.
- `npm run typecheck`: client and server passed.
- `npm run lint`: client and server passed.
- Firefox manual/WebDriver checks covered initial save status, custom activity creation, editing, day move, delete and undo, title rename, day add/remove, reload persistence, pointer reorder, cross-day drag, and keyboard reorder.
- The mobile layout had no horizontal overflow at Firefox's minimum headless viewport width (500 CSS px). A true 390px screenshot was blocked by Firefox's headless minimum window width.
- Lighthouse remains unavailable because Chrome/Chromium is not installed; no score is claimed.
- Component testing and permanent browser automation dependencies were not added.

## Follow-ups

- Phase 7: choose a map provider, then replace the order preview with synchronized markers, routes, popups, and map/list behavior.
- Phase 8: add stay and transport data before extending cost breakdowns.
- Future design work: request mobile itinerary-builder designs if the stacked layout should be replaced by the planned map/list toggle and bottom sheet.
