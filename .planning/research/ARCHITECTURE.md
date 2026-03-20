# Architecture Research

**Domain:** Small service business online booking website (car wash)
**Researched:** 2026-03-20
**Confidence:** HIGH (core patterns well-established; Supabase + Next.js integration verified via official docs)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│                   Next.js (App Router)                           │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Landing /   │  Service     │  Booking     │  Confirmation      │
│  Marketing   │  Catalog     │  Flow        │  Page              │
│  Page        │  Component   │  (3 steps)   │                    │
└──────────────┴──────────────┴──────┬───────┴────────────────────┘
                                     │ Server Actions / API Routes
┌────────────────────────────────────▼────────────────────────────┐
│                     APPLICATION LAYER                            │
│                   Next.js Server Functions                       │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Slot        │  Booking     │  Email       │  i18n              │
│  Engine      │  Service     │  Service     │  (next-intl)       │
│              │              │              │                    │
│  Generates   │  Validates + │  Sends       │  PT/EN routing     │
│  available   │  persists    │  confirm +   │  + translation     │
│  windows     │  reservations│  notify      │  keys              │
└──────────────┴──────────────┴──────┬───────┴────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────┐
│                       DATA LAYER                                 │
│                        Supabase                                  │
├───────────────────────┬─────────────────────────────────────────┤
│  PostgreSQL           │  Edge Functions (optional)              │
│                       │                                         │
│  services             │  send-confirmation-email                │
│  bookings             │  (triggered by DB insert)               │
│  business_config      │                                         │
└───────────────────────┴─────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────┐
│                     EXTERNAL SERVICES                            │
├──────────────────────────────────────────────────────────────────┤
│  Resend (transactional email)                                    │
│  Vercel (hosting + edge deployment)                              │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Landing Page | Business presentation, CTA, contact info | Service Catalog, Booking Flow |
| Service Catalog | Display services, prices, vehicle surcharges, durations | Booking Flow (passes selected service) |
| Booking Flow (3 steps) | Date selection → slot selection → customer details | Slot Engine, Booking Service |
| Confirmation Page | Show booking summary post-submission | (receives booking ID from Booking Service) |
| Slot Engine | Query bookings table, compute available windows for a given date + service duration | Supabase (reads bookings), called by Booking Flow |
| Booking Service | Validate no overlap, insert booking row, trigger email | Supabase (writes bookings), Email Service |
| Email Service | Send confirmation to customer + notification to business | Resend API |
| i18n Layer (next-intl) | Route under /pt and /en, serve translation strings | All UI components |
| Supabase DB | Persist services, bookings, business operating hours | Slot Engine, Booking Service |

## Recommended Project Structure

```
src/
├── app/
│   ├── [locale]/               # i18n root — pt and en routes
│   │   ├── page.tsx            # Landing page (marketing + CTA)
│   │   ├── booking/
│   │   │   ├── page.tsx        # Booking flow (multi-step wizard)
│   │   │   └── confirmation/
│   │   │       └── page.tsx    # Post-booking confirmation
│   │   └── layout.tsx          # Locale-aware layout with nav
│   └── api/
│       ├── slots/route.ts      # GET /api/slots?service=X&date=Y
│       └── bookings/route.ts   # POST /api/bookings
├── components/
│   ├── booking/
│   │   ├── ServiceSelector.tsx # Step 1 — choose service + vehicle type
│   │   ├── DatePicker.tsx      # Step 2a — pick date
│   │   ├── SlotPicker.tsx      # Step 2b — pick available slot
│   │   └── CustomerForm.tsx    # Step 3 — name, email, phone
│   ├── catalog/
│   │   └── ServiceCard.tsx     # Price, duration, description display
│   └── ui/                     # Shared primitives (Button, Badge, etc.)
├── lib/
│   ├── slots.ts                # Slot generation + overlap logic
│   ├── bookings.ts             # Booking creation + validation
│   ├── email.ts                # Resend wrapper + email templates
│   └── supabase.ts             # Supabase client (server + browser)
├── messages/
│   ├── pt.json                 # Portuguese translation strings
│   └── en.json                 # English translation strings
└── types/
    └── booking.ts              # Shared TypeScript types
```

### Structure Rationale

- **app/[locale]/:** All pages are wrapped under a locale segment — next-intl handles routing to /pt and /en automatically; default locale (PT) has no redirect.
- **app/api/:** Two thin API routes keep business logic server-side and out of client bundles; slots is read-only (GET), bookings is write-only (POST with conflict check).
- **lib/slots.ts:** Isolating slot logic makes it independently testable. This is the most complex piece of the system.
- **messages/:** Flat JSON translation files; easy for a non-developer to update copy.

## Architectural Patterns

### Pattern 1: Dynamic Slot Generation (Server-side, per request)

**What:** On each date selection, the server queries existing bookings for that day, then computes available windows by walking the business hours timeline in service-duration-sized increments and excluding any overlapping booked ranges.

**When to use:** This project — single resource (one wash bay), variable service durations (30 min to 2+ hours), no pre-generated slot rows needed.

**Trade-offs:** Slightly more compute per request than a pre-generated slot table, but eliminates stale availability data and requires no maintenance job. At Jetwash24's scale (< 10 bookings/day) this is the right choice.

**Example:**
```typescript
// lib/slots.ts
export function generateAvailableSlots(
  businessOpen: Date,   // e.g. 09:00
  businessClose: Date,  // e.g. 18:00
  serviceDurationMin: number,
  existingBookings: { start: Date; end: Date }[]
): Date[] {
  const slots: Date[] = [];
  let cursor = businessOpen;

  while (addMinutes(cursor, serviceDurationMin) <= businessClose) {
    const proposedEnd = addMinutes(cursor, serviceDurationMin);
    const conflicts = existingBookings.some(
      (b) => cursor < b.end && proposedEnd > b.start  // overlap condition
    );
    if (!conflicts) slots.push(cursor);
    cursor = addMinutes(cursor, 30); // advance in 30-min increments
  }

  return slots;
}
```

### Pattern 2: Optimistic UI with Server-Side Conflict Guard

**What:** Show the customer an available slot based on a fresh query. On booking submission, re-check for conflicts server-side inside a Postgres transaction before committing. Return a clear error if the slot was just taken.

**When to use:** Any booking system with concurrent users. A customer seeing a slot and then submitting it a second later is the primary race condition to protect against.

**Trade-offs:** Adds one extra DB read at submission time, but prevents ghost bookings. The window of conflict is small for a low-volume operation like a car wash.

**Example:**
```typescript
// app/api/bookings/route.ts
export async function POST(req: Request) {
  const { serviceId, startTime, customerName, email, phone } = await req.json();
  const service = await getService(serviceId);
  const endTime = addMinutes(startTime, service.durationMin);

  // Server-side overlap check before insert
  const conflict = await supabase
    .from('bookings')
    .select('id')
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString())
    .eq('status', 'confirmed')
    .single();

  if (conflict.data) {
    return Response.json({ error: 'slot_taken' }, { status: 409 });
  }

  const { data: booking } = await supabase.from('bookings').insert({...}).select().single();
  await sendConfirmationEmail(booking, service);
  return Response.json({ bookingId: booking.id });
}
```

### Pattern 3: Database-Driven Service Catalog

**What:** Services, durations, and base prices live in a Supabase table rather than hardcoded in the frontend. Vehicle surcharges are stored as a separate lookup or as a JSONB column on the service row.

**When to use:** Any project where the business owner may want to adjust prices, add services, or change durations without a code deploy. Even for v1, this is the correct approach.

**Trade-offs:** One extra query on page load to fetch the catalog. Benefit: the owner can adjust pricing by editing a database row.

## Data Flow

### Booking Request Flow

```
Customer selects service + vehicle type
    |
    v
ServiceSelector.tsx → sends (serviceId, vehicleType) to BookingFlow state
    |
    v
DatePicker.tsx → customer picks date
    |
    v
GET /api/slots?serviceId=X&date=2026-05-10
    |
    v
Slot Engine (lib/slots.ts)
    → fetch existing bookings for that date from Supabase
    → compute service duration (from services table)
    → walk 09:00–18:00 in 30-min steps
    → exclude windows that overlap any existing booking
    → return array of available start times
    |
    v
SlotPicker.tsx → customer selects a time slot
    |
    v
CustomerForm.tsx → customer enters name, email, phone
    |
    v
POST /api/bookings { serviceId, vehicleType, startTime, name, email, phone }
    |
    v
Booking Service (app/api/bookings/route.ts)
    → re-validate slot is still free (conflict check)
    → insert booking row in Supabase
    → call Email Service
    |
    ├─→ Resend API → confirmation email to customer
    └─→ Resend API → notification email to jetwash24detailing@gmail.com
    |
    v
Redirect to /[locale]/booking/confirmation?id=BOOKING_ID
```

### i18n Data Flow

```
Request hits Next.js middleware
    |
    v
next-intl middleware detects locale from URL prefix (/pt or /en)
    → sets locale context
    → falls back to PT if no prefix (default locale)
    |
    v
Server Components call useTranslations() or getTranslations()
    → reads from messages/pt.json or messages/en.json
    |
    v
Language switcher link changes URL prefix (e.g. /pt/booking → /en/booking)
    → next-intl router handles redirect with locale swap
```

### Key Data Flows

1. **Slot availability:** Client request → API route → Supabase read → slot engine computation → JSON response. No caching needed at this scale; freshness matters more.
2. **Booking creation:** Client POST → server-side overlap check → Supabase insert → dual email dispatch → confirmation redirect.
3. **Email delivery:** lib/email.ts wraps Resend SDK, called synchronously after successful DB insert. If email fails, booking is still persisted (fire-and-forget pattern acceptable for v1).

## Database Schema

```sql
-- Services catalog
CREATE TABLE services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,         -- e.g. 'exterior-express'
  name_pt     text NOT NULL,
  name_en     text NOT NULL,
  desc_pt     text,
  desc_en     text,
  duration_min int NOT NULL,                -- base duration in minutes
  base_price  numeric(6,2) NOT NULL,
  active      boolean DEFAULT true
);

-- Vehicle surcharges (applied on top of base_price)
CREATE TABLE vehicle_surcharges (
  vehicle_type text PRIMARY KEY,            -- 'citadino' | 'berlina' | 'suv' | 'carrinha'
  surcharge    numeric(6,2) NOT NULL DEFAULT 0
);

-- Bookings
CREATE TABLE bookings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id   uuid REFERENCES services(id),
  vehicle_type text NOT NULL,
  start_time   timestamptz NOT NULL,
  end_time     timestamptz NOT NULL,        -- start_time + service.duration_min
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  status       text NOT NULL DEFAULT 'confirmed',  -- confirmed | cancelled
  created_at   timestamptz DEFAULT now()
);

-- Prevent overlapping bookings at DB level (belt-and-suspenders)
-- Implemented via exclusion constraint with btree_gist extension:
-- ALTER TABLE bookings ADD CONSTRAINT no_overlap
--   EXCLUDE USING gist (tstzrange(start_time, end_time) WITH &&)
--   WHERE (status = 'confirmed');
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 bookings/month | Current design is sufficient. Supabase free tier handles this comfortably. No caching needed. |
| 500–5k bookings/month | Add simple in-memory caching of service catalog (revalidate every hour). Still single bay — architecture unchanged. |
| Multi-bay expansion | Add a `resources` table and scope conflict checks per resource. Slot engine gains a resource dimension. |

### Scaling Priorities

1. **First bottleneck:** Email delivery reliability. Resend free tier has limits. If volume grows, move email dispatch to a Supabase Edge Function triggered by DB insert so it's decoupled from the HTTP request lifecycle.
2. **Second bottleneck:** Slot query performance. At high volume, add an index on `bookings(start_time, end_time, status)`. Not needed for v1.

## Build Order (Phase Dependencies)

The following sequence respects hard dependencies between components:

```
1. Database schema + Supabase project setup
       |
       v
2. Service catalog (services + vehicle_surcharges tables, seeded with Jetwash24 data)
       |
       v
3. Slot engine (lib/slots.ts) — can be unit-tested independently before UI exists
       |
       v
4. Booking API routes (/api/slots and /api/bookings) — depend on slot engine + DB
       |
       v
5. Landing page + service catalog UI — static, no booking dependency
       |
       v
6. Booking flow UI (ServiceSelector → DatePicker → SlotPicker → CustomerForm)
   — depends on API routes being live
       |
       v
7. Email service (Resend integration) — integrate after booking creation is confirmed working
       |
       v
8. i18n (next-intl) — can be layered in at any point; best done before content is finalized
       |
       v
9. Design system (colors, typography, logo) — applied throughout but not a blocker for function
```

**Critical dependency:** Slot engine correctness must be validated before the booking flow is built — a bug in overlap detection that ships inside the UI is much harder to debug and fix.

## Anti-Patterns

### Anti-Pattern 1: Pre-generating Slot Rows in the Database

**What people do:** Create a table of all possible time slots for the next N days/weeks, then mark them as available/booked.

**Why it's wrong:** Requires a cron job to generate future slots, becomes stale when service durations change, creates orphaned rows, and adds operational complexity. For a single-resource business with variable service lengths, this is over-engineering.

**Do this instead:** Generate slots dynamically on each request by computing free windows against existing bookings. Fast enough at this scale, always accurate.

### Anti-Pattern 2: Client-Side Conflict Prevention Only

**What people do:** Only check for conflicts in the frontend (e.g. disabling already-booked slots in the UI) without a server-side re-check at submission.

**Why it's wrong:** Two customers can open the booking page simultaneously, see the same slot as available, and both submit. The second booking silently overwrites or doubles the first.

**Do this instead:** Always re-validate availability server-side inside the booking POST handler before committing the insert. Return HTTP 409 if the slot was taken, prompt the customer to pick another.

### Anti-Pattern 3: Hardcoding Service Data in the Frontend

**What people do:** Put service names, prices, and durations directly in React components or constants files.

**Why it's wrong:** Any pricing change requires a code change and redeployment. The business owner cannot self-serve updates.

**Do this instead:** Store services in the database. Fetch at request time (Next.js server component) with an appropriate cache TTL if performance matters.

### Anti-Pattern 4: Blocking HTTP Response on Email Delivery

**What people do:** `await sendEmail()` inside the booking POST handler before returning a response — if Resend is slow or down, the customer waits or sees an error even though the booking was saved.

**Why it's wrong:** Ties user-visible latency to a third-party service. Email failures appear as booking failures to the customer.

**Do this instead:** For v1, fire email after DB insert but do not await the response for the HTTP 200 — log failures server-side. For v2, move email to a Supabase Edge Function triggered by the DB insert row event, fully decoupling it.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase PostgreSQL | Supabase JS client (server-side only for writes) | Use Row Level Security; anon key only for reads via /api routes |
| Resend (email) | REST SDK called from Next.js server function | Store API key in environment variable; use React Email for templates |
| Vercel (hosting) | Push-to-deploy via GitHub | Environment variables set in Vercel dashboard; preview deployments per PR |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI components ↔ API routes | HTTP (fetch) from Server Actions or useEffect | Keep business logic out of components entirely |
| Slot engine ↔ Supabase | Direct Supabase client calls inside lib/slots.ts | Slot engine is a pure function fed query results — easier to test |
| Booking Service ↔ Email Service | Direct function call (lib/email.ts) | No message queue needed at this scale |
| i18n ↔ all UI | next-intl useTranslations() hook / getTranslations() server-side | Translation keys defined in messages/*.json; never inline strings in components |

## Sources

- [Building a Modern Appointment Booking System — Medium/Spearhead](https://medium.com/@spearhead0802/building-a-modern-appointment-booking-system-design-architecture-and-lessons-learned-a7849d863d00)
- [Time Blocking System in Appointment Booking — DEV Community](https://dev.to/priyam_jain_f127ddf8c4d8d/time-blocking-system-in-appointment-booking-5een)
- [How to Design a Database for Booking and Reservation Systems — GeeksforGeeks](https://www.geeksforgeeks.org/dbms/how-to-design-a-database-for-booking-and-reservation-systems/)
- [Solving Double Booking at Scale — ITNEXT](https://itnext.io/solving-double-booking-at-scale-system-design-patterns-from-top-tech-companies-4c5a3311d8ea)
- [next-intl — Internationalization for Next.js (official)](https://next-intl.dev/)
- [Guides: Internationalization — Next.js official docs](https://nextjs.org/docs/app/guides/internationalization)
- [Using Realtime with Next.js — Supabase Docs](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [Building a Real-time Notification System with Supabase and Next.js — MakerKit](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs)

---
*Architecture research for: small service business booking website (Jetwash24 car wash)*
*Researched: 2026-03-20*
