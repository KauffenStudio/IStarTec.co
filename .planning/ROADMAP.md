# Roadmap: Jetwash24

## Overview

Jetwash24 is built database-outward: the schema and slot engine are established first because every other piece depends on them. The i18n layer is wired in Phase 1 — before any visible string is written — so bilingual support is structural rather than retrofitted. The slot engine (Phase 2) is built and validated in isolation before any UI touches it. The landing page and service catalog (Phase 3) are the first thing real users see and establish the visual language before the booking wizard is assembled (Phase 4). Email notifications (Phase 5) are built after the booking flow is confirmed working so templates can use real data. Phase 6 is a launch gate — security hardening, bilingual audit, and deliverability verification — not a feature phase.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js + Supabase + Tailwind + shadcn/ui + next-intl scaffolding, database schema, logo, design system (completed 2026-03-20)
- [ ] **Phase 2: Slot Engine + Booking API** - Server-side availability logic, atomic booking with 15min buffer, cancellation token endpoint
- [ ] **Phase 3: Landing Page + Service Catalog** - Homepage hero, service catalog UI, package display, contact section, bilingual content
- [ ] **Phase 4: Booking Flow UI** - Multi-step booking wizard wired to API, price summary, GDPR consent, mobile-responsive
- [ ] **Phase 5: Email Notification Pipeline** - Resend setup, confirmation email, business notification, cancellation link, DNS deliverability
- [ ] **Phase 6: Polish + Launch** - Full bilingual audit, real device mobile testing, security hardening, go-live

## Phase Details

### Phase 1: Foundation
**Goal**: The project skeleton exists with i18n routing, the correct design system, the database schema seeded with service data, and the logo — everything downstream depends on these decisions being made correctly
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, DSGN-01, DSGN-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Navigating to `/pt` and `/en` routes serves the correct locale with next-intl middleware — no hardcoded strings anywhere in the codebase
  2. The Supabase database has the services, vehicle_types, and bookings tables seeded with Jetwash24's full service catalog and pricing matrix
  3. The atomic booking constraint (Postgres exclusion constraint on tstzrange with btree_gist) is in place and verified to reject overlapping inserts
  4. The Jetwash24 logo asset exists and the Tailwind v4 + shadcn/ui design system is configured with the dark blue / white / cyan color scheme
  5. A developer can run the project locally and see a placeholder home page served in both PT and EN
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding (Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + next-intl + Vitest)
- [ ] 01-02-PLAN.md — Supabase schema, migrations, exclusion constraint, and service catalog seed data
- [ ] 01-03-PLAN.md — Logo creation and design system configuration

### Phase 2: Slot Engine + Booking API
**Goal**: The server-side slot availability and booking creation logic is correct, atomic, and independently testable before any UI depends on it
**Depends on**: Phase 1
**Requirements**: BOOK-03, BOOK-04
**Success Criteria** (what must be TRUE):
  1. `GET /api/slots?date=YYYY-MM-DD&service_id=X` returns only time windows where a booking of the selected service's duration fits within 9h–18h business hours without overlapping any existing confirmed booking plus its 15-minute buffer
  2. Two simultaneous POST requests to `/api/bookings` for the same slot result in exactly one success (HTTP 200) and one conflict (HTTP 409) — no double booking under concurrent load
  3. A slot that would cause a booking to end after 18:00 is never returned as available
  4. Cancelling a booking via the signed cancellation token frees its slot so it appears available again in subsequent slot queries
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Pure slot engine function (lib/slots.ts) with TDD: overlap logic, 30-min grid, 15-min buffer, end-time constraint
- [ ] 02-02-PLAN.md — RLS migration + API routes (GET /api/slots, POST /api/bookings, POST /api/cancel)

### Phase 3: Landing Page + Service Catalog
**Goal**: Visitors can discover Jetwash24's services, pricing, and contact details in both Portuguese and English on a visually polished, brand-consistent site
**Depends on**: Phase 1
**Requirements**: SERV-01, SERV-02, SERV-03, SERV-04, CONT-01, CONT-02, DSGN-04
**Success Criteria** (what must be TRUE):
  1. The homepage displays a hero section with a clear call-to-action button that leads to the booking flow, in both PT and EN
  2. Every service is listed with its name, description, estimated duration, and base price — vehicle type surcharges are shown clearly (citadino / berlina / SUV / carrinha)
  3. Add-on extras for interior services are visible in the catalog with their individual prices and duration additions
  4. Package deals are presented with the bundle price and the saving compared to purchasing services individually
  5. The contact section shows phone number (click-to-call), email, address with a Google Maps link, and Instagram handle — all accurate
**Plans**: TBD

Plans:
- [ ] 03-01: Homepage hero, CTA, and page layout in PT + EN
- [ ] 03-02: Service catalog component (read from Supabase, vehicle surcharges, extras, packages)
- [ ] 03-03: Contact section with map link, social link, and placeholder photo gallery

### Phase 4: Booking Flow UI
**Goal**: A customer can complete a booking from service selection to confirmation in under 2 minutes on any device
**Depends on**: Phase 2, Phase 3
**Requirements**: BOOK-01, BOOK-02, BOOK-05, BOOK-06, DSGN-03
**Success Criteria** (what must be TRUE):
  1. A user can select a service, optional extras, and vehicle type — the price summary updates in real time as selections change
  2. The date picker only enables dates within business operating range; the slot picker shows only genuinely available time slots for the chosen service duration on the selected date
  3. The user fills in name, email, and phone number; the form validates all fields before submission is permitted
  4. A GDPR consent checkbox is present and required — the booking cannot be submitted without it being checked
  5. The booking flow is fully usable on a mobile phone (375px viewport) without horizontal scrolling or tap-target failures
**Plans**: TBD

Plans:
- [ ] 04-01: Multi-step booking wizard shell (ServiceSelector → DatePicker/SlotPicker → CustomerForm → Summary)
- [ ] 04-02: Real-time slot display wired to API, price recalculation, GDPR consent, confirmation page

### Phase 5: Email Notification Pipeline
**Goal**: Every confirmed booking triggers an immediate confirmation to the customer and a notification with cancellation link to the business, delivered reliably from a verified domain
**Depends on**: Phase 4
**Requirements**: BOOK-07, NOTF-01, NOTF-02, TECH-02
**Success Criteria** (what must be TRUE):
  1. Within 30 seconds of a booking being confirmed, the customer receives a confirmation email in their chosen language (PT or EN) containing the service name, date, time, vehicle type, total price, and business contact details
  2. The business email (jetwash24detailing@gmail.com) receives a notification for every new booking with the customer's full details, service, date/time, and vehicle
  3. The business notification email contains a one-click cancellation link that, when visited, marks the booking as cancelled in the database and frees the slot — no manual intervention required
  4. The cancellation link is signed with a secure token (UUID or JWT) — guessing or forging a cancellation URL is not feasible
  5. Emails achieve a mail-tester.com score of 9/10 or higher with SPF, DKIM, and DMARC records correctly configured for the sending domain
**Plans**: TBD

Plans:
- [ ] 05-01: Resend setup, custom domain DNS (SPF/DKIM/DMARC), email service wrapper
- [ ] 05-02: Customer confirmation email template (PT + EN) and business notification email with cancellation link

### Phase 6: Polish + Launch
**Goal**: The site is hardened, fully bilingual with no missing translations, visually correct on real mobile devices, and safe to receive production bookings
**Depends on**: Phase 5
**Requirements**: (launch gate — all v1 requirements verified end-to-end)
**Success Criteria** (what must be TRUE):
  1. Every visible string, error message, form label, email subject, and meta tag has a correct translation in both PT and EN — no English fallbacks appear on the PT locale
  2. The full booking flow completes correctly on a real mobile device (iOS Safari and Android Chrome) at 375px viewport width
  3. The Supabase RLS policies are audited — unauthenticated users cannot read other customers' booking data or modify bookings without the signed cancellation token
  4. A complete end-to-end booking test (select service → pick slot → fill form → submit → receive email → cancel via link → slot freed) passes in the production environment
**Plans**: TBD

Plans:
- [ ] 06-01: Bilingual audit, meta tags, error message translations, accessibility pass
- [ ] 06-02: Security audit (RLS, rate limiting, cancellation token), end-to-end production test, go-live

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete   | 2026-03-20 |
| 2. Slot Engine + Booking API | 0/2 | Not started | - |
| 3. Landing Page + Service Catalog | 0/3 | Not started | - |
| 4. Booking Flow UI | 0/2 | Not started | - |
| 5. Email Notification Pipeline | 0/2 | Not started | - |
| 6. Polish + Launch | 0/2 | Not started | - |
