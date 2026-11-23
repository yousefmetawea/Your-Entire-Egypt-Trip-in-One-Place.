# Server Setup & Architecture Guide

This document covers setup, configuration, database management, and architecture for the Discover Cairo backend server (`server/`).

---

## 1. Requirements & Prerequisites

- **Node.js:** `>=22.12.0` (Verified on Node `v26.13.1`, npm `11.20.0`)
- **Package Manager:** npm with root npm workspaces
- **Database:** MongoDB 7+ or MongoDB Atlas (e.g. Free Tier M0)

---

## 2. Environment Configuration

Server environment variables are validated at startup using **Zod** (`server/src/config/env.ts`). If any required variable is missing or malformed, the server fails fast with a clear diagnostic message.

Configuration files:

- `server/.env` (Local, **git-ignored**; never commit secrets)
- `server/.env.example` (Tracked template with placeholder values)

### Environment Variables Reference

| Variable               | Type    | Default                 | Description                                                                |
| ---------------------- | ------- | ----------------------- | -------------------------------------------------------------------------- |
| `PORT`                 | number  | `4000`                  | Port for the HTTP server to listen on                                      |
| `NODE_ENV`             | string  | `development`           | `development`, `production`, or `test`                                     |
| `MONGODB_URI`          | string  | _(required)_            | Standard MongoDB connection URI (e.g. `mongodb+srv://...`)                 |
| `JWT_SECRET`           | string  | _(required)_            | Secret string for signing session JWTs (minimum 32 characters recommended) |
| `JWT_EXPIRES_IN`       | string  | `7d`                    | Token lifetime (default 7 days)                                            |
| `COOKIE_NAME`          | string  | `discover_cairo_token`  | Cookie name for the session token                                          |
| `CLIENT_ORIGIN`        | string  | `http://localhost:5173` | Allowed client origin for CORS and state-mutating CSRF validation          |
| `RATE_LIMIT_WINDOW_MS` | number  | `900000`                | Rate limiter window in ms (15 minutes)                                     |
| `RATE_LIMIT_MAX`       | number  | `200`                   | Max requests per IP in the window                                          |
| `AUTH_RATE_LIMIT_MAX`  | number  | `10`                    | Max auth requests (login/register) per IP in the window                    |
| `ENABLE_DEMO_ACTIONS`  | boolean | `true` (dev)            | Enables `/simulate-confirm` for demo workflows                             |

> [!CAUTION]
> Never print, echo, commit, or log `MONGODB_URI` or `JWT_SECRET`. Logs are sanitized to prevent credential exposure.

---

## 3. Database Seeding & Safety Safeguards

The database seed runner (`server/src/seed/seed.ts`) populates catalog collections and an initial development test user.

### Key Characteristics:

1. **Direct Seed Ingestion:** Ingests catalog data directly from `client/src/services/mock/seed/` via TypeScript AST transpilation. No duplication of place or accommodation definitions.
2. **Strict Idempotency:** Uses stable string IDs (`Place.id`, `Accommodation.id`, etc.) and `findOneAndUpdate({ id }, { ... }, { upsert: true })`. Running the seed script multiple times produces identical records with zero duplicates.
3. **Production Protection:** Destructive collection resets (`deleteMany`) are **permanently blocked** when `NODE_ENV=production`. There is no override or environment variable bypass.
4. **Dev Test User:** Automatically upserts a verified test user in non-production environments with a pre-hashed Argon2 password.

### Running the Seed Script

To seed the database specified in your `server/.env`:

```bash
# Seed catalog and dev test user
npx tsx server/src/seed/seed.ts

# Or with reset in development (erases trips/bookings, preserves catalog)
RESET=true npx tsx server/src/seed/seed.ts
```

---

## 4. Running the Server

### Development Mode

Starts the Express server with live TypeScript reloading using `tsx watch`:

```bash
# Start server only (http://localhost:4000)
npm run dev:server

# Or start client + server concurrently from root
npm run dev
```

### Production Build & Execution

Compiles TypeScript to standard NodeNext JavaScript in `server/dist/`:

```bash
# Build server
npm run build --workspace server

# Run compiled server
node server/dist/index.js
```

---

## 5. Security Architecture

1. **Argon2 Password Hashing:** Uses `argon2id` with recommended memory and time cost parameters. Timing-safe verification prevents timing side-channel attacks.
2. **httpOnly Cookie Authentication:** JWTs are delivered exclusively in `httpOnly`, `sameSite: 'lax'` cookies with `secure: true` in production. Client-side JavaScript cannot read or extract tokens.
3. **Centralized CSRF & Origin Defense:**
   - Every state-mutating request (`POST`, `PUT`, `PATCH`, `DELETE`) is checked against `CLIENT_ORIGIN`.
   - Cross-site requests (`sec-fetch-site: cross-site`) and unauthorized origins are rejected with `403 Forbidden`.
   - Standard HTML form submissions (`application/x-www-form-urlencoded`, `multipart/form-data`) are blocked with `400 Bad Request`.
   - Client API calls send custom header `X-Requested-With: XMLHttpRequest`.
4. **Strict Helmet & CORS Whitelisting:** Standard security headers (HSTS, frameguard, noSniff, xssFilter) and origin reflection strictly restricted to `CLIENT_ORIGIN`.
5. **Rate Limiting:** Protects against credential brute-forcing (10 requests/15m) and API scraping/denial of service (200 requests/15m).
6. **Resource Ownership & Optimistic Locking:**
   - Database queries scope trips and booking requests by authenticated `userId`.
   - Itinerary saves enforce integer `version` comparison to prevent race conditions and concurrent write overwrites.

---

## 6. Project Layout & Layering

```
server/src/
├── app.ts                 # Express application initialization & middleware stack
├── index.ts               # Server entry point, DB connection & graceful shutdown
├── config/
│   ├── env.ts             # Zod schema validation for environment variables
│   └── database.ts        # Mongoose connection & lifecycle management
├── errors/
│   └── ApiError.ts        # Typed API error hierarchy
├── middleware/
│   ├── auth.ts            # JWT authentication & session verification
│   ├── csrf.ts            # Centralized Origin & CSRF protection
│   ├── errorHandler.ts    # Centralized error formatter (sanitizes 500s in prod)
│   ├── rateLimiter.ts     # IP rate limiters for API and Auth
│   ├── requestLogger.ts   # Sanitized request logger (masks passwords/tokens)
│   └── validate.ts        # Generic Zod validation middleware
├── models/
│   ├── User.ts            # User model with Argon2 password hash
│   ├── Place.ts           # Places catalog model with geo coordinates
│   ├── Accommodation.ts   # Accommodation options model
│   ├── TransportOption.ts # Transport options model
│   ├── ReadyMadeTrip.ts   # Curated ready-made trips model
│   ├── Trip.ts            # User trip with embedded days and activities
│   └── BookingRequest.ts  # Hybrid booking request with status audit trail
├── controllers/
│   ├── auth.controller.ts # Authentication endpoint handlers
│   └── api.controller.ts  # Catalog, places, trips, and bookings handlers
├── routes/
│   ├── auth.routes.ts     # /api/auth routes
│   ├── places.routes.ts   # /api/places routes
│   ├── catalog.routes.ts  # /api/catalog routes
│   └── userResources.routes.ts # /api/trips and /api/bookings routes
├── services/
│   ├── auth.service.ts    # User registration, authentication, token issuance
│   ├── places.service.ts  # Places query & search service
│   ├── catalog.service.ts # Accommodation, transport, ready-made trips
│   ├── trips.service.ts   # Trip CRUD, optimistic locking, draft place addition
│   └── bookings.service.ts# Booking requests, state machine, demo confirm
├── utils/
│   ├── cookies.ts         # Cookie setters and clearers
│   └── jwt.ts             # JWT signing and verification
└── validation/
    ├── auth.validation.ts # Zod schemas for register/login
    └── api.validation.ts  # Zod schemas for trips, bookings, place queries
```
