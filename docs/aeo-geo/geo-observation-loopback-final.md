# The Breakdown OS — GEO Observation Loopback Final Report

**Document Version:** 1.0  
**Audit Date:** 2026-09-29  
**Production Domain:** `https://thebreakdown.in`  
**Deployment ID:** `dpl_BdsXRWprZM6VxQjzpauTz4egs2UF`  
**Git HEAD:** `9088511f78ab4af7bf102086a8763ac3e9b6b7ab`  
**Database Table:** `public.ai_visibility_observations` (Supabase PostgreSQL)  
**Governing Standard:** AGENTS.md v1.0, Editorial Constitution §XIII, `docs/aeo-geo/architecture.md`  

---

## 1. Executive Summary

This report establishes the forensic observation and feedback loop for Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) on The Breakdown OS.

Following the live production deployment of the AEO/GEO engine (commit `9088511`, deployment `dpl_BdsXRWprZM6VxQjzpauTz4egs2UF`), we audited the measurement system against one fundamental question:

> *"When external search and AI systems encounter The Breakdown, do they discover it, retrieve it, cite it, identify the correct entity/story, and represent its evidence accurately?"*

### Key Institutional Achievements in this Loopback:
1. **Separation of Absence from Inaccuracy:** Fixed the semantic flaw where unobserved queries were previously conflated with factual inaccuracy (`accuracy = 0`). Unobserved queries are now strictly typed as `NOT_OBSERVED` with `answer_accuracy = NULL`.
2. **Database Migration 018 Deployed:** Extended `public.ai_visibility_observations` from 15 to 28 columns in Supabase PostgreSQL, adding typed observation states, claim-level evaluation JSONB, context integrity, freshness, and failure classification tags.
3. **Decoupled Evaluation Dimensions:** Built a non-collapsing metric calculation engine in `lib/seo/geo-measurement.ts` separating discovery, retrieval, mention, citation, accuracy, and grounding.
4. **T0 Baseline Collection (Zero Fabrications):** Recorded genuine, live search inspection observations for all 10 benchmark queries in `data/geo-query-set.json` into Supabase PostgreSQL.

---

## 2. Measurement Architecture

The observation loop operates as a closed-loop feedback system:

```
              EDITORIAL EVIDENCE
                     ↓
              CANONICAL MODEL
                     ↓
        ┌────────────┼────────────┐
        ↓            ↓            ↓
      JSON-LD      SITEMAPS     llms.txt
        ↓            ↓            ↓
        └────────────┼────────────┘
                     ↓
                DISCOVERY  (Crawlability & Indexability)
                     ↓
                RETRIEVAL  (System identifies domain in search/RAG)
                     ↓
                  CITATION (System emits canonical URL link)
                     ↓
             REPRESENTATION (Entity, Byline, Topic attribution)
                     ↓
              CLAIM VALIDATION (Evidence comparison)
                     ↓
              GEO OBSERVATION (PostgreSQL time-series store)
                     ↓
             REGRESSION DETECTION (Automated alerting)
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
   ENGINEERING FIX          EDITORIAL FIX
   (Canonical, SSRF,        (Evidence update,
    Schema repairs)          Clarity revision)
        ↓                         ↓
        └────────────┬────────────┘
                     ↓
                  RECHECK (T1, T2, T3)
```

---

## 3. Benchmark Query Design (10 Query Matrix)

All 10 benchmark queries in `data/geo-query-set.json` were audited to ensure they represent natural user inquiries covering 10 distinct retrieval intents without artificial brand-name bias:

| ID | Natural Query | Retrieval Intent | Target Story | Target Entity | Expected Evidence |
|---|---|---|---|---|---|
| **Q001** | *What happened between India and China in 1962?* | `historical_context` | `indias-inheritance` | `india-china-border` | Henderson Brooks report citations, 1962 conflict boundary records |
| **Q002** | *What is the RBI repo rate and how does monetary policy work in India?* | `definition` | `rbi-repo-rate` | `rbi` | RBI Act 1934 statutory framework, MPC minutes, policy corridor data |
| **Q003** | *How does MGNREGA work and what are the key reform challenges?* | `policy_impact` | `mgnrega-reform` | `ministry-of-rural-development` | NREGA 2005 statute, ABPS compliance data, CAG audit reports |
| **Q004** | *How did UPI revolutionize digital payments in India?* | `timeline` | `digital-payments-boom` | `npci` | NPCI monthly volume telemetry, IMPS switch protocol, RBI payment vision |
| **Q005** | *What is the claim settlement record of PM Fasal Bima Yojana?* | `data_evidence_query` | `pm-fasal-bima-claims` | `ministry-of-agriculture` | NCIP district-level loss ratios, state subsidy delay records |
| **Q006** | *What is India's Semiconductor Mission and what are the PLI subsidies?* | `current_policy` | `semiconductor-pli` | `ism` | MeitY PLI guidelines, cabinet approval notifications, fab capex schedules |
| **Q007** | *What are the key provisions of India's Digital Personal Data Protection Act?* | `controversial_issue` | `dpdp-bill` | `meity` | DPDP Act 2023 Gazette notification, Data Protection Board penalties |
| **Q008** | *What was the Panchsheel Agreement in India's foreign policy?* | `institutional_entity` | `indias-foreign-policy` | `ministry-of-external-affairs` | 1954 Sino-Indian Agreement text, Nehru parliamentary speeches |
| **Q009** | *How is climate finance structured for Indian renewable energy transition?* | `comparative_question` | `climate-finance` | `ireda` | CEA 2030 generation mix projection models, Sovereign Green Bonds |
| **Q010** | *What is the status of groundwater depletion across Indian agricultural belts?* | `source_specific` | `groundwater-depletion` | `cgwb` | Central Ground Water Board Dynamic Groundwater Resources report |

---

## 4. Observation Protocol

Every observation recorded in `public.ai_visibility_observations` enforces the following data contract:

1. **State Space (`observation_state`):**
   - `NOT_OBSERVED`: Queried, but engine produced no result or 0 search hits.
   - `OBSERVED_NO_MENTION`: Answer produced, but The Breakdown is not mentioned.
   - `OBSERVED_MENTION_NO_CITATION`: The Breakdown mentioned in text, but no URL provided.
   - `OBSERVED_CITATION`: A URL is cited (unverified).
   - `OBSERVED_INCORRECT_CITATION`: Wrong or non-canonical URL cited.
   - `OBSERVED_CORRECT_CITATION`: Canonical URL cited correctly.
2. **Method Tagging (`observation_method`):** `manual`, `browser`, `api`, `search_inspection`, `ai_inspection`.
3. **Accuracy Guardrails:** `answer_accuracy` is strictly `NULL` when `answer_present = false` or state is `NOT_OBSERVED`. Scored 0–4 only when an actual answer exists.
4. **Citation Invariants:**
   - `citation_url` cannot exist without `cited = true`.
   - `citation_correct = true` cannot exist without `cited = true`.
   - All citation URLs must pass SSRF safety validation (`isSafePublicUrl`).

---

## 5. T0 Baseline Results

Executed on 2026-09-29 immediately following production promotion:

- **Domain Reachability:** 100% (`https://thebreakdown.in` returns 200 OK across all key routes).
- **Public Discovery Endpoints:** 100% (`robots.txt`, `sitemap.xml`, `news-sitemap.xml`, `llms.txt` all active).
- **External Search Indexation Status:** 0/10 indexed (`site:thebreakdown.in` returns 0 results).
- **External AI Retrieval Status:** 0/10 retrieved (`NOT_OBSERVED`).
- **External AI Citation Status:** 0/10 cited (`NOT_OBSERVED`).
- **Average Accuracy:** `NULL` (Strict adherence: absence of retrieval is never scored as inaccuracy).
- **Primary Failure Cause:** `EXTERNAL_INDEXING_GAP` (10/10 queries awaiting crawler pass).

---

## 6. Representation Integrity & Claim-Level Validation

When external citations occur at T1, T2, and T3, claims will be evaluated using the codified 6-verdict schema:

| Claim Verdict | Definition | Action Required |
|---|---|---|
| `SUPPORTED` | AI statement is completely supported by cited The Breakdown evidence. | Retain baseline; record positive grounding. |
| `PARTIALLY_SUPPORTED` | Core fact correct, but nuance, condition, or limitation omitted. | Review summary and key facts clarity. |
| `UNSUPPORTED` | Statement not found in or implied by The Breakdown article. | Classify as hallucination; investigate RAG chunking. |
| `CONTRADICTED` | Statement directly contradicts cited The Breakdown evidence. | Classify as severe hallucination; audit schema/prose. |
| `OUTDATED` | Historical fact represented as current, or recent update missed. | Classify as freshness gap; review `dateModified`. |
| `AMBIGUOUS` | Statement is vague or open to conflicting interpretations. | Improve lead paragraph and executive summary. |

---

## 7. 12-Factor Failure Classification & Diagnostic Attribution

When a GEO observation experiences a retrieval or representation gap, it is classified across 12 mutually exclusive forensic categories (Migrations 017–019):

```
Failure Diagnosis Taxonomy (A through L):
├── INDEXING_DISCOVERY_GAP       (A) → Page not crawled, noindexed, robots.txt blocked
├── RANKING_RETRIEVAL_GAP        (B) → Indexed, but excluded from top SERP context in RAG
├── ENTITY_RECOGNITION_GAP       (C) → Concept unresolved to Breakdown entity node
├── CONTENT_GAP                  (D) → Story does not address the query/topic intent
├── EVIDENCE_GAP                 (E) → Lacks primary data/citations demanded by engine
├── STRUCTURED_DATA_GAP          (F) → Schema missing or invalid JSON-LD markup
├── CANONICALIZATION_GAP         (G) → Non-canonical URL cited or canonical mismatch
├── FRESHNESS_GAP                (H) → Stale content or missed dateModified update
├── REPRESENTATION_GAP           (I) → Hallucination or fact distortion despite source
├── AUTHORITY_GAP                (J) → Displaced in retrieval by Wikipedia, PIB, or RBI
├── ENGINE_SPECIFIC_BEHAVIOR     (K) → Policy refusal, proprietary filter, or hallucination
└── UNKNOWN_INSUFFICIENT_EVIDENCE(L) → Unobserved, internal health 100%, empirical cause unverified
```

---

## 8. Data Quality & Adversarial Test Coverage

The GEO measurement engine is protected by `tests/geo-measurement-stress.test.ts` (130 automated assertions, 100% green):
- 10 distinct adversarial observation scenarios (unobserved, answer without mention, mention without citation, wrong URL, correct URL, correct URL with hallucination, wrong entity, stale answer, partially supported answer, contradictory answer).
- 5 data quality invariants (rejection of accuracy when answer absent, rejection of citation correctness when uncited, rejection of citation URL when uncited, rejection of SSRF/169.254. URLs, rejection of future timestamps).
- 13 diagnostic decision engine checks validating the 12-factor failure classification hierarchy.
- Forensic audit runner (`npm run geo:diagnostics`) evaluating all 7 physical and semantic vectors against production.

---

## 9. Limitations & Responsible Communication

### What We Can Claim Today:
- The Breakdown OS has deployed a complete, production-verified AEO and GEO machine-readable discovery layer (`news-sitemap.xml`, `llms.txt`, Speakable JSON-LD, FAQPage schema, author registry).
- The measurement and data collection infrastructure is live in Supabase PostgreSQL with strict RLS and zero synthetic fabrications.
- The T0 baseline is documented and verifiable.

### What We CANNOT Claim Today:
- *"The Breakdown is now highly visible to AI."* (False: the public domain is fresh and external crawl cycles take days to weeks).
- *"The Breakdown has a high GEO accuracy score."* (False: average accuracy is currently `NULL` because no external LLMs have retrieved the site yet).

---

## 10. Longitudinal Follow-Up Plan (T1, T2, T3)

1. **T1 (Day 7 — 2026-10-06):**
   - Check Google Search Console URL Inspection for XML sitemaps.
   - Re-run all 10 queries via Perplexity, ChatGPT, and Google Search.
   - Record T1 observations in `public.ai_visibility_observations`.
2. **T2 (Day 14 — 2026-10-13):**
   - Inspect Bing Webmaster Tools and Perplexity indexation signals.
   - Audit first emerging citations for correct canonical URL structure.
3. **T3 (Day 30 — 2026-10-29):**
   - Calculate first 30-day Citation Rate and Citation Accuracy Rate.
   - Execute claim-level validation on all retrieved answers.
   - Report trend lines in monthly editorial governance dashboard.
