---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts — Wave 0 installs |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01-01 | 1 | CONT-03 | integration | `npx vitest run src/__tests__/i18n.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01-01 | 1 | CONT-03 | smoke | `npx next build 2>&1 \| grep -v Warning` | ❌ W0 | ⬜ pending |
| 1-02-01 | 01-02 | 2 | TECH-01 | integration | `npx vitest run src/__tests__/schema.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-02 | 01-02 | 2 | TECH-01 | unit | `npx vitest run src/__tests__/exclusion.test.ts` | ❌ W0 | ⬜ pending |
| 1-03-01 | 01-03 | 3 | DSGN-01 | smoke | `test -f public/logo.svg && echo PASS` | N/A | ⬜ pending |
| 1-03-02 | 01-03 | 3 | DSGN-02 | smoke | `grep -r '#0B1F3A\|#00C8E0' src/app/globals.css` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/i18n.test.ts` — stubs for CONT-03 (locale routing)
- [ ] `src/__tests__/schema.test.ts` — stubs for TECH-01 (Supabase schema tables)
- [ ] `src/__tests__/exclusion.test.ts` — stubs for TECH-01 (btree_gist exclusion constraint)
- [ ] `vitest.config.ts` — framework configuration
- [ ] `package.json` — vitest + @vitest/coverage-v8 devDependencies

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/pt` and `/en` routes serve correct locale in browser | CONT-03 | Requires live browser navigation | Run `npm run dev`, visit http://localhost:3000/pt and http://localhost:3000/en, verify locale strings |
| Logo renders correctly in browser | DSGN-01 | Visual verification | Run `npm run dev`, verify logo appears in header |
| shadcn/ui components render with correct color scheme | DSGN-02 | Visual verification | Run `npm run dev`, verify dark blue / white / cyan palette |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
