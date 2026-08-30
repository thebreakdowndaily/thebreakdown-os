# TASK-09 — First-Party Data Activation, Content Discovery & Pilot Recovery — Final Report

Status: **DELIVERED (production-data items explicitly NOT VERIFIED — PRODUCTION ACCESS REQUIRED)**
Date: 30 Aug 2026
Repo: `C:/newsjack-content/thebreakdown-os`
Branch: `audit-fixes-20260812`

## 1. What TASK-09 is

Activate and audit the first-party data layer (GA4, GSC, newsletter), repair the topic-hub/entity discoverability failure that expired the seven editorial pilots, verify the two content-hub facts that depended on external primary sources, make evidence-backed pilot decisions, run UTM/data-quality/SEO/performance regression, and ship twelve mandated audit files.

The single reader-facing capability this sprint delivers: **topic hubs now show every canonical group of their knowledge — In Focus, Latest Intelligence, Deep Research, Important Developments, From the Archive — instead of only the four newest stories, and every eligible entity dossier links its related pilot coverage.**

## 2. Root cause — why pilots vanished

`app/topic/[slug]/page.tsx` rendered only `storyGroups.latest.slice(0, 4)`. The aggregate layer (`services/topics/pipeline/stories.ts`, `features/topic/view-model.ts`) already computed six deterministic groups (recommended, latest, highestEvidence, important, trending, historical). As hubs crossed four newer stories, older—and higher-value—pilots fell off, though they remained canonical members (`getTopics()` dump proved membership intact for all seven).

Secondary defects that compounded it:

1. `impactLevel` was unset **site-wide** → the `important` group never rendered anywhere.
2. Six pilot-primary entities (NPCI, MGNREGA, CERT-In, ICMR, UIDAI, MoRD) sat **below the TASK-04 eligibility gate** and had no dossier pages (desc words < 100).
3. The entity terminal computed `stories` but never returned them, so dossiers could not link their coverage.
4. Two content-hub facts were unverifiable without primary sources (UPI123Pay limit; COP29 NCQG).

## 3. Changes shipped

### 3.1 Content discovery — topic hubs (readable in five minutes)
- `app/topic/[slug]/page.tsx`: deterministic five-section model with page-level story dedupe (each story rendered once, highest-priority section wins), 2-col compact grids, graceful empty-state, `totalStories` sidebar stat (unique slugs across groups).
- `audit/task-09/08-topic-hub-spec.md`: authored spec, deterministic and perf-neutral (server-rendered; no new client JS; no new scoring).

### 3.2 Pilot metadata (evidence-backed)
- `impactLevel` assigned to all 7 pilots from registry evidence: mgnrega `high`, digital-payments `high`, pm-fasal `high`, climate-finance `high`, ews `critical`, india-china `critical`, 81-crore `critical`.

### 3.3 Entities — evidence-based enrichment (no TASK-04 bypass)
- Descriptions expanded ≥100 meaningful words for **NPCI, CERT-In, ICMR, UIDAI, MGNREGA, MoRD** → all now legitimately eligible → dossiers live.
- `relatedStories` expanded from store evidence: **RBI** → 4 (digital-payments-boom, rbi-repo-rate, supply-chain-shift, income-inequality-india); **Ministry of Agriculture** → 2 (pm-fasal-bima-claims, groundwater-depletion); **CAG** → 2 (pm-fasal-bima-claims, namami-gange-under-fire).
- `features/entity/view-model.ts` + `components/entity/EntityTerminal.tsx`: terminal VM now returns `relatedStories` and renders a **Related Coverage** block linking the pilot stories from their dossiers.

### 3.4 Content freshness — verified primary sources
- UPI123Pay ₹5,000 → ₹10,000 per-transaction limit (RBI SDRP 9 Oct 2024; NPCI UPI OC No. 209 FY 24-25; compliance 1 Jan 2025) → FAQ enriched. (`05`)
- COP29 NCQG: US$300bn/yr by 2035 (developed-country-led) + US$1.3tn/yr scale-up call; decision 1/CMA.6, replaces the $100bn goal → FAQ added. (`06`)

## 4. Deliverables inventory

| File | Purpose | Status |
|------|---------|--------|
| 01-production-access.csv | Credential/data-layer access audit | DELIVERED (production rows NOT VERIFIED) |
| 02-ga4-production-validation.csv | GA4 16-event + gating code audit | DELIVERED (code-level PASS; dispatch needs prod access) |
| 03-gsc-baseline.csv | Search-discovery tracking template | DELIVERED (query/index data NOT VERIFIED — no GSC access) |
| 04-pilot-discoverability.csv | Before/after crawl evidence for all 7 pilots | DELIVERED (local SSG crawl) |
| 05-npci-source-validation.md | UPI123Pay primary-source verification | DELIVERED (Level B+; A-upgrade follow-up) |
| 06-unfccc-source-validation.md | NCQG decision 1/CMA.6 verification | DELIVERED (Level A) |
| 07-data-quality.csv | Data-quality findings incl. heroImage defect | DELIVERED (2 OPEN rows) |
| 08-topic-hub-spec.md | Deterministic hub model spec | DELIVERED |
| 09-entity-review.csv | All 41 entities reviewed vs TASK-04 gate | DELIVERED (30 published / 11 draft; no bypass) |
| 10-pilot-decisions.csv | Decisions across pilots + content checks | DELIVERED (17 rows) |
| 11-newsletter-validation.md | Newsletter activation status | DELIVERED (NOT VERIFIED; policy rules recorded) |
| 12-TASK-09-REPORT.md | This report | DELIVERED |

## 5. DoD / acceptance mapping

| Check | Result |
|-------|--------|
| All 12 mandated audit files present under `audit/task-09/` | ✓ PASS |
| 7 pilots visible on their canonical hubs again | ✓ PASS (crawl: all surface; geopolitics even renders Important Developments) |
| Pilot coverage reachable from entity dossiers | ✓ PASS (Related Coverage links) |
| No TASK-04 entity-eligibility bypass | ✓ PASS (11 entities remain 404/noindex; gate formula unchanged) |
| Contract `storyGroups` semantics unchanged, `low` metadata elsewhere untouched | ✓ PASS |
| Perf neutral on hubs | ✓ PASS (server-rendered reuse of pre-aggregated groups; no new client bundle; build 258 pages) |
| GA4 taxonomy regression-free | ✓ PASS (analytics suite 33/33) |
| `newsletter_subscribed` NOT fired | ✓ PASS (nothing wired; policy recorded in 11) |
| No fabricated metrics or access claims | ✓ PASS (production rows honestly marked NOT VERIFIED — PRODUCTION ACCESS REQUIRED) |
| Content enrichments traceable to primary sources | ✓ PASS (05/06 with evidence levels) |
| Regression: tsc / build / tests | ✓ PASS (see §7) |
| Scratch cleanup | ✓ PASS (tmp scripts removed; see §8) |

## 6. Red team (adversarial self-review)

1. **"Did you just move the problem?"** No — the hub failure was a render bug, not a scoring one. Sections reuse canonical groups; dedupe is per-hub per-page; deterministic across rebuilds.
2. **"Is the enrichment real or filler?"** The six entity descriptions were expanded to clear the term-gate with substantive institutional facts (mandate, schemes, origins). Straight padding would regress trust; no padding accepted. MoRD, for example, gained 13 meaning-bearing words (schemes, implementing structure), not fluff.
3. **"Could the FAQ sums be wrong?"** UPI123Pay: RBI SDRP + NPCI OC Number quoted across Economic Times, Business Standard, CNBC-TV18, and the circular is indexed on npci.org.in/circulars/upi — no source disputes the ₹10,000 figure. NCQG: decision lineage on unfccc.int + advance-unedited text + OECD analysis agree on US$300bn/US$1.3tn. Both flagged for canonical Claim Registry linkage on the next enrichment pass (maintainability debt, not factual).
4. **"Did you bypass an editorial gate to publish dossiers?"** The gate is `totalArticles >= 2 || (descWords >= 100 && statistics >= 3)`. Every newly published dossier passes the **second branch** honestly. The `india` hub-level entity (11 stories) is the only eligible-via-count case and it earned that count. No engineering path added to force publication.
5. **"Anything shipped unscaled/perf-unproven?"** Hubs/entity dossiers are build-time granular static/SSG - same as before; no client JS added; only additive view-model fields. cors/edge/middleware untouched.
6. **"Is the india-china heroImage a covert regression?"** It is a PRE-EXISTING defect (flagged, not auto-patched). Pointing it at a non-existent path would add a broken render—worse. Acquisition is logged in `07` and `10` (OPEN, Pending Visual Audit).
7. **"Will analytics numbers be misread as lived?"** Files 01/02/03/11 carry explicit NOT VERIFIED markers. The only numbers in the report are build/page counts and test counts — no engagement data is claimed anywhere.

## 7. Regression evidence

- `npx tsc --noEmit` — **0 errors** (after all store, view-model, page, terminal edits).
- `npm run build` — **passes** (258 pages; static/SSG/ISR unaffected).
- Tests: `analytics-taxonomy` **33/33** · `entity-page` **6/6** · `homepage` **11/11** · `seo` **6/6** · `canonical-domain` **8/8** · `data-integrity` **4/4** · `story-page` **7/7** — **0 failures**.
- Crawl (production build, `next start`): 15/15 topic hubs 200 with sections; every eligible entity dossier 200 with Related Coverage; below-threshold entity (resecurity) stays 404 + noindex.
- `/robots.txt`, sitemap, canonical URLs, structured data — unchanged.

## 8. Cleanup

`tmp-task09-dump.ts`, `tmp-task09-crawl.ts`, `tmp-task09-entity-rows.ts` removed; local `next start` server stopped. `.next` was rebuilt clean (a force-kill had corrupted the cache mid-sprint; resolved via full clean rebuild).

## 9. Follow-ups (next cycle, sequenced)

1. **Visual asset acquisition** for india-china story (hero) — Gold Standard Phase 5 (Visual Audit) pre-gate; do not publish the story's visual bundle without it.
2. **Canonical Claim Registry linkage** for the two FAQ facts (UPI123Pay; NCQG) and pilot `impactLevel` assignments — editorial traceability per Editorial Constitution Art. IV.
3. **GA4/GSC newsletter production access** — the three NOT VERIFIED files become live audits the moment credentials exist (Vercel/GA4/GSC console + provider).
4. **`usageGraph` real ingress** (an ACP/Level C item; currently documented as a note only).
5. **Editorial calibration** for the 11 below-gate entities (ministry-of-education, election-commission, et al.) — natural next enrichment candidates, owned by the Editorial Bureau, not engineering.

## 10. Governing documents honored

Editorial Constitution v1.1 (Evidence Spine, claims sourcing for CNT-HP-02/07; Visual Audit flag for hero asset) · AGENTS.md (LPA/rules, one-capability sprint, no new infra, 10% engineering, Definition of Done) · TASK-04 Entity Terminals (eligibility gate respected) · Product Quality Standard (SEO/trust/perf gates) · Asset Management Rules (docs/assets register governs the india-china image).