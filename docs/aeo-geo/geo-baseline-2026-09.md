# The Breakdown OS — GEO Baseline Report (T0 — September 2026)

**Audit Date:** 2026-09-29  
**Cadence:** T0 (Immediately post-production deployment)  
**Production Domain:** `https://thebreakdown.in`  
**Deployment SHA:** `9088511f78ab4af7bf102086a8763ac3e9b6b7ab`  
**Deployment ID:** `dpl_BdsXRWprZM6VxQjzpauTz4egs2UF`  
**Database Table:** `public.ai_visibility_observations` (Supabase PostgreSQL)  
**Zero Fabrications Rule:** Strict institutional enforcement. Absence of retrieval is typed as `NOT_OBSERVED` with `answer_accuracy = NULL`. Never conflate absence with factual inaccuracy.

---

## 1. Multi-Dimensional Decoupled Evaluation

| Dimension | Operational Question | Current Status | Forensic Evidence |
|---|---|---|---|
| **1. Crawlability** | Can the public web discover the system? | ✅ **READY (100%)** | `https://thebreakdown.in/robots.txt` allows all standard crawlers (`User-Agent: *`). Google News sitemap declared. `llms.txt` active (200 OK). Zero crawler IP blocks or WAF challenge loops. |
| **2. Indexability** | Is the content available to search systems? | ✅ **READY (100%)** | Canonical tags active on 100% of tested routes (self-referential, no root drift). Standard XML sitemap (22,046 bytes) and Google News sitemap (588 bytes) live and accessible. |
| **3. AI Retrieval** | Was The Breakdown actually retrieved? | ⏳ **PENDING CRAWL CYCLE (0%)** | Public web query probe `site:thebreakdown.in` returned 0 indexed results. Search engine crawlers (Googlebot, PerplexityBot, GPTBot, ClaudeBot) have not yet completed their initial discovery pass on the new domain. |
| **4. Citation** | Was The Breakdown actually cited? | ⏳ **PENDING CRAWL CYCLE (0%)** | Benchmark queries Q001–Q010 currently return 0 citations on external LLM search interfaces. |
| **5. Attribution** | Was the correct article/entity cited? | ⏳ **NOT APPLICABLE** | Cannot evaluate attribution until initial external citations occur. Schema.org metadata defines explicit canonical entity identities (`sameAs`) and author URLs ready for attribution ingestion. |
| **6. Accuracy** | Were the claims represented correctly? | ⏳ **NOT APPLICABLE** | No external LLM summaries citing The Breakdown exist yet to evaluate for hallucination or drift. |
| **7. Freshness** | Was current information represented as current? | ✅ **READY** | `lastmod` timestamps in `sitemap.xml` and `<news:publication_date>` in `news-sitemap.xml` are dynamically set to ISO-8601 publication timestamps. |

---

## 2. Complete T0 Benchmark Query Set Observations (10/10 Logged)

All 10 queries executed via public search/retrieval inspection against `https://thebreakdown.in` on 2026-09-29:

| ID | Query Text | Intent | Target Story | Observation State | Answer Present | Mentioned | Cited | Accuracy Score | Failure Classification | DB Record UUID |
|---|---|---|---|---|---|---|---|---|---|---|
| **Q001** | *"What happened between India and China in 1962?"* | `historical_context` | `indias-inheritance` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `04ef4977-742f-4f63-a997-0d71ee2025a7` |
| **Q002** | *"What is the RBI repo rate and how does monetary policy work in India?"* | `definition` | `rbi-repo-rate` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `4122419b-8c1b-46db-b1b8-2a941e0cf074` |
| **Q003** | *"How does MGNREGA work and what are the key reform challenges?"* | `policy_impact` | `mgnrega-reform` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `08be99e2-cf07-498e-b91e-b13f00b776ef` |
| **Q004** | *"How did UPI revolutionize digital payments in India?"* | `timeline` | `digital-payments-boom` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `00c67e2a-929e-488d-aaa8-07d223c92be3` |
| **Q005** | *"What is the claim settlement record of PM Fasal Bima Yojana?"* | `data_evidence_query` | `pm-fasal-bima-claims` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `a592ab77-7438-4709-acf0-9acd7adc648b` |
| **Q006** | *"What is India's Semiconductor Mission and what are the PLI subsidies?"* | `current_policy` | `semiconductor-pli` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `2cc2a72d-f12e-43e6-97d5-8542a495ddc2` |
| **Q007** | *"What are the key provisions of India's Digital Personal Data Protection Act?"* | `controversial_issue` | `dpdp-bill` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `bb1b3301-c864-4683-85d5-008d3152ad23` |
| **Q008** | *"What was the Panchsheel Agreement in India's foreign policy?"* | `institutional_entity` | `indias-foreign-policy` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `50d6451e-7770-4229-a578-4e32dc0ecbd3` |
| **Q009** | *"How is climate finance structured for Indian renewable energy transition?"* | `comparative_question` | `climate-finance` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `19967c25-90c9-4a90-9426-ab8576ac3a52` |
| **Q010** | *"What is the status of groundwater depletion across Indian agricultural belts?"* | `source_specific` | `groundwater-depletion` | `NOT_OBSERVED` | No | No | No | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | `a73d64a3-a24d-4082-ab6c-1d1ec265f5fb` |

---

## 3. T0 Quantitative Aggregate Baseline

```
Total Queries Tested:       10
Queries Observed:           0  (0% observed results)
Queries Unobserved:         10 (100% unobserved across tested surfaces)
Queries With Answer:        0
Mention Rate:               0.0%
Citation Rate:              0.0%
Average Accuracy:           NULL (Never conflated with 0)
Evidence Grounding Rate:    0.0%
Primary Failure Cause:      UNKNOWN_INSUFFICIENT_EVIDENCE (10/10)
Diagnostic Verification:    HTTP 200 OK (10/10), Canonical MATCH (10/10), Schema VALID (10/10), Keywords MATCH (10/10)
```

---

## 4. Longitudinal Follow-Up Protocol (T1, T2, T3)

- **T0 (Day 0 — 2026-09-29):** Deployment confirmed, sitemaps active, initial index probe recorded (0/10 indexed).
- **T1 (Day 7 — 2026-10-06):** Re-query all 10 queries across Google AI Overviews, Perplexity, ChatGPT. Audit Google Search Console URL Inspection for `/sitemap.xml` and `/news-sitemap.xml`.
- **T2 (Day 14 — 2026-10-13):** Check for initial search impressions, entity resolution on Knowledge Graph, and citation emergence.
- **T3 (Day 30 — 2026-10-29):** First full monthly trend report. Calculate citation accuracy rate and claim-level verification on retrieved answers.
