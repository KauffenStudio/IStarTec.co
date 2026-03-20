# Phase 1: Foundation - Research

**Researched:** 2026-03-20
**Domain:** Next.js 16 project scaffolding, next-intl i18n routing, Supabase schema + exclusion constraints, Tailwind v4 + shadcn/ui design system, logo/asset creation
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TECH-01 | Slot engine prevents double-booking with atomic DB-level verification (no race conditions) | Postgres exclusion constraint with `btree_gist` + `tstzrange` prevents concurrent overlapping inserts atomically; migration pattern documented in Code Examples |
| DSGN-01 | Custom logo created from scratch for Jetwash24 brand | SVG logo creation workflow documented; asset placement in `public/` documented; no external dependency |
| DSGN-02 | Design system with dark blue + white + cyan color scheme, professional and dynamic style | Tailwind v4 CSS custom properties via `@theme` directive; shadcn/ui color token mapping documented |
| CONT-03 | All site content available in Portuguese (primary) and English (alternative) | next-intl 4.x with App Router i18n routing; `proxy.ts` for Next.js 16; `defineRouting` + `[locale]` folder structure documented |
</phase_requirements>

---

## Summary

Phase 1 establishes the three structural pillars that every subsequent phase depends on: the i18n routing skeleton, the Supabase schema, and the design system. These cannot be retrofitted cheaply — a bilingual site built without `next-intl` wired from day one requires touching every component to extract hardcoded strings, and a schema migration mid-project that adds an exclusion constraint must backfill existing rows. Getting these right in Phase 1 eliminates the most expensive rework risks in the project.

The most important update since the prior research: **Next.js has moved from 15.5 to 16.2.0 as the current stable release**. The `npm view next version` command confirms `16.2.0` as `latest`. The breaking change directly relevant to this project is that `middleware.ts` has been renamed to `proxy.ts`. next-intl 4.8.3 fully supports this change — the routing setup uses `src/proxy.ts` instead of `src/middleware.ts`. All other stack choices from the prior `.planning/research/` documents remain valid.

A second important finding: the existing `/jetwash24` folder in this repository is a **completely different, prior project** using the wrong stack (Next.js 14, Prisma, next-auth, Stripe, React 18, Tailwind 3). The new project must be scaffolded fresh from `create-next-app@latest`. Do not reuse or migrate code from the existing jetwash24 folder.

**Primary recommendation:** Scaffold a new Next.js 16.2.0 project in a `jetwash24-v2/` (or replace the existing folder after archiving), wire next-intl with `proxy.ts` and `[locale]` routing before writing a single string, apply Tailwind v4 CSS variables for the color scheme, run the Supabase migration with `btree_gist` enabled and the exclusion constraint in place, and seed the service catalog — all before building any visible UI beyond a placeholder page.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0 | Full-stack React framework | Current stable `latest` on npm (verified 2026-03-20). App Router + Server Components. Turbopack is now the default bundler. |
| React | 19.2.4 | UI rendering | Bundled with Next.js 16; React 19 Server Actions replace a separate API layer. |
| TypeScript | 5.x | Type safety | Required for pricing matrix and slot calculation correctness. Minimum 5.1.0 per Next.js 16 requirements. |
| Tailwind CSS | 4.2.2 | Styling | CSS-native theming via `@theme`; shadcn/ui fully supports v4; no `tailwind.config.js` needed. |
| @supabase/supabase-js | 2.99.3 | Database client | PostgreSQL-backed; exclusion constraint for double-booking prevention; free tier sufficient. |
| @supabase/ssr | 0.9.0 | SSR-safe Supabase client | Required for correct cookie handling in Next.js App Router Server Components. |
| next-intl | 4.8.3 | PT/EN i18n routing | App Router native; `proxy.ts` for Next.js 16; `defineRouting` for locale config. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | CLI (no npm version) | Accessible component primitives | Install via `npx shadcn@latest init -t next`; copy-paste architecture; Tailwind v4 supported. |
| date-fns | 4.1.0 | Date arithmetic | Used in Phase 2 slot engine; pair with react-day-picker 9.x. Install now to avoid version conflicts later. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 16 | Next.js 15.5 (backport tag) | 15.5 is still available via `npm install next@backport` but 16 is the current `latest`; new projects should use 16 |
| Supabase + btree_gist exclusion | Application-level lock | Application lock is insufficient — two concurrent transactions both pass the JS check before either inserts |
| CSS custom properties via `@theme` | `tailwind.config.js` | Tailwind v4 is CSS-native; a JS config file is incorrect for v4 and will conflict with the CLI |

### Installation

```bash
# Scaffold new project (creates with Next.js 16, React 19, Tailwind v4)
npx create-next-app@latest jetwash24 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core runtime dependencies
npm install @supabase/supabase-js @supabase/ssr next-intl

# Date utilities (install now; Phase 2 needs these; version-pinned to match react-day-picker 9.x)
npm install date-fns

# Shadcn/ui (after project creation)
npx shadcn@latest init -t next
```

**Version verification (confirmed 2026-03-20 via `npm view`):**
- `next`: 16.2.0
- `@supabase/supabase-js`: 2.99.3
- `@supabase/ssr`: 0.9.0
- `next-intl`: 4.8.3
- `tailwindcss`: 4.2.2
- `date-fns`: 4.1.0
- `react`: 19.2.4

---

## Architecture Patterns

### Recommended Project Structure

```
jetwash24/
├── messages/
│   ├── pt.json                   # Portuguese translations (primary)
│   └── en.json                   # English translations
├── public/
│   └── logo.svg                  # Jetwash24 logo (DSGN-01)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── src/
    ├── app/
    │   ├── [locale]/             # i18n root — all pages under PT/EN prefix
    │   │   ├── layout.tsx        # Locale layout with NextIntlClientProvider
    │   │   └── page.tsx          # Placeholder home page
    │   └── layout.tsx            # Root layout (minimal — returns children)
    ├── components/
    │   └── ui/                   # Shadcn/ui components copied here by CLI
    ├── i18n/
    │   ├── routing.ts            # defineRouting({ locales, defaultLocale })
    │   ├── navigation.ts         # Locale-aware Link, redirect, useRouter
    │   └── request.ts            # getRequestConfig for server-side locale
    ├── lib/
    │   └── supabase.ts           # Supabase client (server + browser variants)
    ├── proxy.ts                  # next-intl middleware (Next.js 16 name)
    └── types/
        └── database.ts           # Supabase table types (services, bookings, etc.)
```

### Pattern 1: next-intl with Next.js 16 App Router

**What:** Locale-prefixed routing (`/pt/*` and `/en/*`) with automatic redirect from unprefixed URLs to the default locale (`/pt`). All user-facing strings read from `messages/pt.json` or `messages/en.json`.

**When to use:** Required from the first line of code — retrofitting is a near-rewrite.

**Files required:**

`src/i18n/routing.ts`:
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt'
});
```

`src/proxy.ts` (Next.js 16 — was `middleware.ts` before Next.js 16):
```typescript
// Source: https://next-intl.dev/docs/routing/middleware
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
};
```

`src/i18n/navigation.ts`:
```typescript
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

`src/i18n/request.ts`:
```typescript
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return {locale};
});
```

`src/app/[locale]/layout.tsx`:
```typescript
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {setRequestLocale} from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`next.config.ts`:
```typescript
import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
```

### Pattern 2: Tailwind v4 Design System with CSS Custom Properties

**What:** Brand colors defined as CSS custom properties inside the `@theme` directive in `globals.css`. No `tailwind.config.js` file — Tailwind v4 is fully CSS-native. Shadcn/ui reads from these same CSS variables.

**When to use:** Any Tailwind v4 project. The shadcn/ui CLI generates this structure automatically during `npx shadcn@latest init`.

**Color scheme for Jetwash24 (DSGN-02):**
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Jetwash24 brand palette */
  --color-brand-navy: #0B1F3A;      /* dark blue — primary */
  --color-brand-cyan: #00C8E0;      /* cyan — accent */
  --color-brand-white: #FFFFFF;     /* white — text on dark */
  --color-brand-navy-light: #142E54;
  --color-brand-cyan-dark: #009BB0;

  /* Shadcn/ui semantic tokens */
  --color-background: var(--color-brand-navy);
  --color-foreground: var(--color-brand-white);
  --color-primary: var(--color-brand-cyan);
  --color-primary-foreground: var(--color-brand-navy);
}
```

**Key Tailwind v4 rules:**
- No `tailwind.config.js` — the shadcn CLI will not create one for v4 projects
- The `components.json` generated by shadcn init targets `globals.css` for theme variables
- Use `class="bg-brand-navy text-brand-white"` directly from custom properties

### Pattern 3: Supabase Schema with Exclusion Constraint (TECH-01)

**What:** The `bookings` table uses a PostgreSQL exclusion constraint backed by the `btree_gist` extension to prevent overlapping bookings at the database level. This is the only correct solution — JavaScript-only checks are insufficient against concurrent requests.

**When to use:** Required. This is Phase 1 because Phase 2 depends on the constraint existing before any booking logic is written.

**Migration file (`supabase/migrations/001_initial_schema.sql`):**
```sql
-- Enable btree_gist extension (required for exclusion constraints on range types)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Services catalog
CREATE TABLE services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  name_pt      text NOT NULL,
  name_en      text NOT NULL,
  desc_pt      text,
  desc_en      text,
  duration_min int NOT NULL,
  base_price   numeric(6,2) NOT NULL,
  is_active    boolean DEFAULT true,
  sort_order   int DEFAULT 0
);

-- Vehicle surcharges
CREATE TABLE vehicle_surcharges (
  vehicle_type text PRIMARY KEY,   -- 'citadino' | 'berlina' | 'suv' | 'carrinha'
  surcharge    numeric(6,2) NOT NULL DEFAULT 0
);

-- Bookings table
CREATE TABLE bookings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       uuid REFERENCES services(id),
  vehicle_type     text NOT NULL,
  start_time       timestamptz NOT NULL,
  end_time         timestamptz NOT NULL,
  customer_name    text NOT NULL,
  customer_email   text NOT NULL,
  customer_phone   text,
  status           text NOT NULL DEFAULT 'confirmed',
  cancel_token     uuid UNIQUE DEFAULT gen_random_uuid(),
  created_at       timestamptz DEFAULT now(),
  CONSTRAINT status_values CHECK (status IN ('confirmed', 'cancelled'))
);

-- Atomic double-booking prevention (TECH-01)
-- Exclusion constraint: no two 'confirmed' bookings may overlap in time
ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (tstzrange(start_time, end_time) WITH &&)
  WHERE (status = 'confirmed');

-- Index for slot availability queries
CREATE INDEX idx_bookings_time_status ON bookings (start_time, end_time, status);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_surcharges ENABLE ROW LEVEL SECURITY;

-- Services and vehicle_surcharges: public read, no write from client
CREATE POLICY "services_public_read" ON services FOR SELECT USING (true);
CREATE POLICY "vehicle_surcharges_public_read" ON vehicle_surcharges FOR SELECT USING (true);

-- Bookings: allow INSERT for anon users; no client-side SELECT/UPDATE/DELETE
CREATE POLICY "bookings_insert_anon" ON bookings FOR INSERT WITH CHECK (true);
```

**btree_gist availability:** Listed in Supabase's documented extensions. Enabled via `CREATE EXTENSION IF NOT EXISTS btree_gist`. Available on free tier (no tier restrictions found in official docs — this was flagged as a concern in STATE.md but evidence indicates it is a standard PostgreSQL bundled extension available universally).

### Pattern 4: Seed Data for Jetwash24 Service Catalog

**What:** Service catalog and vehicle surcharges seeded from PROJECT.md pricing. This is the canonical data source for all booking and pricing logic downstream.

```sql
-- Seed: services
INSERT INTO services (slug, name_pt, name_en, desc_pt, desc_en, duration_min, base_price, sort_order)
VALUES
  ('interior-express',   'Lavagem Interior Express',     'Express Interior Wash',
   'Aspiração + tablier + plásticos',                    'Vacuuming + dashboard + plastics',
   30, 15.00, 1),

  ('exterior-express',   'Lavagem Exterior Express',     'Express Exterior Wash',
   'Carro completo + jantes + motor',                    'Full exterior + rims + engine bay',
   45, 15.00, 2),

  ('exterior-premium',   'Lavagem Exterior Premium',     'Premium Exterior Wash',
   'Express + polimento faróis + remoção riscos',        'Express + headlight polish + scratch removal',
   90, 30.00, 3),

  ('exterior-interior',  'Exterior + Interior Express',  'Exterior + Interior Express',
   'Ambas as lavagens express',                          'Both express washes combined',
   75, 25.00, 4),

  ('interior-premium',   'Pacote Interior Premium',      'Premium Interior Package',
   'Todos os extras incluídos',                          'All extras included',
   120, 75.00, 5),

  ('full-detailing',     'Full Detailing',               'Full Detailing',
   'Tudo incluído',                                      'Everything included',
   150, 110.00, 6);

-- Seed: vehicle surcharges
INSERT INTO vehicle_surcharges (vehicle_type, surcharge)
VALUES
  ('citadino', 0.00),
  ('berlina',  5.00),
  ('suv',      10.00),
  ('carrinha', 15.00);
```

**Note on add-on extras:** The PROJECT.md lists add-ons (limpeza profunda de estofos +50€, remoção de pelos +10€, vidros interiores +5€, ozonização +10€). These are modeled as the `interior-premium` package in the services table (all included at 75€). Individual add-on selection is a Phase 4 booking-flow concern. Phase 1 only needs the base service catalog seeded.

### Anti-Patterns to Avoid

- **Using `middleware.ts` in a Next.js 16 project:** Next.js 16 deprecates `middleware.ts`; the correct filename is `proxy.ts`. Using `middleware.ts` will still work temporarily (it is deprecated, not removed) but triggers warnings and will break in a future version. Start with `proxy.ts`.
- **Creating `tailwind.config.js` for a Tailwind v4 project:** Tailwind v4 uses CSS-native `@theme` in `globals.css`. The shadcn CLI generates this correctly — do not add a JS config file.
- **Reusing code from the existing `/jetwash24` folder:** That project uses Next.js 14 + Prisma + next-auth + Stripe + React 18 + Tailwind 3 — the wrong stack. It must not be imported, copied, or referenced.
- **Hardcoding any PT strings in component files:** The PITFALLS.md documents this as requiring a near-full frontend rewrite to fix. All user-facing strings go into `messages/pt.json` and `messages/en.json` from the first commit.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale routing + string lookup | Custom URL prefix logic + JSON loader | next-intl 4.x with `defineRouting` | App Router server component support; `proxy.ts` handles redirects; type-safe translation keys |
| Component primitives (Button, Input, Select) | Custom CSS components | shadcn/ui CLI | Copy-paste components built on Radix UI + Tailwind; accessible by default; zero extra bundle cost |
| Double-booking prevention | JavaScript mutex or Redis lock | Postgres exclusion constraint with `btree_gist` | DB-level atomicity — two concurrent transactions cannot both succeed against the same range |
| Design token management | Hardcoded hex values in components | Tailwind v4 `@theme` CSS custom properties | Single source of truth; theme changes propagate automatically |
| Supabase server client in Next.js App Router | Manual cookie handling | `@supabase/ssr` `createServerClient` | Correct SSR-safe implementation that handles cookie refresh automatically |

**Key insight:** The i18n layer and the database constraint are both "boring infrastructure" problems that have well-established solutions. The only value in Phase 1 is wiring them together correctly — not reinventing them.

---

## Common Pitfalls

### Pitfall 1: Using `middleware.ts` Instead of `proxy.ts` in Next.js 16

**What goes wrong:** Project scaffolds with `middleware.ts` (the pre-Next.js-16 convention). next-intl locale routing silently degrades or produces warnings. Developers discover the deprecation after building several pages.

**Why it happens:** Documentation and tutorials still reference `middleware.ts`. The `create-next-app` template may still scaffold `middleware.ts` in older templates.

**How to avoid:** Always create `src/proxy.ts`. If `create-next-app` generates `middleware.ts`, rename it immediately before writing any other code.

**Warning signs:** Any file named `middleware.ts` in a Next.js 16 project.

### Pitfall 2: i18n Not Wired Before First String

**What goes wrong:** Developer writes the first visible string (e.g. `<h1>Lavagem de carros</h1>`) directly in a component. Then more strings accumulate. When the bilingual requirement is addressed, every component must be touched.

**Why it happens:** i18n feels like configuration, not feature work. Developers defer it.

**How to avoid:** Wire next-intl completely (proxy.ts, defineRouting, [locale] layout, messages/ files) as the very first task in Phase 1, before writing any JSX with user-visible text.

**Warning signs:** Any literal text string in a `.tsx` file that isn't behind a `t('key')` call.

### Pitfall 3: btree_gist Extension Not Enabled Before Exclusion Constraint

**What goes wrong:** Migration runs `ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (...)` without first enabling `btree_gist`. PostgreSQL returns `ERROR: operator class "gist_int8_ops" does not exist for access method "gist"` (or similar). Migration fails silently if error handling is misconfigured.

**Why it happens:** `btree_gist` is not enabled by default on new Postgres databases. The exclusion constraint requires it.

**How to avoid:** Always put `CREATE EXTENSION IF NOT EXISTS btree_gist;` at the top of the migration, before any table creation or constraint. Verify the extension is listed in `supabase.extensions` after the migration runs.

**Warning signs:** Migration file has `EXCLUDE USING gist` without a preceding `CREATE EXTENSION btree_gist`.

### Pitfall 4: Wrong Supabase Client in Server Components

**What goes wrong:** Developer uses `createClient()` from `@supabase/supabase-js` directly in Server Components. Authentication cookies are not forwarded correctly. Queries fail in production or return empty results for authenticated requests.

**Why it happens:** The bare `@supabase/supabase-js` client does not handle cookie-based auth in SSR contexts.

**How to avoid:** Use `@supabase/ssr` `createServerClient` for Server Components and Route Handlers. Use `createBrowserClient` for Client Components only.

**Warning signs:** `import { createClient } from '@supabase/supabase-js'` in any file under `src/app/` that runs server-side.

### Pitfall 5: Tailwind v4 JS Config File Conflict

**What goes wrong:** Developer (or an AI assistant) creates a `tailwind.config.js` or `tailwind.config.ts` in a Tailwind v4 project. The JS config conflicts with the CSS-native `@theme` config. Custom colors stop working or produce unexpected results.

**Why it happens:** Tailwind v3 projects always had a JS config. Developers and tools that assume v3 patterns create one reflexively.

**How to avoid:** For a Tailwind v4 project, all configuration lives in `src/app/globals.css` inside `@theme {}`. No JS config file should exist.

**Warning signs:** `tailwind.config.js` or `tailwind.config.ts` in the project root when using Tailwind v4.

---

## Code Examples

Verified patterns from official sources:

### Supabase Server Client (SSR-safe)

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// src/lib/supabase.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### Using Translations in a Server Component

```typescript
// Source: https://next-intl.dev/docs/usage/messages
// src/app/[locale]/page.tsx
import {useTranslations, setRequestLocale} from 'next-intl/server';

type Props = {params: Promise<{locale: string}>};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = useTranslations('HomePage');

  return <h1>{t('title')}</h1>;
}
```

```json
// messages/pt.json
{
  "HomePage": {
    "title": "Lavagem de carros profissional no Algarve"
  }
}
```

```json
// messages/en.json
{
  "HomePage": {
    "title": "Professional car wash in the Algarve"
  }
}
```

### Verifying the Exclusion Constraint Works

```sql
-- Test: insert two overlapping bookings — second should fail
INSERT INTO bookings (service_id, vehicle_type, start_time, end_time, customer_name, customer_email)
SELECT id, 'citadino', '2026-04-01 10:00:00+00', '2026-04-01 10:30:00+00', 'Test A', 'a@test.com'
FROM services WHERE slug = 'interior-express';

-- This must fail with: ERROR: conflicting key value violates exclusion constraint
INSERT INTO bookings (service_id, vehicle_type, start_time, end_time, customer_name, customer_email)
SELECT id, 'berlina', '2026-04-01 10:15:00+00', '2026-04-01 10:45:00+00', 'Test B', 'b@test.com'
FROM services WHERE slug = 'exterior-express';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` for Next.js request interception | `proxy.ts` (Next.js 16) | October 2025 (Next.js 16 release) | Must rename file in all Next.js 16 projects; `middleware.ts` is deprecated but still works temporarily |
| `next lint` CLI command | Direct `eslint` or Biome | Next.js 16 (removed) | `next lint` is gone in Next.js 16; use `eslint` or `biome` directly in scripts |
| `tailwind.config.js` | CSS `@theme` in `globals.css` | January 2025 (Tailwind v4) | No JS config file in v4; all theme tokens are CSS variables |
| `experimental.ppr` flag | `cacheComponents: true` (stable) | Next.js 16 | PPR flag renamed; available as stable Cache Components opt-in |
| Next.js 15.5 | Next.js 16.2.0 (current latest) | October 2025 | Prior research documented 15.5; npm `latest` is now 16.2.0 |

**Deprecated/outdated:**
- `middleware.ts` filename: deprecated in Next.js 16; rename to `proxy.ts`
- `next lint` command: removed in Next.js 16; use `eslint` directly
- `experimental.turbopack`: moved to top-level `turbopack` config
- Tailwind `tailwind.config.js`: incorrect for v4 projects

---

## Open Questions

1. **New project directory: replace vs. rename existing `/jetwash24` folder**
   - What we know: The existing `/jetwash24` folder contains a completely different project with the wrong stack (Next.js 14, Prisma, Stripe, next-auth). It will conflict with the new project.
   - What's unclear: Whether to archive it (rename to `/jetwash24-legacy`), delete it, or replace in-place.
   - Recommendation: Archive by renaming to `jetwash24-legacy/` before scaffolding the new project into `jetwash24/`. This preserves the existing code without contaminating the new project.

2. **Logo asset format and creation approach (DSGN-01)**
   - What we know: The logo needs to be created from scratch (PROJECT.md: "Logo a criar de raiz — identidade visual ainda a definir"). The brand direction is dark blue + white + cyan.
   - What's unclear: SVG vs PNG; whether the logo is text-only, icon-only, or combined.
   - Recommendation: Create as SVG (scalable, no quality loss at any size, best for web). A combined wordmark + icon in dark blue (#0B1F3A) and cyan (#00C8E0) with "Jetwash24" text and a stylized water/car motif is the standard approach for this type of business. Final design is a creative decision, not a technical one.

3. **`setRequestLocale` in every page vs. static rendering**
   - What we know: next-intl 4.x requires `setRequestLocale(locale)` in layouts and pages that use static rendering.
   - What's unclear: Whether the placeholder home page in Phase 1 needs `generateStaticParams`.
   - Recommendation: Include `generateStaticParams` and `setRequestLocale` in the Phase 1 locale layout from the start. This is trivial to add now and complex to add later if caching behavior changes.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected in new project (to be scaffolded) |
| Config file | None — Wave 0 must add |
| Quick run command | `npx jest --testPathPattern=unit --passWithNoTests` (after Wave 0 setup) |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TECH-01 | Exclusion constraint rejects overlapping inserts | Integration (Supabase) | SQL test via `supabase db test` or manual verification script | Wave 0 |
| TECH-01 | Two concurrent POSTs to same slot produce exactly one success | Integration | Manual concurrent test (Phase 2 concern) | Deferred to Phase 2 |
| DSGN-01 | Logo SVG asset exists at `public/logo.svg` | Smoke | `test -f public/logo.svg` | Wave 0 |
| DSGN-02 | CSS custom properties present in globals.css | Unit | `grep --color "@theme" src/app/globals.css` | Wave 0 |
| CONT-03 | Navigating to `/pt` serves PT locale | Smoke | `curl -s http://localhost:3000/pt` returns PT content | Wave 0 |
| CONT-03 | Navigating to `/en` serves EN locale | Smoke | `curl -s http://localhost:3000/en` returns EN content | Wave 0 |
| CONT-03 | No hardcoded strings in `.tsx` files | Lint | Custom lint rule or grep: `grep -r "Lavagem" src/app/` must return 0 results | Wave 0 |

### Sampling Rate

- **Per task commit:** Run `npm run build` — build failure indicates broken i18n wiring or TypeScript errors
- **Per wave merge:** Full suite + manual browser check of `/pt` and `/en` routes
- **Phase gate:** All routes accessible, exclusion constraint verified via SQL test, no hardcoded strings

### Wave 0 Gaps

- [ ] `jest.config.ts` — test framework configuration (or use Vitest if preferred)
- [ ] `tests/schema.test.sql` — Supabase exclusion constraint verification
- [ ] No existing test infrastructure in the project (new scaffold)

*(The new project scaffold from `create-next-app` does not include a test framework. Wave 0 must decide: Jest or Vitest. Either is acceptable for this project scale. Vitest is faster and aligns better with the Vite/ESM ecosystem; Jest has broader documentation. Recommendation: Vitest.)*

---

## Sources

### Primary (HIGH confidence)

- `npm view next version` (live, 2026-03-20) — confirmed Next.js 16.2.0 as `latest`
- `npm view next dist-tags` (live, 2026-03-20) — confirmed version landscape; 15.5 is `backport`, 16.2.0 is `latest`
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — `proxy.ts` rename, Turbopack stable, breaking changes
- [next-intl routing/middleware docs](https://next-intl.dev/docs/routing/middleware) — `proxy.ts` setup, `createMiddleware`, matcher config
- [next-intl App Router with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — `defineRouting`, `[locale]` layout, `generateStaticParams`, `setRequestLocale`
- `npm view @supabase/supabase-js version` (live, 2026-03-20) — confirmed 2.99.3
- `npm view next-intl version` (live, 2026-03-20) — confirmed 4.8.3
- `npm view tailwindcss version` (live, 2026-03-20) — confirmed 4.2.2
- `.planning/research/STACK.md` (project research, 2026-03-20) — stack rationale, full library list
- `.planning/research/ARCHITECTURE.md` (project research, 2026-03-20) — project structure, DB schema, data flow
- `.planning/research/PITFALLS.md` (project research, 2026-03-20) — i18n pitfalls, double-booking pitfalls

### Secondary (MEDIUM confidence)

- [WebSearch: Supabase btree_gist free tier 2026](https://supabase.com/docs/guides/database/extensions) — btree_gist listed as supported extension; no tier restrictions documented
- [shadcn/ui Next.js installation docs](https://ui.shadcn.com/docs/installation/next) — `npx shadcn@latest init -t next`; Tailwind v4 support confirmed
- [WebSearch: next-intl Next.js 16 proxy.ts setup 2026](https://www.buildwithmatija.com/blog/next-intl-nextjs-16-proxy-fix) — confirmed proxy.ts rename; `NextIntlClientProvider` requirement

### Tertiary (LOW confidence — flagged)

- WebSearch results on btree_gist Supabase free tier: multiple sources confirm extension availability but none explicitly state free-tier restrictions. **Action:** Verify by checking the Supabase dashboard after project creation. If btree_gist is unavailable on free tier, the workaround is an application-level `FOR UPDATE` row lock inside a Postgres function (less elegant but functional).

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified live via `npm view` on 2026-03-20
- Architecture: HIGH — next-intl official docs confirm `proxy.ts` + `defineRouting` pattern; schema from prior project research
- Pitfalls: HIGH — Next.js 16 breaking changes verified against official release blog; i18n and constraint pitfalls from prior verified research

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable ecosystem; Next.js minor releases possible but no breaking changes expected)

---

**Key delta from prior research (`.planning/research/`):**
The prior stack research (2026-03-20) documented Next.js 15.5 as the recommended version. As of the same date, `npm view next version` returns 16.2.0 (released October 2025). The required file rename (`middleware.ts` → `proxy.ts`) and the three next-intl 4.0 integration requirements (`NextIntlClientProvider` wrapper, `locale` return from `getRequestConfig`, `proxy.ts` filename) are the only changes that affect Phase 1 implementation directly. All other stack choices remain valid.
