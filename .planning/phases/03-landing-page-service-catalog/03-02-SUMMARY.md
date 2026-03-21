---
phase: 03-landing-page-service-catalog
plan: 02
subsystem: ui
tags: [react, next-intl, tailwind, shadcn, supabase, lucide-react]

# Dependency graph
requires:
  - phase: 03-01
    provides: catalog.ts pure functions, SLUG_CATEGORY, calculatePrice, calculateSavings, i18n translation keys, shadcn ui components (tabs, card, badge)
  - phase: 01-foundation
    provides: brand CSS tokens, Logo component, supabase server client, next-intl routing
  - phase: 02-slot-engine-booking-api
    provides: VehicleSurcharge data from Supabase vehicle_surcharges table

provides:
  - NavBar (sticky, logo, anchor links, mobile hamburger, locale toggle)
  - HeroSection (gradient background, logo, tagline, CTA scrolling to #services, 3 badges)
  - AboutSection (brand paragraph from translations in navy-light card)
  - ServiceCatalog (client component with vehicle selector, tabbed Interior/Exterior/Pacotes filtering)
  - VehicleSelector (4-button toggle, real-time price updates without page reload)
  - ServiceCard (name, description, duration badge, vehicle-adjusted price with children slot)
  - ExtrasPanel (4 checkbox extras with running total for interior-express card)
  - PackageCard (crossed-out individual price, bundle price, savings badge)
  - ContactSection (phone click-to-call, email mailto, Maps link, Instagram link)
  - page.tsx rewritten as server component fetching services + surcharges from Supabase

affects:
  - phase-04-booking-flow (ExtrasPanel selections to be consumed; CTA button to open booking flow)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server components use getTranslations (async), client components use useTranslations
    - Data fetched once at server render in page.tsx, passed as props to client components
    - VehicleType surcharge map built client-side from server-fetched VehicleSurcharge array
    - Children slot pattern in ServiceCard for ExtrasPanel injection
    - Graceful degradation: Supabase fetch errors render page with empty arrays

key-files:
  created:
    - jetwash24/src/components/NavBar.tsx
    - jetwash24/src/components/MobileMenu.tsx
    - jetwash24/src/components/HeroSection.tsx
    - jetwash24/src/components/AboutSection.tsx
    - jetwash24/src/components/ContactSection.tsx
    - jetwash24/src/components/ServiceCatalog.tsx
    - jetwash24/src/components/VehicleSelector.tsx
    - jetwash24/src/components/ServiceCard.tsx
    - jetwash24/src/components/ExtrasPanel.tsx
    - jetwash24/src/components/PackageCard.tsx
  modified:
    - jetwash24/src/app/[locale]/page.tsx

key-decisions:
  - "HeroSection uses inline style for CSS gradient (linear-gradient 135deg #0B1F3A to #009BB0) — Tailwind arbitrary value would be verbose and less readable"
  - "ExtrasPanel is self-contained display-only state — no booking state in Phase 3, Phase 4 will consume selections"
  - "ServiceCard uses children slot for ExtrasPanel injection — keeps ServiceCard reusable without coupling to extras logic"
  - "page.tsx logs fetch errors server-side and renders with empty arrays — ServiceCatalog emptyState translation handles user-facing message"
  - "MobileMenu uses plain anchor href for locale switch instead of next-intl Link — avoids client component needing locale routing awareness"

patterns-established:
  - "Server component data flow: fetch in page.tsx server component, pass as props to client components"
  - "All text via next-intl: getTranslations in server components, useTranslations in client components"
  - "Brand class pattern: bg-brand-navy-light for card surfaces, border-brand-cyan/20 for borders, text-brand-cyan for accent icons"

requirements-completed: [SERV-01, SERV-02, SERV-03, SERV-04, CONT-01, CONT-02, DSGN-04]

# Metrics
duration: 5min
completed: 2026-03-21
---

# Phase 03 Plan 02: Landing Page Components Summary

**Full single-page homepage: sticky NavBar, gradient HeroSection, AboutSection, tabbed ServiceCatalog with real-time vehicle price switching, and ContactSection — all wired via Supabase server fetch in page.tsx with zero hardcoded strings**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T15:24:04Z
- **Completed:** 2026-03-21T15:28:20Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- 10 new component files created (5 server, 5 client) covering full homepage layout
- ServiceCatalog with live vehicle type switching updates all card prices instantly client-side from server-fetched surcharge data
- page.tsx rewritten as async server component fetching Supabase data and wiring all sections in correct order

## Task Commits

Each task was committed atomically:

1. **Task 1: NavBar + MobileMenu + HeroSection + AboutSection + ContactSection** - `ce348ae` (feat)
2. **Task 2: ServiceCatalog + VehicleSelector + ServiceCard + ExtrasPanel + PackageCard** - `496b9ba` (feat)
3. **Task 3: Wire page.tsx with Supabase data fetch** - `4c4e29f` (feat)

**Plan metadata:** (docs commit — created after self-check)

## Files Created/Modified

- `jetwash24/src/components/NavBar.tsx` - Sticky server component nav with logo, anchor links, locale toggle, MobileMenu
- `jetwash24/src/components/MobileMenu.tsx` - Client component hamburger with useState toggle and full-width dropdown
- `jetwash24/src/components/HeroSection.tsx` - Server component with gradient, Logo, tagline, CTA anchor, 3 icon badges
- `jetwash24/src/components/AboutSection.tsx` - Server component with brand paragraph in navy-light card
- `jetwash24/src/components/ContactSection.tsx` - Server component with phone, email, Maps, Instagram links
- `jetwash24/src/components/ServiceCatalog.tsx` - Client component orchestrating vehicle selector + tabs + card grids
- `jetwash24/src/components/VehicleSelector.tsx` - Client 4-button toggle for citadino/berlina/suv/carrinha
- `jetwash24/src/components/ServiceCard.tsx` - Client card with icon, name, description, duration badge, price, children slot
- `jetwash24/src/components/ExtrasPanel.tsx` - Client checkbox list for 4 interior extras with running total
- `jetwash24/src/components/PackageCard.tsx` - Client card with line-through individual price and savings badge
- `jetwash24/src/app/[locale]/page.tsx` - Rewritten async server component with Supabase fetch + all section wiring

## Decisions Made

- HeroSection uses inline style for CSS gradient — Tailwind arbitrary values would be verbose
- ExtrasPanel is display-only in Phase 3 — Phase 4 booking flow will consume selected extras
- ServiceCard uses children slot for ExtrasPanel injection, keeping the card reusable
- page.tsx logs Supabase errors server-side and renders with empty arrays for graceful degradation
- MobileMenu uses plain anchor for locale switch to avoid needing routing locale awareness in a client component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all components type-checked clean on first pass, all 34 tests passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full homepage is visually complete and ready for Phase 4 booking flow integration
- ExtrasPanel selections are display-only state; Phase 4 will pass them into the booking form
- CTA button currently anchors to #services; Phase 4 will replace it with booking modal trigger
- All Supabase data dependencies (services + vehicle_surcharges) are production-ready from Phase 1 seed

---
*Phase: 03-landing-page-service-catalog*
*Completed: 2026-03-21*
