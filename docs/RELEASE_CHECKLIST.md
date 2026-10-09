# THE BREAKDOWN OS — RELEASE CHECKLIST & DEPLOYMENT PROTOCOL

**Version:** 1.0  
**Status:** Mandatory Institutional Release Standard  
**Governing Documents:** `AGENTS.md`, `docs/product-quality.md`, `docs/ci-pipeline.md`

---

## The Non-Negotiable 6-Gate Release Protocol

No code may be promoted to production (`https://thebreakdown.in`) unless all six verification gates pass with zero exceptions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE 6-GATE RELEASE PROTOCOL                          │
└────────────────────────────────────────────────────────────────────────┘

  [GATE 1]  TypeScript Type Safety        ───► tsc --noEmit (0 errors)
       │
  [GATE 2]  Code Quality & ESLint         ───► npm run lint (0 errors)
       │
  [GATE 3]  Automated Regression Suite    ───► vitest run (100% pass, 0 skips)
       │
  [GATE 4]  Production Compilation        ───► npm run build (Clean artifact)
       │
  [GATE 5]  Deployment Parity Probing     ───► test-deployment-parity.js (24/24 routes)
       │
  [GATE 6]  Public Trust & Sitemap Audit  ───► sitemap.xml & Trust route verification
```

---

### Gate 1: TypeScript Type Safety
- **Command:** `npm run typecheck` (or `npx tsc --noEmit`)
- **Criteria:**
  - `0` errors.
  - Strict mode enabled (`tsconfig.json`).
  - No `any` escape hatches or unapproved `@ts-ignore` comments.
- **Sign-off:** Automated CI check.

### Gate 2: Code Quality & Style
- **Command:** `npm run lint`
- **Criteria:**
  - `0` ESLint errors.
  - No unused imports or dead variables in production code paths.
  - Component line limits respected:
    - Target: $< 250$ lines.
    - Warning: $300$ lines.
    - Refactor mandatory: $> 500$ lines.
- **Sign-off:** Automated CI check.

### Gate 3: Automated Regression Suite
- **Command:** `npm test` (or `npx vitest run`)
- **Criteria:**
  - All test files executed ($>110$ files).
  - $100\%$ tests passing ($>1,000$ assertions).
  - $0$ failed tests, $0$ orphaned suites.
  - Core subsystem coverage verified:
    - Search indexing & polygon/runtime entities.
    - Radar polling, collectors, SSRF guards.
    - Newsroom triage engine & anti-fatigue filtering.
    - Reconciliation engine & sitemap generation.
    - Comprehension pathways & Next Best Understanding.
- **Sign-off:** Automated CI check.

### Gate 4: Production Compilation
- **Command:** `npm run build`
- **Criteria:**
  - Next.js production build exits with code 0.
  - Static generation succeeds for all static routes.
  - Bundle size budgets maintained; no outsized chunks.
  - Zero dynamic runtime evaluation errors during static compilation.
- **Sign-off:** Automated CI check.

### Gate 5: Deployment Parity Probing
- **Command:** `node scripts/test-deployment-parity.js`
- **Criteria:**
  - 24/24 critical route probes return HTTP 200.
  - Canonical routes match production origin:
    - Home (`/`), Series (`/series`), Topics (`/topics`), Entities (`/entities`).
    - Trackers: MGNREGA (`/trackers/mgnrega`), PMFBY (`/trackers/pmfby`), UPI (`/trackers/upi`), Semi (`/trackers/semiconductor`).
    - Transparency: Trust (`/trust`), Corrections (`/transparency/corrections`), Constitution (`/editorial-constitution`).
  - Response payload size within expected bounds ($> 2,000$ bytes).
- **Sign-off:** Release Engineer.

### Gate 6: Public Trust & Sitemap Audit
- **Command:** `curl -sI https://thebreakdown.in/sitemap.xml` & XML inspection
- **Criteria:**
  - `sitemap.xml` returns HTTP 200 and Content-Type `application/xml` or `text/xml`.
  - All public stories, entities, topics, fixes, and chapters present in sitemap.
  - Stable trust pages (`/trust`, `/editorial-constitution`, `/methodology`) use historical review timestamps, NOT dynamic `new Date()`.
  - OpenGraph tags and JSON-LD schema validated across top 5 representative stories.
- **Sign-off:** Lead Architect / Ombudsman.

---

## Deployment Procedure

1. **Staging / Preview Verification**:
   ```bash
   npx vercel
   ```
   Inspect preview URL and confirm visual and functional parity.

2. **Production Promotion**:
   ```bash
   npx vercel deploy --prod --yes
   ```

3. **Post-Deployment Verification**:
   ```bash
   node scripts/test-deployment-parity.js
   ```

4. **Rollback Trigger**:
   If Gate 5 or Gate 6 exhibits degradation or HTTP 5xx errors:
   - Immediately alias previous known-good deployment via Vercel CLI / Dashboard.
   - File P0 incident report per `docs/ON_CALL_RUNBOOK.md`.
