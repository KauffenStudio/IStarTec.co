---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [nextjs, typescript, tailwind, shadcn, next-intl, supabase, vitest, i18n]

requires: []
provides:
  - Next.js 16.2.0 project scaffold with TypeScript, Tailwind v4, shadcn/ui
  - next-intl bilingual routing (pt/en) via proxy.ts + defineRouting + [locale] structure
  - Supabase server and browser clients (SSR-safe via @supabase/ssr)
  - Vitest configured with Wave 0 stubs for i18n, schema, and exclusion constraint
  - Brand design system (navy #0B1F3A + cyan #00C8E0) via Tailwind v4 @theme CSS variables
  - Working placeholder home page at /pt and /en with all strings in messages/*.json
affects: [02-database, 03-booking-engine, 04-ui-pages, 05-email, 06-deployment]

tech-stack:
  added:
    - next@16.2.0
    - react@19.2.4
    - typescript@5.x
    - tailwindcss@4.x (CSS-native, no tailwind.config.js)
    - shadcn/ui (CLI-initialized, Radix preset)
    - next-intl@4.8.3
    - "@supabase/supabase-js@2.99.3"
    - "@supabase/ssr@0.9.0"
    - date-fns@4.1.0
    - vitest@4.1.0
    - "@vitest/coverage-v8@4.1.0"
  patterns:
    - next-intl with proxy.ts (Next.js 16 convention, not middleware.ts)
    - [locale] folder structure for all app routes
    - Tailwind v4 @theme CSS custom properties for brand tokens
    - getTranslations (async) for server components, not useTranslations
    - @supabase/ssr createServerClient for SSR-safe DB access
    - Wave 0 vitest stubs (it.todo) as test placeholders

key-files:
  created:
    - jetwash24/src/proxy.ts (next-intl middleware for locale routing)
    - jetwash24/src/i18n/routing.ts (defineRouting with pt/en locales)
    - jetwash24/src/i18n/navigation.ts (locale-aware Link, redirect, useRouter)
    - jetwash24/src/i18n/request.ts (getRequestConfig with message loading)
    - jetwash24/src/app/[locale]/layout.tsx (NextIntlClientProvider, generateStaticParams)
    - jetwash24/src/app/[locale]/page.tsx (placeholder home with getTranslations)
    - jetwash24/src/lib/supabase.ts (createSupabaseServerClient + createSupabaseBrowserClient)
    - jetwash24/messages/pt.json (Portuguese translations)
    - jetwash24/messages/en.json (English translations)
    - jetwash24/vitest.config.ts (node environment, @/* alias)
    - jetwash24/src/__tests__/i18n.test.ts (5 Wave 0 stubs)
    - jetwash24/src/__tests__/schema.test.ts (6 Wave 0 stubs)
    - jetwash24/src/__tests__/exclusion.test.ts (5 Wave 0 stubs)
  modified:
    - jetwash24/next.config.ts (createNextIntlPlugin wired)
    - jetwash24/src/app/layout.tsx (minimal root layout, returns children only)
    - jetwash24/src/app/globals.css (brand @theme tokens added, shadcn tokens preserved)
    - jetwash24/package.json (added test/test:coverage scripts)

key-decisions:
  - "getTranslations (async) must be used in async server components instead of useTranslations (sync hook) — next-intl enforces this at build time"
  - "request.ts must load messages JSON dynamically per locale for build to succeed — getRequestConfig returning only locale is insufficient"
  - "Legacy jetwash24 folder (Next.js 14/Prisma/Stripe) archived to jetwash24-legacy — completely different stack, not reusable"
  - "proxy.ts confirmed as Next.js 16 convention — middleware.ts is deprecated"
  - "shadcn/ui initialized with Radix+Nova preset — no tailwind.config.js generated (Tailwind v4 CSS-native)"
  - "Root .gitignore created at repo root to exclude node_modules, .next, .env.local from all subdirectories"

patterns-established:
  - "Pattern: All user-facing strings go in messages/pt.json and messages/en.json — never hardcoded in .tsx files"
  - "Pattern: Async server components use getTranslations from next-intl/server, not useTranslations"
  - "Pattern: proxy.ts (not middleware.ts) for Next.js 16 middleware"
  - "Pattern: Brand colors defined as @theme CSS custom properties in globals.css, usable as Tailwind classes (bg-brand-navy, text-brand-cyan)"

requirements-completed: [CONT-03, DSGN-02]

duration: 13min
completed: 2026-03-20
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**Next.js 16.2.0 with next-intl bilingual routing (pt/en via proxy.ts), Tailwind v4 brand design system (navy+cyan @theme tokens), shadcn/ui, SSR-safe Supabase clients, and Vitest with 16 Wave 0 stubs — build succeeds producing /pt and /en static routes**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-20T21:17:35Z
- **Completed:** 2026-03-20T21:30:00Z
- **Tasks:** 4 (Task 1, Task 2, Task 3a, Task 3b)
- **Files modified:** 17

## Accomplishments

- Scaffolded fresh Next.js 16.2.0 project with correct stack (archived legacy jetwash24 with wrong stack to jetwash24-legacy)
- Wired next-intl bilingual routing: proxy.ts + defineRouting + [locale]/ folder — `/pt` and `/en` routes serve locale-specific content
- Applied Jetwash24 brand palette (navy #0B1F3A, cyan #00C8E0) via Tailwind v4 @theme CSS custom properties
- Created Wave 0 vitest stubs: 16 `it.todo` entries across i18n, schema, and exclusion constraint test files
- Supabase SSR-safe server client and browser client ready for Phase 2
- `npm run build` succeeds with `/pt` and `/en` generated as SSG static pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project and install all dependencies** - `845deab` (chore)
2. **Task 2: Create Wave 0 vitest stub files** - `9050903` (test)
3. **Task 3a: Wire next-intl i18n config and routing** - `f7661d9` (feat)
4. **Task 3b: Placeholder home page, messages, Supabase client, globals.css** - `562e00d` (feat)

**Plan metadata:** (final commit to follow)

## Files Created/Modified

- `jetwash24/src/proxy.ts` - next-intl createMiddleware for locale routing (Next.js 16 proxy.ts)
- `jetwash24/src/i18n/routing.ts` - defineRouting with ['pt', 'en'], defaultLocale 'pt'
- `jetwash24/src/i18n/navigation.ts` - createNavigation exports (Link, redirect, usePathname, useRouter)
- `jetwash24/src/i18n/request.ts` - getRequestConfig loading messages JSON dynamically
- `jetwash24/src/app/[locale]/layout.tsx` - NextIntlClientProvider wrapper, generateStaticParams
- `jetwash24/src/app/[locale]/page.tsx` - placeholder home using getTranslations (async)
- `jetwash24/src/lib/supabase.ts` - createSupabaseServerClient + createSupabaseBrowserClient
- `jetwash24/messages/pt.json` - Portuguese translations (HomePage, Navigation, Common)
- `jetwash24/messages/en.json` - English translations (HomePage, Navigation, Common)
- `jetwash24/src/app/globals.css` - @theme brand tokens + shadcn tokens, :root background/primary overridden to brand colors
- `jetwash24/next.config.ts` - createNextIntlPlugin wired to src/i18n/request.ts
- `jetwash24/src/app/layout.tsx` - minimal root layout (returns children, no html/body)
- `jetwash24/vitest.config.ts` - node environment, @/* alias, includes src/**/*.test.ts
- `jetwash24/package.json` - test and test:coverage scripts added
- `jetwash24/src/__tests__/i18n.test.ts` - 5 Wave 0 stubs for locale routing
- `jetwash24/src/__tests__/schema.test.ts` - 6 Wave 0 stubs for DB schema
- `jetwash24/src/__tests__/exclusion.test.ts` - 5 Wave 0 stubs for TECH-01 exclusion constraint

## Decisions Made

- **getTranslations vs useTranslations:** `useTranslations` is a React hook and cannot be called in async server components. next-intl provides `getTranslations` (async) for server components. Build failure revealed this — fixed inline (Rule 1).
- **request.ts message loading:** The `getRequestConfig` callback must return `messages` (the loaded JSON) in addition to `locale`. Returning only `locale` causes "No messages found" build error. Added dynamic import of messages JSON.
- **proxy.ts over middleware.ts:** Confirmed correct filename for Next.js 16. The Next.js docs inside `node_modules/next/dist/docs/` confirm this explicitly.
- **Legacy folder archived:** The existing jetwash24 folder used Next.js 14 + Prisma + Stripe + next-auth — incompatible stack. Archived to jetwash24-legacy.
- **Root .gitignore:** Created to prevent node_modules, .next build artifacts, and .env.local from being committed in the monorepo structure.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useTranslations in async server component**
- **Found during:** Task 3b — build failed during `npm run build`
- **Issue:** Plan specified `useTranslations('HomePage')` in an async server component. next-intl prohibits this — `useTranslations` is a React hook, not callable in async functions.
- **Fix:** Changed import to `getTranslations` from `next-intl/server` and awaited it: `const t = await getTranslations('HomePage')`
- **Files modified:** `jetwash24/src/app/[locale]/page.tsx`
- **Verification:** `npm run build` succeeds with /pt and /en routes generated
- **Committed in:** `562e00d` (Task 3b commit)

**2. [Rule 1 - Bug] Added messages loading to request.ts**
- **Found during:** Task 3b — build failed with "No messages found" after fixing useTranslations
- **Issue:** `getRequestConfig` returned only `{locale}` without loading the messages JSON. next-intl requires the messages to be returned from this config function.
- **Fix:** Added `messages: (await import('../../messages/${locale}.json')).default` to the return value
- **Files modified:** `jetwash24/src/i18n/request.ts`
- **Verification:** `npm run build` succeeds; pt.json and en.json content renders correctly at /pt and /en
- **Committed in:** `562e00d` (Task 3b commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both auto-fixes were required for correctness — the plan's next-intl patterns were based on client component usage; async server component patterns require different APIs. No scope creep.

## Issues Encountered

- The legacy `jetwash24` folder contained a hidden `.next/` subfolder that blocked `create-next-app` from scaffolding into `jetwash24/`. The legacy folder had to be fully deleted (not just renamed) before scaffolding.
- `create-next-app` initialized the new project as its own git repository (inner .git). The inner .git was removed before staging to the parent repo.
- `shadcn@latest init --yes` flag didn't suppress all prompts; used `--defaults` flag combined with `-b radix -p nova` to achieve non-interactive init.

## User Setup Required

None - no external service configuration required for this plan. Supabase credentials in `.env.local` are placeholders — actual credentials will be configured in Phase 2 (database setup).

## Next Phase Readiness

- i18n infrastructure complete: all Phase 2+ components can use `getTranslations`/`useTranslations` immediately
- Supabase clients ready: `createSupabaseServerClient()` and `createSupabaseBrowserClient()` available in `src/lib/supabase.ts`
- Tailwind v4 brand tokens available: `bg-brand-navy`, `text-brand-cyan`, `bg-brand-cyan-dark` classes work in any component
- Wave 0 test stubs ready for fleshing out in Phase 2 (schema.test.ts, exclusion.test.ts)
- Phase 2 (database) needs real Supabase project URL + anon key added to .env.local

---
## Self-Check: PASSED

All key files verified present on disk. All 4 task commits verified in git log (845deab, 9050903, f7661d9, 562e00d).

---
*Phase: 01-foundation*
*Completed: 2026-03-20*
