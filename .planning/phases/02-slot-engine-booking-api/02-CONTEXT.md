# Phase 2: Slot Engine + Booking API - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-side slot availability logic and booking/cancellation API routes. This phase builds and validates the engine in isolation — no UI depends on it yet. Three endpoints: GET /api/slots, POST /api/bookings, POST /api/cancel. The pure slot function (lib/slots.ts) is unit-testable independently of the API layer.

</domain>

<decisions>
## Implementation Decisions

### Booking advance window
- Clients can book from **tomorrow up to 7 days ahead** — today is always blocked
- Simple calendar-day rule: if today is Monday, Tuesday through Sunday+7 are all bookable regardless of current time (no 24h-from-now math)
- No same-day bookings — the business needs at least overnight notice

### Slot interval granularity
- Candidate starting times are generated on a **30-minute grid**: 09:00, 09:30, 10:00, 10:30...
- A slot is valid only if `start_time + service.duration_min + 15min buffer ≤ 18:00`
- The engine never returns a slot that would cause the booking (including buffer) to end after 18:00
- Example: a 90-min service can start no later than 16:15 (90min + 15min = 105min before 18:00)

### Cancellation access
- **Business only** — the cancel_token (UUID) is included exclusively in the business notification email (built in Phase 5)
- Clients cannot self-cancel in v1
- Cancel endpoint is idempotent: calling it twice returns HTTP 200 both times
  - First call: marks booking `cancelled`, frees slot, returns `{success: true, message: "Booking cancelled"}`
  - Subsequent calls (already cancelled): returns `{success: true, message: "Booking already cancelled"}`
- Invalid/unknown token: HTTP 404

### API response contracts
- GET /api/slots: returns array of ISO 8601 datetime strings (available start times only)
- POST /api/bookings: HTTP 200 on success with booking id + cancel_token; HTTP 409 on conflict (slot taken); HTTP 422 on validation failure
- POST /api/cancel: HTTP 200 (idempotent); HTTP 404 on unknown token
- All error responses include a machine-readable `error` field and human-readable `message`

### Claude's Discretion
- Internal slot engine algorithm (how unavailable windows are computed from existing bookings)
- TypeScript types for API request/response payloads
- Test structure for concurrent booking simulation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database schema (foundation for all slot logic)
- `jetwash24/supabase/migrations/001_initial_schema.sql` — bookings table structure, exclusion constraint, RLS policies, indexes
- `jetwash24/supabase/seed.sql` — service catalog with duration_min values the slot engine depends on
- `jetwash24/src/types/database.ts` — TypeScript interfaces for Service, Booking, BookingInsert

### Business rules
- `.planning/REQUIREMENTS.md` §BOOK-03, BOOK-04 — slot availability and double-booking prevention requirements
- `.planning/ROADMAP.md` §Phase 2 — success criteria (concurrent booking test, slot end-time constraint, cancellation frees slot)
- `.planning/STATE.md` §Decisions — 15-min buffer confirmed by business owner; 1 car at a time confirmed

### Existing infrastructure
- `jetwash24/src/lib/supabase.ts` — Supabase server/browser client factories (use createSupabaseServerClient in API routes)

No external specs beyond the above — all business rules captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts`: exports `createSupabaseServerClient()` and `createSupabaseBrowserClient()` — API routes must use the server variant
- `src/types/database.ts`: `Service`, `Booking`, `BookingInsert`, `VehicleType`, `BookingStatus` types — import from here, do not redeclare

### Established Patterns
- Next.js 16 API routes live in `src/app/api/` as `route.ts` files using the App Router convention
- Middleware is `src/proxy.ts` (not `middleware.ts`) — do not confuse this with API routes
- All server components and API routes use async patterns (no sync `useTranslations`)

### Integration Points
- The slot engine (`lib/slots.ts`) must be a pure function — takes existing bookings array + service duration, returns available start times — so it can be unit-tested without DB
- API routes call the slot engine after fetching existing bookings from Supabase
- Phase 4 (Booking Flow UI) will call these exact endpoints — keep response shapes stable

</code_context>

<specifics>
## Specific Ideas

- The slot engine is intentionally a pure function separate from the API route — this makes it independently testable and reusable
- The 30-minute grid was chosen over 15-minute to keep the date picker UI manageable (fewer options per day)
- "No same-day" is a simple calendar-day check — not time-based — which keeps the slot engine logic clean

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-slot-engine-booking-api*
*Context gathered: 2026-03-20*
