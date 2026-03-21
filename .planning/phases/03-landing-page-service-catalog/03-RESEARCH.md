# Phase 3: Landing Page + Service Catalog - Research

**Researched:** 2026-03-21
**Domain:** Next.js 16 App Router, React 19, shadcn/ui, next-intl 4.8.3, Supabase SSR, Tailwind CSS v4
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page structure**
- Single scrollable page at `/[locale]` — no separate routes for services or contact
- Section order: Hero → About → Service Catalog → Contact
- All sections anchor-linked (`#services`, `#contact`) for CTA and nav

**Hero**
- Full-bleed dark navy gradient background (no photo needed)
- `logo-white.svg` prominently centered — already exists in `public/`
- Tagline (PT): "Detailing profissional, preços honestos." — translate to EN: "Professional detailing, honest prices."
- Cyan CTA button: "Conhecer os Serviços" (PT) / "See Services" (EN) — scrolls to `#services`
- Below CTA: 3 quick-glance badge icons — Lavagem Interior | Lavagem Exterior | Pacotes

**About section**
- Short paragraph between hero and services (2-3 sentences)
- Who we are, where we are (Guia, Portugal), our philosophy
- No separate About page — inline between hero and catalog

**Service catalog navigation**
- Tab bar with 3 tabs: Interior | Exterior | Pacotes
- Tabs filter displayed service cards (client-side React state)
- Vehicle type selector at top of catalog (above tab bar or within it)
- Options: Citadino | Berlina | SUV | Carrinha
- Selecting a vehicle type updates ALL prices dynamically (client-side, no page reload)

**Service cards**
- Each service: name, description, estimated duration, price (adjusted by selected vehicle type)
- Interior tab: Lavagem Interior Express card includes selectable add-on extras inline
  - Limpeza Profunda Estofos (+45min, +50€)
  - Remoção de Pelos de Animais (+15min, +10€)
  - Limpeza de Vidros Interiores (+10min, +5€)
  - Ozonização (+20min, +10€)
- Interior tab also shows Pacote Interior Premium (all extras included, ~2h, 75€)
- Exterior tab: Lavagem Exterior Express (15€), Lavagem Exterior Premium (30€)
- Pacotes tab: Exterior + Interior Express (25€), Full Detailing (~110€)

**Package pricing display**
- Show crossed-out individual total price alongside bundle price
- Saving badge: e.g. "~~30€~~ 25€ — Poupa 5€" (implements SERV-04)

**Vehicle surcharges — display rule**
- Citadino = base price (no surcharge shown)
- Berlina = base + 5€, SUV = base + 10€, Carrinha = base + 15€
- All prices shown in € with vehicle-adjusted totals after selector change

**Data source**
- Service catalog data fetched from Supabase (`services` table via seed.sql) — not hardcoded
- Server component fetches on page load; vehicle type adjustment is client-side from fetched data
- Consistent with what the booking API (Phase 2) uses — single source of truth

**Placeholder visuals**
- Hero: brand gradient block (navy → cyan) — no external image files needed, pure CSS
- Service cards: text + category icon only (interior / exterior / package icon) — no per-card images
- No gray placeholder boxes — either brand gradient or text-only
- When real client photos arrive, hero gradient swaps to `<Image>` with `object-cover`

**i18n**
- All visible strings go through next-intl (`getTranslations` in server components, `useTranslations` in client components)
- Translation keys: `HomePage.*` for hero/about, `Services.*` for catalog, `Contact.*` for contact section
- Vehicle type labels, tab names, and CTA text all translated

**Contact section**
- Phone: +351 928380478 — click-to-call `href="tel:+351928380478"`
- Email: jetwash24detailing@gmail.com — `href="mailto:..."`
- Address: Guia, Portugal — link to Google Maps search (not embedded iframe)
- Instagram: @jetwash24detailing — external link to profile
- No embedded Google Maps iframe in this phase

### Claude's Discretion
- Exact shadcn/ui component choices for cards, tabs, and badges
- Navigation bar design (sticky or not, mobile hamburger or not)
- Exact spacing, typography scale, and icon set (Lucide icons available via shadcn)
- How client-side vehicle price state is managed (useState, URL param, or similar)
- About section copy — write sensible placeholder text, client can revise

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SERV-01 | Utilizador pode ver catálogo completo de serviços com descrições, preços e duração estimada | ServiceCatalog component reads all active services from Supabase; seed.sql has 6 services with name_pt/en, desc_pt/en, duration_min, base_price |
| SERV-02 | Preços variam automaticamente por tipo de veículo (citadino, berlina, SUV, carrinha) | VehicleSelector client component holds useState; vehicle_surcharges table seeded with 4 rows; price = base_price + surcharge, all calculation client-side from server-fetched data |
| SERV-03 | Extras opcionais (limpeza profunda de estofos, remoção de pelos, vidros interiores, ozonização) são selecionáveis na reserva de serviços interiores | ExtrasPanel component with checkboxes; extras are hardcoded constants (no DB table for extras); display-only in Phase 3, booking state consumed by Phase 4 |
| SERV-04 | Pacotes são apresentados com a poupança em relação aos serviços individuais | PackageCard variant with crossed-out individual_total and "Poupa Xé" badge; savings calculated client-side |
| CONT-01 | Página inicial com hero section, visão geral dos serviços e chamada à ação para reservar | HeroSection + AboutSection + ServiceCatalog all on single scrollable page; CTA scrolls to `#services` |
| CONT-02 | Secção de contacto com telefone, email, morada, link para Google Maps e Instagram | ContactSection with tel/mailto/maps link/instagram — no iframe, no API key |
| DSGN-04 | Placeholders visuais para fotografias de serviços (a substituir quando o cliente fornecer fotos reais) | Hero uses CSS gradient; service cards use Lucide category icons (Droplets/Car/Package); no gray boxes |
</phase_requirements>

---

## Summary

Phase 3 builds the public homepage on top of a fully established foundation. The project already has: Next.js 16.2.0 with App Router, next-intl 4.8.3 for i18n (with PT/EN routing working), shadcn/ui initialized with the radix-nova preset, Supabase SSR client, brand CSS tokens in globals.css, Logo component, and Button component. The placeholder `page.tsx` at `src/app/[locale]/page.tsx` needs to be replaced with the full homepage.

The central architectural challenge is the hybrid server/client rendering split: the homepage server component fetches all service data from Supabase once at render time, then passes it as props to client components (`VehicleSelector`, `ExtrasPanel`, `ServiceCatalog`) that handle dynamic price updates and tab switching without any additional API calls. This pattern matches exactly what is already established in the codebase.

The extras (Limpeza Profunda Estofos, etc.) are NOT stored in a database table — they are hardcoded display-only data in Phase 3. There is no `extras` table in the schema. This simplifies the data model considerably. The database schema has only three tables: `services`, `vehicle_surcharges`, and `bookings`. The extras panel is pure UI in Phase 3; Phase 4 will connect selections to the booking flow.

**Primary recommendation:** Replace `page.tsx` with an async server component that fetches services + vehicle_surcharges via `createSupabaseServerClient()`, passes results as props to a `ServiceCatalog` client component tree, and renders `HeroSection`, `AboutSection`, `ServiceCatalog`, and `ContactSection` sections in a single scrollable page. Install shadcn tabs, card, badge, and separator before building components.

---

## Standard Stack

### Core (already installed — verify before adding)
| Library | Version (installed) | Purpose | Status |
|---------|---------------------|---------|--------|
| next | 16.2.0 | App Router, server components, `<Link>`, `<Image>` | INSTALLED |
| react | 19.2.4 | UI rendering, `useState` for client state | INSTALLED |
| next-intl | 4.8.3 | `getTranslations` (server), `useTranslations` (client) | INSTALLED |
| @supabase/ssr | ^0.9.0 | `createSupabaseServerClient()` for page-load data fetch | INSTALLED |
| lucide-react | ^0.577.0 | Icons: Droplets, Car, Package, Phone, Mail, MapPin, Instagram, Menu | INSTALLED |
| tailwindcss | ^4 | Utility classes, brand tokens via @theme inline | INSTALLED |
| shadcn (button) | already installed | CTA button | INSTALLED |

### shadcn Components to Install
| Component | shadcn add command | Purpose |
|-----------|-------------------|---------|
| tabs | `npx shadcn add tabs` | Interior / Exterior / Pacotes tab bar |
| card | `npx shadcn add card` | Service card shell, package card |
| badge | `npx shadcn add badge` | Duration badge, "Poupa Xé" savings badge |
| separator | `npx shadcn add separator` | Section dividers |

**Installation:**
```bash
cd /Users/augustinagapii/Desktop/ClaudeCode/jetwash24
npx shadcn add tabs card badge separator
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Tabs (Radix) | custom tab state + CSS | shadcn gives keyboard accessibility, ARIA roles, focus management for free |
| useState for vehicle type | URL search params | useState is simpler, avoids URL pollution for display-only state; URL param would survive page refresh but Phase 3 doesn't require that |
| Server-fetched extras (DB table) | No DB table — hardcoded | Extras are not in the schema; hardcoded constants is the correct approach for Phase 3 |

---

## Architecture Patterns

### Recommended Project Structure

New files to create:
```
jetwash24/src/
├── app/[locale]/
│   └── page.tsx              # REPLACE: async server component, fetches services + surcharges
├── components/
│   ├── NavBar.tsx            # NEW: sticky nav with Logo + anchor links + mobile hamburger
│   ├── HeroSection.tsx       # NEW: gradient hero, logo, tagline, CTA, 3 badges
│   ├── AboutSection.tsx      # NEW: 2-3 sentence brand paragraph
│   ├── ServiceCatalog.tsx    # NEW: 'use client', holds vehicleType + activeTab state, wraps cards
│   ├── VehicleSelector.tsx   # NEW: 'use client', 4-button toggle (Citadino/Berlina/SUV/Carrinha)
│   ├── ServiceCard.tsx       # NEW: shadcn Card + name/description/duration/price display
│   ├── ExtrasPanel.tsx       # NEW: 'use client', checkbox list for interior extras
│   ├── PackageCard.tsx       # NEW: ServiceCard variant with crossed-out price + savings badge
│   └── ContactSection.tsx    # NEW: phone/email/address/instagram with Lucide icons
└── components/ui/
    ├── button.tsx             # EXISTS
    ├── tabs.tsx               # TO INSTALL
    ├── card.tsx               # TO INSTALL
    ├── badge.tsx              # TO INSTALL
    └── separator.tsx          # TO INSTALL
```

Translation keys to add:
```
jetwash24/messages/
├── pt.json                   # ADD: Services.*, Contact.*, Nav.*, HomePage.tagline/about/cta
└── en.json                   # ADD: same keys in English
```

### Pattern 1: Server Component Data Fetch → Client Component Props

The established pattern (confirmed in `src/app/[locale]/page.tsx` and `src/lib/supabase.ts`):

```typescript
// src/app/[locale]/page.tsx — server component (no 'use client')
import { createSupabaseServerClient } from '@/lib/supabase';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  const supabase = await createSupabaseServerClient();
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  const { data: surcharges } = await supabase
    .from('vehicle_surcharges')
    .select('*');

  return (
    <main>
      <NavBar />
      <HeroSection />
      <AboutSection />
      <ServiceCatalog
        services={services ?? []}
        surcharges={surcharges ?? []}
        id="services"
      />
      <ContactSection id="contact" />
    </main>
  );
}
```

### Pattern 2: Client Component with Vehicle Price State

```typescript
// src/components/ServiceCatalog.tsx
'use client';
import { useState } from 'react';
import { Service, VehicleSurcharge, VehicleType } from '@/types/database';

type Props = {
  services: Service[];
  surcharges: VehicleSurcharge[];
  id?: string;
};

export function ServiceCatalog({ services, surcharges, id }: Props) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('citadino');
  const [activeTab, setActiveTab] = useState<'interior' | 'exterior' | 'pacotes'>('interior');

  const surchargeMap = Object.fromEntries(
    surcharges.map(s => [s.vehicle_type, s.surcharge])
  );
  const currentSurcharge = surchargeMap[vehicleType] ?? 0;

  // price calculation — client-side, no API call
  const priceFor = (service: Service) =>
    Math.round((service.base_price + currentSurcharge) * 100) / 100;

  // ... render VehicleSelector, Tabs, ServiceCard/PackageCard
}
```

### Pattern 3: next-intl in Client Components

Client components that need translations must use `useTranslations`, not `getTranslations`:

```typescript
// src/components/VehicleSelector.tsx
'use client';
import { useTranslations } from 'next-intl';

export function VehicleSelector({ selected, onChange }) {
  const t = useTranslations('Services');
  // t('vehicle.citadino') → "Citadino" / "City Car"
}
```

### Pattern 4: Extras Hardcoded Constants (not from DB)

The `services` table has no `extras` data — extras are display-only constants in Phase 3:

```typescript
// src/components/ExtrasPanel.tsx
'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const EXTRAS = [
  { id: 'deep-clean', durationMin: 45, priceCents: 5000 },
  { id: 'pet-hair',   durationMin: 15, priceCents: 1000 },
  { id: 'windows',    durationMin: 10, priceCents:  500 },
  { id: 'ozone',      durationMin: 20, priceCents: 1000 },
] as const;

export function ExtrasPanel() {
  const t = useTranslations('Services');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const totalExtra = EXTRAS
    .filter(e => checked.has(e.id))
    .reduce((sum, e) => sum + e.priceCents, 0);
  const totalMin = EXTRAS
    .filter(e => checked.has(e.id))
    .reduce((sum, e) => sum + e.durationMin, 0);

  // renders checkbox list + running total
}
```

### Pattern 5: Anchor-Scroll Navigation with next/link

For anchor links within the same page, use a plain `<a>` tag (not `<Link>`) to avoid Next.js App Router intercepting in-page scroll:

```typescript
// NavBar — anchor links use plain <a> not next/link
<a href="#services" className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150">
  {t('services')}
</a>
```

CTA button similarly:
```typescript
// HeroSection
<Button asChild className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan-dark px-8 py-3">
  <a href="#services">{t('cta')}</a>
</Button>
```

`scroll-behavior: smooth` goes in `globals.css` on the `html` element.

### Anti-Patterns to Avoid

- **Using `<Link href="#services">` from next/link for anchor scrolling:** Next.js `<Link>` is for route navigation, not in-page anchor scrolling. Use plain `<a href="#services">` for in-page anchors.
- **Calling `getTranslations` in client components:** next-intl 4.x enforces async server-only for `getTranslations`. Use `useTranslations` in `'use client'` files.
- **Fetching vehicle_surcharges in client component:** Don't add a browser-side Supabase fetch. All data is loaded once server-side; surcharges are passed as props.
- **Hardcoding prices in components:** Prices must come from the `services` table / seed.sql. UI spec's prices match exactly — but the code must read from `service.base_price`, not literals.
- **Declaring new CSS color variables:** Brand tokens already exist in `globals.css`. Use `bg-brand-navy`, `text-brand-cyan`, etc. — no new CSS variables.
- **Using `useTranslations` at server component level:** Will fail at build time in next-intl 4.x.
- **Using `middleware.ts`:** This project uses `proxy.ts` (established in Phase 1 — Next.js 16 convention). Do not create `middleware.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab component with keyboard nav | Custom tab state + div clicks | `shadcn add tabs` (Radix UI) | Keyboard (Arrow keys, Home/End), ARIA roles (role="tablist", role="tab", role="tabpanel"), focus management all handled |
| Toggle button group for vehicle selector | Multiple useState booleans | 4 `<button>` elements with selected state, OR shadcn ToggleGroup if available | Simple enough for 4 buttons; manage with single `vehicleType` useState |
| Card shell with border/radius | Inline div with custom classes | `shadcn add card` | Consistent with shadcn theming system; Card/CardHeader/CardContent/CardFooter slots |
| Savings badge | `<span>` with arbitrary green | `shadcn add badge` with className override for cyan | Consistent design system; accepts className for color override |

**Key insight:** The interactive complexity in this phase (tabs, vehicle selector, extras checkboxes) is all display-side state management. There are no async operations in client components — all data is already loaded. This means these components can be kept simple with `useState` only.

---

## Common Pitfalls

### Pitfall 1: Mixing getTranslations and useTranslations contexts
**What goes wrong:** Calling `getTranslations` inside a `'use client'` component causes a build error in next-intl 4.x. Calling `useTranslations` in an `async` server component causes a React hook error.
**Why it happens:** next-intl 4.x enforces strict server/client boundaries for translation loading.
**How to avoid:** Any file with `'use client'` at the top MUST use `useTranslations`. Any `async function` server component MUST use `await getTranslations()`.
**Warning signs:** Build error mentioning "useTranslations can only be called client-side" or "getTranslations is not available in client components."

### Pitfall 2: Service categorization — no `category` column in DB
**What goes wrong:** Trying to filter services by Interior/Exterior/Pacotes tab using a DB column that doesn't exist. The `services` table has: `id, slug, name_pt, name_en, desc_pt, desc_en, duration_min, base_price, is_active, sort_order`. No `category` column.
**Why it happens:** The tab filtering must be implemented client-side using the service `slug` to determine category.
**How to avoid:** Use slug-to-category mapping in the client component:
```typescript
const SLUG_CATEGORY: Record<string, 'interior' | 'exterior' | 'pacotes'> = {
  'interior-express':  'interior',
  'interior-premium':  'interior',
  'exterior-express':  'exterior',
  'exterior-premium':  'exterior',
  'exterior-interior': 'pacotes',
  'full-detailing':    'pacotes',
};
```
**Warning signs:** TypeScript error selecting `.category` from a `Service` type.

### Pitfall 3: Package savings calculation requires knowing individual component prices
**What goes wrong:** "Exterior + Interior Express" bundle (25€) savings badge needs to compare against the sum of "Lavagem Exterior Express" (15€) + "Lavagem Interior Express" (15€) = 30€. But the component receiving the `PackageCard` only has the package's `base_price`.
**Why it happens:** The `services` table has no foreign-key relationship between packages and their component services.
**How to avoid:** Hardcode the individual-total lookup alongside the slug-category map, OR pass the full `services` array to `PackageCard` and compute the individual total from the array. The latter is more correct:
```typescript
const PACKAGE_COMPONENT_SLUGS: Record<string, string[]> = {
  'exterior-interior': ['exterior-express', 'interior-express'],
  'full-detailing':    ['exterior-premium', 'interior-premium'],
};
```
Then sum base_price of components + surcharge for each, compare to package base_price + surcharge.

### Pitfall 4: scroll-behavior smooth requires CSS, not JS
**What goes wrong:** Anchor clicks (`href="#services"`) don't scroll smoothly by default.
**Why it happens:** The browser handles anchor scrolling natively; smooth scroll requires CSS.
**How to avoid:** Add `scroll-behavior: smooth` to the `html` element in `globals.css` (in the `@layer base` block or as a direct rule). Do not use JavaScript `scrollIntoView()` for the CTA — it's not needed.

### Pitfall 5: shadcn Tabs with dark brand background — default styles will be wrong
**What goes wrong:** shadcn Tabs uses light `--muted` tokens for the tab list background and `--foreground` for text. On `bg-brand-navy`, these defaults produce illegible light-on-light or dark-on-dark combinations.
**Why it happens:** shadcn tokens (`--muted`, `--card`) in this project's `:root` are set to light values (oklch near 1.0), but the brand background is dark navy.
**How to avoid:** Override shadcn Tabs styling with explicit brand classes. The `<Tabs>` component accepts `className` on `TabsList` and `TabsTrigger`. Set `TabsList` to `bg-brand-navy-light` and use `data-[state=active]` to apply `text-brand-cyan` + cyan underline to active tab.

### Pitfall 6: Mobile hamburger nav needs 'use client' for open/close state
**What goes wrong:** If NavBar is a server component, there's no place to put the `useState` for hamburger open/close.
**Why it happens:** Server components can't use event handlers or state.
**How to avoid:** Make `NavBar` a client component (`'use client'`), OR split into a server `NavBar` shell that renders a client `MobileMenu` sub-component. The latter is more idiomatic — server renders the logo and desktop links; a `'use client'` `<MobileMenu>` handles the hamburger toggle.

---

## Code Examples

Verified patterns from existing codebase:

### Supabase server fetch (from src/lib/supabase.ts)
```typescript
// Pattern: always await createSupabaseServerClient() — it's async
const supabase = await createSupabaseServerClient();
const { data: services, error } = await supabase
  .from('services')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');
```

### getTranslations in server component (from src/app/[locale]/page.tsx)
```typescript
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');
  // t('tagline') → "Detailing profissional, preços honestos."
}
```

### Brand token classes (from globals.css — confirmed tokens)
```
bg-brand-navy        → #0B1F3A  (dominant background)
bg-brand-navy-light  → #142E54  (card backgrounds, nav)
bg-brand-cyan        → #00C8E0  (CTA button, active states)
bg-brand-cyan-dark   → #009BB0  (CTA hover)
text-brand-white     → #FFFFFF  (body text on navy)
text-brand-cyan      → #00C8E0  (accent text, icons)
text-brand-gray      → #94A3B8  (muted: duration, descriptions)
```

### Logo component usage (from src/components/Logo.tsx)
```typescript
import { Logo } from '@/components/Logo';
// On dark background (hero, nav):
<Logo variant="white" width={200} height={60} />
// Default variant is 'white' — explicit for clarity
```

### Button with asChild for anchor link (from src/components/ui/button.tsx)
```typescript
import { Button } from '@/components/ui/button';
// CTA: Button renders an <a> tag via asChild
<Button asChild className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan-dark px-8 py-3">
  <a href="#services">{t('cta')}</a>
</Button>
```

### Price display calculation (from UI-SPEC data contract)
```typescript
// Surcharge values from vehicle_surcharges table (fetched server-side)
// client-side calculation — all values in euros (not cents)
const surchargeMap: Record<string, number> = Object.fromEntries(
  surcharges.map(s => [s.vehicle_type, s.surcharge])
);
const displayPrice = (service: Service): string => {
  const total = service.base_price + (surchargeMap[vehicleType] ?? 0);
  return `${total.toFixed(0)}€`;
};
// Note: base_price is numeric(6,2) from Postgres → JS number with decimals
// base prices in seed.sql: 15.00, 15.00, 30.00, 25.00, 75.00, 110.00
```

### Package savings badge calculation
```typescript
// Individual components for each package (hardcoded mapping)
const PACKAGE_COMPONENTS: Record<string, string[]> = {
  'exterior-interior': ['exterior-express', 'interior-express'],
  'full-detailing':    ['exterior-premium', 'interior-premium'],
};

function getSaving(pkg: Service, allServices: Service[], surcharge: number): number {
  const components = PACKAGE_COMPONENTS[pkg.slug] ?? [];
  const individualTotal = components.reduce((sum, slug) => {
    const svc = allServices.find(s => s.slug === slug);
    return sum + (svc ? svc.base_price + surcharge : 0);
  }, 0);
  return Math.round(individualTotal - (pkg.base_price + surcharge));
}
// For "exterior-interior" @ Citadino: (15+0) + (15+0) - (25+0) = 5 → "Poupa 5€"
// For "exterior-interior" @ Berlina:  (15+5) + (15+5) - (25+5) = 10 → "Poupa 10€"
```

### Click-to-call and mailto links (ContactSection)
```typescript
<a href="tel:+351928380478" className="flex items-center gap-2 min-h-[44px]">
  <Phone size={16} className="text-brand-cyan" />
  <span className="text-brand-white">+351 928 380 478</span>
</a>
<a href="mailto:jetwash24detailing@gmail.com" className="flex items-center gap-2 min-h-[44px]">
  <Mail size={16} className="text-brand-cyan" />
  <span className="text-brand-white">jetwash24detailing@gmail.com</span>
</a>
<a
  href="https://www.google.com/maps/search/Guia,+Portugal"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 min-h-[44px]"
>
  <MapPin size={16} className="text-brand-cyan" />
  <span className="text-brand-white">Guia, Portugal</span>
</a>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 | Breaking rename — `middleware.ts` is deprecated (project already uses `proxy.ts`) |
| `useTranslations` everywhere | `getTranslations` in server, `useTranslations` in client | next-intl 3+ | Build error if mixed up |
| `params.locale` (sync) | `const { locale } = await params` (async) | Next.js 15+ | params is now a Promise in App Router |

**Deprecated/outdated:**
- `middleware.ts` filename: Replaced by `proxy.ts` in this project's Next.js 16 — do not create `middleware.ts`
- Sync `params` access: `params.locale` without await will cause TypeScript errors in Next.js 16

---

## Data Architecture: What Comes from DB vs Hardcoded

This is the most important structural decision for planning:

| Data | Source | Why |
|------|--------|-----|
| Service names (PT/EN) | Supabase `services` table | Single source of truth; booking API uses same data |
| Service descriptions | Supabase `services` table | Already seeded |
| Service duration | Supabase `services` table | `duration_min` column |
| Service base price | Supabase `services` table | `base_price` numeric(6,2) |
| Vehicle surcharges | Supabase `vehicle_surcharges` table | Seeded; used by booking API too |
| Service category (Interior/Exterior/Pacotes) | Hardcoded slug mapping in client component | No `category` column in DB |
| Extras (Limpeza Profunda, etc.) | Hardcoded constants in ExtrasPanel | No `extras` table in schema |
| Package component slugs | Hardcoded in client component | No package-component relationship in DB |
| Contact details | Translation files | Static business info |
| About text | Translation files | Placeholder — client revises later |
| Copy strings (CTA, tabs, badges) | Translation files | i18n requirement |

---

## i18n: Translation Keys to Add

The existing `pt.json` and `en.json` only have `HomePage.title`, `HomePage.subtitle`, `HomePage.cta`, `Navigation.*`, and `Common.*`. Phase 3 must add:

**New keys for `pt.json` (and corresponding `en.json`):**
```json
{
  "HomePage": {
    "title": "...",
    "subtitle": "...",
    "cta": "Marcar agora",
    "tagline": "Detailing profissional, preços honestos.",
    "about": "A Jetwash24 nasce da paixão pelo detalhe automóvel. Sediados em Guia, Portugal, acreditamos que cada veículo merece um tratamento profissional a preços justos. Venha conhecer-nos.",
    "catalogCta": "Conhecer os Serviços",
    "badge_interior": "Lavagem Interior",
    "badge_exterior": "Lavagem Exterior",
    "badge_pacotes": "Pacotes"
  },
  "Services": {
    "tab_interior": "Interior",
    "tab_exterior": "Exterior",
    "tab_pacotes": "Pacotes",
    "vehicle_citadino": "Citadino",
    "vehicle_berlina": "Berlina",
    "vehicle_suv": "SUV",
    "vehicle_carrinha": "Carrinha",
    "saving": "Poupa {amount}€",
    "duration": "{min} min",
    "emptyState": "Nenhum serviço disponível.",
    "errorState": "Não foi possível carregar os serviços. Tente novamente mais tarde.",
    "extras_deepClean": "Limpeza Profunda Estofos",
    "extras_petHair": "Remoção de Pelos de Animais",
    "extras_windows": "Limpeza de Vidros Interiores",
    "extras_ozone": "Ozonização",
    "extras_addMin": "+{min} min",
    "extras_addPrice": "+{price}€",
    "extras_total": "+{price}€ / +{min} min"
  },
  "Contact": {
    "phone": "+351 928 380 478",
    "email": "jetwash24detailing@gmail.com",
    "address": "Guia, Portugal",
    "instagram": "@jetwash24detailing",
    "mapLink": "Ver no Google Maps"
  },
  "Nav": {
    "services": "Serviços",
    "contact": "Contacto",
    "openMenu": "Abrir menu de navegação"
  }
}
```

---

## Open Questions

1. **Extras table: absent by design or oversight?**
   - What we know: Schema has `services`, `vehicle_surcharges`, `bookings` only. No `extras` table.
   - What's clear: Phase 3 treats extras as display-only hardcoded data. This is correct per CONTEXT.md.
   - Recommendation: Hardcode extras in `ExtrasPanel.tsx` as constants. Phase 4 will decide if extras need DB storage for booking flow.

2. **NavBar locale switcher**
   - What we know: `messages/pt.json` has `Common.locale_switch: "EN"` and `en.json` has `"PT"`. Existing `[locale]/layout.tsx` uses `routing.locales`. The CONTEXT.md and UI-SPEC don't explicitly spec a locale switcher in the nav.
   - What's unclear: Should the nav include a PT/EN toggle link?
   - Recommendation: Include a simple locale toggle in the nav using `next-intl`'s `Link` from `src/i18n/navigation.ts` (which is locale-aware). It's a natural UX element for a bilingual site and the routing is already set up.

3. **Supabase error handling on page load**
   - What we know: `createSupabaseServerClient()` can fail if env vars are missing; the query can return an error.
   - What's unclear: Should the page error boundary or render gracefully?
   - Recommendation: Check `error` from Supabase query; if services fail to load, render an error message using the `Services.errorState` translation key. Do not throw — return a degraded UI rather than crashing the page.

---

## Validation Architecture

nyquist_validation is enabled in `.planning/config.json`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `jetwash24/vitest.config.ts` |
| Quick run command | `cd jetwash24 && npm test` |
| Full suite command | `cd jetwash24 && npm test` |

Note: Vitest runs in `node` environment (not jsdom). Component rendering tests are not supported without additional setup. Existing tests are integration/unit tests against pure logic.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SERV-01 | Service catalog displays name, description, duration, price | manual-only | N/A — requires rendered component | ❌ Wave 0 |
| SERV-02 | Prices vary by vehicle type using surcharge math | unit | `cd jetwash24 && npm test -- src/__tests__/catalog.test.ts` | ❌ Wave 0 |
| SERV-03 | Extras panel shows selectable extras with running total | manual-only | N/A — requires rendered component | ❌ Wave 0 |
| SERV-04 | Package savings badge shows correct saving per vehicle type | unit | `cd jetwash24 && npm test -- src/__tests__/catalog.test.ts` | ❌ Wave 0 |
| CONT-01 | Hero + about + service catalog renders on page | manual-only | N/A — requires browser | ❌ Wave 0 |
| CONT-02 | Contact links have correct href values | unit | `cd jetwash24 && npm test -- src/__tests__/catalog.test.ts` | ❌ Wave 0 |
| DSGN-04 | No gray placeholder boxes in rendered page | manual-only | Visual inspection | N/A |

SERV-02 and SERV-04 have pure logic (price calculation, savings calculation) that can and should be unit-tested without a DOM.

### Sampling Rate
- **Per task commit:** `cd jetwash24 && npm test`
- **Per wave merge:** `cd jetwash24 && npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `jetwash24/src/__tests__/catalog.test.ts` — covers SERV-02 (price calculation logic), SERV-04 (package savings logic), CONT-02 (contact href values as string assertions)
- [ ] Note: `jsdom` environment NOT available — tests must cover pure logic functions, not React rendering

**Wave 0 note:** Extract price calculation and savings calculation as pure functions in a shared utility (e.g., `src/lib/catalog.ts`) so they can be unit-tested without a DOM. The test file then imports and asserts on those pure functions.

---

## Sources

### Primary (HIGH confidence)
- `jetwash24/supabase/migrations/001_initial_schema.sql` — exact schema, confirmed no extras/category columns
- `jetwash24/supabase/seed.sql` — exact service slugs, base prices, durations, vehicle surcharges
- `jetwash24/src/types/database.ts` — TypeScript types for Service, VehicleSurcharge — import, don't redeclare
- `jetwash24/src/lib/supabase.ts` — createSupabaseServerClient() async signature confirmed
- `jetwash24/src/app/globals.css` — brand tokens confirmed: brand-navy, brand-navy-light, brand-cyan, brand-cyan-dark, brand-white, brand-gray
- `jetwash24/src/components/Logo.tsx` — Logo props: variant ('color'|'white'), width, height, className
- `jetwash24/src/components/ui/button.tsx` — Button variants confirmed; asChild prop available via Slot.Root
- `jetwash24/package.json` — exact versions: next 16.2.0, react 19.2.4, next-intl 4.8.3, lucide-react 0.577.0, vitest 4.1.0
- `jetwash24/vitest.config.ts` — test environment: node (not jsdom); include pattern confirmed
- `jetwash24/node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` — Link component props for Next.js 16 confirmed

### Secondary (MEDIUM confidence)
- `.planning/phases/03-landing-page-service-catalog/03-UI-SPEC.md` — UI contract for spacing, typography, color usage, component inventory, copywriting, i18n key assignments, data contract — HIGH alignment with CONTEXT.md decisions
- `.planning/phases/03-landing-page-service-catalog/03-CONTEXT.md` — locked decisions, canonical refs

### Tertiary (LOW confidence)
- Training knowledge on next-intl 4.x `getTranslations` vs `useTranslations` boundary — verified against established patterns in `src/app/[locale]/page.tsx` (HIGH once verified with codebase)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed from `package.json`; shadcn components confirmed from `components.json` references and `src/components/ui/`
- Architecture: HIGH — data flow pattern confirmed from existing `page.tsx`, `supabase.ts`, i18n routing; DB schema confirmed from migration SQL
- Pitfalls: HIGH — slug-based categorization confirmed by inspecting actual schema (no category column); getTranslations/useTranslations boundary confirmed from existing code
- Data model for extras: HIGH — no extras table confirmed by reading full migration SQL; hardcoded approach is correct for Phase 3

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable dependencies; next-intl and Next.js APIs unlikely to change at patch level)
