---
phase: 03-landing-page-service-catalog
plan: 01
subsystem: ui
tags: [shadcn, vitest, i18n, next-intl, typescript, tailwind]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: globals.css brand tokens, database types (Service, VehicleType), next-intl i18n setup
  - phase: 02-slot-engine-booking-api
    provides: booking API, confirmed existing services with slugs from seed.sql
provides:
  - shadcn UI components: tabs, card, badge, separator installed in src/components/ui/
  - catalog.ts pure functions: calculatePrice, calculateSavings, SLUG_CATEGORY, PACKAGE_COMPONENTS
  - Unit tests for price/savings calculations (17 tests, 100% pass)
  - Complete PT and EN translation keys for Phase 3 (HomePage, Services, Contact, Nav namespaces)
  - Smooth scroll enabled in globals.css
affects:
  - 03-02 (hero section component — uses translation keys and catalog.ts)
  - 03-03 (service catalog component — uses shadcn components, calculatePrice, calculateSavings, translations)

# Tech tracking
tech-stack:
  added: [shadcn/tabs, shadcn/card, shadcn/badge, shadcn/separator]
  patterns: [TDD red-green for pure functions, pure calculation functions in src/lib/, translation keys per namespace in messages/]

key-files:
  created:
    - jetwash24/src/lib/catalog.ts
    - jetwash24/src/__tests__/catalog.test.ts
    - jetwash24/src/components/ui/tabs.tsx
    - jetwash24/src/components/ui/card.tsx
    - jetwash24/src/components/ui/badge.tsx
    - jetwash24/src/components/ui/separator.tsx
  modified:
    - jetwash24/messages/pt.json
    - jetwash24/messages/en.json
    - jetwash24/src/app/globals.css

key-decisions:
  - "calculateSavings clamps to 0 when saving is negative (never show negative badge) — Math.max(0, ...)"
  - "SLUG_CATEGORY and PACKAGE_COMPONENTS are plain record constants (not functions) — simpler lookup, tree-shakeable"
  - "Translation keys use flat keys within namespace (e.g. Services.tab_interior) not nested objects — consistent with next-intl useTranslations pattern"

patterns-established:
  - "Pure functions pattern: business logic in src/lib/*.ts with zero framework dependencies, unit-tested with vitest"
  - "Translation namespace pattern: HomePage, Services, Contact, Nav, Navigation, Common — each section has own namespace"
  - "TDD red-green: write failing tests first, commit as test(), implement as feat()"

requirements-completed: [SERV-02, SERV-04]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 3 Plan 01: Foundation — shadcn Components, Catalog Pure Functions, and i18n Keys Summary

**shadcn UI components (tabs/card/badge/separator) installed, calculatePrice/calculateSavings pure functions unit-tested (17 tests green), and complete PT+EN translation keys for all Phase 3 sections added**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-21T10:42:16Z
- **Completed:** 2026-03-21T10:44:16Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- 4 shadcn UI components installed (tabs, card, badge, separator) — ready for service catalog UI
- catalog.ts with 4 exports: calculatePrice, calculateSavings, SLUG_CATEGORY, PACKAGE_COMPONENTS — all unit-tested with TDD approach
- PT and EN translation files expanded from 3 keys each to complete Phase 3 coverage (HomePage, Services, Contact, Nav namespaces)
- Smooth scroll enabled globally via globals.css html rule

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing catalog tests** - `fab92a1` (test)
2. **Task 1 (GREEN): catalog.ts implementation + shadcn install** - `870e04e` (feat)
3. **Task 2: Translation keys + smooth scroll** - `a101aec` (feat)

_Note: TDD task split into test commit (RED) and feat commit (GREEN) per TDD protocol._

## Files Created/Modified

- `jetwash24/src/lib/catalog.ts` — Pure functions: calculatePrice, calculateSavings; constants: SLUG_CATEGORY, PACKAGE_COMPONENTS
- `jetwash24/src/__tests__/catalog.test.ts` — 17 unit tests covering all calculation behaviors and edge cases
- `jetwash24/src/components/ui/tabs.tsx` — shadcn Tabs component (installed)
- `jetwash24/src/components/ui/card.tsx` — shadcn Card component (installed)
- `jetwash24/src/components/ui/badge.tsx` — shadcn Badge component (installed)
- `jetwash24/src/components/ui/separator.tsx` — shadcn Separator component (installed)
- `jetwash24/messages/pt.json` — Expanded with HomePage (tagline, about, catalogCta, badges), Services (tabs, vehicles, saving, extras), Contact, Nav namespaces
- `jetwash24/messages/en.json` — Same structure with English values
- `jetwash24/src/app/globals.css` — Added scroll-behavior: smooth to html rule in @layer base

## Decisions Made

- calculateSavings clamps negative savings to 0 with Math.max(0, ...) — prevents showing "Save -5€" badge for full-detailing on citadino
- SLUG_CATEGORY and PACKAGE_COMPONENTS are plain record constants (not functions) — simpler lookup, tree-shakeable by bundler
- Translation keys use flat structure within namespace (e.g. Services.tab_interior) consistent with next-intl useTranslations('Services')('tab_interior') pattern

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- shadcn tabs/card/badge/separator ready for service catalog component (03-03)
- calculatePrice and calculateSavings ready to drive price display with surcharge selection
- All translation keys available for hero section (03-02) and catalog (03-03) components to reference immediately
- No blockers for subsequent Phase 3 plans

---
*Phase: 03-landing-page-service-catalog*
*Completed: 2026-03-21*
