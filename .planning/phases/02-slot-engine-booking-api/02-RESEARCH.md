# Phase 2: Slot Engine + Booking API - Research

**Researched:** 2026-03-20
**Domain:** Next.js 16 Route Handlers, pure TypeScript slot computation, Supabase atomic booking, Vitest unit testing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Booking advance window**
- Clients can book from tomorrow up to 7 days ahead — today is always blocked
- Simple calendar-day rule: if today is Monday, Tuesday through Sunday+7 are all bookable regardless of current time (no 24h-from-now math)
- No same-day bookings — the business needs at least overnight notice

**Slot interval granularity**
- Candidate starting times are generated on a 30-minute grid: 09:00, 09:30, 10:00, 10:30...
- A slot is valid only if `start_time + service.duration_min + 15min buffer <= 18:00`
- The engine never returns a slot that would cause the booking (including buffer) to end after 18:00
- Example: a 90-min service can start no later than 16:15 (90min + 15min = 105min before 18:00)

**Cancellation access**
- Business only — the cancel_token (UUID) is included exclusively in the business notification email (built in Phase 5)
- Clients cannot self-cancel in v1
- Cancel endpoint is idempotent: calling it twice returns HTTP 200 both times
  - First call: marks booking `cancelled`, frees slot, returns `{success: true, message: "Booking cancelled"}`
  - Subsequent calls (already cancelled): returns `{success: true, message: "Booking already cancelled"}`
- Invalid/unknown token: HTTP 404

**API response contracts**
- GET /api/slots: returns array of ISO 8601 datetime strings (available start times only)
- POST /api/bookings: HTTP 200 on success with booking id + cancel_token; HTTP 409 on conflict (slot taken); HTTP 422 on validation failure
- POST /api/cancel: HTTP 200 (idempotent); HTTP 404 on unknown token
- All error responses include a machine-readable `error` field and human-readable `message`

### Claude's Discretion
- Internal slot engine algorithm (how unavailable windows are computed from existing bookings)
- TypeScript types for API request/response payloads
- Test structure for concurrent booking simulation

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BOOK-03 | Client can see available time slots in real time for the chosen date | GET /api/slots route + pure slot engine function; research covers query param parsing, slot generation algorithm, Supabase read of confirmed bookings |
| BOOK-04 | System automatically blocks unavailable slots (1 car at a time + 15min buffer) | Postgres exclusion constraint (btree_gist + tstzrange) is the atomic guard; JS slot engine pre-filters for UI; research covers both layers and the error code that signals a race |
</phase_requirements>

---

## Summary

Phase 2 builds the server-side slot availability and booking creation logic. It has two distinct sub-concerns: (1) a pure TypeScript function (`lib/slots.ts`) that computes available start times from a list of existing confirmed bookings, and (2) three Next.js 16 App Router Route Handlers that expose this logic as HTTP endpoints. The double-booking guarantee is delivered by the Postgres exclusion constraint already present in the schema — the JS layer cannot race-condition around a `EXCLUDE USING gist` constraint.

The existing codebase provides everything needed: the schema (`001_initial_schema.sql`) with the exclusion constraint, typed interfaces (`src/types/database.ts`), and the Supabase server client factory (`src/lib/supabase.ts`). No new dependencies are required — Vitest is already installed and configured. The slot engine must be a pure function so it can be unit-tested without a live database.

The main implementation risk is timezone handling: `start_time` and `end_time` are stored as `timestamptz` in UTC, but business hours (09:00–18:00) are local Portuguese time (Europe/Lisbon, UTC+1 standard / UTC+2 summer). The slot engine must work in the correct local timezone when comparing against business hour boundaries. The second risk is catching the correct Postgres error code (`23P01` — exclusion violation) from Supabase and translating it to HTTP 409 instead of a generic 500.

**Primary recommendation:** Keep the slot engine as a pure function that operates on plain minute-of-day integers (stripped of timezone) for simplicity, but have the API layer convert the requested date from the caller's perspective to a list of UTC timestamps that map to the correct local-time windows before passing them to Supabase.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0 | Route Handlers for the three API endpoints | Already installed; project convention |
| @supabase/ssr | ^0.9.0 | Server-side Supabase client in Route Handlers | Already installed; `createSupabaseServerClient()` factory in place |
| @supabase/supabase-js | ^2.99.3 | Supabase JS client (used by @supabase/ssr internally) | Already installed |
| date-fns | ^4.1.0 | Date arithmetic for slot generation | Already installed; battle-tested for timezone-safe operations |
| TypeScript | ^5 | Static types for slot engine and API payloads | Already installed |
| Vitest | ^4.1.0 | Unit tests for pure slot engine + API route tests | Already installed; configured in `vitest.config.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns-tz | (not installed) | Timezone-aware date operations for Europe/Lisbon | If slot generation needs local time from UTC date input; evaluate before adding |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Temporal API | Temporal is Stage 3 but not universally available in Node 20; date-fns is already installed |
| Postgres exclusion constraint | Application-level lock | Application lock cannot prevent race between two simultaneous requests in separate serverless invocations; the constraint is the only correct solution |

**Installation:** No new packages needed. All dependencies already in `jetwash24/package.json`.

**Version verification:** All versions confirmed from `jetwash24/package.json` (read 2026-03-20) — no registry lookup required.

---

## Architecture Patterns

### Recommended Project Structure

```
jetwash24/src/
├── lib/
│   └── slots.ts               # Pure slot engine — no DB, no Next.js, testable in isolation
├── app/
│   └── api/
│       ├── slots/
│       │   └── route.ts       # GET /api/slots?date=YYYY-MM-DD&service_id=X
│       ├── bookings/
│       │   └── route.ts       # POST /api/bookings
│       └── cancel/
│           └── route.ts       # POST /api/cancel
└── __tests__/
    ├── slots.test.ts           # Unit tests for pure slot engine (no DB)
    ├── bookings-api.test.ts    # Integration tests for POST /api/bookings
    └── cancel-api.test.ts      # Integration tests for POST /api/cancel
```

### Pattern 1: Pure Slot Engine Function

**What:** A function that accepts a date string, a service duration in minutes, and an array of existing confirmed bookings; returns an array of ISO 8601 datetime strings representing valid available start times.

**When to use:** Called by the GET /api/slots route handler after fetching confirmed bookings from Supabase. Also directly unit-testable with synthetic booking arrays — no database required.

**Example:**
```typescript
// Source: jetwash24/src/lib/slots.ts (to be created)
// Types from jetwash24/src/types/database.ts

import type { Booking } from '@/types/database';

const BUSINESS_START_HOUR = 9;   // 09:00 local time
const BUSINESS_END_HOUR = 18;    // 18:00 local time
const SLOT_INTERVAL_MIN = 30;
const BUFFER_MIN = 15;

export interface SlotEngineInput {
  date: string;          // YYYY-MM-DD in local time (Europe/Lisbon)
  durationMin: number;   // from service.duration_min
  existingBookings: Pick<Booking, 'start_time' | 'end_time'>[];
  timezone?: string;     // default: 'Europe/Lisbon'
}

export function computeAvailableSlots(input: SlotEngineInput): string[] {
  // Returns array of ISO 8601 start times that are:
  // 1. On the 30-min grid within [09:00, 18:00)
  // 2. Where start + durationMin + BUFFER_MIN <= 18:00
  // 3. Not overlapping any existing booking's [start_time, end_time + BUFFER_MIN)
}
```

### Pattern 2: Next.js 16 Route Handler (App Router)

**What:** Route Handlers live in `src/app/api/[path]/route.ts` and export named functions for HTTP verbs. They use the Web Request/Response API (no Express-style `req`, `res`).

**When to use:** All three API endpoints in this phase.

**Example:**
```typescript
// Source: jetwash24/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
// Path: src/app/api/slots/route.ts

import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { computeAvailableSlots } from '@/lib/slots';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const serviceId = searchParams.get('service_id');

  // Validation → 422
  // Fetch service from Supabase → get duration_min
  // Fetch confirmed bookings for date from Supabase
  // Call computeAvailableSlots(...)
  // Return Response.json(availableSlots)
}
```

### Pattern 3: Atomic Booking Insert with Conflict Detection

**What:** Attempt to INSERT into the `bookings` table. If the Postgres exclusion constraint fires, Supabase returns an error with code `23P01`. Catch this code and return HTTP 409. All other errors return HTTP 500.

**When to use:** POST /api/bookings route handler.

**Example:**
```typescript
// Source: Postgres spec (error code 23P01 = exclusion_violation)
// src/app/api/bookings/route.ts

const supabase = await createSupabaseServerClient();
const { data, error } = await supabase
  .from('bookings')
  .insert(bookingInsert)
  .select('id, cancel_token')
  .single();

if (error) {
  if (error.code === '23P01') {
    // Exclusion constraint fired — slot was taken by concurrent request
    return Response.json(
      { error: 'slot_conflict', message: 'This slot is no longer available' },
      { status: 409 }
    );
  }
  return Response.json(
    { error: 'internal_error', message: 'Booking failed' },
    { status: 500 }
  );
}
```

### Pattern 4: Idempotent Cancel by Token

**What:** SELECT booking by `cancel_token`. If not found → 404. If found and status is already `cancelled` → 200 with "already cancelled" message. If found and status is `confirmed` → UPDATE to `cancelled` → 200.

**When to use:** POST /api/cancel route handler.

**Example:**
```typescript
// Source: business rules from CONTEXT.md decisions
// src/app/api/cancel/route.ts

const { token } = await request.json();

const { data: booking } = await supabase
  .from('bookings')
  .select('id, status')
  .eq('cancel_token', token)
  .single();

if (!booking) {
  return Response.json({ error: 'not_found', message: 'Invalid token' }, { status: 404 });
}
if (booking.status === 'cancelled') {
  return Response.json({ success: true, message: 'Booking already cancelled' }, { status: 200 });
}

await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
return Response.json({ success: true, message: 'Booking cancelled' }, { status: 200 });
```

### Anti-Patterns to Avoid

- **SELECT then INSERT for conflict detection:** Fetching slots, checking in JS, then inserting is not atomic. Two concurrent requests can both pass the JS check before either INSERT completes. The exclusion constraint is the only safe guard.
- **Using `createSupabaseBrowserClient()` in Route Handlers:** API routes must use `createSupabaseServerClient()` (the async factory), not the browser client. Both are exported from `src/lib/supabase.ts`.
- **Returning slots for today:** The advance window check must be a calendar-day comparison (no 24h-from-now math). Compare `date >= tomorrow` only.
- **Timezone blindness:** Do not compare local business hours against UTC timestamps directly. A booking at 17:00 Lisbon time in summer is 15:00 UTC — naively comparing hour values will produce wrong results.
- **Using `middleware.ts`:** Project convention uses `src/proxy.ts` as the Next.js 16 middleware filename. Do not create `middleware.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Race-condition-free booking | JS-level check-then-insert | Postgres `EXCLUDE USING gist` constraint already in schema | Application-level check cannot span concurrent serverless invocations |
| Date arithmetic | Custom minute calculators | `date-fns` already installed | DST, leap seconds, month boundaries — all handled |
| TypeScript DB types | Re-declare interfaces inline | Import from `@/types/database` | Single source of truth, already mirrors the schema exactly |
| Supabase client instantiation | Direct `createClient()` calls | `createSupabaseServerClient()` from `@/lib/supabase` | Handles cookie management for SSR; already configured |

**Key insight:** The hardest problem (atomic concurrency) is already solved in the database layer. Phase 2's job is to wire the existing constraint correctly through the API, not to invent a new concurrency mechanism.

---

## Common Pitfalls

### Pitfall 1: Timezone Boundary Errors

**What goes wrong:** Slot generation compares hour values numerically without accounting for timezone offset, producing slots that map to the wrong local time — or missing the correct slots entirely.

**Why it happens:** `start_time`/`end_time` are stored as `timestamptz` (UTC). When generating the 09:00–18:00 grid for a date, the code must work in Europe/Lisbon local time (UTC+1 in winter, UTC+2 in summer). Portugal observes DST.

**How to avoid:** Use `date-fns` with explicit timezone anchoring. Generate candidate start times as local-time Date objects for the requested date (e.g., `new Date('2026-06-15T09:00:00+02:00')`), then convert to UTC for storage and comparison. Alternatively, accept the date in `YYYY-MM-DD` form from the client (which is local-date aware) and compute all comparisons in minutes-from-midnight against existing bookings also converted to local time.

**Warning signs:** Test coverage with a date in June (UTC+2) vs January (UTC+1) — if available slots shift by 1 hour between seasons, timezone handling is broken.

### Pitfall 2: Missing Exclusion Constraint Error Code

**What goes wrong:** The POST /api/bookings handler catches `error` from Supabase but checks `error.message` (a string) rather than `error.code` (the Postgres SQLSTATE). String matching against error messages is fragile and locale-dependent.

**Why it happens:** Developers grep for "conflict" or "duplicate" in the error message rather than checking the standardized SQLSTATE code.

**How to avoid:** Always check `error.code === '23P01'` (exclusion_violation) explicitly. The Supabase `PostgrestError` object exposes `.code` as the 5-character SQLSTATE string.

**Warning signs:** The concurrent booking test produces two HTTP 200s instead of one 200 and one 409.

### Pitfall 3: Booking for Today Not Blocked

**What goes wrong:** The slots endpoint returns slots for the current calendar day because the check compares timestamps rather than calendar dates.

**Why it happens:** Comparing `date >= now()` in milliseconds rather than comparing calendar days. A request at 23:59 on Monday should not return Monday slots even though `+1 day` hasn't elapsed.

**How to avoid:** In the GET /api/slots handler, before calling the slot engine, reject any requested date that is not at least `tomorrow` in the local timezone. Use calendar-day comparison: `requestedDate >= addDays(startOfToday_Lisbon, 1)`.

**Warning signs:** E2E test requesting today's date receives available slots.

### Pitfall 4: Buffer Not Applied to Existing Bookings

**What goes wrong:** The slot engine correctly applies the 15-minute buffer to the end of the *new* booking (to enforce `start + duration + 15 <= 18:00`) but fails to apply the buffer when checking for overlap against *existing* bookings.

**Why it happens:** The buffer rule has two purposes — it applies to both the candidate slot's end time AND to the exclusion window around existing bookings. Missing the second application means slots immediately adjacent to an existing booking are offered as available, then rejected by the constraint at INSERT time.

**How to avoid:** When computing the occupied interval for each existing booking, treat it as `[start_time, end_time + 15min)`. A candidate slot overlaps if its `[start, start + duration)` intersects this interval. The exclusion constraint in the DB stores `end_time` as `start_time + duration_min` (no buffer) — the buffer is a JS-layer concern for slot generation.

**Warning signs:** A slot starting exactly at `existing_booking.end_time` is returned as available but then returns 409.

### Pitfall 5: Supabase RLS Blocks Slot Queries

**What goes wrong:** GET /api/slots returns empty results because RLS blocks the `bookings` table SELECT for the anon role.

**Why it happens:** The RLS policy for `bookings` in the schema is INSERT-only for anon — there is no SELECT policy. The slot query needs to read existing confirmed bookings to determine availability.

**How to avoid:** Use the service role key (not the anon key) for server-side reads from `bookings`. Alternatively, add a specific RLS policy that allows the server to read `status` and time columns. The canonical approach for Route Handlers is to use `createSupabaseServerClient()` — but this uses the anon key. For privileged reads, create a second factory using `SUPABASE_SERVICE_ROLE_KEY` (server env var, never exposed to client). Document this decision explicitly.

**Warning signs:** Slot query returns 0 existing bookings even when DB has confirmed bookings; slots appear available when they should be blocked.

---

## Code Examples

Verified patterns from official sources:

### Query Parameters in Next.js 16 Route Handler
```typescript
// Source: jetwash24/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');        // 'YYYY-MM-DD' or null
  const serviceId = searchParams.get('service_id');
}
```

### Returning JSON with Status Code
```typescript
// Source: Next.js 16 official docs (route.md)
// Response.json() — standard pattern for all three endpoints
return Response.json({ error: 'validation_error', message: 'date is required' }, { status: 422 });
return Response.json({ slots: ['2026-03-21T09:00:00.000Z', ...] }, { status: 200 });
```

### Supabase Insert with Select
```typescript
// Source: @supabase/supabase-js v2 docs — chaining .select() on insert
const { data, error } = await supabase
  .from('bookings')
  .insert(bookingInsert)
  .select('id, cancel_token')
  .single();
```

### Supabase Filtered Query for Slot Availability
```typescript
// Fetch only confirmed bookings that fall on the requested date
// (exact time range depends on timezone handling strategy)
const { data: existing } = await supabase
  .from('bookings')
  .select('start_time, end_time')
  .eq('status', 'confirmed')
  .gte('start_time', dayStartUTC)
  .lt('start_time', dayEndUTC);
```

### Slot Engine Core Algorithm (pseudocode)
```typescript
// src/lib/slots.ts (to be created)
// All times in local minutes-from-midnight for simplicity within this function

const BUFFER_MIN = 15;
const GRID_MIN = 30;
const DAY_START = 9 * 60;   // 540 minutes
const DAY_END = 18 * 60;    // 1080 minutes

// For each candidate on the 30-min grid:
//   candidateEnd = candidate + durationMin  (the actual service end)
//   requiredWindow = candidate + durationMin + BUFFER_MIN
//   if requiredWindow > DAY_END → skip (violates end-time constraint)
//
//   For each existing booking:
//     occupiedEnd = existingEndMinutes + BUFFER_MIN
//     if candidate < occupiedEnd && candidateEnd > existingStartMinutes → skip (overlap)
//
//   Otherwise → valid slot
```

### Vitest Concurrent Request Simulation
```typescript
// src/__tests__/bookings-api.test.ts (to be created)
// Pattern for the concurrent booking success criterion

it('simultaneous POST for same slot yields exactly one 200 and one 409', async () => {
  const payload = { /* valid booking for a known free slot */ };
  const [r1, r2] = await Promise.all([
    fetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }),
    fetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  ]);
  const statuses = [r1.status, r2.status].sort();
  expect(statuses).toEqual([200, 409]);
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API routes (`pages/api/*.ts`) | App Router Route Handlers (`app/api/**/route.ts`) | Next.js 13+ (project on 16) | Different function signatures, `params` is now a Promise |
| Sync `params` access | `await params` (Promise) | Next.js 15.0-RC | Must `await params` before accessing slug; project on 16.2.0 |
| `getServerSideProps` for server data | Route Handlers + Server Components | Next.js 13+ | Slot query is a Route Handler, not getServerSideProps |

**Deprecated/outdated:**
- `pages/api/` directory: This project uses App Router exclusively. Do not create files in `pages/`.
- `middleware.ts` filename: Project uses `src/proxy.ts` for Next.js 16 middleware (confirmed in Phase 1 decisions).
- Sync `params` in Route Handlers: As of Next.js 15+, `params` is a Promise — `const { id } = await params`.

---

## Open Questions

1. **RLS for slot availability query**
   - What we know: `bookings` RLS has INSERT-only for anon; no SELECT policy exists in `001_initial_schema.sql`
   - What's unclear: Whether `createSupabaseServerClient()` (using anon key) can bypass RLS for SELECT, or if a service role client is needed
   - Recommendation: Plan 02-02 must decide: either (a) add a Supabase migration adding a restricted SELECT policy for the server to read `status`/`start_time`/`end_time` columns, or (b) use a `SUPABASE_SERVICE_ROLE_KEY` env var in a second server client factory. Option (a) is preferable to avoid exposing service role key. This is a Wave 0 decision — must be resolved before implementing the GET /api/slots route.

2. **Timezone implementation detail**
   - What we know: Business hours are 09:00–18:00 in Europe/Lisbon; `timestamptz` stores UTC; date-fns is available but date-fns-tz is not installed
   - What's unclear: Whether the slot engine should receive UTC-adjusted boundaries from the API layer, or do timezone math internally
   - Recommendation: The API layer computes UTC boundaries for the requested date (09:00 and 18:00 Lisbon time → UTC) and passes them to the slot engine. The slot engine receives pre-converted Date objects and works purely in UTC. This keeps the pure function timezone-agnostic and the conversion testable in the route handler layer. date-fns-tz may need to be installed if `date-fns` alone cannot handle the Lisbon timezone correctly.

3. **Concurrent test infrastructure**
   - What we know: The concurrent booking test (two simultaneous POSTs) is a phase success criterion; Vitest runs tests in Node environment
   - What's unclear: Whether Vitest can issue truly concurrent HTTP requests against a locally running Next.js dev server, or whether integration tests must mock Supabase
   - Recommendation: For the concurrency test, use Promise.all with fetch against a locally running server (requires `npm run dev` or `next start` to be running). This is a manual integration test, not a unit test. The pure slot engine unit tests are fully automatable with `vitest run`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `jetwash24/vitest.config.ts` |
| Quick run command | `cd jetwash24 && npm test` |
| Full suite command | `cd jetwash24 && npm run test:coverage` |

The existing vitest config uses `environment: 'node'` and includes `src/**/*.test.ts`. The `@` alias resolves to `./src`. No changes to vitest config are needed for Phase 2.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOOK-03 | GET /api/slots returns only valid available start times | unit (pure fn) | `cd jetwash24 && npm test -- slots.test.ts` | Wave 0 |
| BOOK-03 | Slot end-time constraint: no slot returned if start + duration + 15min > 18:00 | unit (pure fn) | `cd jetwash24 && npm test -- slots.test.ts` | Wave 0 |
| BOOK-03 | No same-day slots (today is blocked) | unit (pure fn) | `cd jetwash24 && npm test -- slots.test.ts` | Wave 0 |
| BOOK-03 | Only tomorrow through +7 days are bookable | unit (pure fn) | `cd jetwash24 && npm test -- slots.test.ts` | Wave 0 |
| BOOK-04 | Existing confirmed booking + 15min buffer blocks overlapping slots | unit (pure fn) | `cd jetwash24 && npm test -- slots.test.ts` | Wave 0 |
| BOOK-04 | Cancelled booking does NOT block overlapping slots | unit (pure fn) | `cd jetwash24 && npm test -- slots.test.ts` | Wave 0 |
| BOOK-04 | Two simultaneous POSTs → exactly one 200, one 409 | integration (manual) | Requires running server + manual `Promise.all` test | Wave 0 |
| BOOK-04 | Cancel token frees slot in subsequent slot query | integration (manual) | Requires running server | Wave 0 |

### Sampling Rate

- **Per task commit:** `cd jetwash24 && npm test -- slots.test.ts` (unit tests only, <5s)
- **Per wave merge:** `cd jetwash24 && npm test` (full suite including all test files)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `jetwash24/src/__tests__/slots.test.ts` — unit tests for `computeAvailableSlots` pure function (BOOK-03, BOOK-04)
- [ ] `jetwash24/src/lib/slots.ts` — the pure function itself (implementation target for Plan 02-01)
- [ ] `jetwash24/src/app/api/slots/route.ts` — GET handler (implementation target for Plan 02-02)
- [ ] `jetwash24/src/app/api/bookings/route.ts` — POST handler (implementation target for Plan 02-02)
- [ ] `jetwash24/src/app/api/cancel/route.ts` — POST handler (implementation target for Plan 02-02)

Existing test files (`exclusion.test.ts`, `schema.test.ts`, `i18n.test.ts`) contain only `it.todo` placeholders and will not interfere.

---

## Sources

### Primary (HIGH confidence)
- `jetwash24/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — Route Handler API: HTTP methods, query params, Request/Response, params-as-Promise change
- `jetwash24/supabase/migrations/001_initial_schema.sql` — Schema authority: bookings table, exclusion constraint definition, RLS policies
- `jetwash24/src/types/database.ts` — TypeScript interface authority: Service, Booking, BookingInsert, VehicleType, BookingStatus
- `jetwash24/src/lib/supabase.ts` — Client factory patterns: createSupabaseServerClient, createSupabaseBrowserClient
- `jetwash24/vitest.config.ts` — Test infrastructure: environment, include patterns, path aliases
- `jetwash24/package.json` — Confirmed versions of all installed dependencies
- `.planning/phases/02-slot-engine-booking-api/02-CONTEXT.md` — All locked business decisions
- `jetwash24/supabase/seed.sql` — Service catalog with duration_min values (30, 45, 75, 90, 120, 150 minutes)

### Secondary (MEDIUM confidence)
- Postgres SQLSTATE `23P01` (exclusion_violation) — documented in PostgreSQL error codes reference; Supabase surfaces this as `error.code` in the JS client response

### Tertiary (LOW confidence)
- Timezone handling via date-fns for Europe/Lisbon — date-fns is installed but date-fns-tz is not; whether base date-fns handles Lisbon DST correctly needs validation at implementation time

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed from package.json; no version lookups needed
- Architecture: HIGH — Next.js 16 route.md docs read directly from node_modules; Supabase patterns confirmed from existing codebase
- Pitfalls: HIGH for RLS/error-code/concurrency issues (derived from schema); MEDIUM for timezone pitfall (known pattern, implementation detail unresolved)
- Slot engine algorithm: HIGH for the logic (pure function, well-specified by CONTEXT.md decisions); MEDIUM for timezone implementation choice

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable — Next.js 16.2.0 pinned, Supabase schema locked, no fast-moving dependencies for this phase)
