# Feature Research

**Domain:** Car wash / auto detailing online booking — single-location, in-person payment
**Researched:** 2026-03-20
**Confidence:** HIGH (findings consistent across multiple industry sources)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Service catalogue with prices | Users won't book without knowing what they're paying; price transparency is the #1 trust signal | LOW | Group by interior / exterior / packages. Include duration. |
| Vehicle type selector with price variation | Different car sizes have different prices — users expect this to be handled automatically | MEDIUM | Citadino / Berlina / SUV / Carrinha affects total price |
| Date + time slot picker | Core booking mechanic — the entire point of the site | MEDIUM | Calendar UI showing available slots only |
| Real-time slot availability | Users expect to only see bookable slots; showing full slots and then failing feels broken | MEDIUM | Slots must block when capacity is reached (factoring service duration) |
| Booking confirmation email to customer | Immediate confirmation is the trust signal that a booking "worked" | LOW | Transactional email with booking summary: service, date, time, price, address |
| Business notification email per booking | Operator must know about bookings; this is the substitute for an admin panel | LOW | Email to jetwash24detailing@gmail.com with full booking details |
| Contact information on the site | Phone, address, hours — users expect to find these without effort | LOW | Sticky footer or dedicated section; click-to-call on mobile |
| Mobile-responsive design | 70%+ of automotive service bookings come from mobile devices | LOW | Must work flawlessly on iOS Safari and Android Chrome |
| Prominent "Book Now" CTA | Users look for a clear action; if they can't find it in 3 seconds they leave | LOW | Sticky button or above-the-fold placement; visible on every page |
| Business location (map embed or address) | Users booking a physical location need to know how to get there | LOW | Google Maps embed or clear address display |
| Operating hours displayed | Users need to know when they can actually show up | LOW | Available hours: 9h–18h daily |
| Bilingual content (PT + EN) | Algarve region has significant non-Portuguese resident and tourist population | MEDIUM | PT as primary, EN as secondary; language toggle |

### Differentiators (Competitive Advantage)

Features that set the product apart from a generic booking page. Not required to function, but meaningfully improve conversion or perception.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Add-on extras as bookable line items | Lets customers build exactly the service they want; natural upsell mechanism | MEDIUM | e.g. "Add ozonisation +10€" during booking flow — matches Jetwash24's pricing model |
| Service duration shown per option | Reduces anxiety about time commitment; helps customers plan their day | LOW | Show estimated time for each service/package combination |
| Before/after photo gallery | Most powerful conversion tool in the detailing industry — shows proof of quality | LOW | Use placeholder images initially; swap in real photos when provided |
| Package deal presentation (bundle savings) | Makes value obvious and anchors higher-tier purchases | LOW | "Full Detailing 110€ vs buying separately" framing |
| Transparent "price very bad condition — discuss in person" message | Sets realistic expectations; prevents no-shows or disputes | LOW | Inline note under vehicle condition in booking form |
| Instagram feed or link integration | Social proof from active @jetwash24detailing account; shows the business is alive | LOW | A simple Instagram link or embedded feed; not complex |
| Fast booking flow (under 2 min) | Jetwash24's core promise — directly reduces abandonment | MEDIUM | Minimise steps; no account creation required; progress indicator |
| Booking summary page before confirmation | Lets user review their full order (service + extras + vehicle type + time) before committing | LOW | Reduces incorrect bookings, builds confidence |

### Anti-Features (Deliberately NOT Building for v1)

Features that seem good but create disproportionate cost or complexity for the actual business stage.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Customer account / login | Repeat customers want their history | Adds auth complexity, email verification flows, password resets — high overhead for zero validated demand | Booking confirmation email with full details is sufficient; user can re-book from scratch |
| Online payment / Stripe integration | Seems like a complete product | In-person payment is the explicit business decision; adds PCI compliance, refund handling, failed payment states, and ongoing fees | Clear "pay in person" message at booking confirmation |
| Admin panel / dashboard | Business owner wants to see all bookings | Premature for v1 — adds significant scope; email notifications cover the operational need | Email-per-booking to operator; review after real booking volume justifies it |
| SMS / WhatsApp notifications | Higher open rate than email | Requires paid API integration (Twilio, etc.), number verification, opt-in compliance (GDPR) | Email confirmation covers the v1 need; add SMS after validating demand |
| Reviews / ratings system | Social proof | Requires moderation, a customer identity layer, and a critical mass of reviews to not look empty | Link to Google Maps / Instagram where real reviews already exist |
| Loyalty / points programme | Retention mechanic | Zero customer base yet; complex to implement; loyalty matters after repeat visits, not before the first | Competitive pricing is the v1 retention strategy |
| Real-time business chat / chatbot | Instant answers for customers | Requires someone to monitor it; chatbots add misdirection; adds scope with low ROI for v1 | Phone number (click-to-call) and email in contact section |
| Multi-location support | Scalability | Single location: Guia, Portugal. Architecture for multiple locations adds unnecessary complexity | Build for one; extract later if needed |
| Native mobile app | Better mobile experience | Web-first is faster to ship; a responsive website handles 100% of the mobile need at v1 | Mobile-responsive website |
| Cancellation / rescheduling portal | Customer autonomy | Requires booking lookup, authentication or token system, slot re-opening logic — significant scope | "Reply to your confirmation email to cancel" message; operator handles manually |

---

## Feature Dependencies

```
Service Catalogue (prices, descriptions, duration)
    └──required by──> Booking Form (can't choose what doesn't exist)
                          └──required by──> Slot Availability (needs service duration to block time)
                                               └──required by──> Confirmation Email (needs booking data)
                                                                     └──required by──> Business Notification Email (same data)

Vehicle Type Selector
    └──feeds into──> Price Calculation (base price + vehicle surcharge)
                         └──feeds into──> Booking Summary Page

Add-on Extras
    └──requires──> Service Catalogue (extras attach to a base service)
    └──feeds into──> Price Calculation

Bilingual Toggle (PT/EN)
    └──affects──> All content-bearing pages (service names, labels, emails, confirmations)
```

### Dependency Notes

- **Service Catalogue requires definition first:** All booking flow logic (slot duration, pricing, extras) derives from the catalogue. This must be defined and seeded before the booking form can work.
- **Slot availability requires service duration:** A 2-hour Full Detailing blocks different capacity than a 30-min Express. Duration is a property of the service, not a user input.
- **Add-on extras require a base service:** Extras like ozonisation or pet hair removal only make sense attached to an interior service selection.
- **Bilingual toggle affects confirmation emails:** Both PT and EN confirmation emails must be templated; the user's language preference at booking time should determine which email they receive.
- **Vehicle type selector is tightly coupled to price calculation:** Must resolve before showing a total in the booking summary.

---

## MVP Definition

### Launch With (v1)

Minimum needed to take real bookings and validate demand.

- [ ] Service catalogue — interior, exterior, packages with prices, durations, descriptions
- [ ] Vehicle type selector — citadino / berlina / SUV / carrinha with price surcharges
- [ ] Date + time slot picker — real-time availability, slots blocked by duration
- [ ] Add-on extras selector — during booking flow, priced clearly
- [ ] Booking summary page — full review before submission (service + extras + vehicle + datetime + total price)
- [ ] Customer confirmation email — immediate, with all booking details and address
- [ ] Business notification email — to jetwash24detailing@gmail.com per booking
- [ ] Contact section — phone (click-to-call), email, address, hours, Instagram link
- [ ] Bilingual PT + EN — language toggle across all content and emails
- [ ] Mobile-responsive design — optimised for iOS Safari and Android Chrome
- [ ] Prominent "Book Now" CTA — above the fold on homepage, sticky on mobile
- [ ] "Pay in person" messaging — clear at booking summary and confirmation stages

### Add After Validation (v1.x)

Add once real bookings are flowing and patterns emerge.

- [ ] Before/after photo gallery — when real photos are provided by client
- [ ] SMS confirmation — if email open rate proves insufficient (add after monitoring)
- [ ] Cancellation flow via email token — if manual cancellation requests become frequent
- [ ] Google Maps embed — if users report difficulty finding the location

### Future Consideration (v2+)

Defer until product-market fit and booking volume justify the investment.

- [ ] Admin panel / booking dashboard — when email management becomes genuinely painful
- [ ] Customer accounts — when repeat customer retention is a measurable priority
- [ ] Online payment — only if business model changes; currently out of scope by decision
- [ ] Reviews system — after sufficient bookings generate genuine customer feedback
- [ ] SMS/WhatsApp notifications — after validating that email confirmation is insufficient

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Service catalogue with prices | HIGH | LOW | P1 |
| Date + time slot picker | HIGH | MEDIUM | P1 |
| Real-time slot availability | HIGH | MEDIUM | P1 |
| Vehicle type selector + price variation | HIGH | MEDIUM | P1 |
| Customer confirmation email | HIGH | LOW | P1 |
| Business notification email | HIGH | LOW | P1 |
| Mobile-responsive design | HIGH | LOW | P1 |
| Prominent "Book Now" CTA | HIGH | LOW | P1 |
| Contact section (phone, address, hours) | HIGH | LOW | P1 |
| Bilingual PT + EN | HIGH | MEDIUM | P1 |
| Add-on extras as line items | HIGH | MEDIUM | P1 |
| Booking summary before confirmation | MEDIUM | LOW | P1 |
| Service duration shown | MEDIUM | LOW | P1 |
| Package deal presentation | MEDIUM | LOW | P2 |
| Before/after photo gallery | MEDIUM | LOW | P2 |
| Instagram link / integration | LOW | LOW | P2 |
| Google Maps embed | MEDIUM | LOW | P2 |
| Cancellation flow | MEDIUM | MEDIUM | P3 |
| SMS notifications | MEDIUM | HIGH | P3 |
| Admin panel | HIGH | HIGH | P3 |
| Customer accounts | MEDIUM | HIGH | P3 |
| Online payment | MEDIUM | HIGH | P3 (out of scope) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Research based on industry-standard car wash/detailing booking sites (Bookeo, EasyWeek, QuanticaLabs car wash systems, Picktime).

| Feature | SaaS Booking Platforms (Bookeo, EasyWeek) | Generic Detailing Sites (Wix/template) | Jetwash24 Approach |
|---------|------------------------------------------|----------------------------------------|-------------------|
| Service catalogue | YES — configurable | YES — manual | YES — curated, real prices |
| Vehicle type pricing | YES — multi-tier | SOMETIMES | YES — 4 tiers + "discuss in person" |
| Add-on extras | YES — configurable | RARELY | YES — built into flow |
| Online payment | YES — required by platform | SOMETIMES | NO — in-person only (explicit decision) |
| Admin dashboard | YES — full dashboard | NO | NO — email-first for v1 |
| Customer accounts | YES | RARELY | NO — no login required |
| Bilingual | SOMETIMES | RARELY | YES — PT + EN (Algarve context) |
| SMS reminders | YES (paid tier) | NO | NO — v1 email only |
| Review system | YES | RARELY | NO — use Google/Instagram |
| Mobile optimised | YES | SOMETIMES | YES — mobile-first design |
| Instant confirmation | YES | SOMETIMES | YES — automated email |

**Key differentiation for Jetwash24:** A custom-built experience optimised for the specific service catalogue, in-person payment model, and bilingual Algarve audience — without the overhead of SaaS platform fees or generic template limitations.

---

## Sources

- [Car Wash Booking System Guide 2026 — QuanticaLabs](https://quanticalabs.com/blog/wordpress-plugins/what-is-a-car-wash-booking-system-benefits-must-have-features-and-how-it-works-2025-guide/)
- [Car Wash Booking System — Bookeo](https://www.bookeo.com/appointments/car-wash-booking-system/)
- [Car Wash Scheduling Software — Picktime](https://www.picktime.com/scheduling-software/car-wash)
- [Online Reservation Software — EasyWeek](https://easyweek.io/solutions/car-wash)
- [20 Best Auto Detailing Websites 2026 — CyberOptik](https://www.cyberoptik.net/blog/best-auto-detailing-websites-success-secrets/)
- [Car Detailing Website Best Practices — Design Detail](https://www.designdetail.io/blog/car-detailing-website-best-practices-conversions)
- [How UX Increases Detailing Bookings — Grounded Group](https://groundedgroup.com/how-user-experience-can-increase-bookings/)
- [Booking UX Best Practices 2025 — Ralabs](https://ralabs.org/blog/booking-ux-best-practices/)
- [What Do Successful Auto Detailing Websites Have In Common — Detailers Roadmap](https://www.detailersroadmap.com/what-do-successful-auto-detailing-websites-have-in-common)
- [Best Booking System for Detailers — Detail Supply GJ](https://detailsupplygj.com/best-booking-system/)

---
*Feature research for: Car wash / auto detailing online booking (Jetwash24)*
*Researched: 2026-03-20*
