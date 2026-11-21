# Decisions

**Status:** Phase 1 — design system implemented; pending review  
**Last updated:** 2026-11-21

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
- Phases 0 and 1 are local-only. Hosting providers are undecided.
- Base branch: `main`. Phase work uses dedicated branches: `phase-0-setup` and, currently, `phase-1-design-system`.
- Phase 0 is committed. Phase 1 is implemented but remains uncommitted and unpushed pending review.

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
- No test runner is installed because there is no product logic to test yet.
- Phase 1 added Framer Motion and self-hosted Fontsource packages for Playfair Display and Plus Jakarta Sans. No icon library was added.

## Design system (Phase 1)

- Tailwind CSS v4 tokens are configured CSS-first in `client/src/styles/theme.css` from the Stitch design system. There is no `tailwind.config.*`.
- The canvas is `#F7F3EC`; primary surfaces use `#1F1F1F` (`#060607` is the primary token), and secondary/interactive text is `#775928`. `#B08D57` and `#D9C7A3` are decorative bronze/sand aliases and are not used for text or interactive contrast.
- Typography is Playfair Display for editorial/display text and Plus Jakarta Sans for interface and body text, self-hosted through Fontsource. This resolves the `docs/PLAN.md` §3 Inter reference in favor of `DESIGN.md` and the Stitch exports.
- Implemented primitives: Container, Section, Button, Card, Chip, Badge/StatusBadge, Input, Select, Tabs, and Modal. Navbar and Footer are presentational only, with no routing or invented product links.
- Slider, DatePicker, Toast, and Skeleton are deferred until their screen designs exist.
- Component APIs are typed. Styling uses a small `cn` class joiner; no CVA, `tailwind-merge`, or icon library was added.
- Framer Motion is limited to shared variants and coordinated entrances. CSS handles hover and focus transitions; `MotionConfig reducedMotion="user"` and global CSS honour reduced-motion preferences. There are no ambient loops.
- The temporary showcase at `/` reviews tokens, typography, components, motion, and a static English RTL preview. It is not a product page and will be replaced in Phase 2.
- Phase 1 is implemented but not yet approved. Do not start Phase 2 or add product routes without explicit approval.

## Localization

- English is the default language. Arabic is supported, including RTL direction.
- Localization uses `i18next` and `react-i18next`.
- The selected language is stored in `localStorage` under `discover-cairo.language`; English is used when no valid preference exists.
- The MVP does not use locale-prefixed URLs, preserving the route plan in `docs/PLAN.md`.
- Runtime language changes update `<html lang>` and `<html dir>` to `ltr` or `rtl`.
- UI copy will live in translation resources rather than hardcoded component strings once UI work begins. The Phase 1 showcase copy is review-only.
- Layouts will use flow-relative CSS/Tailwind properties and `rtl:` variants where necessary. No RTL-specific plugin is selected. Phase 1 adds logical-property RTL foundations and a static English RTL preview only.
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
