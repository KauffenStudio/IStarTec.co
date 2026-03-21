---
phase: 02-slot-engine-booking-api
plan: 02
subsystem: api
tags: [supabase, rls, nextjs, route-handler, booking-api, slots, cancellation, typescript]

requires:
  - phase: 02-slot-engine-booking-api
    plan: 01
    provides: computeAvailableSlots pure function in src/lib/slots.ts
  - phase: 01-foundation
    provides: database schema (bookings, services tables with exclusion constraint), supabase client factory

provides:
  - GET /api/slots endpoint: returns available start times as ISO 8601 strings for a date + service_id
  - POST /api/bookings endpoint: atomic booking creation with 23P01 exclusion constraint conflict detection
  - POST /api/cancel endpoint: idempotent cancellation via cancel_token UUID
  - 002_rls_slots_read.sql: RLS SELECT + UPDATE policies enabling server-side booking reads and cancellation

affects:
  - Phase 04 (Booking Flow UI) — all three endpoints are the HTTP contract the UI will call
  - Phase 05 (Email confirmations) — POST /api/bookings response (id + cancel_token) feeds email flow

tech-stack:
  added: []
  patterns:
    - Next.js App Router Route Handlers using standard Web API Response.json() (not NextResponse)
    - RLS row-level + query-level column restriction pattern (RLS controls rows, .select() controls columns)
    - Atomic insert with Postgres exclusion constraint 23P01 error code detection for 409 conflict
    - Idempotent cancellation (re-cancelling an already-cancelled booking returns 200, not error)
    - Europe/Lisbon date range validation using Intl.DateTimeFormat('sv-SE') for YYYY-MM-DD today string

key-files:
  created:
    - jetwash24/supabase/migrations/002_rls_slots_read.sql
    - jetwash24/src/app/api/slots/route.ts
    - jetwash24/src/app/api/bookings/route.ts
    - jetwash24/src/app/api/cancel/route.ts
  modified: []

key-decisions:
  - "RLS policies added (SELECT + UPDATE) for bookings — anon key client is sufficient, no service-role key needed"
  - "UTC window query uses +25h buffer for dayEndUTC to safely cover both UTC+0 and UTC+1 Lisbon offsets"
  - "cancel route fetches booking by cancel_token then updates by id — avoids relying on RLS UPDATE to filter by token"

patterns-established:
  - "Response.json() used directly (standard Web API) — no NextResponse import required in App Router route handlers"
  - "23P01 is the Postgres exclusion constraint error code — caught after .insert() to return HTTP 409 slot_conflict"
  - "Idempotent cancel: check status before UPDATE; if already cancelled, return 200 without an extra DB write"

requirements-completed: [BOOK-03, BOOK-04]

duration: 5min
completed: 2026-03-21
---

# Phase 02 Plan 02: Booking API Routes Summary

**Three Next.js App Router route handlers wiring the slot engine to Supabase via RLS-enabled anon client — GET /api/slots with Europe/Lisbon date validation, POST /api/bookings with Postgres 23P01 conflict detection, POST /api/cancel with idempotent cancellation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T09:56:28Z
- **Completed:** 2026-03-21T10:01:00Z
- **Tasks:** 2 (Task 1: RLS migration — already committed; Task 2: three route handlers)
- **Files modified:** 4

## Accomplishments

- RLS policies added for bookings (SELECT for slot reads, UPDATE for cancellation) so anon key client can perform server-side operations without exposing service-role key
- GET /api/slots validates date range (tomorrow to +7 days in Europe/Lisbon), fetches service duration, queries bookings for the day, and calls computeAvailableSlots
- POST /api/bookings atomically inserts with Postgres exclusion constraint catching 23P01 as 409 — cannot double-book even under concurrent load
- POST /api/cancel is idempotent: re-cancelling returns HTTP 200 with "already cancelled" message, first cancel returns HTTP 200 with "Booking cancelled"
- TypeScript compiles cleanly, 17 existing slot engine tests all pass

## Task Commits

Each task was committed atomically:

1. **Task 1: RLS migration (SELECT + UPDATE policies for bookings)** - `bef131d` (feat) — committed in prior session
2. **Task 2: GET /api/slots, POST /api/bookings, POST /api/cancel route handlers** - `284ef8f` (feat)

**Plan metadata:** committed after SUMMARY.md creation (docs commit)

## Files Created/Modified

- `jetwash24/supabase/migrations/002_rls_slots_read.sql` — RLS SELECT policy for slot availability reads + UPDATE policy for cancellation
- `jetwash24/src/app/api/slots/route.ts` — GET handler: date validation (Europe/Lisbon), service lookup, booking query, computeAvailableSlots call
- `jetwash24/src/app/api/bookings/route.ts` — POST handler: input validation, end_time computation, atomic insert, 23P01 conflict detection
- `jetwash24/src/app/api/cancel/route.ts` — POST handler: cancel_token lookup, idempotent status update

## Decisions Made

- **No service-role client:** Adding RLS SELECT + UPDATE policies to bookings means the existing `createSupabaseServerClient()` (anon key) is sufficient. No SUPABASE_SERVICE_ROLE_KEY environment variable needed in route handlers.
- **UTC +25h window for booking query:** The slots route queries bookings using `[YYYY-MM-DDT00:00:00+00:00, nextDay+00:00)` with a 25-hour window. This safely covers any Lisbon local time (UTC+0 or UTC+1) without timezone arithmetic complexity.
- **cancel: fetch then update by id (not by token):** The cancel route fetches `id, status` by cancel_token, then updates by `id`. This avoids relying on the UPDATE RLS policy to correctly filter by token UUID, and also enables the idempotency check before issuing the UPDATE.

## Deviations from Plan

### Pre-existing Work

Task 1 (RLS migration) and the slots/bookings route files were partially created in a prior session (commit `bef131d`). The cancel route was missing — only the empty directory existed. This plan execution completed the missing cancel route and verified all files meet acceptance criteria.

### Auto-fixed Issues

None — plan executed exactly as written for the remaining work.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** No scope creep. All files meet the specified acceptance criteria.

## Issues Encountered

None. TypeScript compiled cleanly on first attempt. The pre-existing partial work (migration + two route files) was already correct and required no modification.

## User Setup Required

None for API routes themselves. Supabase must have the 002_rls_slots_read.sql migration applied via `supabase db push` before the routes will function against a real database.

## Next Phase Readiness

- All three API endpoints are implemented and compile cleanly
- Response shapes match the CONTEXT.md locked API contracts that Phase 04 (Booking Flow UI) depends on
- POST /api/bookings returns `{ id, cancel_token }` — ready for Phase 05 email integration
- No blockers for Phase 03 or Phase 04

---
*Phase: 02-slot-engine-booking-api*
*Completed: 2026-03-21*
