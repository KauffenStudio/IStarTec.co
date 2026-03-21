# Phase 3: Landing Page + Service Catalog - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Public-facing homepage that lets visitors discover Jetwash24's services, pricing, and contact details in both Portuguese and English. Scope: hero section, brief about, service catalog with pricing, and contact section — all on a single scrollable page. The booking flow (date picker, booking form, confirmation) is Phase 4. The CTA button will scroll to the services section for now; Phase 4 updates it to open the booking flow.

</domain>

<decisions>
## Implementation Decisions

### Page structure
- Single scrollable page at `/[locale]` — no separate routes for services or contact
- Section order: Hero → About → Service Catalog → Contact
- All sections anchor-linked (e.g. `#services`, `#contact`) for CTA and nav

### Hero
- Full-bleed dark navy gradient background (no photo needed)
- `logo-white.svg` prominently centered — already exists in `public/`
- Tagline (PT): **"Detailing profissional, preços honestos."** — translate to EN: "Professional detailing, honest prices."
- Cyan CTA button: "Conhecer os Serviços" (PT) / "See Services" (EN) — scrolls to `#services`
- Below CTA: 3 quick-glance badge icons — Lavagem Interior | Lavagem Exterior | Pacotes

### About section
- Short paragraph between hero and services (2-3 sentences)
- Who we are, where we are (Guia, Portugal), our philosophy
- No separate About page — inline between hero and catalog

### Service catalog navigation
- Tab bar with 3 tabs: **Interior | Exterior | Pacotes**
- Tabs filter the displayed service cards (client-side React state)
- Vehicle type selector at **top of catalog** (above tab bar or within it)
  - Options: Citadino | Berlina | SUV | Carrinha
  - Selecting a vehicle type updates ALL prices dynamically (client-side JS, no page reload)

### Service cards
- Each service: name, description, estimated duration, price (adjusted by selected vehicle type)
- Interior tab: **Lavagem Interior Express** card includes selectable add-on extras inline (checkboxes or toggle list):
  - Limpeza Profunda Estofos (+45min, +50€)
  - Remoção de Pelos de Animais (+15min, +10€)
  - Limpeza de Vidros Interiores (+10min, +5€)
  - Ozonização (+20min, +10€)
- Interior tab also shows **Pacote Interior Premium** (all extras included, ~2h, 75€)
- Exterior tab: Lavagem Exterior Express (15€), Lavagem Exterior Premium (30€)
- Pacotes tab: Exterior + Interior Express (25€), Full Detailing (~110€)

### Package pricing display
- Show crossed-out individual total price alongside bundle price
- Saving badge: e.g. "~~30€~~ 25€ — Poupa 5€" (implements SERV-04)

### Vehicle surcharges — display rule
- Citadino = base price (no surcharge shown)
- Berlina = base + 5€
- SUV = base + 10€
- Carrinha = base + 15€
- All prices shown in € with vehicle-adjusted totals after selector change

### Data source
- Service catalog data fetched from Supabase (`services` table via seed.sql) — not hardcoded
- Server component fetches on page load; vehicle type adjustment is client-side from fetched data
- Consistent with what the booking API (Phase 2) uses — single source of truth

### Placeholder visuals
- **Hero**: brand gradient block (navy → cyan) — no external image files needed, pure CSS
- **Service cards**: text + category icon only (interior / exterior / package icon) — no per-card images
- No gray placeholder boxes — either brand gradient or text-only
- When real client photos arrive, hero gradient swaps to `<Image>` with `object-cover`

### i18n
- All visible strings go through next-intl (`getTranslations` in server components, `useTranslations` in client components)
- Translation keys: `HomePage.*` for hero/about, `Services.*` for catalog, `Contact.*` for contact section
- Vehicle type labels, tab names, and CTA text all translated

### Contact section
- Phone: +351 928380478 — click-to-call `href="tel:+351928380478"`
- Email: jetwash24detailing@gmail.com — `href="mailto:..."`
- Address: Guia, Portugal — link to Google Maps search (not embedded iframe)
- Instagram: @jetwash24detailing — external link to profile
- No embedded Google Maps iframe in this phase (keeps page fast, no API key needed)

### Claude's Discretion
- Exact shadcn/ui component choices for cards, tabs, and badges
- Navigation bar design (sticky or not, mobile hamburger or not)
- Exact spacing, typography scale, and icon set (Lucide icons available via shadcn)
- How client-side vehicle price state is managed (useState, URL param, or similar)
- About section copy — write sensible placeholder text, client can revise

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Service data and pricing (source of truth)
- `jetwash24/supabase/seed.sql` — All services, extras, packages with duration_min, base_price_cents. Catalog must match exactly.
- `jetwash24/src/types/database.ts` — TypeScript types for Service, VehicleType — import, don't redeclare

### Design system
- `jetwash24/src/app/globals.css` — Brand tokens: `--brand-navy`, `--brand-white`, `--brand-cyan`, `--brand-cyan-dark`. Use these, don't invent new colors.
- `jetwash24/src/components/Logo.tsx` — Existing logo component. Use `public/logo-white.svg` for dark backgrounds.
- `jetwash24/src/components/ui/button.tsx` — Existing Button component with shadcn variants

### i18n patterns
- `jetwash24/src/app/[locale]/page.tsx` — Established `getTranslations` + `setRequestLocale` pattern for server components
- `jetwash24/messages/` — Existing translation files structure (PT/EN)

### Business requirements
- `.planning/REQUIREMENTS.md` §SERV-01–SERV-04, CONT-01, CONT-02, DSGN-04 — requirements this phase must satisfy
- `.planning/PROJECT.md` §Serviços e Preços — full service/pricing table with vehicle surcharges

### Existing infrastructure
- `jetwash24/src/lib/supabase.ts` — `createSupabaseServerClient()` for server component data fetching

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/Logo.tsx`: Logo component — use `public/logo-white.svg` for hero (dark bg)
- `src/components/ui/button.tsx`: Button with shadcn variants — use for CTA
- `public/logo-white.svg`, `public/logo.svg`: Both variants available
- Brand CSS tokens in `globals.css`: `text-brand-cyan`, `bg-brand-navy`, `text-brand-white` utility classes

### Established Patterns
- Server components: `async function Page()` with `await getTranslations()` and `setRequestLocale()`
- Client components: `'use client'` + `useTranslations()` hook
- Supabase server fetch: `createSupabaseServerClient()` from `src/lib/supabase.ts`
- Next.js 16 App Router with `[locale]` segment — all pages live in `src/app/[locale]/`

### Integration Points
- `page.tsx` at `src/app/[locale]/page.tsx` — replace current placeholder with full homepage
- New components go in `src/components/` (e.g. `ServiceCatalog.tsx`, `HeroSection.tsx`, `ContactSection.tsx`)
- Phase 4 will replace the CTA `href="#services"` with a link to the booking flow — keep it easy to update

</code_context>

<specifics>
## Specific Ideas

- Tagline: "Detailing profissional, preços honestos." — approved by user, use exactly this
- Vehicle type selector updates prices dynamically (client-side) — no page reload
- Package cards: crossed-out individual price + "Poupa Xé" saving badge — implement per SERV-04
- Hero: pure CSS navy-to-cyan gradient (no image files) until client provides real photos
- Google Maps: link only (no embedded iframe) — keeps page fast without API key complexity

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-landing-page-service-catalog*
*Context gathered: 2026-03-21*
