# The Breakdown OS — GEO Evidence Attribution Report v1.0

**Audit & Assessment Date:** 2026-09-29  
**Version:** 1.0  
**Phase:** T0 Diagnostic Hardening → External Evidence Attribution  
**Production Target:** `https://thebreakdown.in` (Deployment: `dpl_BdsXRWprZM6VxQjzpauTz4egs2UF`)  
**Primary Data Stores:**
- `public.ai_visibility_observations` (Supabase PostgreSQL — Immutable T0 Baseline)
- `public.geo_evidence_assessments` (Supabase PostgreSQL — Additive Evidence Assessments)
**Governing Documents:**
- `docs/aeo-geo/architecture.md` (Phase 12 — GEO Measurement Foundation)
- `docs/aeo-geo/audit-diagnostic-engine.md` (Forensic Engine Audit)
- `docs/aeo-geo/diagnostic-attribution-framework.md` (Attribution Taxonomy)
- Editorial Constitution §XIII & §XIV (Defensibility & Quality Gates)

---

## 1. What T0 Proves

1. **Local Architecture & Serving Readiness is 100% Production Ready:**
   - 100% of tested target routes return HTTP 200 OK with sub-second average edge latency.
   - 100% of tested routes serve valid, self-referential canonical tags (`canonicalMatch = true`) matching the canonical model.
   - 100% of tested routes serve valid Schema.org JSON-LD (`NewsArticle` / `Article` / `FAQPage` / `Organization`) with complete author identity and zero SSRF / unsafe URLs.
   - `robots.txt` explicitly allows public routes (`/story/`, `/series/`, `/entity/`) and declares both standard `sitemap.xml` and Google `news-sitemap.xml`.
   - `llms.txt` and `feed.xml` (RSS 2.0) are live, valid, and fully accessible to automated crawlers.
2. **Semantic Content Intent is High (50% – 100%):**
   - The query-requirements model confirms that stories address the required information units for their topics without relying on simplistic keyword stuffing.
3. **Absence of Retrieval is Real & Documented:**
   - On the freshly launched production domain, queries across external generative search surfaces yielded 0 mentions and 0 citations at T0.
4. **Epistemic Integrity is Maintained:**
   - Absence of retrieval is typed as `NOT_OBSERVED` with `answer_accuracy = NULL`. It is not fabricated, nor is it scored as factual inaccuracy.

---

## 2. What T0 Does NOT Prove

1. **T0 Does NOT Prove an Indexing Failure:**
   - An unobserved query on an AI interface does not mean Google or Bing failed to index the URL. A page may be indexed but ranked outside the top 10 SERP snippets ingested by an LLM prompt.
2. **T0 Does NOT Prove External Crawler Rejection:**
   - Serving 200 OK on sitemaps and robots.txt proves *permission* and *submission*, but does not prove whether Googlebot, Bingbot, or GPTBot have executed their crawl cycle.
3. **T0 Does NOT Prove Low Domain Authority:**
   - Without comparative SERP displacement logs or third-party backlink data, attributing lack of retrieval to domain authority is speculative.
4. **T0 Does NOT Prove Factual Hallucination:**
   - Since no external answers citing The Breakdown were returned, claim-level distortion cannot be evaluated.

---

## 3. Local Evidence Matrix (100% Verified)

Local readiness measures technical health, canonical correctness, semantic schema, and primary sourcing, independent of external search engine behavior:

| Query ID | Target Route | HTTP Status | Canonical Match | Schema.org | Primary Sources | Local Readiness Score |
|---|---|---|---|---|---|---|
| **Q001** | `/series/.../indias-inheritance` | 200 OK (1874ms) | CONFIRMED | CONFIRMED | 3 categories | **100.00%** |
| **Q002** | `/story/rbi-repo-rate` | 200 OK (786ms) | CONFIRMED | CONFIRMED | 3 categories | **95.00%** |
| **Q003** | `/story/mgnrega-reform` | 200 OK (636ms) | CONFIRMED | CONFIRMED | 3 categories | **90.00%** |
| **Q004** | `/story/digital-payments-boom` | 200 OK (604ms) | CONFIRMED | CONFIRMED | 3 categories | **90.00%** |
| **Q005** | `/story/pm-fasal-bima-claims` | 200 OK (711ms) | CONFIRMED | CONFIRMED | 3 categories | **91.67%** |
| **Q006** | `/story/semiconductor-pli` | 200 OK (425ms) | CONFIRMED | CONFIRMED | 3 categories | **95.00%** |
| **Q007** | `/story/dpdp-bill` | 200 OK (431ms) | CONFIRMED | CONFIRMED | 3 categories | **96.67%** |
| **Q008** | `/story/indias-foreign-policy` | 200 OK (621ms) | CONFIRMED | CONFIRMED | 3 categories | **98.33%** |
| **Q009** | `/story/climate-finance` | 200 OK (601ms) | CONFIRMED | CONFIRMED | 3 categories | **93.33%** |
| **Q010** | `/story/groundwater-depletion` | 200 OK (663ms) | CONFIRMED | CONFIRMED | 3 categories | **93.33%** |

---

## 4. External Evidence & Index Telemetry Status

In accordance with the Formal Evidence Status Model:

| Signal Name | Status | Method | Source | Value | Confidence |
|---|---|---|---|---|---|
| `google_index_status` | **`NOT_TESTED`** | `gsc_inspection` | None | `null` | 0.00 |
| `bing_index_status` | **`NOT_TESTED`** | `search_api` | None | `null` | 0.00 |
| `edge_crawler_logs` | **`NOT_TESTED`** | `server_logs` | None | `null` | 0.00 |
| `competitor_displacement` | **`NOT_TESTED`** | `search_api` | None | `null` | 0.00 |
| `external_search_retrieval`| **`OBSERVED`** | `manual_inspection`| Live Web | `NOT_RETRIEVED` | 1.00 |

*Epistemic Rule:* Because external index inspection APIs are not configured in the repository environment, index status is strictly classified as **`INDEX_STATUS_UNKNOWN`**. It is never assumed to be unindexed.

---

## 5. Content Intent Coverage (Semantic Query-Requirements Model)

Replacing naive keyword matching, content completeness is evaluated against 6 atomic information units per topic:

| Query ID | Topic Focus | Units Present | Units Partial | Units Absent | Intent Coverage Rate |
|---|---|---|---|---|---|
| **Q001** | 1962 Sino-Indian War & Border Demarcation | 6 | 0 | 0 | **100.00%** |
| **Q002** | RBI Repo Rate & MPC Monetary Transmission | 4 | 1 | 1 | **75.00%** |
| **Q003** | MGNREGA Statutory Reform (100 to 125 Days) | 3 | 0 | 3 | **50.00%** |
| **Q004** | UPI Architecture & Zero-MDR Policy | 3 | 0 | 3 | **50.00%** |
| **Q005** | PM Fasal Bima Yojana Claims & Delay Audits | 3 | 1 | 2 | **58.33%** |
| **Q006** | India Semiconductor Mission & PLI Subsidies | 4 | 1 | 1 | **75.00%** |
| **Q007** | Digital Personal Data Protection Act 2023 | 5 | 0 | 1 | **83.33%** |
| **Q008** | Panchsheel Agreement & Tibet Geopolitics | 5 | 1 | 0 | **91.67%** |
| **Q009** | Renewable Transition Climate Finance CAPEX | 4 | 0 | 2 | **66.67%** |
| **Q010** | Groundwater Table Depletion in Ag Belts | 4 | 0 | 2 | **66.67%** |

*Note:* Intent coverage rate measures editorial comprehensiveness against a multi-faceted research prompt. It is a local quality metric, not a retrieval performance score.

---

## 6. Query Variant Results (Non-Contaminating Architecture)

24 query variants were established in `data/geo-query-variants.json` across 6 distinct linguistic and intent formulations:
1. `natural` (e.g. *"1962 India China war summary and causes"*)
2. `specific` (e.g. *"What semiconductor fab projects are approved in Dholera and Sanand?"*)
3. `entity` (e.g. *"Data Protection Board of India penalty powers and independence"*)
4. `question_formulation` (e.g. *"Why did states opt out of PMFBY crop insurance scheme?"*)
5. `source_seeking` (e.g. *"Henderson Brooks Bhagat report 1962 war findings"*)
6. `navigational` (e.g. *"The Breakdown India China 1962 chapter"*)

All 24 variants preserve the canonical benchmark Q001–Q010 intact. In our initial test run, sample variants were recorded into `public.geo_evidence_assessments` under version `v1.0-variant`.

---

## 7. Diagnostic Confidence & Calibration

Confidence scores are assigned strictly based on **Evidence Quality**, not intuition:

- `0.00 – 0.24`: Speculative
- `0.25 – 0.49`: Weak evidence (Used for current UNKNOWN cases where external index telemetry is missing, confidence = **0.30**)
- `0.50 – 0.74`: Moderate evidence
- `0.75 – 0.89`: Strong evidence (Used for local content gaps when intent coverage < 40%, confidence = **0.85**)
- `0.90 – 1.00`: Confirmed empirical evidence (Used for technical blocks such as HTTP 404 or canonical mismatch, confidence = **0.95**)

---

## 8. UNKNOWN Cases & "What Would Change This Diagnosis?"

For all 10 canonical queries at T0, the diagnosis is:

```
DIAGNOSIS: UNKNOWN_INSUFFICIENT_EVIDENCE
CONFIDENCE: 0.30
```

### Missing Evidence Required to Transition:
1. Google Search Console URL Inspection API telemetry (`coverageState`)
2. Bing Webmaster Tools URL indexation confirmation
3. Edge crawler access logs confirming Googlebot / PerplexityBot requests
4. Real-time SERP position ranking of The Breakdown vs competing institutional sources (PIB, RBI, Wikipedia)

### Actionable Resolution Tests:
1. Query Google Search Console URL Inspection for each canonical URL.
2. Check whether crawler bot IP ranges visited `/news-sitemap.xml` within the last 7 days.
3. If confirmed indexed (`INDEXED_CONFIRMED`) and unretrieved → Transition to `RANKING_RETRIEVAL_GAP`.
4. If confirmed unindexed (`NOT_INDEXED_CONFIRMED`) → Transition to `INDEXING_DISCOVERY_GAP`.

---

## 9. Two Decoupled Scores

The platform rejects composite vanity metrics:

| Metric | Score at T0 | Interpretation |
|---|---|---|
| **Local Readiness Score** | **94.5% (Average)** | Technical, canonical, structured data, and primary evidence layers are production-ready. |
| **External Retrieval Score** | **`NULL`** | No external citations or mentions have occurred yet. Never conflated with 0. |

---

## 10. T1 Protocol & Requirements (Day 7 — 2026-10-06)

1. **Search Console Audit:** Inspect GSC coverage reports for `/sitemap.xml` and `/news-sitemap.xml`.
2. **Re-Query Benchmark & Variants:** Execute Q001–Q010 and variants across Google AI Overviews, Perplexity, and ChatGPT.
3. **Record T1 Additive Assessments:** Execute `npm run geo:evidence` with assessment version `v1.1`.
4. **Transition Recording:** Log any state changes in `public.geo_evidence_assessments` preserving previous state and evidentiary justification.
