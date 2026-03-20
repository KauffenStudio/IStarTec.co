---
phase: 2
slug: slot-engine-booking-api
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `jetwash24/vitest.config.ts` |
| **Quick run command** | `cd jetwash24 && npx vitest run src/lib` |
| **Full suite command** | `cd jetwash24 && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd jetwash24 && npx vitest run src/lib`
- **After every plan wave:** Run `cd jetwash24 && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | BOOK-03 | unit stub | `cd jetwash24 && npx vitest run src/lib/slots.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | BOOK-03 | unit | `cd jetwash24 && npx vitest run src/lib/slots.test.ts` | ✅ | ⬜ pending |
| 2-02-01 | 02 | 0 | BOOK-04 | migration | `cd jetwash24 && npx supabase db push` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | BOOK-03 | manual | See Manual-Only section | — | ⬜ pending |
| 2-02-03 | 02 | 1 | BOOK-04 | manual | See Manual-Only section | — | ⬜ pending |
| 2-02-04 | 02 | 2 | BOOK-04 | manual | See Manual-Only section | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jetwash24/src/lib/slots.test.ts` — unit test stubs for slot engine (BOOK-03)
- [ ] `jetwash24/supabase/migrations/002_rls_slots_read.sql` — SELECT policy or service-role pattern for bookings read (BOOK-03, BOOK-04)

*Existing Vitest infrastructure already installed — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GET /api/slots returns correct windows | BOOK-03 | Requires running Next.js server + real Supabase | `curl "http://localhost:3000/api/slots?date=2026-04-01&service_id=<uuid>"` and verify JSON array of ISO time strings within 09:00–18:00 Europe/Lisbon |
| Two simultaneous POSTs → 200 + 409 | BOOK-04 | Requires concurrent HTTP clients + running server | Run two parallel curl POSTs for same slot; verify one returns 200, one returns 409 |
| Cancellation token frees slot | BOOK-04 | Requires e2e booking + cancel + re-query | POST booking → POST /api/cancel with signed token → GET /api/slots and verify slot reappears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
