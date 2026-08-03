# Phase III Security Certification — Intelligence Boundary

**Certification Date:** 03 Aug 2026
**Status:** ✅ **GO** (conditional, documented below)

---

## 1. Mission

Eliminate the certification-blocking findings from Phase II by enforcing **server-side intelligence authorization**. The requirement is absolute:

> Unauthorized users must **never receive** Intelligence data. Not "receive but cannot see." **Never transmitted.**

Phase II Critical findings this sprint resolves:

| Phase II finding | Severity | Resolved |
|---|---|---|
| Module RBAC is client-side only; RSC payload streamed to any authenticated session | Critical | ✅ |
| Public self-registration mints a session that passes middleware; data reachable in payload | Critical | ✅ |
| Server-side `role-guard.ts` existed but was dead code | Medium | ✅ (removed, superseded) |
| Demo-mode / middleware session split-brain | Medium | ✅ (documented as deliberate fail-closed boundary) |

---

## 2. Intelligence Boundary Audit — Result

Every `/intel` route was reviewed for **all six transmission phases**: loading, querying, computing, serializing, streaming, rendering.

### 2.1 Boundary verdict (per route)

| Route | Before | After | Boundary |
|---|---|---|---|
| `/intel` (Mission Control) | no guard at all | server gate `dashboard` before `loadData()` | ✅ |
| `/intel/watch-list` | guard after `computeScoringOverview()` | gate before `computeScoringOverview()` | ✅ |
| `/intel/predictions` | guard after `computePredictionsOverview()` | gate before `computePredictionsOverview()` | ✅ |
| `/intel/scenarios` | guard after `computeScenariosOverview()` | gate before `computeScenariosOverview()` | ✅ |
| `/intel/research` | guard after `computeEvidenceOverview()` | gate before all data calls | ✅ |
| `/intel/toolkit` | guard after `computeToolkitOverview()` | gate before all data calls | ✅ |
| `/intel/editorial` | guard after `computeEditorialOverview()` | gate before `computeEditorialOverview()` | ✅ |
| `/intel/candidates` (placeholder) | client guard only | server gate before render | ✅ |
| `/intel/media` (placeholder) | client guard only | server gate before render | ✅ |
| `/intel/rti` (placeholder) | client guard only | server gate before render | ✅ |
| `/intel/story-builder` (placeholder) | client guard only | server gate before render | ✅ |
| `/intel/verification` (placeholder) | client guard only | server gate before render | ✅ |
| `/intel/tasks` (placeholder) | client guard only | server gate before render | ✅ |

**Verified:** all 13 routes call `guardIntelModule(module)` and render `IntelDenied` on denial **before** any data computation. Structural regression tests enforce this ordering (see §6).

### 2.2 Transmission phases audit

| Phase | Enforcement | Evidence |
|---|---|---|
| Loading / Querying | Middleware module check returns `403 Forbidden` before the router serves the page | `middleware.ts` §3 (verified in build output: all `/intel` routes are `ƒ Dynamic`) |
| Computing | `guardIntelModule()` runs first in every Server Component; no compute call precedes it | structural test §6 |
| Serializing / Streaming | Authorization failure returns `IntelDenied` (forbidden) or `redirect('/login')` (unauthenticated); no payload enters the RSC stream | page sources |
| Rendering | Denied users render a denial surface, never content | `components/intel/IntelDenied.tsx` |

### 2.3 No leakage vectors

| Vector | Status | Verification |
|---|---|---|
| RSC payload | ✅ sealed | server gate precedes compute; middleware short-circuits |
| API routes | ✅ none expose intel | structural test: no `app/api` file imports `lib/intel` or `intel-server` |
| Server Actions | ✅ none exist under `app/intel` | file inventory |
| Public pages | ✅ isolated | structural test: no `app/` (outside `/intel`) or `components/` (outside `/components/intel`) file imports `lib/intel` |
| Static prerender | ✅ none | build: all 13 `/intel` routes are `ƒ (Dynamic)`; nothing is statically baked |
| Caching | ✅ none | authenticated header policy: `private, no-cache, no-store, must-revalidate` + `noindex, nofollow` |
| Prefetch / prefetching | ✅ n/a | authenticated pages carry no-store cache policy |

---

## 3. Authorization Matrix

Source of truth: `features/auth/roles.ts` (unchanged; now enforced server-side).

| Module | Min role | guest | fact_checker | researcher | reporter | analyst | editor | managing_editor | owner |
|---|---|---|---|---|---|---|---|---|---|
| dashboard | guest | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| watch-list | analyst | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| predictions | analyst | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| scenarios | analyst | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| candidates | researcher | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| media | reporter | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| research | researcher | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| toolkit | reporter | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| editorial | editor | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| story-builder | editor | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| verification | fact_checker | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rti | researcher | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tasks | reporter | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

Inheritance is strictly linear (`guest < fact_checker < researcher < reporter < analyst < editor < managing_editor < owner`). A role can access a module iff its rank ≥ the module's minimum rank. Verified by 13×8 matrix assertions in the security suite.

### 3.1 Role normalization rules (documented)

| Input | Normalized | Rationale |
|---|---|---|
| `null` / `undefined` / `''` | `guest` | fail closed; no silent escalation |
| `reader` (public role) | `guest` | minimum capability; a public reader is never an intelligence user |
| unknown string | `guest` | fail closed |
| `EDITOR`, `Managing Editor` | `editor`, `managing_editor` | case/spacing normalized |
| valid intel roles | themselves | unchanged |

---

## 4. Updated RBAC Flow

### 4.1 Request lifecycle (per `/intel/:path*` request)

```
1. Middleware (edge)
   ├─ session exists?  ── no ──> 302 /login?redirect=<path>
   └─ yes
   └─ intelModuleFromPath(path) ── module mapped?
        ├─ no  ──> continue (page 404s if unknown)
        └─ yes
        └─ canAccessIntelModule(normalize(metadata.role), module)?
             ├─ no  ──> 403 Forbidden (no router execution, no payload)
             └─ yes ──> continue

2. Server Component (origin)
   const gate = await guardIntelModule(module)      // server-side, before data
   if (!gate.authorized) return <IntelDenied/>       // forbidden → denial surface
                                                      // unauthenticated → redirect (safety net)

3. Data computation (ONLY for authorized)
   await computeXxxOverview() …                       // payload built and streamed

4. Client (UX only — never a boundary)
   <IntelModuleGuard module="…">                      // hides/shows for authorized users
   layout tab filter by intelModulesForRole(role)
```

### 4.2 Enforcement layers

| Layer | Mechanism | Role |
|---|---|---|
| Edge | `middleware.ts` module check → 403 | Primary boundary (short-circuits before router) |
| Origin | `guardIntelModule()` before compute in every Server Component | Second boundary + denial UX |
| Client | `IntelModuleGuard`, tab filter | UX only |

### 4.3 Session model

- `features/auth/auth-server.ts` `getSession()` now **fails closed**: any error returns `null` → treated as unauthenticated → `redirect('/login')`.
- New registration (`app/api/v1/auth/register/route.ts`) explicitly sets `role: 'reader'` in user metadata → normalizes to `guest` → **dashboard-only** capability. New users receive the minimum possible capability.
- Expired sessions → `getSession()` returns `null` → unauthenticated → login redirect.

### 4.4 Demo-mode boundary (deliberate, documented)

Demo mode (`features/auth/demo.ts`) is a **client-side preview affordance only**. It writes to `localStorage`; it never creates a server-visible session. Because the `/intel` middleware and every Server Component now require a real Supabase session, **demo mode cannot reach any intelligence route**. This is a deliberate fail-closed decision: a client-set flag must never act as an authorization credential, even in dev. Environments that need to exercise the workspace must configure `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (as `.env.local` does). In production `isDemoMode()` is false and the demo path is inert.

---

## 5. Security Test Suite

New suite: `tests/intel-auth.test.ts` (script `test:intel-auth`, wired into `test:all`).

**Result: 1,091 assertions passed, 0 failed.**

| Section | Coverage | Assertions |
|---|---|---|
| Role normalization | null/undefined/empty/reader/unknown/case/spacing | ✓ |
| Authorization matrix | 13 modules × 8 roles + inheritance + reader minimum | ✓ |
| `decideIntelAccess` | pure decision logic, carries role + label | ✓ |
| `guardIntel` | anonymous, missing role, invalid role, reader, guest, analyst, editor, boundary hold | ✓ |
| `intelModuleFromPath` | all 13 mappings + negatives | ✓ |
| Structural: page gating | every `/intel` page calls `guardIntelModule` **before** any data call | ✓ |
| Structural: boundary isolation | no `app/` (excl. intel), no `components/` (excl. intel) imports `lib/intel` or `intel-server` | ✓ |
| Structural: middleware | derives module, checks permission, resolves role from metadata, returns 403 | ✓ |

The structural sections are **regression guards**: any future page that computes intel data without first gating, or any new API route that imports the intelligence engine, fails CI.

---

## 6. Quality Gates

| Gate | Result |
|---|---|
| `npm run test:intel-auth` | ✅ 1,091 passed |
| Existing intel suites (scoring/predictions/scenarios/evidence/toolkit/editorial) | ✅ 459 passed, 0 failed |
| `npx tsx tests/auth.test.ts` | ✅ 26/26 |
| `npx tsc --noEmit` | ✅ zero new errors (9 pre-existing `mgcf-runtime` scaffold errors, unrelated) |
| `npm run build` | ✅ Compiled successfully; all 13 `/intel` routes `ƒ (Dynamic)` |
| ESLint (changed scope) | ✅ clean (pre-existing repo baseline errors in untouched files documented) |

No public surface was modified. `/up403` is untouched. No datasets were added. No modules were added. No analytics were added. Mission Control UI was not implemented.

---

## 7. GO / NO-GO

**Status: GO** — the intelligence boundary is now server-enforced.

Success criteria from the sprint brief:

| Criterion | Status |
|---|---|
| ✓ Unauthorized users cannot receive Intelligence payloads | **Met** — edge 403 + origin gate before compute |
| ✓ Authorization occurs before any Intelligence computation | **Met** — `guardIntelModule` precedes every data call |
| ✓ Client guards are purely presentational | **Met** — `IntelModuleGuard` is UX-only; security is server-side |
| ✓ Server Components enforce authorization | **Met** — all 13 routes gate first |
| ✓ Services respect Intelligence boundaries | **Met** — services are pure; the only consumers are gated pages; structural tests block future un-gated imports |
| ✓ Mission Control can safely consume existing engines | **Met** — see Mission Control Readiness Report |

**Conditions attached to GO (must hold):**
1. The security suite (`test:intel-auth`) stays in CI; its structural sections are the standing guard against boundary regressions.
2. No intelligence route is ever converted to a static page (dynamic rendering is required for per-request authorization).
3. Demo mode remains client-side only; any future demo support must be reviewed as an authorization change, not a UX change.

**Known, accepted trade-offs:**
- An authenticated user with an insufficient role who directly requests a protected path receives a bare `403 Forbidden` from the edge (no denial page, no payload). This is the correct security primitive; the denial UX (`IntelDenied`) is the origin-layer safety net.
- The intelligence workspace now requires real Supabase auth even in local dev; demo mode cannot exercise it. Documented in §4.4.

---

*Read-only intent respected for public surfaces: this sprint modified only authentication/session code, the intel workspace, middleware, and tests. No production UI, no datasets, no public routes were changed.*
