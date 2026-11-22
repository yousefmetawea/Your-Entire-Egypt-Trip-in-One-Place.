# Trip Planner Rules

This document describes the Phase 5 demo planner in plain language. It is a rule-based demo, not a live booking or pricing engine.

## Inputs

- **Dates:** a start date and end date, using real `YYYY-MM-DD` calendar dates. The end date cannot precede the start date. A trip can cover 1–14 days.
- **Travelers:** a whole number from 1 to 12.
- **Budget tier:** `Essential`, `Balanced`, or `Signature`. This is a style preference only. It is required, but it does not change the demo itinerary because no verified price data is available.
- **Interests:** one or more of History, Culture, or Adventure. Food is shown for context but is disabled and rejected because the demo catalog has no food places.
- **Stay preference:** Any stay, Hotel, or Hostel. No accommodation inventory is available, so this is stored as a preference only.
- **Transport preference:** Any transport, Airport transfer, Private car, Bus, or Metro. No transport inventory is available, so this is stored as a preference only.

## Saved places

- The planner reads the existing local draft trip, if any.
- Places already in the draft are treated as saved places.
- “Include saved places” is on by default. Saved places are included when they fit the trip, and their areas are prioritized.
- If the user turns it off, saved places are excluded from the generated itinerary.
- Generating a new itinerary replaces the current draft itinerary. The draft title and ID are preserved. The user is asked to confirm before replacing an existing draft.
- “Start over” clears the wizard answers in this browser only. It does not delete the draft trip.

## Matching and grouping

- A place matches an interest when its category matches or one of its tags exactly matches the interest.
- Candidate places are grouped by the six catalog areas: Giza, Downtown Cairo, Islamic Cairo, Coptic Cairo, Zamalek, and Old Cairo.
- Areas are ordered by saved-place count, then match count, then the catalog area order.
- At most one area is scheduled per day, and at most three activities are scheduled per day.
- Extra days are assigned to areas that still have unscheduled candidate places. If no places remain, the day is left empty and a warning is produced.
- Start times are fixed at 09:00, 11:30, and 14:00. They are not live availability or route-optimized times.

## Honest data handling

- Activity duration comes from the place’s stored average visit length. If it is missing, the trip page says “Visit length not listed.”
- Travel time is currently missing for every generated activity. The trip page says “Travel time not listed.” No route or travel time is invented.
- Activity cost comes from the place’s stored ticket price. If it is missing, the trip page says price information is not available.
- Prices are labeled “Estimated price” and use their stored currency and last-updated date when supplied. No conversion or live-price claim is made.
- Empty days, omitted places, unmatched interests, and missing details are reported as warnings by the generator and shown honestly in the UI.
- The generated trip is stored locally and labeled as a demo. There is no booking, live availability, or external provider call.

## Determinism

- The generator is a pure function in `client/src/lib/planner/itinerary.ts`.
- It does not use randomness, the current time, network calls, or browser storage.
- Day IDs use the date (`day-YYYY-MM-DD`), and activity IDs use the date and place ID. Repeated runs with the same inputs produce the same itinerary.
- The service layer handles persistence, validation, draft replacement, and user ownership.

## Out of scope in Phase 5

- Editing or reordering activities.
- Drag and drop, maps, route optimization, and travel-time calculation.
- Booking requests, live prices, availability, and payments.
- Real accommodation or transport inventory.
- Arabic planner copy and mirrored planner layouts.
