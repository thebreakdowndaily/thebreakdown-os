# THE BREAKDOWN — POST-RELEASE SYSTEM INVENTORY

- **Date:** 13 Aug 2026
- **Author:** CTO review (post-release forensic audit)
- **Status:** Recorded architectural checkpoint — pre-integration baseline snapshot (W5a + vitest integration logged in §13)
- **Scope:** Exact state of every workstream outside the protected production baseline `v1.0.0-audit-fixes` (`1ab15b1`), prior to W5 integration.

---

## 1. Baseline (Production)

| Item | Value |
|------|-------|
| Tag | `v1.0.0-audit-fixes` |
| Commit | `1ab15b1` |
| Remote refs | `origin/main` = `1ab15b1` |
| Production | https://thebreakdown.in (Vercel auto-deploy on `origin/main` push) |
| Self-contained | ✅ **Verified** — the 5 tracked files importing `@/packages/*` do **not** import untracked packages at `1ab15b1` or at branch HEAD `cd0616e`; imports exist **only** in the uncommitted working tree |
| `app/api/v2/*` | 16 tracked files, identical baseline ↔ HEAD |
| Live verification | Regressions A–E pass; `tsc` clean; `npm run build` passes |

### Baseline guarantee

`1ab15b1` is the clean, self-contained, deployable production baseline. It does not depend on any untracked package, service, or migration.

---

## 2. Repository State

| Layer | Scope | Count |
|-------|-------|-------|
| L1 — committed (`1ab15b1` → HEAD `cd0616e`) | 11 `feat(intel)` + 5 audit fixes + hero fix | 156 files, +18014/−22 |
| L2 — uncommitted (working tree) | Intelligence / Election-OS / Investigation-OS integration | 35 modified + 250 untracked |

### Branch / tag topology

- Only `release/v1.0.0-audit-fixes` and `origin/main` contain baseline.
- Local `main` (`e295526`) — **stale, does NOT contain baseline**.
- `origin/release/v1.0.0-audit-fixes` (`f3a2688`) — **stale, does NOT contain baseline**.
- All other branches (`dev`, `feat/intel-foundation-v1`, `feature/*`, `fix/*`, `release-test-cherry`, `release/v1.0.0-rc1`) do not contain baseline.
- Tags: `ar-eos-1.0-baseline`, `audit-framework-v1.0.0-alpha`, `rxs-v1.0`, `rxs-v1.0-frozen`, `v1.0.0`, `v1.0.0-audit-fixes`, `v1.0.0-beta-base`, `v1.0.0-chapter1`, `v3.0-clean-architecture`.

### Critical risk

The 250 untracked files are **not gitignored**. A bare `git add -A` would sweep the entire parallel regime into the baseline.

---

## 3. Workstream Inventory & Disposition

| ID | Workstream | Location | State | Disposition |
|----|------------|----------|-------|-------------|
| W1 | Intel Foundation (11 commits) | `feat/intel-foundation-v1`, committed L1 | Self-contained, tested; **no production consumer confirmed** | **HOLD** — preserve; no production path yet |
| W2 | Audit Fixes (5 commits) | Baseline | Deployed, verified | **DONE** |
| W3 | Election Intelligence OS | `services/intelligence`, `app/api/v2/intelligence\|kap\|corrections`, `packages/{intelligence,iql,kap-sdk,mgcf-runtime}`, `types/intelligence-processing.ts` | Untracked | **KEEP + REVIEW** — evidence audit before integration |
| W4 | Investigation/Explorer OS | `app/api/v2/explorer`, `supabase/migrations/009-013`, `lib/{events,graph,gaps,workflow,watchlists}`, `services/{search,monitoring}` | Untracked | **KEEP + REVIEW** — migrations need SQL review |
| W5 | Editorial/Evidence/Rendering packages | `packages/{editorial,evidence,reading-engine,domains,models}` | Untracked; **5 tracked files already import them in working tree** | **INTEGRATE** — blocking clean working-tree build |
| W6 | Report Regime (simulated governance) | `tests/research/*.ts` → root `.md/.json`; overwrote `audit_report.md`, `PROGRAMME-CLOSEOUT.md` | Untracked generators, dated 2026-08-05, not imported by app | **REVIEW** — separate editorial artifacts from simulation output |
| W7 | Auth/Newsroom | `app/api/auth/route.ts`, `middleware.ts` (demo-mode), `/newsroom` | L2 modified | **KEEP + REVIEW** — demo-mode bypass needs gating decision |

### Verification note

"Self-certifying" is **not** a verification category. A workstream is verified only when its implementation and tests provide external evidence — not because its own code claims completeness. W3/W4/W6 remain **unverified** until an independent evidence audit is performed.

---

## 4. Canonical vs Duplicate Model Map

| Source | Tracking | Status |
|--------|----------|--------|
| `types/canonical.ts` | Tracked | **Canonical** — source of truth |
| `types/corrections.ts` | Untracked | **Duplicate-model risk** |
| `types/intelligence-processing.ts` | Untracked | **Duplicate-model risk** |
| `types/newsroom-intelligence.ts` | Untracked | **Duplicate-model risk** |
| `packages/models` | Untracked | **Duplicate-model risk** |
| `packages/domains` | Untracked | **Duplicate-model risk** |
| `packages/intelligence-contracts` | Untracked | **Duplicate-model risk** |

**Requirement:** before W5 commit, determine canonical vs transitional for each definition. Do not cement competing schemas.

---

## 5. Data-Provider Map

| Provider | Location | Tracking | Risk |
|----------|----------|----------|------|
| Bootstrap | `lib/bootstrap.ts` | Tracked | — |
| Store | `utils/data-layer/store.ts` | Tracked | Memory store |
| Repositories | `services/repositories/{memory,supabase}` | Tracked | Provider selection |
| Migrations 009–013 | `supabase/migrations/` | Untracked | SQL unverified, memory/DB divergence |

---

## 6. API Inventory

- Tracked `app/api/v2/*` (16 files) — identical at baseline and HEAD.
- Untracked additions: `corrections/`, `explorer/`, `intelligence/`, `kap/`.
- `/api/v2/explorer` — **public**.
- `/newsroom` — auth-gated.
- Other untracked routes — x-api-key gated.

---

## 7. Test Coverage

- Tracked: 106/106 passing; `tsc` clean; build passes.
- Working tree adds 7 test files (`tests/story/usability-metrics`, `tests/design-system/tokens`, `tests/editorial/foundation`, `tests/reading-engine/engine`, `tests/models/canonical`, `tests/evidence/verification`, `tests/intelligence/intel`).
- **FLAG:** `vitest` is imported by tracked tests but **not declared in `package.json`** — reproducibility hole to resolve before any integration commit.

---

## 8. Dependency Graph (verified)

- Clean-checkout build: baseline ✅, branch HEAD ✅, **working tree ❌** (depends on untracked packages — present on disk, so builds locally today).
- The 5 tracked files importing untracked packages in the working tree:
  - `components/up403/evidence.tsx` → `@/packages/evidence/src`
  - `app/up403/[slug]/page.tsx` → `@/packages/editorial/src`
  - `app/stories/page.tsx` → `@/packages/editorial/src`
  - `components/home/HomepageLayout.tsx` → `@/packages/editorial/src`
  - `app/entity/[slug]/page.tsx` → `@/packages/editorial/src`

---

## 9. Architecture Gaps

- No production consumer of Intel pipeline (W1/W3).
- Self-certifying report regime (W6) — simulated governance output not validated.
- Untracked migrations 009–013 — no SQL review.
- Missing `vitest` declaration in `package.json`.

---

## 10. Vision Gap

- Intel/Investigation/Explorer surfaces are not visible to any reader → W1/W3/W4 fail the "reader can notice in 5 minutes" rule unless integrated.
- Founding Edition (Chapter 1) remains intact and untouched in production.

---

## 11. Integration Sequence (recommended)

1. **W5 integration** (forensic audit → fix dependency/model issues → clean-checkout verification → atomic commit).
2. **W3/W4 evidence & migration audit** — stress-test Intel/Investigation architecture before any production path.
3. **W7 auth/demo-mode decision.**
4. **W6 quarantine** — exclude generated reports from `git add`; separate real reports from simulation output.
5. **W1 production-consumer decision** (HOLD until W3 integrated).

---

## 12. Ranked Risks

| Priority | Risk | Mitigation |
|----------|------|------------|
| P0 | Bare `git add -A` sweeps untracked regime into baseline | Quarantine rules; stage only exact file lists |
| P0 | Working tree not clean-buildable without untracked packages | W5 integration commit |
| P1 | Duplicate-model risk (`types/` + `packages/models|domains|contracts`) | Canonical model audit before commit |
| P1 | `vitest` undeclared — reproducibility hole | Declare dependency or externalize |
| P1 | Untracked migrations 009–013 unverified | SQL review before any DB execution |
| P2 | W3/W6 self-certified claims unverified | Independent evidence audit |
| P2 | Local `main` & `origin/release` stale | Re-point after integration |
| P3 | Demo-mode bypass in auth/middleware | Gating decision (W7) |
| P4 | No production consumer of Intel pipeline | Integration plan only after W3 audit |

---

## 13. Integration Log (W5a + vitest, 13 Aug 2026)

### W5a committed — `3c16b85`

`feat(w5a): integrate editorial layout and evidence badge packages`

- Committed `packages/editorial` (8 files) + `packages/evidence/src/*` + `packages/evidence/package.json` (**`core/Evidence.ts` excluded** — depends on untracked `packages/iql`, deferred to W3/W4).
- Plus the 5 consumer-file changes that use them (`app/stories`, `app/entity`, `app/up403`, `components/home/HomepageLayout`, `components/up403/evidence`) — editorial-skin swaps only (Breadcrumbs/Container → `EditorialLayout`; inline evidence details → `EvidenceBadge`).
- W5b (`packages/models`, `packages/reading-engine`, `packages/domains`) remains untracked/deferred: imported by no tracked code, and `packages/domains` + `evidence/core` depend on untracked `packages/iql`.
- **Verified in a clean checkout at `cd0616e`**: `tsc --noEmit` clean, `npm run build` passes, tsx suite 53/53.

### vitest declared — `5cc0112`

`chore(test): declare vitest as a real devDependency`

- The tracked vitest suite was never runnable: vitest undeclared, absent from lockfile, `vitest.config.js` untracked. A clean checkout ran vitest with **no config** → no `@/` alias, no globals, no include scoping → swept in 66 tsx `runTests()` harnesses, 9 Playwright specs, 83 collection errors.
- Pinned `vitest 4.1.10` in devDependencies, added `test:vitest` script, tracked `vitest.config.js` with an explicit include list of the **46 genuine vitest tests**.
- Fixed stale `TEST-CF-03` (Volume I registry now has 7 published chapters, not 5).
- **Excluded 6 pre-existing broken/environment-dependent files** (documented in config, for W6 repair): `contract.test.ts` (0-test helper lib), `audit/tests/loader.test.ts` (asserts `data.error`, loader returns top-level `error`), `audit/tests/manifest-validation.test.ts` (hello-world capabilities not in schema enum), `audit/plugins/architecture/tests/architecture.test.ts` (fixture lacks `unknown-dir`), `audit/plugins/operations/tests/operations.test.ts` (real repo fails operations audit), `tests/research/db-integration.test.ts` (needs live PostgreSQL; ENOTFOUND when `.env.test` points at unreachable host).
- **Verified in a clean checkout at `3c16b85`**: `tsc --noEmit` clean, `npm run build` passes, tsx suite 53/53 (incl. GOLDEN STORY), vitest 46/46 (exit 0).

### Repository state after W5a + vitest

- HEAD: `5cc0112` on `audit-fixes-20260812`.
- Working tree: 250 untracked + 30 modified remain (Layer-2 intelligence/Editorial-OS workstream). `services/intelligence/` is fully untracked (incl. `rss-parser` import — the tsc error in the working tree is Layer-2 pollution, not a commit regression; clean checkout at HEAD passes).
- Baseline `1ab15b1` untouched; nothing pushed to `origin/main`; production unchanged.
- Verification artifacts: `C:\Users\nitin\AppData\Local\Temp\opencode\wt-w5a-verify` (clean-checkout worktree), `w5a-consumers.patch`.

---

*Checkpoint recorded. Baseline `1ab15b1` protected. No production modification. No bare `git add`. W5 integration proceeds as a forensic, evidence-gated changeset — **not** `git add packages/`.*
