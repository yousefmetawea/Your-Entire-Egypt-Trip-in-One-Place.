# Decisions

**Status:** Phase 0 — alignment and setup  
**Last updated:** 2026-11-20

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
- Phase 0 is local-only. Hosting providers are undecided.
- Base branch: `main`. Phase work uses dedicated phase branches; this phase uses `phase-0-setup`.
- No Git commit or push is part of Phase 0.

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
- React Router is deferred to Phase 2.
- MongoDB, Mongoose, authentication, CORS, rate limiting, and product API routes are deferred to their planned phases.
- No test runner is installed in Phase 0 because there is no product logic to test yet.

## Localization

- English is the default language. Arabic is supported, including RTL direction.
- Localization uses `i18next` and `react-i18next`.
- The selected language is stored in `localStorage` under `discover-cairo.language`; English is used when no valid preference exists.
- The MVP does not use locale-prefixed URLs, preserving the route plan in `docs/PLAN.md`.
- Runtime language changes update `<html lang>` and `<html dir>` to `ltr` or `rtl`.
- UI copy will live in translation resources rather than hardcoded component strings once UI work begins.
- Layouts will use flow-relative CSS/Tailwind properties and `rtl:` variants where necessary. No RTL-specific plugin is selected.
- Dates, numbers, and currency will use built-in `Intl` APIs.
- Dynamic content such as place names and descriptions will use a localized shape (English required, Arabic optional, English fallback). The exact data and API shape will be finalized in Phase 2/10.
- User-generated content will not be translated automatically.
- Arabic typography, Arabic product naming, translation voice/dialect, and mirrored visual layouts are not present in the Stitch exports. They require user approval before implementation.

## Deferred product decisions requested by `docs/PLAN.md` §9

- Final product name and logo.
- Project deadline and weekly available hours.
- Hosting for the client, server, and database.
- Map provider and API key.
- AI provider/key or rule-based fallback.
- Whether budget alerts and PDF export are MVP or later.
- Source of final place content, photos, prices, and Arabic translations.
- Mobile-specific visual designs.
