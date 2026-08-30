# TASK-08 — Pilot Content Analysis (Phase D)

**Governed by:** TASK-08 (Measure → Diagnose → Change → Measure Again)
**Evidence basis:** production build served locally; rendered HTML crawled; canonical data model inspected. No third-party traffic estimates are used as facts. `audit/task-06/04-content-performance.csv` figures (Positions, Engagement Rate) are **NOT first-party** — GSC/GA4 access never existed — and are **excluded** from every decision in this document.

## Honesty constraint

Every row below separates three things:
1. **Verified structural facts** (rendered titles, HTML links, data-model contents) — collected this cycle.
2. **Hypotheses** — clearly labelled as such, testable only after GSC/GA4 access.
3. **NOT VERIFIED** markers — everywhere a first-party metric would live.

---

## CNT-HP-01 — MGNREGA 2026: The 125-Day Rural Employment Guarantee Explained

| Field | Value |
|---|---|
| Target query | `mgnrega budget 2026` |
| Intent (TASK-05) | Policy / Explanatory → Evergreen Explainer |
| Category / reading time | economy / 14 min |
| Rendered title (after EXP-02) | `MGNREGA 2026: The 125-Day Rural Employment Guarantee Explained` |
| Title length | 63 chars (was ~79) |
| Content verdict | Strong. Covers 2005→2026 transition, VB-G RAM G Act, 100→125 days, repeal + transitional protection. |
| Topic hub presence | agriculture, employment, policy ✓ · economy ✗ (top-4 slice) |
| Entity pages | MoRD ✗ (no entity page exists) · India ✓ |
| Internal links after EXP-05 | → economy, policy, agriculture, employment topics; → India entity |
| Decision | **REFINE coverage (budget allocation detail) + title shipped (EXP-02) + keep.** Query asks *budget*; page explains *guarantee transition*. Add an explicit 2026-27 allocation/outlay block when a verified budget source is acquired. |

## CNT-HP-02 — Digital Payments in Rural India: UPI's Unseen Revolution

| Field | Value |
|---|---|
| Target query | `upi transaction limit rural` |
| Intent | Explanatory → Deep Research |
| Category / reading time | technology / 8 min |
| Rendered title | unchanged (strong for UPI-in-rural narrative) |
| **Content verdict** | **INTENT GAP.** Zero occurrences of "limit", "transaction limit", "wallet limit" anywhere in the story's data model. The primary query is not answered. The TASK-06 record marked an "UPDATE — explain transaction caps and failures in feature phone UPI" as Approved, but that coverage was never shipped. |
| Topic hub presence | digital-payments ✓ · technology ✗ (only 81-crore listed) |
| Decision | **REFINE — add feature-phone UPI transaction-limit coverage (EXP-04). Blocked on verified NPCI sources.** Title changes deliberately withheld — a title without content would be clickbait. |

## CNT-HP-03 — India-China Border: Galwan and the Standoff Four Years On

| Field | Value |
|---|---|
| Target query | `india china border dispute galwan map` |
| Intent | Causal → Timelines |
| Category / reading time | politics / 17 min |
| Rendered title (after EXP-03) | 57 chars (was ~93) |
| Content verdict | Strong narrative; "Twenty rounds", "60,000 troops" both sides. |
| Map coverage | Query token "map" is a format expectation. No GIS map verified inside the story data model this cycle. |
| Topic hub presence | geopolitics ✗ · policy ✗ (neither surfaces the story; top-4 slice) |
| Related-story links | CrossStoryRecommendations rendered no outbound story card (only mode switches) — candidate for resolver weight review. |
| Decision | **REFINE — title shipped (EXP-03); add/verify a map block (visual asset, provenance-registered); fix hub surfacing (design change) later.** |

## CNT-HP-04 — PM Fasal Bima Yojana: The Claims That Never Reached Farmers

| Field | Value |
|---|---|
| Target query | `pm fasal bima yojana claims data` |
| Intent | Data → Data Pages |
| Category / reading time | policy / 15 min |
| Rendered title | Strong intent match; no change (CTR-05). |
| Content verdict | Investigation with claims data across six states; evidenceScore 97. |
| Topic hub presence | agriculture ✓ · policy ✗ |
| Limitation | Seasonal claims data will age; refresh cadence registered in 05-refresh-backlog.csv. |
| Decision | **SCALE (keep) — content satisfies intent; add structured claims-data table/CSV when refreshed.** |

## CNT-HP-05 — Who Really Gets the EWS Quota? An Investigation into UPSC's 104 Selections

| Field | Value |
|---|---|
| Target query | `ews reservation eligibility upsc` |
| Intent | Policy → Deep Research (highest opportunity score 10000) |
| Category / reading time | policy / 12 min |
| Rendered title | Strong; answers the eligibility question ("who gets") while hooking the investigation. No change. |
| Content verdict | 104-selection analysis; strong relevance to both eligibility and wellbeing-of-reservation debates. |
| Topic hub presence | education ✓ · policy ✓ |
| Decision | **SCALE (keep) — treat as flagship; maintain, do not dilute with title/format churn.** |

## CNT-HP-06 — 81.5 Crore Aadhaar Records Exposed: Inside India's Biggest Data Breach

| Field | Value |
|---|---|
| Target query | `aadhaar data breach icmr report` |
| Intent | Document → Document Pages |
| Category / reading time | technology / 14 min |
| Rendered title | Strong (numbers + breach + Aadhaar); no change. |
| Content verdict | Oct 2023 breach, ICMR origin, DPDP framing; cross-links to sibling DPDP story. |
| Topic hub presence | cybersecurity ✓ · technology ✓ · policy ✗ |
| Entity pages | ICMR ✗ · UIDAI ✗ · CERT-In ✗ (none exist) — the query's "icmr report" token has no dedicated entity hub. |
| Decision | **SCALE (keep) — content satisfies intent; ENT-01 (entity pages) would strengthen.** |

## CNT-HP-07 — India's ₹11 Lakh Crore Climate Finance Challenge

| Field | Value |
|---|---|
| Target query | `climate finance commitments cop29 india` |
| Intent | Explanatory → Deep Research |
| Category / reading time | environment / 13 min |
| Rendered title | Omits COP entirely (by design today). |
| **Content verdict** | **INTENT GAP.** Data layer has zero occurrences of COP29 / COP 29 / NCQG / "New Collective Quantified Goal". Query asks about international *commitments*; page covers the domestic financing gap only. |
| Topic hub presence | environment ✗ · geopolitics ✗ |
| Decision | **REFINE — add COP29/COP30 NCQG commitments + India's NDC financing positions (EXP-04 scaffold). Blocked on verified UNFCCC/NDC sources.** Title changes withheld for the same reason as CNT-HP-02. |

---

## Cross-cutting findings

1. **Intent-gap pair**: two of seven pilots (CNT-HP-02, CNT-HP-07) do not answer their primary queries. Both were "Approved UPDATE" in TASK-06 and never shipped the coverage. This is the highest-leverage editorial correction in the cycle.
2. **Topic-hub surfacing**: hubs render `storyGroups.latest.slice(0, 4)`; pilots fall off their own hubs when topics are busy (economy, geopolitics, environment, policy all under-surface pilots). Design change (curated/pinned) tracked, not executed.
3. **Entity coverage**: only 11 entity pages exist; no pilot primary entity has a terminal page. `entity_opened` is effectively unmeasurable for pilots today.
4. **Internal-link hygiene**: before EXP-05, story pages emitted zero topic/entity links; after EXP-05 they emit resolvable-only chips.
5. **Measurement**: all live metrics remain NOT VERIFIED — production GA4/GSC access is still the single blocker to Phase D final numbers.

## Files referenced

- Crawl evidence: all findings derived from fetching the production build at `http://127.0.0.1:3123` (robots, sitemap, 7 pilot pages, 10 topic hubs, story/entity pages).
- Opportunity log: `audit/task-08/04-internal-link-opportunities.csv`
- Decision log: `audit/task-08/09-content-decision-log.csv`
- Experiment register: `audit/task-08/06-experiment-register.csv`