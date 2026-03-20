# Project Research Summary

**Project:** Jetwash24 — Car Wash Online Booking Website
**Domain:** Single-location car wash / auto detailing, in-person payment, bilingual PT/EN, Algarve Portugal
**Researched:** 2026-03-20
**Confidence:** HIGH

## Executive Summary

Jetwash24 is a small service business booking site — a well-understood product category with established patterns. The core complexity is not the web framework but the scheduling engine: variable-duration services (30 min to 2+ hours) sharing a single wash bay require a properly modelled time-range overlap system, not the naive "fixed grid" approach most developers reach for first. The recommended stack is Next.js 15.5 (App Router) with Supabase for persistence and Resend for transactional email. This combination eliminates the need for a separate backend, handles real-time slot availability without polling, and gives the business owner a manageable operational model at zero infrastructure cost on the free tiers.

The recommended approach is to build from the database outward: schema and slot engine first, API routes second, UI third. This order is dictated by a hard dependency chain — the booking form cannot be correctly built before slot availability logic is validated, and slot availability depends entirely on service durations stored in the database. The entire v1 feature set is achievable in a single codebase with no microservices, no admin panel, and no payment integration — all explicitly out of scope. Email-only operations (one notification per booking to the business owner) are sufficient for the expected booking volume.

The most impactful risks are: (1) double-booking from a race condition if the slot check and insert are not atomic — this must be solved at the database constraint level, not in JavaScript; (2) transactional email deliverability failure if emails are sent from an unverified domain; and (3) i18n debt if bilingual support is retrofitted rather than built in from day one. All three risks are preventable with correct early decisions, but they become expensive to fix after launch. GDPR consent is also a legal requirement that cannot be deferred.

## Key Findings

### Recommended Stack

Next.js 15.5 with the App Router provides server components and server actions in a single codebase, eliminating the need for a separate backend. Supabase provides PostgreSQL with a real-time WebSocket layer — critical for reflecting slot availability without polling. Resend handles transactional email with first-class React Email template support. All versions are current stable releases verified against the npm registry on 2026-03-20.

**Core technologies:**
- Next.js 15.5 + React 19: Full-stack framework — App Router server actions replace a separate API layer for form submissions
- TypeScript 5.x: Type safety — essential for the pricing matrix and slot calculation logic
- Tailwind CSS 4.2.2: Styling — CSS-native theming; Shadcn/UI v4 support confirmed
- Supabase (supabase-js 2.99.3 + ssr 0.9.0): Database + realtime — PostgreSQL overlap queries and WebSocket availability updates
- Resend 6.9.4: Email delivery — 3,000 free emails/month; react-email integration
- next-intl 4.8.3: i18n — App Router native, no client context provider required
- react-hook-form 7.71.2 + Zod 4.3.6: Form handling and server-side validation
- react-day-picker 9.14.0 + date-fns 4.1.0: Calendar UI and date arithmetic
- Shadcn/UI (CLI): Accessible component primitives (Button, Calendar, Select, Form, Dialog)
- Vercel: Hosting — zero-config Next.js deployment; Edge Network for Portugal latency

**Do not use:** Prisma (redundant over Supabase client), next-auth (no login needed), Stripe (in-person payment), React Query/SWR (use Supabase Realtime instead), next-i18next (Pages Router only).

### Expected Features

The full feature research is in `.planning/research/FEATURES.md`. Key decisions:

**Must have (table stakes):**
- Service catalogue with prices, durations, and vehicle type surcharges — foundation of the entire booking flow
- Date + time slot picker with real-time availability — the primary product function
- Add-on extras as bookable line items — directly supports Jetwash24's pricing model
- Customer confirmation email + business notification email — operational necessity without an admin panel
- Bilingual PT + EN content and routing — genuine conversion requirement for the Algarve market
- Mobile-responsive design — 70%+ of automotive bookings originate on mobile
- Booking summary page before confirmation — reduces incorrect bookings and no-shows
- Contact section with click-to-call — baseline trust signal for a physical location
- GDPR consent checkbox — legal requirement under EU law (Portugal under CNPD jurisdiction)

**Should have (differentiators, add when possible):**
- Before/after photo gallery — highest-conversion trust signal in the detailing industry
- Package deal presentation with bundle framing — anchors higher-tier purchases
- Instagram link integration — social proof from active account

**Defer to v2+:**
- Admin panel / booking dashboard — email-per-booking covers v1 operational need
- Customer accounts — no validated demand; re-booking from scratch is acceptable
- Online payment — explicitly out of scope; in-person payment is the business decision
- SMS/WhatsApp notifications — email covers v1; add only if open rate data justifies it
- Cancellation / rescheduling portal — significant scope; operator handles manually in v1

### Architecture Approach

The system follows a three-layer pattern: Next.js App Router (presentation + application), Supabase PostgreSQL (data), and external services (Resend, Vercel). The most important architectural decision is keeping the slot engine (`lib/slots.ts`) as a pure, independently testable function. The booking creation API route performs a server-side conflict re-check before every insert — the UI availability display is optimistic; the database is the source of truth. All service data lives in the database (not hardcoded), making pricing changes a database edit rather than a redeployment.

**Major components:**
1. Slot Engine (`lib/slots.ts`) — generates available windows by walking business hours in service-duration increments and excluding overlapping bookings; must be validated before UI is built
2. Booking Service (`app/api/bookings/route.ts`) — atomic conflict check + insert + email trigger; HTTP 409 if slot was taken between display and submission
3. Email Service (`lib/email.ts`) — Resend wrapper; fires after confirmed DB insert; non-blocking to user response
4. i18n Layer (next-intl middleware + `messages/*.json`) — locale routing and translation; must be established before any content string is written
5. Service Catalog (Supabase `services` table) — source of truth for service names, durations, base prices; vehicle surcharges in a separate lookup table

**Build order dictated by dependencies:**
Database schema → Service catalog seed → Slot engine → API routes → Landing page + catalog UI → Booking flow UI → Email service → i18n → Design system

### Critical Pitfalls

Full detail in `.planning/research/PITFALLS.md`. Top pitfalls to eliminate at the architecture level:

1. **Race condition double booking** — Use a Postgres exclusion constraint (`tstzrange(start_time, end_time) WITH &&` where status = 'confirmed') plus a server-side re-check inside the booking POST. A JavaScript check followed by a separate INSERT is insufficient — two concurrent transactions both pass the check.
2. **Slot availability ignoring service duration** — Model each booking as `(start_time, end_time)`. Slot generation must use range overlap logic (`existing_start < candidate_end AND existing_end > candidate_start`), not point-collision. Service must be selected before slot picker renders.
3. **Email deliverability failure** — Send from a verified custom domain (e.g. `reservas@jetwash24.pt`) with SPF, DKIM, and DMARC configured. Never send from a Vercel or Supabase subdomain. Validate with mail-tester.com before launch.
4. **Bilingual i18n retrofitting** — Set up next-intl with `messages/pt.json` and `messages/en.json` on day one, before writing any visible string. Retrofitting bilingual support across a completed codebase is close to a full frontend rewrite.
5. **Missing cancellation flow** — Business notification email must include a one-click signed cancellation link from day one. Without it, cancelled or no-show bookings remain in the database as phantom bookings, filling the calendar over time.
6. **GDPR non-compliance** — Booking form must include an explicit consent checkbox before submission. Portugal is under EU GDPR jurisdiction (CNPD). This is a legal requirement, not a nice-to-have.

## Implications for Roadmap

The architecture research provides an explicit build order. The feature dependency graph and pitfall prevention requirements reinforce it. The phase suggestions below are based on the combined view of all four research files.

### Phase 1: Foundation and Infrastructure

**Rationale:** i18n, database schema, and project scaffolding have zero dependencies and block everything else. Setting these up incorrectly causes the most expensive rework (bilingual retrofit is near a rewrite; schema migration is painful mid-project).
**Delivers:** Working Next.js + Supabase project with locale routing, database schema, and seeded service catalog — no UI beyond placeholder
**Addresses:** Bilingual content requirement; service catalog dependency; all database-first features
**Avoids:** Bilingual hardcoding pitfall (Pitfall 5); price matrix hardcoding pitfall (Pitfall 6); RLS disabled shortcut

### Phase 2: Slot Engine and Booking API

**Rationale:** The slot engine is the most complex and most failure-prone piece of the system. It must be built and unit-tested in isolation before the UI depends on it. Both critical correctness pitfalls (race condition, duration overlap) are addressed here.
**Delivers:** Working API routes (`GET /api/slots`, `POST /api/bookings`) with correct overlap logic, atomic conflict prevention, and minimum advance booking window enforcement
**Uses:** Supabase PostgreSQL with exclusion constraint, `lib/slots.ts` pure function, Zod validation
**Implements:** Slot Engine and Booking Service architecture components
**Avoids:** Race condition double booking (Pitfall 1); duration overlap bug (Pitfall 2); no minimum advance window (Pitfall 7)

### Phase 3: Landing Page and Service Catalog UI

**Rationale:** The marketing pages and service catalog are static relative to the booking engine and can be built independently once the database is seeded. They are the first thing real users see and establish the visual language for the booking flow.
**Delivers:** Homepage with CTA, service catalog with prices/durations/vehicle surcharges, contact section, bilingual content in both locales, mobile-responsive layout
**Addresses:** Service catalogue, vehicle type display, contact section, mobile design, Instagram link, package deal presentation, before/after photo placeholder
**Avoids:** Hardcoded prices in components (read from database); missing contact information

### Phase 4: Booking Flow UI

**Rationale:** Booking flow UI depends on working API routes (Phase 2) and established design language (Phase 3). This phase wires the multi-step form to the backend.
**Delivers:** Complete booking wizard (ServiceSelector → DatePicker + SlotPicker → CustomerForm → BookingSummary → Confirmation page) with real-time availability, price recalculation, add-on extras, and GDPR consent checkbox
**Uses:** react-hook-form, Zod, react-day-picker, date-fns, Shadcn/UI components
**Implements:** Booking Flow UI, DatePicker, SlotPicker, CustomerForm components
**Avoids:** Service selection after slot selection (UX pitfall); missing GDPR consent (security/legal pitfall); no price summary before confirmation (UX pitfall); no mobile-optimised date picker

### Phase 5: Email Notification Pipeline

**Rationale:** Email is built after the booking creation is confirmed working so that the email templates can use real booking data. DNS configuration (SPF/DKIM/DMARC) must be done before any production email is sent.
**Delivers:** Customer confirmation email (PT + EN variants), business notification email with one-click signed cancellation link, DNS records configured, deliverability validated with mail-tester.com
**Uses:** Resend 6.9.4, @react-email/components, custom domain DNS records
**Implements:** Email Service component; cancellation token endpoint
**Avoids:** Email going to spam (Pitfall 4); email-only cancellation blindness (Pitfall 3); cancellation token guessable with sequential IDs (security pitfall)

### Phase 6: Polish, Security, and Launch Preparation

**Rationale:** Final hardening before production traffic. CAPTCHA, rate limiting, and the full "Looks Done But Isn't" checklist from PITFALLS.md must be completed before go-live.
**Delivers:** Spam/bot protection on booking form, complete bilingual content audit, real device mobile testing, race condition end-to-end test, before/after photo gallery (if photos provided), Google Maps embed
**Addresses:** hCaptcha or Cloudflare Turnstile integration; full translation coverage including error messages and meta tags; Supabase RLS audit
**Avoids:** Spam booking flooding; remaining UX and security gaps

### Phase Ordering Rationale

- Phases 1 and 2 must precede everything. The database schema and slot engine correctness are hard prerequisites with no workaround.
- Phase 3 can begin concurrently with Phase 2 for static content only, but must not build the booking form before Phase 2 routes are live and tested.
- Phase 4 is the highest UX complexity. Doing it fourth means the design language is established and the API is validated before the form is built.
- Phase 5 is intentionally after Phase 4 so email templates can use real booking confirmation data from integration testing.
- Phase 6 is a launch gate, not a feature phase. It must not be merged into earlier phases or treated as optional.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Email):** DNS configuration (SPF/DKIM/DMARC for jetwash24.pt) may need domain-specific research; Resend custom domain verification steps should be confirmed against current Resend docs before planning
- **Phase 2 (Slot Engine):** The Postgres exclusion constraint using `btree_gist` extension availability on Supabase free tier should be confirmed before relying on it

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** next-intl App Router setup and Supabase project scaffolding are thoroughly documented with official guides
- **Phase 3 (Landing Page):** Standard Next.js server component page with Tailwind + Shadcn/UI — no novel patterns
- **Phase 4 (Booking Flow UI):** react-hook-form + Zod + react-day-picker integration is well-documented; Shadcn/UI Calendar component handles the hard parts
- **Phase 6 (Polish):** Standard pre-launch checklist; no novel integrations

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry live on 2026-03-20; compatibility matrix confirmed via official docs for all major packages |
| Features | HIGH | Findings consistent across 10 industry sources (Bookeo, EasyWeek, Picktime, QuanticaLabs, CyberOptik, Ralabs, Detailers Roadmap); feature dependency graph cross-validated |
| Architecture | HIGH | Core patterns (dynamic slot generation, server-side conflict guard, database-driven catalog) verified via official Supabase, Next.js, and booking system architecture sources |
| Pitfalls | HIGH | Race condition and duration overlap pitfalls verified across multiple engineering sources; GDPR requirement confirmed via iubenda and CNPD jurisdiction; email deliverability verified via Clearout and Mailtrap |

**Overall confidence:** HIGH

### Gaps to Address

- **Cancellation token implementation detail:** The signed token approach is recommended but the specific implementation (JWT vs UUID stored in DB) should be decided during Phase 5 planning. UUID stored in DB is simpler; JWT avoids an extra DB lookup. Neither is wrong for this scale.
- **Buffer time between services:** PITFALLS.md recommends a post-service buffer (e.g. 15 minutes for cleanup/prep). The exact duration should be confirmed with the business owner before Phase 2 implementation — it affects total daily capacity.
- **Jetwash24 exact service catalogue and pricing:** The architecture assumes service data comes from the database. The actual services, durations, and prices for Jetwash24 must be confirmed with the client and seeded during Phase 1. The schema supports any catalogue; the data is client-specific.
- **Domain and DNS control:** Phase 5 email deliverability depends on the business having access to DNS records for `jetwash24.pt`. This must be confirmed before Phase 5 starts.

## Sources

### Primary (HIGH confidence)
- [Next.js 15.5 release blog](https://nextjs.org/blog/next-15-5) — confirmed stable version and App Router patterns
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — confirmed 15.5 as current recommended stable
- [Supabase Realtime docs](https://supabase.com/docs/guides/realtime/getting_started) — WebSocket slot availability pattern
- [Resend official docs](https://resend.com/docs/send-with-nextjs) — Server Actions integration, App Router support
- [react-email 5.0 announcement](https://resend.com/blog/react-email-5) — React 19.2 and Tailwind v4 support
- [next-intl official site](https://next-intl.dev/) — App Router support, 4.8.3 version
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — stable January 2025, CSS-native config
- [Shadcn/UI Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — CLI support for v4
- npm registry (live verification) — all version numbers confirmed
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — integration pattern
- [Solving Double Booking at Scale — ITNEXT](https://itnext.io/solving-double-booking-at-scale-system-design-patterns-from-top-tech-companies-4c5a3311d8ea) — race condition prevention
- [GDPR Compliance in Online Booking — iubenda](https://www.iubenda.com/en/blog/gdpr-compliance-in-online-booking-best-practices-for-enhanced-privacy-and-security/) — EU legal requirements

### Secondary (MEDIUM confidence)
- [Car Wash Booking System Guide — QuanticaLabs](https://quanticalabs.com/blog/wordpress-plugins/what-is-a-car-wash-booking-system-benefits-must-have-features-and-how-it-works-2025-guide/) — feature landscape
- [20 Best Auto Detailing Websites 2026 — CyberOptik](https://www.cyberoptik.net/blog/best-auto-detailing-websites-success-secrets/) — UX and conversion patterns
- [Booking UX Best Practices 2025 — Ralabs](https://ralabs.org/blog/booking-ux-best-practices/) — form UX patterns
- [Time Blocking System in Appointment Booking — DEV Community](https://dev.to/priyam_jain_f127ddf8c4d8d/time-blocking-system-in-appointment-booking-5een) — slot engine patterns
- [10 Reasons Your Transactional Emails Won't Deliver — Clearout](https://clearout.io/blog/transactional-email-deliverability/) — deliverability guidance
- [Builder.io: Best React calendar libraries 2025](https://www.builder.io/blog/best-react-calendar-component-ai) — react-day-picker recommendation (verified against daypicker.dev)

### Tertiary (MEDIUM-LOW confidence)
- [Concurrency Conundrum in Booking Systems — Medium](https://medium.com/@abhishekranjandev/concurrency-conundrum-in-booking-systems-2e53dc717e8c) — race condition patterns (community source, corroborated by multiple others)
- [Localization Best Practices — Phrase](https://phrase.com/blog/posts/10-common-mistakes-in-software-localization/) — i18n pitfalls (general, not Next.js specific)

---
*Research completed: 2026-03-20*
*Ready for roadmap: yes*
