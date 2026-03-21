---
phase: 3
slug: landing-page-service-catalog
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `jetwash24/vitest.config.ts` |
| **Quick run command** | `cd jetwash24 && npx vitest run src/__tests__/catalog.test.ts` |
| **Full suite command** | `cd jetwash24 && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd jetwash24 && npx vitest run src/__tests__/catalog.test.ts`
- **After every plan wave:** Run `cd jetwash24 && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | SERV-01 | unit stub | `cd jetwash24 && npx vitest run src/__tests__/catalog.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | CONT-01 | type-check | `cd jetwash24 && npx tsc --noEmit 2>&1 \| head -20` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 1 | SERV-01,02,03,04 | unit | `cd jetwash24 && npx vitest run src/__tests__/catalog.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | SERV-02 | unit | `cd jetwash24 && npx vitest run src/__tests__/catalog.test.ts` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | CONT-02, DSGN-04 | type-check | `cd jetwash24 && npx tsc --noEmit 2>&1 \| head -20` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jetwash24/src/__tests__/catalog.test.ts` — unit tests for `calculatePrice()` and `calculateSavings()` pure functions (SERV-01, SERV-02, SERV-04)
- [ ] `jetwash24/src/lib/catalog.ts` — pure functions stub (calculatePrice, calculateSavings, SLUG_CATEGORY_MAP, PACKAGE_COMPOSITION_MAP)
- [ ] `npx shadcn add tabs card badge separator` — install 4 missing shadcn components

*Existing Vitest infrastructure already installed — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page renders in both PT and EN | CONT-01 | Requires running dev server + browser | `npm run dev`, visit `/pt` and `/en`, verify all text is translated |
| Vehicle selector updates prices dynamically | SERV-02 | Requires browser interaction | Select each vehicle type, verify prices update without page reload |
| Service extras display with correct add-on prices | SERV-03 | Visual + content verification | Check Interior tab, verify extras list shows correct durations and prices |
| Package savings badge shows correct amount | SERV-04 | Visual + math verification | Check Pacotes tab, verify crossed-out price and "Poupa X€" badge |
| Contact links are clickable and correct | CONT-02 | Requires device or browser | Verify click-to-call, email, Maps link, Instagram all have correct hrefs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
