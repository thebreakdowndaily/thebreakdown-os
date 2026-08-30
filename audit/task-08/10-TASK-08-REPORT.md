# TASK-08 — REPORT: First Evidence-Based Optimization Cycle

**Ticket:** TASK-08 (Measure → Diagnose → Change → Measure Again)
**Cycle window:** 29 Aug 2026 (expedite)
**Related:** TASK-06 (pilot cohort), TASK-07 (measurement foundation)
**Bottom line up front:** This cycle shipped **four controlled changes**: one measurement-integrity fix (EXP-01), two title optimizations (EXP-02, EXP-03), and an internal-link capability (EXP-05). All are code-verified and rendered-verified. **Nothing that requires production analytics is claimed as measured**: GA4/GSC/newsletter baselines remain NOT VERIFIED. Two pilot pages (CNT-HP-02, CNT-HP-07) were confirmed to not answer their primary queries — the highest-leverage editorial correction found, currently blocked on verified sources.

---

## 1. Objective & scope
Run the first closed-loop optimization cycle for the seven TASK-06 pilot stories using the TASK-07 measurement foundation. Every decision had to satisfy: "Is the evidence **first-party** or explicitly **NOT VERIFIED**?" No fabricated metrics; no third-party estimates presented as facts; every change reversible and traceable. Delivered the ten mandated files under `audit/task-08/`.

## 2. Phase A — Production access status
Attempted truthfully this cycle (see `01-production-access.csv`).
- **Verifiable in-repo:** GA measurement ID present and `G-` prefixed; sitemap.xml reachable and contains all 7 pilots; robots.txt allows `/story`; canonical tags render; preview host gating code-verified.
- **Not verifiable without credentials:** GA4 property/data-stream admin, GSC domain property, GSC watch queries, newsletter provider, live Sentry DSN, live host headers on thebreakdown.in → all `NOT VERIFIED — PRODUCTION ACCESS REQUIRED`. This is the permanent blocker for Phases C, E (measurement half), F, J (conversion), and K.

## 3. Phase B — Production event validation
| Status | Count |
|---|---|
| Events wired in code (16) | 16 (incl. `newsletter_subscribed` intentionally never fired) |
| Events verified live in production | 0 — live GA4 access absent |
| Defects found & fixed | **1: page_view double-fire** |

**Defect (EXP-01):** initial page load emitted **two** `page_view` (GA4 auto `gtag('config')` from the ga-init script **and** `GATracker`'s mount effect). This inflated every session-start comparison. Fixed by making `GATracker` skip its first run so `ga-init` owns the initial view and `GATracker` owns SPA navigations (`components/analytics/GATracker.tsx`). Verified via `npx tsc --noEmit` (clean), `npm run build` (passes), `npx tsx tests/analytics-taxonomy.test.ts` (33/33). Full matrix: `02-production-event-validation.csv`.

## 4. Phase C — Search console baseline
**NOT VERIFIED — PRODUCTION ACCESS REQUIRED.** No GSC credentials exist in the environment. Registered the 7 pilot target queries as the Day-0 baseline contract (see `08-search-performance-analysis.md` §1). Until GSC is granted, **no position/impression/CTR statement in this report is a measurement.**

## 5. Phase D — Pilot content analysis
Rendered the production build locally and crawled 7 pilots + 10 topic hubs + entity pages. Findings (detailed in `07-pilot-analysis.md`):
- **2 intent gaps:** CNT-HP-02 has 0 × "limit" content for query `upi transaction limit rural`; CNT-HP-07 has 0 × COP29/NCQG for `climate finance commitments cop29 india`. Both were "Approved UPDATE" in TASK-06 but never shipped.
- **Titles realigned:** CNT-HP-01 (79→63 chars), CNT-HP-03 (93→57 chars), both preserving intents.
- **Hub surfacing:** economy/geopolitics/environment/policy hubs under-surface pilots because hubs render `latest.slice(0,4)`.
- **Entity coverage:** only 11 entity pages exist; no pilot primary entity has a terminal page.

## 6. Query-intent analysis
The content-decision tree (high impressions+low CTR → title; good CTR+poor engagement → intent/content; good engagement+poor ranking → depth/authority; good everywhere → scale) was applied as a **protocol** because no GSC data exists. Applied to evidence:
- Unsatisfied queries (CNT-HP-02/07) → **content first, title later** (REFINE).
- Satisfied queries (CNT-HP-04/05/06) → **SCALE (keep)**.
- Truncation risk (CNT-HP-01/03) → **title** (shipped).

## 7. Phase E — CTR experiments
`03-ctr-experiments.csv`.
- Shipped: CTR-01 (EXP-02, mgnrega title), CTR-02 (EXP-03, india-china title).
- Withheld with documented reasons: CTR-03 (climate-finance title blocked by content gap), CTR-04 (digital-payments title blocked by content gap) — changing these titles without content would be clickbait.
- Kept unchanged (intent already optimal): CTR-05 (PMFBY), CTR-06 (EWS).
- Measure plan: 14-day GSC/GA4 comparison per test; revert if no gain. Baselines all NOT VERIFIED.

## 8. Phase F — Position bands 4–20
**NOT VERIFIED — PRODUCTION ACCESS REQUIRED.** No GSC data means no pilot can be assigned a band. Protocol defined (`08` §2): 4–20 rising impressions low CTR → title/meta; 4–20 good CTR poor engagement → intent/content; 21+ good content → depth/links/authority; #1–3 → scale. The structural changes shipped this cycle (titles, links, measurement integrity) are the safe work possible without a browser session.

## 9. Phase G — Internal-link optimization
`04-internal-link-opportunities.csv`. Crawl proved story pages emitted **zero** topic/entity links; topic hubs covered only a top-4 slice; entity pages barely exist. Shipped **EXP-05**: a server-rendered "Related Topics & Entities" strip in StoryShell that links **only resolvable targets** (no 404 risk), feeding `topic_link_clicked`/`entity_link_clicked`. Verified on rendered HTML (e.g., mgnrega → economy/policy/agriculture/employment + India; india-china → geopolitics/policy + India/UN). Deferred: entity terminal pages (ENT-01), hub curation (HUBLK-01..04), resolver weighting for india-china ties.

## 10. Phase H — Refresh backlog
`05-refresh-backlog.csv`. Candidates with rationale and **NOT VERIFIED triggers**: CNT-HP-01 (post-commencement operational data), CNT-HP-02 (stale 400% stat + missing limit coverage), CNT-HP-03 (new talk rounds), CNT-HP-04 (seasonal claims), CNT-HP-05 (eligibility rule changes), CNT-HP-06 (DPDP rules milestones), CNT-HP-07 (COP29/NCQG/Ndc). Refresh is scheduled against release events, not calendar vanity.

## 11. Phase I — Search opportunity reassessment
`09-content-decision-log.csv`. Explicitly **re-marked** the TASK-05 backlog rather than preserving hypotheses: OPP-01 REFINE/SCALE, OPP-02 REFINE (blocked), OPP-03 REFINE, OPP-04 SCALE, OPP-05 SCALE, OPP-06 SCALE+entity gap, OPP-07 DEFER, OPP-08 DEFER, OPP-09 REFINE (blocked), OPP-10 DEFER. Three DEFERs were re-classified because no published-page verification or baselines exist.

## 12. Phase J — Newsletter validation
Provider: **IMPLEMENTATION GAP — NOT YET CONNECTED**. `newsletter_subscribed` is defined but must never fire until a delivery provider confirms double-opt-in. `newsletter_started`/`newsletter_viewed` are wired (`SubscribeForm.tsx`, `NewsletterTracker.tsx`) and the email-in-URL leak is fixed; a **zero-subscription baseline is the honest state**. No conversion will be claimed until the funnel completes.

## 13. Phase K — Retention
**NOT VERIFIED — PRODUCTION ACCESS REQUIRED.** Retention proxies defined: story_completed (≥90% scroll), evidence_expanded depth, related_story_clicked continuation, search→content conversion, and newsletter_started→subscribed when wired. The north star is **readers who understood something**, not page views. Measurement protocol registered; no data this cycle.

## 14. Phase L — Experiments selected & executed
| ID | Variable | Status | KPI |
|---|---|---|---|
| EXP-01 | page_view dedupe (measurement) | EXECUTED, code-verified | page_view count/session = 1 initial |
| EXP-02 | CNT-HP-01 title | EXECUTED, rendered-verified | CTR + story_completed |
| EXP-03 | CNT-HP-03 title | EXECUTED, rendered-verified | CTR + story_opened |
| EXP-04 | CNT-HP-02 content coverage | BLOCKED (no verified sources) | query coverage + CTR |
| EXP-05 | story→topic/entity links | EXECUTED, rendered-verified | topic_link_clicked / entity_link_clicked |

One experiment, one major variable; all hypotheses pre-registered in `06-experiment-register.csv`. No experiment mixed variables (titles untouched on content-blocked pages; content untouched on title tests).

## 15. Red-team review
- **Thin-data risk:** Openly absent. The report labels every Phase C/F/J/K number as NOT VERIFIED and refuses to fill gaps with estimates. The only released findings are from builds, renders, and rendered-HTML crawls (first-party, reproducible).
- **Correlation vs causation:** EXP-02/03/05 are framed as hypotheses with 14-day measurement windows, not as wins. No causal claim is made.
- **Clicks vs readers:** CTR containment ≠ success. Primary KPIs are completion + evidence depth. Titles were optimized for honest intent-match, not bait.
- **Data hygiene:** `audit/task-06/04-content-performance.csv` contains unverified Position/Engagement cells; flagged for editorial ownership to mark/redact. It was excluded from decisions here.
- **Scope discipline:** No infrastructure built; no SEO/robots/sitemap files touched; the only code changes are the four experiments + their tests. Every change answers "can a reader notice this?" (title renders shorter, link strip visible, analytics accurate).
- **Reversibility:** Each experiment is a single self-contained change, revertible independently; the page_view fix restores GA4's intended 1-per-load contract.

## 16. Definition-of-Done compliance + Recommended TASK-09
**DoD:** ✓ Build (`npm run build`) · ✓ TypeScript (`tsc --noEmit` clean) · ✓ Tests (`analytics-taxonomy`) · ✓ Lint (no new lint errors in changed files) · ✓ No SEO/robots/sitemap regression · ✓ Accessibility preserved (chip strip is a semantic `<a>` group with aria-label; keyboard/focus intact) · ✓ Documentation updated (`audit/task-08/*`) · ✓ Public APIs unchanged · ✓ No fabricated metrics · ✓ Red-team pass.

**Recommended TASK-09 — "Unblock & First Half-Measurement":**
1. Acquire GSC + GA4 access, register the 7 pilot queries, snapshot Day-0 baselines (unblocks EXP-02/03/05 readout).
2. Grant newsletter provider + double-opt-in; only then activate `newsletter_subscribed`.
3. Acquire verified NPCI and UNFCCC/NDC sources → execute EXP-04 coverage for CNT-HP-02/07 (the two unsatisfied queries).
4. Create entity pages for the pilots' primary entities (ENT-01) to widen entity measurement.
5. Re-run the reader-journey measurement (story_opened→evidence→completed→related) on the same 7 pilots.
6. Publish the first honest trust/reporting snapshot (Trust Index inputs) using whatever first-party data then exists.

## Traceability
Governed by: Editorial Constitution v1.1 (clicks-vs-readers, no fabrication), AGENTS.md (Platform Beta rules — one reader-visible capability per sprint; 90/10 rule — the 10% engineering effort was spent only on found defects/verifiable optimizations), TASK-08 ticket. Implementation traces to TASK-07 instrumentation where relevant. No frozen baseline files were modified.

**Signed:** The Breakdown Engineering (10% effort) on behalf of Research/Editorial/Verification bureaus. Cycle closes: 29 Aug 2026.