# Pitfalls Research

**Domain:** Car wash manual booking website — time-slot scheduling, email-only management, bilingual PT+EN, variable service durations, no admin panel
**Researched:** 2026-03-20
**Confidence:** HIGH (critical pitfalls verified across multiple sources; email-only management patterns verified through community evidence)

---

## Critical Pitfalls

### Pitfall 1: Race Condition Double Booking

**What goes wrong:**
Two customers simultaneously view the same available slot, both see it as free, and both complete the booking. Both receive confirmation emails. The business receives two notification emails for the same slot and has no automated way to detect the conflict. The operator only discovers the double booking on the day of service.

**Why it happens:**
Developers check availability at form-load time rather than at submission time. Without a database-level atomic lock on the slot at write time (e.g. a unique constraint or row lock), two concurrent INSERT operations both succeed. This is the most common and most damaging bug in custom booking systems.

**How to avoid:**
- Use a database unique constraint on `(date, start_time)` or a status column that goes through a locked/confirmed state machine
- If using Supabase: use a Postgres function with `FOR UPDATE` row lock or a unique partial index to enforce one booking per slot atomically
- Never rely on a JavaScript availability check followed by a separate write — the check and write must be one atomic operation
- For a single-bay car wash, the constraint is simple: no two bookings can overlap (`start_time < new_end_time AND end_time > new_start_time`)

**Warning signs:**
- Booking form does a `SELECT` then, separately, an `INSERT` — these are two round trips without a lock
- No unique constraint or transaction on the bookings table
- Availability is computed client-side only

**Phase to address:**
Booking system core (earliest booking phase) — this must be correct from day one.

---

### Pitfall 2: Slot Availability Ignoring Variable Service Duration

**What goes wrong:**
A 2-hour Full Detailing booking is stored as occupying 14:00–16:00, but the system still offers 14:30 and 15:00 as available slots because it only checks whether `start_time` conflicts, not whether the new booking's full time range overlaps with an existing one. A customer books 14:30 for a 30-minute express wash; the operator now has two jobs physically occupying the bay at the same time.

**Why it happens:**
Developers think of slots as fixed grid lines (every 30 minutes) rather than as time ranges. Availability queries check `start_time NOT IN (booked_times)` instead of checking for range overlap. This is documented as a real bug across Microsoft Bookings, Acuity, and custom systems alike.

**How to avoid:**
- Model each booking as `(start_time, end_time)` where `end_time = start_time + service_duration`
- Availability query must use overlap logic: a slot is available only if no existing booking satisfies `existing_start < candidate_end AND existing_end > candidate_start`
- Generate available slots dynamically per service type: the slot grid for a 30-min service is different from the slot grid for a 120-min service
- Add a buffer time (e.g. 15 minutes) after each service for cleaning/prep before offering the next slot

**Warning signs:**
- Slot generation uses a single fixed interval (e.g. every 30 min) regardless of which service the user selected
- The booking table has `start_time` but no `end_time` or `duration` column
- Service selection happens after slot selection in the booking flow (duration unknown when slots are generated)

**Phase to address:**
Booking system core — slot generation logic must know the selected service duration before rendering the calendar.

---

### Pitfall 3: Email-Only Management Blindness to Cancellations

**What goes wrong:**
A customer cancels by replying to the confirmation email, or simply does not show up. The operator reads the cancellation in Gmail but does not manually update any system. The slot remains marked as booked in the database. Future customers cannot book that slot even though it is now free. Over time, phantom bookings accumulate and the calendar appears full when it is not.

**Why it happens:**
Without an admin panel, there is no UI to mark a booking as cancelled. The email confirmation pipeline only runs forward (new bookings), not backward (cancellations, no-shows). This is the core tension of "no admin panel" architecture: all state changes require either a self-service link or a manual database intervention.

**How to avoid:**
- Include a one-click cancellation link in every business notification email that, when clicked, marks the booking as cancelled in the database (no login required, use a signed token)
- Include the same cancellation link in the customer confirmation email so customers can self-cancel
- Set a booking expiry: if a booking is not confirmed/arrived within X minutes of its start time, auto-release the slot (optional, but valuable for no-show recovery)
- Document a "break-glass" procedure for the operator: direct Supabase table editor access to manually cancel slots when needed

**Warning signs:**
- Business notification email contains only booking details, no action links
- No `status` column on the bookings table (no way to distinguish confirmed vs. cancelled vs. no-show)
- No cancellation workflow designed before launch

**Phase to address:**
Email notification pipeline phase — cancellation links and booking status must be designed alongside confirmation emails, not added later.

---

### Pitfall 4: Transactional Email Going to Spam

**What goes wrong:**
Confirmation emails to customers land in spam or are never delivered. The customer believes the booking failed and books again, or shows up without a confirmation the operator saw. Business notification emails to `jetwash24detailing@gmail.com` land in promotions or spam, so the operator misses bookings.

**Why it happens:**
Sending transactional email from a generic domain (e.g. `noreply@vercel-deployed-app.vercel.app`) or from a Supabase/Resend default domain without SPF/DKIM configured. Gmail increasingly filters unauthenticated transactional mail. A 2025 deliverability report found 16.9% of emails never reach their destination even when "delivered."

**How to avoid:**
- Use a dedicated transactional email provider (Resend, Postmark, or SendGrid) — never use Supabase's built-in SMTP for production volume
- Send FROM a domain the business controls (e.g. `reservas@jetwash24.pt`) with SPF, DKIM, and DMARC records configured
- Keep the FROM address consistent across all emails — changing it resets sender reputation
- Test deliverability with mail-tester.com before launch
- For the business notification to Gmail: send from a verified domain address; Gmail trusts authenticated senders far more than free email addresses

**Warning signs:**
- Emails sent from `@vercel.app`, `@supabase.io`, or any platform subdomain
- No SPF/DKIM records visible in DNS when checked with MXToolbox
- No email deliverability test performed before go-live

**Phase to address:**
Email notification pipeline phase — DNS records and provider setup must precede any email sending.

---

### Pitfall 5: Bilingual Site Hardcoded in One Language

**What goes wrong:**
The site is built in Portuguese first with text hardcoded in JSX/HTML. Adding English later requires touching every component, hunting for strings across the codebase, and often missing edge cases (error messages, toast notifications, email subjects, meta tags, placeholder text). The English version ends up incomplete or inconsistently translated.

**Why it happens:**
i18n is treated as a cosmetic feature added at the end rather than a structural concern designed from the start. The Algarve tourist context makes English genuinely necessary — not a nice-to-have — so incomplete English is a real conversion blocker.

**How to avoid:**
- Set up `next-intl` (or equivalent) with a locale file structure from day one, even before writing a single visible string
- All user-facing strings go into `messages/pt.json` and `messages/en.json` from the first commit
- This includes: error messages, form validation text, email confirmation subject lines, meta titles/descriptions, and image alt text
- Use locale-aware routing (`/pt/...` and `/en/...`) or a language switcher that stores preference in a cookie, not automatic redirect based on browser locale (auto-redirect frustrates users on shared devices or while travelling)

**Warning signs:**
- Any literal Portuguese string in a `.tsx` component file
- No `messages/` or `locales/` directory in the project structure after the first feature is built
- Language switcher is added as a last-minute task

**Phase to address:**
Project foundation / setup phase — i18n structure must be established before any content is written.

---

### Pitfall 6: Price Matrix Complexity Handled With Hardcoded Conditionals

**What goes wrong:**
The service + vehicle type price matrix (4 services × 4 vehicle types = up to 16 price points, plus add-ons) gets encoded as nested `if/else` or `switch` statements in the frontend. When the business wants to change a price, a code deployment is required. When a new service is added, the conditional tree grows and bugs appear in edge cases (e.g. Pet Hair Removal + SUV surcharge double-counted, or base price shown before vehicle type is selected).

**Why it happens:**
The pricing seems simple at first glance. Developers write it inline rather than as a data structure.

**How to avoid:**
- Model the pricing in a data table (a `services` table in the database, or a well-structured JSON config file)
- The frontend reads the price matrix from this single source and computes the final price dynamically based on selected service + vehicle type + add-ons
- Price calculation lives in one function, not scattered across components
- For v1 without an admin panel, a config file is acceptable; document that price changes require a config edit + redeploy (this is acceptable for an early-stage business)

**Warning signs:**
- Price logic appears in multiple components
- A price change requires searching the codebase for the number
- The booking summary shows the wrong price when the vehicle type changes after service selection

**Phase to address:**
Service catalog and booking flow phases — pricing data model must be established before the booking form is built.

---

### Pitfall 7: No Minimum Advance Booking Window

**What goes wrong:**
The booking system allows a customer to book a slot starting in 5 minutes. The operator has no way to prepare. The customer arrives, the operator is mid-job and cannot accept them. The confirmation email was already sent. The customer is angry. This is a documented common issue in small-business booking systems.

**Why it happens:**
Slot availability logic focuses on whether a slot is occupied but not whether there is sufficient lead time for the business to act on the booking.

**How to avoid:**
- Enforce a minimum booking lead time of at least 1–2 hours (configurable)
- The slot generator should exclude any slot that starts within the minimum lead time from now
- Optionally: do not show today's remaining slots after a cutoff time (e.g. no same-day bookings after 16:00 for an 18:00 close)

**Warning signs:**
- Slot generation uses only `NOW()` as the lower bound without a buffer offset
- No minimum notice setting in the booking configuration

**Phase to address:**
Booking system core — slot generation logic.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing only `start_time`, deriving `end_time` at query time | Simpler schema | Overlap queries become complex; duration changes invalidate old bookings | Never — store both |
| Hardcoding prices in component JSX | Faster initial build | Price change requires code deployment; bugs in edge cases | Never for a real business |
| Using Supabase SMTP for transactional email | No additional setup | High deliverability failure rate in production | Never in production |
| Auto-redirecting users to language based on browser locale | Feels smart | Breaks for tourists, shared devices, expats — frustrates the users you most need to convert | Never — use explicit switcher |
| Single language codebase, translate "later" | Faster MVP | Every component must be refactored; English version always feels incomplete | Never when bilingual is a day-one requirement |
| No booking status column (`confirmed`, `cancelled`, `no-show`) | Simpler schema | Cannot cancel without deleting records; analytics impossible; email-only management breaks | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Resend / email provider | Sending FROM the app's deployment domain (e.g. `@vercel.app`) | Send FROM a verified custom domain with SPF + DKIM + DMARC configured |
| Supabase | Using `supabase.from('bookings').insert()` without a transaction for slot reservation | Use a Postgres RPC function with row-level locking to make check + insert atomic |
| Supabase Row Level Security | Leaving RLS disabled on the `bookings` table "temporarily" | Enable RLS from the start; allow `INSERT` for anon users but restrict `SELECT` and `DELETE` |
| next-intl | Wrapping only page content in the provider; forgetting error messages and metadata | Wire i18n into `next/head` metadata, form validation messages, and email content from day one |
| Google Maps embed | Embedding an iframe without a `title` attribute, breaking accessibility and SEO | Always include descriptive `title` on iframes; consider a static map image for performance |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all bookings to compute availability client-side | Slow calendar render as bookings accumulate | Compute available slots in a Postgres function or server action; return only available slot list | At ~100+ bookings |
| No database index on `(booking_date, start_time)` | Availability queries slow down over time | Add index at schema creation | At ~500 bookings |
| Rendering the full service catalog on every slot selection change | UI jank during price recalculation | Memoize price computation; service data is static, load once | Immediate on slower mobile connections |
| Loading the booking form as a client component that fetches availability on mount | Visible loading spinner, layout shift | Pre-render available dates server-side; fetch slot times only when a date is selected | Immediate on 3G mobile |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No CAPTCHA or rate limiting on the booking form | Spam bookings flood the operator's email; all slots appear full | Add hCaptcha or Cloudflare Turnstile to the booking form; rate-limit booking submissions by IP |
| Booking cancellation link uses sequential integer IDs (e.g. `/cancel?id=12`) | Anyone can cancel any booking by guessing IDs | Use a cryptographically random token (UUID v4 or signed JWT) in cancellation links |
| Exposing customer email addresses in client-side API responses | Scraping, privacy violation, GDPR breach | Never return full customer records to the browser; cancellation tokens are sufficient |
| No GDPR consent checkbox on the booking form | Legal violation under EU GDPR / ePrivacy; Portugal falls under EU law | Require explicit opt-in checkbox: "I consent to my data being used to process this booking." Link to a privacy notice |
| Storing customer data indefinitely | GDPR data retention violation | Define a retention policy (e.g. delete booking records older than 2 years); document it in the privacy notice |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Service selection after slot selection | User picks a time, then picks a service that doesn't fit that time — form errors and confusion | Always collect service first, then generate slots based on that service's duration |
| Showing all slots including today-past slots | Customers try to book a time that already passed and get an error | Filter out any slot starting within the minimum booking window from `NOW()` |
| No price summary before final confirmation | Customer surprised by total (vehicle surcharge + add-ons not visible until the end) | Show a running price breakdown as the customer selects service, add-ons, and vehicle type |
| Language switcher hidden or requiring page reload | Tourists and English-speakers abandon the site | Persistent language switcher in the header, switch is instant without full page reload |
| Booking form requires account creation | 24% of users abandon forms that require account registration | No login required for v1; email + phone is sufficient for identity |
| No mobile-optimised date picker | Fat-finger errors on calendar grid; users abandon on mobile (up to 70% of traffic is mobile) | Use a native-feeling date picker component designed for touch (e.g. react-day-picker with large tap targets) |
| Ambiguous success state | Customer unsure if booking was confirmed; they submit twice | Clear confirmation screen + confirmation email within 30 seconds; state explicitly "Your booking is confirmed" |

---

## "Looks Done But Isn't" Checklist

- [ ] **Booking form:** Appears functional in dev but uses a single hardcoded date — verify slot generation works across month boundaries and excludes Sundays if the business is closed
- [ ] **Email confirmations:** Emails send in dev but FROM address is unverified in production — verify SPF/DKIM with mail-tester.com against the production domain before launch
- [ ] **Cancellation flow:** Business notification email contains booking details — verify it also contains a one-click cancellation link that actually updates the database
- [ ] **Bilingual content:** All visible strings are translated — verify error messages, toast notifications, email subjects, and `<meta>` descriptions are also translated (not just page body)
- [ ] **Slot blocking:** Full Detailing (2h) appears to block the slot — verify it also blocks 14:30 and 15:00 when booked at 14:00 (range overlap, not just start-time collision)
- [ ] **Price matrix:** Price updates when vehicle type changes after service is already selected — verify the summary recalculates on every input change
- [ ] **GDPR:** Booking form submits — verify there is a consent checkbox and a link to a privacy notice that exists and is readable in both languages
- [ ] **Mobile:** Form works on desktop — verify on a real iOS/Android device at 375px width with a slow 3G throttle in DevTools
- [ ] **Race condition:** Booking succeeds in a single session — verify two browser tabs cannot both book the same slot simultaneously

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double booking discovered post-launch | MEDIUM | Add unique constraint to `bookings` table via migration; contact affected customer; issue manual refund or reschedule |
| Duration overlap bug found after go-live | HIGH | Audit all existing bookings for conflicts; fix overlap query; potentially contact affected customers; rebuild trust |
| Email going to spam discovered post-launch | MEDIUM | Set up SPF/DKIM/DMARC on domain DNS; switch to dedicated transactional provider; warm up sender reputation |
| Bilingual i18n refactor needed | HIGH | Retrofit i18n library across all components; extract every hardcoded string; high risk of missing edge cases; this is a near-rewrite of the frontend |
| GDPR non-compliance discovered | HIGH | Add consent checkbox + privacy notice; assess whether previously collected data has a valid legal basis; may require notifying CNPD (Portugal's DPA) |
| Phantom bookings from no cancellation flow | LOW | Add `status` column via migration; build cancellation token endpoint; backfill existing bookings with `confirmed` status |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Race condition double booking | Booking system core | Run two concurrent booking submissions for the same slot; verify only one succeeds |
| Slot duration overlap | Booking system core | Book a 2h service at 14:00; verify 14:30 and 15:00 are unavailable |
| Email-only cancellation blindness | Email notification pipeline | Cancel a booking via email link; verify slot becomes bookable again immediately |
| Transactional email spam | Email notification pipeline (pre-launch) | Run mail-tester.com against production domain; score must be >9/10 |
| Bilingual hardcoded strings | Project foundation / setup | Verify no literal PT strings exist outside `messages/pt.json` after setup phase |
| Price matrix hardcoded conditionals | Service catalog phase | Change a price in the config; verify all form states reflect the new price without code changes |
| No minimum advance booking window | Booking system core | Attempt to book a slot starting in 10 minutes; verify it is not offered |
| CAPTCHA / spam bookings | Booking system core | Verify form submission is protected before public launch |
| Cancellation token guessable | Email notification pipeline | Verify cancellation URL uses UUID/signed token, not sequential integer |
| GDPR consent missing | Booking form phase | Verify form cannot be submitted without consent checkbox checked |
| No mobile-optimised date picker | Booking form / UI phase | Test on real device at 375px; all inputs must be tappable without zoom |

---

## Sources

- [5 Common Online Booking Mistakes and How to Avoid Them — Site123](https://www.site123.com/learn/5-common-online-booking-mistakes-and-how-to-avoid-them)
- [17 Common Mistakes to Avoid While Using Online Booking Systems — EZBook](https://ezbook.com/mistakes-to-avoid-when-using-online-booking-system/)
- [Common Booking Mistakes Businesses Can't Afford to Make in 2025 — KliknRoll](https://kliknroll.com/common-booking-mistake-in-2025/)
- [Concurrency Conundrum in Booking Systems — Medium](https://medium.com/@abhishekranjandev/concurrency-conundrum-in-booking-systems-2e53dc717e8c)
- [Debugging Real-Time Bookings: Race Conditions and Double Bookings — Medium](https://medium.com/@get2vikasjha/debugging-real-time-bookings-fixing-hidden-race-conditions-cache-issues-and-double-bookings-98328bc52192)
- [Buffer Time in Bookings Not Included in Scheduling — Microsoft Q&A](https://learn.microsoft.com/en-ca/answers/questions/5764915/buffer-time-in-bookings-is-not-being-included-in-s)
- [Time Blocking System in Appointment Booking — DEV Community](https://dev.to/priyam_jain_f127ddf8c4d8d/time-blocking-system-in-appointment-booking-5een)
- [10 Reasons Your Transactional Emails Won't Deliver — Clearout](https://clearout.io/blog/transactional-email-deliverability/)
- [Email Deliverability Issues: Diagnose, Fix, Prevent — Mailtrap](https://mailtrap.io/blog/email-deliverability-issues/)
- [Localization Best Practices: 10 Common Pitfalls — Phrase](https://phrase.com/blog/posts/10-common-mistakes-in-software-localization/)
- [Portuguese Language Peculiarities During Localization — LingoHub](https://lingohub.com/blog/the-portuguese-language-peculiarities-during-localization)
- [GDPR Compliance in Online Booking — iubenda](https://www.iubenda.com/en/blog/gdpr-compliance-in-online-booking-best-practices-for-enhanced-privacy-and-security/)
- [Booking UX Best Practices to Boost Conversions — Ralabs](https://ralabs.org/blog/booking-ux-best-practices/)
- [Why Customers Abandon Bookings — Bluewater Digital](https://bluewater.digital/article/why-customers-abandon-bookings/)
- [Car Wash Booking System Guide — QuanticaLabs](https://quanticalabs.com/blog/wordpress-plugins/what-is-a-car-wash-booking-system-benefits-must-have-features-and-how-it-works-2025-guide/)

---
*Pitfalls research for: Car wash online booking — Jetwash24, Guia Portugal*
*Researched: 2026-03-20*
