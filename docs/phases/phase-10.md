# Phase 10: Back-End and Real Data Implementation Record

> Phase 10 establishes the real back-end foundation for Discover Cairo: Express 5 + TypeScript + MongoDB (Mongoose) + JWT authentication via httpOnly cookies, replacing client mock services while preserving full client interface compatibility and mock fallback.

---

## 1. Milestones Overview

### Milestone 1: Server Foundation, Environment Validation & Database Connection

- Configured typed environment schema validation using **Zod** (`server/src/config/env.ts`) that enforces strict runtime checks on all required variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, etc.) and fails fast at startup.
- Implemented MongoDB connection lifecycle management (`server/src/config/database.ts`) with graceful shutdown (`SIGINT`, `SIGTERM`).
- Added security middleware: Helmet, CORS whitelisting, request rate limiting, centralized CSRF/Origin enforcement, and masked logging.
- Set up central error handling (`ApiError`, `errorHandler`) with consistent JSON envelopes and hidden stack traces in production.
- Verified in `server/src/app.test.ts`.

### Milestone 2: Database Models & Idempotent Seed Runner

- Created Mongoose schemas and models in `server/src/models/` with stable string IDs and `_id -> id` mapping:
  - `User`: Email uniqueness, Argon2 password hash.
  - `Place`: Cairo/Giza landmarks, geo-coordinates, ticket prices, and opening hours.
  - `Accommodation`: Curated hotels/hostels with tier and pricing.
  - `TransportOption`: Private cars, airport transfers, public transit.
  - `ReadyMadeTrip`: Seed itineraries with days and activities.
  - `Trip`: User-owned itinerary with embedded days, activities, and optimistic locking `version`.
  - `BookingRequest`: Airport transfer and guided tour requests with embedded status audit trail.
- Built zero-duplication seed script (`server/src/seed/seed.ts`) that ingests seed data directly from `client/src/services/mock/seed/` via TypeScript AST transpilation.
- Implemented **permanent production protection**: destructive collection resets are strictly denied when `NODE_ENV=production` without exception or environment override.
- Verified in `server/src/seed/seed.test.ts`.

### Milestone 3: Authentication & Security

- User registration and login with Argon2 (`argon2id`) password hashing and timing-safe verification.
- Delivered JWT session tokens in secure, server-managed HTTP cookies (`discover_cairo_token`):
  - `httpOnly: true` (preventing token theft via XSS).
  - `sameSite: 'lax'`.
  - `secure: true` in production, `false` in development.
  - 7-day expiration lifetime.
- Centralized Origin and CSRF validation in middleware for state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- Verified in `server/src/routes/auth.test.ts`.

### Milestone 4: Core APIs

- **Places**: Search by keyword, area, and category filters; slug lookup; nearby places.
- **Catalog**: Accommodations, transport options, and ready-made trips.
- **Trips**: CRUD operations scoped by authenticated `userId`, add-place-to-draft flow, and `saveItinerary` with optimistic locking (`version` check).
- **Booking Requests**: Hybrid booking model for airport transfers and guided tours, pending cancellation, and developer simulated confirmation strictly gated behind `ENABLE_DEMO_ACTIONS`.
- Verified in `server/src/routes/api.test.ts`.

### Milestone 5: Client Integration & Authentication UI

- Built lightweight, typed API client (`client/src/services/api/apiClient.ts`) including `credentials: 'include'` and custom CSRF headers.
- Implemented swappable API services (`client/src/services/api/createApiServices.ts`) conforming exactly to `Services` contracts.
- Integrated deterministic itinerary planning against live backend places and user trips.
- Created `AuthContext` and `useAuth` hook with session bootstrap from `GET /api/auth/me`.
- Implemented `/login` and `/register` pages using design system components.
- Added `ProtectedRoute` guard redirecting unauthenticated users from `/my-trip` to `/login`.
- Connected Navbar user status and Sign Out actions.
- Configured Vite dev server proxy for `/api` to `http://localhost:4000`.

### Milestone 6: Hardening, Verification & Documentation

- Authored REST API specification in `docs/api.md`.
- Authored server setup guide and operational manual in `docs/server.md`.
- Updated project phase documentation (`docs/phases/phase-10.md`, `AGENTS.md`, and `docs/decisions.md`).
- Executed `npm audit` confirming **0 vulnerabilities**.
- Verified dual execution modes: all client tests pass with both `VITE_DATA_SOURCE=api` and `VITE_DATA_SOURCE=mock`.
- Completed full monorepo verification chain (lint, typecheck, tests, format check, and production builds).

---

## 2. Key Architecture Decisions

1. **Database:** MongoDB Atlas (M0 free cluster) with Mongoose 9. Mongoose schemas use stable string IDs (`Place.id`, `Trip.id`, `BookingRequest.id`) matching existing client types.
2. **Password Hashing:** Argon2id with recommended memory and parallelism parameters.
3. **Session Management:** JWT stored in 7-day `httpOnly`, `sameSite: 'lax'` cookies. No JWTs stored in `localStorage` or `sessionStorage`.
4. **CSRF & Request Security:** State-mutating endpoints enforce `Origin` matching `CLIENT_ORIGIN`, require `Content-Type: application/json`, reject standard HTML forms, and verify `X-Requested-With: XMLHttpRequest`.
5. **Direct Catalog Seeding:** Seed runner transpiles client seed files dynamically with TypeScript AST parser, preventing duplicate catalog copies.
6. **Optimistic Locking:** Trip editing validates integer `version` field, returning `409 Conflict` if the trip was modified concurrently.
7. **Swappable Architecture:** Client switches between `api` and `mock` via `VITE_DATA_SOURCE`, preserving offline mock testing.

---

## 3. Verification & Quality Results

| Check                | Result                                                                |
| -------------------- | --------------------------------------------------------------------- |
| **Client Lint**      | 0 errors, 0 warnings (`eslint .`)                                     |
| **Server Lint**      | 0 errors, 0 warnings (`eslint .`)                                     |
| **Client Typecheck** | 0 errors (`tsc -b`)                                                   |
| **Server Typecheck** | 0 errors (`tsc --noEmit`)                                             |
| **Client Tests**     | 28 test suites, 168 tests passed                                      |
| **Server Tests**     | 8 test suites, 68 tests passed                                        |
| **Mock Mode Tests**  | 28 test suites, 165 tests passed (`VITE_DATA_SOURCE=mock`)            |
| **Code Style**       | 100% formatted with Prettier (`format:check`)                         |
| **Client Build**     | Vite production bundle generated successfully                         |
| **Server Build**     | TypeScript compiler generated clean NodeNext output in `server/dist/` |
| **Security Audit**   | `npm audit` reported **0 vulnerabilities**                            |
