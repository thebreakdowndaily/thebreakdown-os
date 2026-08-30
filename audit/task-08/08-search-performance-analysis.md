# TASK-08 — Search Performance Analysis (Phase C + D + H)

**Governed by:** TASK-08 (Measure → Diagnose → Change → Measure Again)
Honesty statement: Google Search Console access is **NOT VERIFIED — PRODUCTION ACCESS REQUIRED**. There are therefore **no first-party positions, impressions, or clicks** in this document. `audit/task-06/04-content-performance.csv` contains **unverified Position/Engagement figures that must not be treated as measurements**; they are excluded from every decision here.

## 0. What we verified without a browser session

| Item | Result | Evidence |
|---|---|---|
| Sitemap reachable | ✓ `https://thebreakdown.in/sitemap.xml` | `app/robots.ts` + served sitemap.xml (contains all 7 pilots) |
| Pilot URLs indexable | ✓ All 7 in sitemap | served sitemap.xml `<loc>/story/<slug></loc>` present for all 7 |
| Robots policy | ✓ `/story` allowed, `/search` disallowed | served robots.txt |
| Canonical tags | ✓ All pilots render `canonical` = `https://thebreakdown.in/story/<slug>` | rendered HTML per pilot |
| Titles + meta | ✓ Rendered (lengths audited, EXP-02/03 shipped) | rendered HTML |
| Indexing gate | ✗ Indexing **cannot be verified** — requires Google Search Console / SearchLabs | GSC not verified |

So the crawl control is clean; **ranking outcomes remain invisible until GSC access exists.**

## 1. The measurement contract for the 7 pilot queries

Decisions in this cycle are only "better or not" once these baselines exist (Phase C contract):

| Query | Page | Baseline needs (GSC) | Day-0 snapshot |
|---|---|---|---|
| mgnrega budget 2026 | CNT-HP-01 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |
| upi transaction limit rural | CNT-HP-02 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |
| india china border dispute galwan map | CNT-HP-03 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |
| pm fasal bima yojana claims data | CNT-HP-04 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |
| ews reservation eligibility upsc | CNT-HP-05 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |
| aadhaar data breach icmr report | CNT-HP-06 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |
| climate finance commitments cop29 india | CNT-HP-07 | position, impressions, CTR | NOT VERIFIED — PRODUCTION ACCESS REQUIRED |

## 2. Position band 4–20 interpretation (Phase F) — protocol, not results

The TASK-08 decision tree only becomes actionable with GSC data. The protocol:

- **Positions 4–20 + rising impressions + low CTR** → title/meta experiment (EXP-02/EXP-03 apply).
- **Positions 4–20 + good CTR + poor engagement** → intent/content experience fix (EXP-04 pattern).
- **Positions 21+ + good content** → depth/internal-link/authority work (EXP-05 + entity hubs).
- Anything better than #3 → SCALE the topic.

Today every pilot is in an unknown band → the correct action set was **structural**: fix what is verifiable (title length, link hygiene, page-view integrity) and stop there. No fabricated "position 8 → position 3" language appears anywhere in this cycle.

## 3. Query-intent gap analysis (evidence-backed)

Two queries are unsatisfied by current content (verified by model inspection, not by estimation):

| Query | Handle | Verified gap | Verdict |
|---|---|---|---|
| upi transaction limit rural | CNT-HP-02 | 0 × "limit" in content | An upgrade *must* add coverage, not re-title |
| climate finance commitments cop29 india | CNT-HP-07 | 0 × COP29/NCQG in content | An upgrade *must* add coverage, not re-title |

Any title/CTR action on these would be clickbait. They are registered as **REFINE (content)** experiments EXP-04, blocked on verified sources.

## 4. What shipped this cycle and why it is safe search work

| Change | Safe because | Not claimed |
|---|---|---|
| EXP-01 page_view dedupe | fixes a measurement bug that poisoned every ratio | does not change rankings |
| EXP-02 CNT-HP-01 title | shorter, factual, preserves intents, content matches | no ranking gain asserted |
| EXP-03 CNT-HP-03 title | shorter, factual, preserves intents, content matches | no ranking gain asserted |
| EXP-05 topic/entity link strip | additive, resolvable-only links; measurable events | no direct ranking signal asserted |
| (deferred) content coverage for CNT-HP-02/07 | no fabrication; blocked on sources | — |

## 5. Red-team notes (short form; full in 10-TASK-08-REPORT.md)

- **No busywork protection**: we did not "lower CTR" or "improve position" fictionally; the report's Phase C/F sections explicitly say no first-party baseline exists.
- **Correlation ≠ causation**: EXP-02/03/05 are hypotheses with pre-registered KPIs; they will be judged only after 14+ days of GA4/GSC data.
- **Clicks ≠ readers**: CTR is a containment metric. Primary success is story_completed + evidence engagement.
- **Flagged data**: `audit/task-06/04-content-performance.csv` carries unverified numeric cells; flagged for editorial ownership to mark/redact before any external use.

## 6. Recommended immediate owner actions to unblock TASK-09

1. Grant GSC access to the domain property for the research owner (blocker for all Phase C/F baselines).
2. Add the 7 pilot queries as GSC watch queries.
3. Grant GA4 (full access) to the research owner.
4. Connect a newsletter provider with double-opt-in.
5. Create entity pages for MoRD/NPCI/MoA/CERT-In/ICMR/UIDAI (unblocks entity measurement + link graph).
6. Acquire verified NPCI and UNFCCC/NDC sources to unblock EXP-04 content work.

## Traceability

Governing documents: Editorial Constitution v1.1 (clicks-vs-readers guidance), AGENTS.md Platform Beta rules, TASK-08 ticket. No lower-level document was changed; no SEO/robots/sitemap files were modified this cycle.