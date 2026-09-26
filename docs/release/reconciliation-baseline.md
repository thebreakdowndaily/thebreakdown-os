# The Breakdown OS — Repository Baseline & Toolchain Specification

**Status:** Forensic Verification Complete  
**Date:** 2026-09-26  
**Governing Ticket:** CERTIFICATION-RECONCILIATION-01  
**Repository Canonical URI:** `c:/newsjack-content/thebreakdown-os`  
**Current Branch:** `fix/p1-publication-safety`  
**Total Tracked Files:** 4,801  

---

## 1. Toolchain & Environment Matrix

| Component | Repository Specification | Verified Version | Configuration File | Status |
|-----------|--------------------------|------------------|-------------------|--------|
| **Package Manager** | `npm` | npm (with `package-lock.json`) | `package-lock.json` | Confirmed (No yarn or pnpm locks) |
| **Node.js** | `>=22.0.0` (engines) | Node v22.x compatible | `package.json` engines | Confirmed |
| **Next.js** | `^15.5.18` | Next.js 15.5.18 | `next.config.js` | Confirmed |
| **TypeScript** | `^5.5.0` | TypeScript 5.5.0 | `tsconfig.json`, `tsconfig.frontend.json` | Confirmed (`tsc --noEmit` exits 0) |
| **ESLint** | `9.39.4` | ESLint 9 (Flat Config) | `eslint.config.mjs` | Confirmed (`npm run check:lint` exits 0) |
| **Test Runner (Vitest)** | `4.1.10` | Vitest 4.1.10 | `vitest.config.js` | Confirmed (63 test suites configured) |
| **Test Runner (TSX)** | Self-executing harnesses | `npx tsx` | `package.json` test scripts | Confirmed |
| **Test Runner (Jest)** | `^29.7.0` | Jest 29.7.0 / ts-jest 29.1.1 | `jest.research.config.js`, `jest.frontend.config.js` | Confirmed |
| **Test Runner (Playwright)** | `^1.62.1` | Playwright 1.62.1 | `playwright.config.ts` | Confirmed |

---

## 2. Git State & Recent Commit Lineage

### Branch
`fix/p1-publication-safety`

### Recent Commits (Top 10)
```text
519ea4f Merge pull request #6 from thebreakdowndaily/fix/post-audit-polish
486b0ce fix(polish): eliminate viewport overflows and guarantee client claim hydration
e58fdda Merge pull request #5 from thebreakdowndaily/security/production-hardening
bfe05f0 fix(story): remove accidental untracked Phase D dependencies from StoryShell and resolver
cc70e81 fix(story): stabilize production canonical story pipeline, SVG charts, and analytics
e28a62b fix(audit): allow audit CLI report generation to complete without strict flag
beede9c fix(ci): resolve audit framework compilation, report validation, and workflow job naming
b0eaaa5 feat(frontend): implement Earth-inspired editorial redesign and three-environment design system
c46ec36 feat(ci): implement Phase 4 release hardening, migration safety gate, deterministic network isolation, and security regression gates
6fca346 chore(security): complete final infrastructure and remote provider verification for phase 3
```

### Working Tree Status
- **Modified (tracked):** 31 files (chiefly page wrappers, layout, metadata, next.config.js, package.json).
- **Untracked (new test and audit files):**
  - `lib/knowledge/source-validator.ts`
  - `scripts/check-source-integrity.ts`
  - `tests/dead-routes.test.ts` (PASS: 26/26 tests)
  - `tests/publication-safety-p1.test.ts` (PASS: 13/13 tests)
  - `tests/source-integrity-validator.test.ts` (PASS: 10/10 tests)

---

## 3. ESLint Configuration & Invariant Check

- **Configuration:** `eslint.config.mjs` is present in the repository root using modern ESLint 9 Flat Config syntax (`import ts from 'typescript-eslint'`, `@next/eslint-plugin-next`, `eslint-plugin-react-hooks`, `eslint-plugin-react`).
- **Canonical Lint Script:** `npm run check:lint` (`eslint app components providers styles hooks types features`).
- **Execution Result:**
  ```text
  Exit Code: 0
  Errors: 0
  Warnings: 408 (legacy modules: unused variables with '_' prefix recommendation, any types in seed/view-models, react-hooks purity warnings)
  ```
- **Finding:** No missing configuration file. Previous references to `.eslintrc.cjs` were an artifact of expecting legacy ESLint 8 format. The project uses ESLint 9 flat configuration.

---

## 4. TypeScript Invariant Check

- **Canonical Command:** `npm run typecheck` (`tsc --noEmit`)
- **Execution Result:**
  ```text
  Exit Code: 0
  Errors: 0
  Warnings: 0
  Duration: 42s
  ```

---

## 5. Test Execution Architecture

The repository enforces three distinct testing modalities (explicitly documented in `vitest.config.js`):
1. **Vitest Unit/Integration Tests (`npm run test:vitest`):**
   - Configured via `vitest.config.js`.
   - Enumerates 63 test suites across domains (`newsroom`, `audit`, `security`, `chapter`, `story`, `governance`, `trackers`, `fix`).
   - Current execution: 62 suites passed, 1 suite failed on a single assertion (`tests/diagnostic-routes.test.ts:58`). Total: 718 tests passed, 1 failed.
2. **TSX Self-Executing Harnesses (`npx tsx`):**
   - Enumerated in `package.json` (`npm run test`, `npm run test:security`, `npm run test:migration`).
   - `npm run test`: 26 sub-suites sequentially executed (26/26 passed, 0 failed).
   - `npm run test:security`: 5 test suites executed (1,326+ assertions passed, 0 failed).
   - `npm run test:migration`: 16 migrations verified against embedded PostgreSQL cluster (16/16 migrations applied, 33/33 database tests passed).
3. **Jest Research Intelligence Suites (`npm run test:research`):**
   - Configured via `jest.research.config.js`.
   - Executes `tests/research/*.test.ts`.

---

## 6. Supabase Migration Baseline

- **Directory:** `supabase/migrations/`
- **Total Migrations:** Exactly 16 files (`001_create_tables.sql` to `016_api_keys_and_rate_limiting.sql`).
- **Head Migration:** `016_api_keys_and_rate_limiting.sql`.
- **Note on Historical Discrepancy:** The prompt noted "Verify migration sequence (001-021)". The repository contains exactly 16 migrations. All 16 are verified statically and dynamically in embedded PostgreSQL.
