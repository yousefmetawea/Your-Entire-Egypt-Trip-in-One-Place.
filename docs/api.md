# Discover Cairo REST API Documentation

This document specifies the backend REST API implemented in Express 5 + TypeScript + MongoDB (Mongoose) for Phase 10.

---

## 1. Overview & Conventions

- **Base URL:** `/api` (e.g. `http://localhost:4000/api` or via Vite reverse proxy `/api`)
- **Format:** All requests and responses use standard JSON (`application/json`).
- **No Secrets Policy:** Passwords and credentials are never returned in responses or exposed in logs.
- **Client Disclosures:** All prices are estimated. Data includes `isDemo: true` where applicable.

---

## 2. Authentication, Cookies & Security

### Cookie Configuration

Authentication uses JSON Web Tokens (JWT) stored in a secure, server-managed HTTP cookie:

- **Cookie name:** `discover_cairo_token`
- **Lifespan:** 7 days (`maxAge: 7 * 24 * 60 * 60 * 1000`)
- **httpOnly:** `true` (Tokens cannot be accessed, read, or stolen by JavaScript)
- **sameSite:** `'lax'`
- **secure:** `false` in development, `true` in production (`NODE_ENV === 'production'`)

### Centralized CSRF & Origin Protection

All state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) pass through central security middleware:

1. **Origin Verification:** The `Origin` header must match the configured `CLIENT_ORIGIN` (default: `http://localhost:5173`). Cross-origin requests from untrusted origins or `sec-fetch-site: cross-site` are blocked with `403 Forbidden`.
2. **Content-Type Enforcement:** Requests with a payload body must supply `Content-Type: application/json`. Standard HTML form submissions (`application/x-www-form-urlencoded`, `multipart/form-data`) are rejected with `400 Bad Request`.
3. **Custom Header Check:** Clients send the `X-Requested-With: XMLHttpRequest` header to prevent cross-site request forgery via standard browser form submissions.

### Rate Limiting

- **Global API limiter:** 200 requests per 15-minute window per IP.
- **Strict Auth limiter:** 10 requests per 15-minute window per IP on login and registration endpoints.

---

## 3. Error Response Format

All error responses return a standardized JSON structure with appropriate HTTP status codes:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Invalid email address format",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      }
    ]
  }
}
```

### Standard Status Codes

| HTTP Status | Error Code                   | Description                                                                    |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `400`       | `VALIDATION` / `BAD_REQUEST` | Malformed payload or validation schema failure                                 |
| `401`       | `UNAUTHORIZED`               | Missing or invalid authentication cookie                                       |
| `403`       | `FORBIDDEN`                  | Origin mismatch or accessing another user's private resource                   |
| `404`       | `NOT_FOUND`                  | Requested entity does not exist                                                |
| `409`       | `CONFLICT`                   | Optimistic concurrency conflict (version mismatch) or email already registered |
| `429`       | `RATE_LIMITED`               | Rate limit threshold exceeded                                                  |
| `500`       | `INTERNAL_ERROR`             | Unexpected server error (stack traces hidden in production)                    |

---

## 4. Endpoints

### 4.1. System & Health

#### `GET /api/health`

Health check for uptime monitors and container orchestrators.

- **Auth:** Public
- **Response `200 OK`:**

```json
{
  "status": "ok",
  "environment": "development",
  "database": "connected"
}
```

---

### 4.2. Authentication

#### `POST /api/auth/register`

Creates a new user account with Argon2 password hashing and establishes a session cookie.

- **Auth:** Public (Strict rate limited)
- **Request Body:**

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Password123"
}
```

- **Response `201 Created`:** Sets `discover_cairo_token` cookie.

```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "role": "user"
  }
}
```

#### `POST /api/auth/login`

Authenticates existing user credentials via timing-safe Argon2 verification.

- **Auth:** Public (Strict rate limited)
- **Request Body:**

```json
{
  "email": "alex@example.com",
  "password": "Password123"
}
```

- **Response `200 OK`:** Sets `discover_cairo_token` cookie.

```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "role": "user"
  }
}
```

#### `GET /api/auth/me`

Restores user session from the httpOnly authentication cookie.

- **Auth:** Protected (Requires valid `discover_cairo_token`)
- **Response `200 OK`:**

```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "role": "user"
  }
}
```

#### `POST /api/auth/logout`

Clears the session cookie.

- **Auth:** Public / Protected
- **Response `200 OK`:** Clears `discover_cairo_token` cookie.

```json
{
  "message": "Logged out successfully"
}
```

---

### 4.3. Catalog & Places

#### `GET /api/places`

List places with optional search and filters.

- **Auth:** Public
- **Query Parameters:**
  - `search` (string, optional): Full-text or name search.
  - `area` (string, optional): Area filter (`giza`, `downtown-cairo`, `islamic-cairo`, `coptic-cairo`, etc.).
  - `category` (string, optional): Category filter (`history`, `culture`, `adventure`).
  - `page` (number, default: 1): Page number.
  - `limit` (number, default: 50, max: 100): Results per page.
- **Response `200 OK`:**

```json
{
  "places": [
    {
      "id": "great-pyramids-of-giza",
      "slug": "great-pyramids-of-giza",
      "name": { "en": "Great Pyramids of Giza" },
      "area": "giza",
      "category": "history",
      "description": { "en": "..." },
      "images": [],
      "location": { "lat": 29.9792, "lng": 31.1342 },
      "isDemo": true
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 50
}
```

#### `GET /api/places/slug/:slug`

Get place details by unique slug.

- **Auth:** Public
- **Response `200 OK`:**

```json
{
  "place": {
    "id": "great-pyramids-of-giza",
    "slug": "great-pyramids-of-giza",
    "name": { "en": "Great Pyramids of Giza" },
    "area": "giza",
    "category": "history",
    "openingHours": null,
    "ticketPrice": { "amount": 540, "currency": "EGP", "isEstimated": true },
    "avgVisitMinutes": 180,
    "nearbyPlaceIds": ["grand-egyptian-museum"],
    "isDemo": true
  }
}
```

#### `GET /api/places/:id/nearby`

Get nearby places for a given place ID.

- **Auth:** Public
- **Query Parameters:**
  - `limit` (number, default: 3)
- **Response `200 OK`:**

```json
{
  "nearby": [ ... ]
}
```

#### `GET /api/catalog/accommodation`

List accommodation options.

- **Auth:** Public
- **Query Parameters:** `type` (`hotel` | `hostel`), `tier` (`essential` | `balanced` | `signature`)
- **Response `200 OK`:** `{ "accommodations": [ ... ] }`

#### `GET /api/catalog/accommodation/:id`

Get accommodation details by stable ID.

- **Auth:** Public
- **Response `200 OK`:** `{ "accommodation": { ... } }`

#### `GET /api/catalog/transport`

List transportation options.

- **Auth:** Public
- **Query Parameters:** `type` (`transfer` | `private-car` | `bus` | `metro`)
- **Response `200 OK`:** `{ "transportOptions": [ ... ] }`

#### `GET /api/catalog/ready-made-trips`

List curated ready-made trips.

- **Auth:** Public
- **Response `200 OK`:** `{ "trips": [ ... ] }`

---

### 4.4. Trips (User Resource)

#### `GET /api/trips`

List trips owned by the authenticated user.

- **Auth:** Protected
- **Response `200 OK`:**

```json
{
  "trips": [
    {
      "id": "trip_0e39cfb8-...",
      "userId": "usr_...",
      "title": "4 Days Cairo Exploration",
      "startDate": "2026-11-25",
      "endDate": "2026-11-28",
      "travelers": 2,
      "status": "draft",
      "days": [ ... ],
      "version": 1
    }
  ]
}
```

#### `POST /api/trips`

Create a new trip for the authenticated user.

- **Auth:** Protected
- **Request Body:**

```json
{
  "title": "Cairo Winter Getaway",
  "startDate": "2026-12-01",
  "endDate": "2026-12-05",
  "travelers": 2,
  "budgetTier": "balanced",
  "interests": ["history", "culture"],
  "preferences": {
    "accommodationType": "hotel",
    "transportType": "transfer"
  }
}
```

- **Response `201 Created`:** `{ "trip": { ... } }`

#### `GET /api/trips/:id`

Get a specific trip by ID.

- **Auth:** Protected (Enforces ownership; returns `403` if owned by another user)
- **Response `200 OK`:** `{ "trip": { ... } }`

#### `PATCH /api/trips/:id`

Update trip properties. Increments `version`.

- **Auth:** Protected (Enforces ownership)
- **Request Body (all fields optional):**

```json
{
  "title": "Updated Cairo Itinerary",
  "travelers": 3,
  "status": "upcoming",
  "accommodationId": "acc-mena-house",
  "savedPlaceIds": ["great-pyramids-of-giza"]
}
```

- **Response `200 OK`:** `{ "trip": { ... } }`

#### `PUT /api/trips/:id/itinerary`

Save modified days/activities with optimistic concurrency control.

- **Auth:** Protected (Enforces ownership)
- **Request Body:**

```json
{
  "title": "Refined Itinerary",
  "days": [ ... ],
  "version": 1
}
```

- **Response `200 OK`:** Returns `{ "trip": { ... } }` with incremented `version: 2`.
- **Response `409 Conflict`:** Returned if client `version` does not match server `version`.

#### `DELETE /api/trips/:id`

Deletes a user's trip.

- **Auth:** Protected (Enforces ownership)
- **Response `200 OK`:** `{ "message": "Trip deleted successfully" }`

#### `POST /api/trips/draft/place`

Adds a place to the user's active draft trip (creates a draft trip if none exists).

- **Auth:** Protected
- **Request Body:**

```json
{
  "placeId": "great-pyramids-of-giza"
}
```

- **Response `200 OK`:**

```json
{
  "trip": { ... },
  "dayId": "day_...",
  "activity": { ... },
  "added": true,
  "createdTrip": false
}
```

---

### 4.5. Booking Requests (Hybrid Model)

#### `GET /api/bookings`

List booking requests created by the authenticated user.

- **Auth:** Protected
- **Response `200 OK`:** `{ "bookings": [ ... ] }`

#### `POST /api/bookings`

Submit an internal booking request. Requests start in `pending` status.

- **Auth:** Protected
- **Request Body (Airport Transfer example):**

```json
{
  "kind": "airport-transfer",
  "tripId": "trip_...",
  "details": {
    "pickupLocation": "Cairo International Airport (CAI)",
    "dropoffLocation": "Downtown Cairo Hotel",
    "date": "2026-11-25",
    "time": "14:00",
    "passengers": 2,
    "flightNumber": "MS777",
    "notes": "Extra luggage"
  }
}
```

- **Response `201 Created`:**

```json
{
  "booking": {
    "id": "req_...",
    "userId": "usr_...",
    "kind": "airport-transfer",
    "status": "pending",
    "statusHistory": [
      {
        "status": "pending",
        "changedAt": "2026-11-23T14:00:00.000Z",
        "note": "Initial request submitted"
      }
    ],
    "version": 1
  }
}
```

#### `GET /api/bookings/:id`

Get booking request details and audit history.

- **Auth:** Protected (Enforces ownership)
- **Response `200 OK`:** `{ "booking": { ... } }`

#### `POST /api/bookings/:id/cancel`

Cancel a pending request. Confirmed or completed requests cannot be cancelled.

- **Auth:** Protected (Enforces ownership)
- **Response `200 OK`:** `{ "booking": { "status": "cancelled", ... } }`

#### `POST /api/bookings/:id/simulate-confirm`

Developer / Demo control to transition a pending request to `confirmed`.

- **Auth:** Protected (Enforces ownership)
- **Security Guard:** Strictly rejected with `403 Forbidden` unless `ENABLE_DEMO_ACTIONS=true` in server environment.
- **Response `200 OK`:** `{ "booking": { "status": "confirmed", ... } }`
