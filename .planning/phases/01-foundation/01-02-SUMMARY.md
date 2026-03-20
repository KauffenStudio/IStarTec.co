---
phase: 01-foundation
plan: 02
subsystem: database
tags: [supabase, postgres, sql, typescript, btree_gist, exclusion-constraint, rls]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Project scaffold with jetwash24/ directory, supabase.ts client, TypeScript config

provides:
  - Postgres migration with btree_gist extension, 3 tables, exclusion constraint (TECH-01), RLS, and indexes
  - Seed data: 6 services from PROJECT.md catalog with correct prices and durations
  - Seed data: 4 vehicle surcharges (citadino 0, berlina +5, SUV +10, carrinha +15)
  - TypeScript interfaces: Service, VehicleSurcharge, Booking
  - TypeScript types: BookingStatus, VehicleType, ServiceInsert, BookingInsert

affects: [02-slot-engine, 03-ui, 04-booking-flow, 05-email]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Postgres exclusion constraint with btree_gist + tstzrange for atomic double-booking prevention"
    - "RLS enabled on all tables: public read for catalog, anon insert for bookings, no client-side updates"
    - "TypeScript database types mirroring schema columns — Service, Booking, VehicleSurcharge interfaces"
    - "Seed data in supabase/seed.sql as canonical source for service catalog and vehicle surcharges"

key-files:
  created:
    - jetwash24/supabase/migrations/001_initial_schema.sql
    - jetwash24/supabase/seed.sql
    - jetwash24/src/types/database.ts
  modified: []

key-decisions:
  - "btree_gist extension enabled at migration top before any table creation — prevents constraint failure"
  - "Exclusion constraint uses tstzrange(start_time, end_time) WITH && filtered by status = 'confirmed' only — allows re-booking cancelled slots"
  - "cancel_token is UUID stored in bookings table (not JWT) — matches decision from STATE.md"
  - "RLS policy: bookings has INSERT-only anon access — no client-side reads or updates, queries go through server functions"

patterns-established:
  - "Pattern: btree_gist before EXCLUDE USING gist — extension must precede constraint in migration"
  - "Pattern: partial exclusion constraint WHERE status = 'confirmed' — cancelled bookings don't block new bookings"
  - "Pattern: TypeScript types in src/types/database.ts mirror schema exactly — update when schema changes"

requirements-completed: [TECH-01]

# Metrics
duration: 2min
completed: 2026-03-20
---

# Phase 01 Plan 02: Database Schema and Types Summary

**Postgres schema with btree_gist exclusion constraint (TECH-01), 6-service seed catalog, and TypeScript database types for Supabase**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-20T21:36:31Z
- **Completed:** 2026-03-20T21:38:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created complete Supabase migration with btree_gist extension, services/vehicle_surcharges/bookings tables, exclusion constraint preventing overlapping confirmed bookings (TECH-01), 3 performance indexes, and RLS with public read + anon insert policies
- Seeded 6 services from PROJECT.md catalog (interior-express, exterior-express, exterior-premium, exterior-interior, interior-premium, full-detailing) with exact prices and durations
- Exported TypeScript interfaces (Service, VehicleSurcharge, Booking) and types (BookingStatus, VehicleType, ServiceInsert, BookingInsert) that compile cleanly and mirror schema columns exactly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migration with schema, exclusion constraint, RLS, and indexes** - `c5a5131` (feat)
2. **Task 2: Create seed data and TypeScript database types** - `bffb6e7` (feat)

## Files Created/Modified

- `jetwash24/supabase/migrations/001_initial_schema.sql` - Complete schema: btree_gist extension, services/vehicle_surcharges/bookings tables, TECH-01 exclusion constraint, indexes, RLS policies
- `jetwash24/supabase/seed.sql` - 6 service rows + 4 vehicle surcharge rows from PROJECT.md catalog
- `jetwash24/src/types/database.ts` - TypeScript interfaces and types mirroring schema columns

## Decisions Made

- btree_gist extension placed as first statement in migration to guarantee it exists before the exclusion constraint is created
- Exclusion constraint filtered with `WHERE (status = 'confirmed')` — cancelled bookings do not block the same time slot from being rebooked
- cancel_token stored as UUID in the bookings table per the decision in STATE.md (simpler than JWT at this scale)
- RLS policy grants bookings INSERT-only access to anon users — SELECT/UPDATE/DELETE must go through server-side Supabase client

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Migration and seed data require manual Supabase deployment before Phase 2 work begins.**

When the Supabase project is connected:
1. Run the migration: `supabase db push` or paste `jetwash24/supabase/migrations/001_initial_schema.sql` into the Supabase SQL editor
2. Run the seed: paste `jetwash24/supabase/seed.sql` into the Supabase SQL editor
3. Verify: `SELECT count(*) FROM services` should return 6; `SELECT count(*) FROM vehicle_surcharges` should return 4
4. Verify btree_gist is active: `SELECT * FROM pg_extension WHERE extname = 'btree_gist'` should return 1 row

**Note:** btree_gist availability on Supabase free tier was flagged as a concern in STATE.md. Evidence from official Supabase docs confirms it is a standard bundled extension with no tier restrictions, but this should be confirmed after the first migration run.

## Next Phase Readiness

- Migration SQL is ready to run on Supabase (btree_gist first, then tables, then constraint, then RLS)
- Seed data provides the canonical service catalog and vehicle surcharges for Phase 2 slot engine and Phase 4 booking flow
- TypeScript types are ready for import from `@/types/database`
- Phase 2 (slot engine) can begin — exclusion constraint (TECH-01) is in place

---
*Phase: 01-foundation*
*Completed: 2026-03-20*

## Self-Check: PASSED

- migrations/001_initial_schema.sql: FOUND
- seed.sql: FOUND
- database.ts: FOUND
- 01-02-SUMMARY.md: FOUND
- Commit c5a5131 (Task 1): FOUND
- Commit bffb6e7 (Task 2): FOUND
