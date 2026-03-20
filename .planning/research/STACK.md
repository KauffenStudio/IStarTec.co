# Stack Research

**Domain:** Car wash online booking website (PT/EN bilingual, time slot management, email notifications)
**Researched:** 2026-03-20
**Confidence:** HIGH (versions verified via npm registry; architecture verified via official docs and multiple sources)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5.x (latest stable) | Full-stack React framework | App Router gives server components + server actions in one codebase. No separate backend needed for this project's scope. Next.js 16 is out but 15.5 is the proven stable release; 16 is too new to adopt for a production client site right now. |
| React | 19.x (bundled with Next.js 15.5) | UI rendering | Required by Next.js 15.5. React 19 Server Actions replace the need for a separate API layer for form submissions — booking form can POST directly via Server Action. |
| TypeScript | 5.x (bundled with Next.js) | Type safety | Essential for time slot logic: vehicle type pricing matrices, service duration calculations, and slot availability checks are error-prone without types. |
| Tailwind CSS | 4.2.2 | Styling | v4 shipped stable January 2025. Zero-config, CSS-native theming with `@theme` directive. Dark blue + cyan brand colours map directly to CSS custom properties. Shadcn/UI now fully supports v4. |
| Supabase | @supabase/supabase-js 2.99.3 + @supabase/ssr 0.9.0 | Database + realtime slot availability | PostgreSQL-backed. Realtime subscriptions let the calendar reflect newly blocked slots without page refresh — critical for preventing double-bookings. Free tier is sufficient for this business volume. No self-hosting needed. |
| Resend | 6.9.4 | Transactional email delivery | Built by the react-email team; first-class integration. 3,000 emails/month free. Reliable deliverability without SMTP configuration headaches. Sends both the client confirmation and the business notification from a single API call. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | 4.8.3 | PT/EN bilingual routing and message lookup | Use for all user-facing strings and URL locale prefixes (`/pt/marcacao`, `/en/booking`). Supports App Router Server Components natively — no context providers needed in client tree. |
| @react-email/components | 5.2.10 | Typed, renderable email templates | Build the booking confirmation email as a React component. Renders to HTML+text. Use with Resend's `.send({ react: <ConfirmationEmail /> })` API. Supports Tailwind v4. |
| react-hook-form | 7.71.2 | Booking form state management | Handles the multi-step booking form (service → vehicle type → date → slot → contact details) without re-rendering the entire tree on each keystroke. |
| @hookform/resolvers | 5.2.2 | Zod schema adapter for react-hook-form | Connects Zod schemas to form validation. Required to use Zod with react-hook-form. |
| Zod | 4.3.6 | Runtime schema validation | Validates booking submissions server-side before writing to Supabase. Prevents invalid slot data, missing required fields, and malformed vehicle type values from reaching the database. |
| react-day-picker | 9.14.0 | Calendar UI for slot selection | Zero-dependency, headless, TypeScript-native. Foundation for Shadcn/UI's `<Calendar>` component. Allows disabling already-booked dates and past dates. Integrates with react-hook-form via controlled component pattern. |
| date-fns | 4.1.0 | Date arithmetic and formatting | Pair with react-day-picker (same ecosystem). Use for: calculating service end times from start + duration, blocking slots that would run past business hours (18:00), and formatting dates in PT locale (`format(date, 'EEEE, d MMMM', { locale: pt })`). |
| shadcn/ui | CLI-based (no npm version) | Accessible component primitives | Install via `npx shadcn@latest init`. Provides: Button, Calendar, Select, Input, Form wrappers, Dialog. Copy-paste architecture — only install what's used. Reduces custom CSS needed for the Jetwash24 brand. Fully supports Tailwind v4. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel | Hosting and deployment | Zero-config Next.js hosting; Edge Network for Portugal/Algarve latency. Free Hobby tier covers this project. Set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` as environment variables in Vercel dashboard. |
| Supabase CLI | Local DB development + migrations | Install at `~/.local/bin/supabase` (already installed per user memory). Use `supabase db push` for schema migrations. Do not hand-edit the Supabase dashboard for schema — track all changes as migration files. |
| ESLint + eslint-config-next | Linting | Note: `next lint` command is deprecated as of Next.js 15.5. Use `eslint` directly. |
| Biome (optional alternative) | Faster linting + formatting | Next.js 15.5 now scaffolds Biome projects natively via `create-next-app`. Faster than ESLint + Prettier combined. Recommended if starting fresh and not relying on ESLint plugins. |

## Installation

```bash
# Scaffold project
npx create-next-app@latest jetwash24 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core runtime dependencies
npm install @supabase/supabase-js @supabase/ssr resend next-intl

# Email template components
npm install @react-email/components

# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

# Calendar and date utilities
npm install react-day-picker date-fns

# Shadcn/UI (after project creation)
npx shadcn@latest init
npx shadcn@latest add button calendar input select form dialog
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 15.5 (App Router) | Next.js 16 | When Next.js 16 reaches a few patch releases and ecosystem (shadcn, next-intl) confirms full stability — probably safe in 2-3 months. |
| Supabase | PlanetScale + separate auth | If the project needed multi-region replication or outgrew Supabase pricing. Not relevant here — Supabase free tier handles hundreds of bookings/month easily. |
| Resend | Nodemailer + Gmail SMTP | Nodemailer with Gmail requires OAuth2 setup and has deliverability risks (lands in spam). Use Nodemailer only if Resend's free tier is ever exhausted and a self-hosted SMTP is acceptable. |
| Resend | SendGrid / Mailgun | SendGrid/Mailgun have more complex APIs, higher cost on free tiers, and no first-class react-email integration. Resend is the modern default for Next.js projects. |
| next-intl | next-i18next | next-i18next was the Pages Router standard; it requires a client-side context provider that conflicts with App Router Server Components. next-intl was built for App Router from the ground up. |
| react-day-picker | react-datepicker | react-datepicker bundles its own styles (conflicts with Tailwind) and has no Shadcn/UI integration. react-day-picker is headless and already powers Shadcn's `<Calendar>`. |
| Shadcn/UI | Radix UI (bare) | Use bare Radix if a fully custom design system is needed. Shadcn/UI is Radix + Tailwind pre-wired — saves significant time for a client site with a defined brand. |
| Tailwind CSS v4 | Tailwind CSS v3 | Use v3 only if an existing component library being adopted requires it. Starting fresh in 2026, always use v4. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| next-i18next | Built for Pages Router; adds client context provider that breaks Server Components; maintenance is in decline | next-intl 4.x |
| Nodemailer (standalone) | Gmail SMTP OAuth2 is complex to maintain; deliverability is unreliable; env credentials management is fragile | Resend 6.x |
| Prisma ORM | Adds a build-time code generation step and cold-start latency in serverless. Supabase already exposes a full PostgREST API and typed client — Prisma is redundant and adds complexity | @supabase/supabase-js (direct client) |
| next-auth / Auth.js | Project spec explicitly excludes user login. Adding Auth.js would introduce sessions, callbacks, and database tables for zero user-facing benefit in v1 | Nothing — no auth needed |
| Stripe / payment libraries | Out of scope per PROJECT.md — payment is in-person only. Adding Stripe increases PCI compliance surface area unnecessarily | Nothing — link to in-person instructions in booking confirmation email |
| React Query / SWR | Slot availability should use Supabase Realtime subscriptions (WebSocket), not polling. React Query is for REST/GraphQL caching, not WebSocket state | Supabase Realtime (`supabase.channel()`) |
| Firebase / Firestore | No advantage over Supabase for this use case; inferior SQL support makes time-slot overlap queries harder; no built-in email; ties you to Google ecosystem | Supabase |

## Stack Patterns by Variant

**If business later requests an admin panel:**
- Add Supabase Row Level Security policies to restrict booking management to an admin role
- Use the same Next.js app with a protected `/admin` route group
- Because the database schema is already in Supabase, no migration is needed

**If business later requests online payments:**
- Add Stripe Checkout with Stripe's official `@stripe/stripe-js` and `stripe` Node SDK
- Because Next.js Server Actions already handle the booking flow, adding a Stripe PaymentIntent before the Supabase insert is a contained change

**If the PT locale needs a custom domain for SEO (jetwash24.pt):**
- Use next-intl domain-based routing instead of path-based (`/pt/`, `/en/`)
- Because next-intl supports both routing strategies without changing translation file structure

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next 15.5.x | react 19.x, react-dom 19.x | Next.js 15.5 ships with React 19. Do not mix React 18 in the same project. |
| @supabase/supabase-js 2.99.3 | Node.js 20+ | Node.js 18 support dropped in 2.79.0. Vercel's default runtime is Node 20 — no action needed. |
| next-intl 4.8.3 | next 15.x and 16.x | Fully supports App Router Server Components and Client Components. |
| react-day-picker 9.x | date-fns 4.x | DayPicker v9 uses date-fns v4 as its date adapter. Do not install date-fns v3 alongside v9 — breaking API differences. |
| tailwindcss 4.2.2 | shadcn/ui (CLI latest) | Shadcn/UI CLI initialised with Tailwind v4 generates a CSS-only config (no `tailwind.config.js`). This is correct behaviour for v4 — do not create a JS config file. |
| @react-email/components 5.x | react 19.x, resend 6.x | react-email 5 explicitly supports React 19.2 and Tailwind 4. |

## Sources

- [Next.js 15.5 release blog](https://nextjs.org/blog/next-15-5) — confirmed 15.5 as latest stable; Next.js 16 migration warnings documented — HIGH confidence
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — confirmed Next.js 16 is out but 15.5 is the current recommended stable — HIGH confidence
- [Supabase Realtime docs](https://supabase.com/docs/guides/realtime/getting_started) — confirmed WebSocket-based slot availability pattern — HIGH confidence
- [Resend official docs](https://resend.com/docs/send-with-nextjs) — confirmed Server Actions integration, App Router support — HIGH confidence
- [react-email 5.0 announcement](https://resend.com/blog/react-email-5) — confirmed React 19.2 and Tailwind v4 support — HIGH confidence
- [next-intl official site](https://next-intl.dev/) — confirmed App Router support, 4.8.3 version — HIGH confidence
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — confirmed stable January 2025, CSS-native config — HIGH confidence
- [Shadcn/UI Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — confirmed CLI support for v4, no JS config file — HIGH confidence
- npm registry (verified via `npm view`) — all version numbers confirmed live — HIGH confidence
- [Builder.io: Best React calendar libraries 2025](https://www.builder.io/blog/best-react-calendar-component-ai) — react-day-picker as headless standard; Shadcn/UI Calendar built on it — MEDIUM confidence (verified against daypicker.dev)

---
*Stack research for: Jetwash24 — car wash online booking website*
*Researched: 2026-03-20*
