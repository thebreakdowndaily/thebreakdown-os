# The Breakdown OS — GEO Diagnostic Attribution & Retrieval Gap Framework

**Version:** 1.0  
**Status:** Canonical Architectural Standard  
**Last Updated:** 2026-09-29  
**Governing Documents:**
- `docs/aeo-geo/architecture.md` (Phase 12 — GEO Measurement Foundation)
- `docs/aeo-geo/11-measurement-baseline.md` (Representation Integrity & Metrics)
- `AGENTS.md` (Definition of Done & Platform Beta Doctrine)
- `docs/editorial/editorial-constitution.md` §XIII & §XIV (Defensibility & Quality Gates)

---

## 1. Executive Summary & Core Doctrine

The Breakdown OS evaluates discovery, retrieval, citation, and representation through a decoupled, multi-dimensional lens. The foundational doctrine of our measurement engineering is:

> **Core Doctrine 1:** Never confuse "No Retrieval" with "Indexing Failure".  
> **Core Doctrine 2:** Never confuse "No Retrieval" with "Inaccuracy" (`answer_accuracy` remains `NULL` when `observation_state = NOT_OBSERVED`).  
> **Core Doctrine 3:** A `NOT_OBSERVED` observation means strictly: *"The tested engine/surface did not produce an observation of The Breakdown for this query at this measurement point."*  
> **Core Doctrine 4:** The root cause of non-retrieval must remain `UNKNOWN_INSUFFICIENT_EVIDENCE` until explicit forensic diagnostic signals prove an internal defect or empirical indexing error.

Pre-emptively labeling an unobserved query as an "indexing gap" when internal HTTP reachability, canonical integrity, Schema.org validity, and content coverage are 100% verified violates the scientific integrity of GEO measurement.

---

## 2. The 12-Factor Diagnostic Attribution Taxonomy

The platform classifies retrieval outcomes across 12 mutually exclusive, forensic failure modes (A through L), supported by database check constraints in Migration 019:

| Code | Failure Classification | Category | Technical Definition | Diagnostic Criteria |
|---|---|---|---|---|
| **A** | `INDEXING_DISCOVERY_GAP` | Technical / Crawler | Page not crawled, noindexed, robots.txt blocked, or verified absent from search engine index. | HTTP 4xx/5xx, `X-Robots-Tag: noindex`, `robots.txt` disallow, or GSC/Index inspection explicitly confirming "URL not on Google". |
| **B** | `RANKING_RETRIEVAL_GAP` | Information Retrieval | Page is indexed, but query ranked too low on search engine result pages (SERPs) to be ingested into LLM context window. | Empirical index probe confirms indexed, but outside top 10 SERP snippets selected for RAG prompt. |
| **C** | `ENTITY_RECOGNITION_GAP` | Knowledge Graph | Answer engine failed to resolve query concept to The Breakdown's canonical entity node (`sameAs`, Wikidata, DBpedia). | Entity exists in Breakdown index, but external LLM attributes claim to generic or wrong entity. |
| **D** | `CONTENT_GAP` | Editorial / Semantic | Query intent or specific substantive questions are not addressed in story body. | Forensic token audit reveals substantive query terms or core facts are missing from rendered HTML. |
| **E** | `EVIDENCE_GAP` | Sourcing / Rigor | Story addresses topic conceptually, but lacks primary data points, statutory citations, or empirical figures demanded by the prompt. | Primary source count = 0, or missing authoritative documentary references. |
| **F** | `STRUCTURED_DATA_GAP` | Semantic Markup | Schema.org markup is missing, malformed, non-compliant, or discarded by the crawler. | JSON-LD fails validator, lacks `NewsArticle` type, or has invalid author/publisher structure. |
| **G** | `CANONICALIZATION_GAP` | Architecture | Search engine or LLM selected a non-canonical, duplicate, or redirect URL instead of canonical URL. | Served canonical tag differs from expected canonical, or citation URL points to non-canonical route. |
| **H** | `FRESHNESS_GAP` | Temporal | Content is outdated, refers to superseded legislation, or lacks current temporal markers. | Observation freshness evaluated as `stale` or `outdated`, or schema dates older than competing articles. |
| **I** | `REPRESENTATION_GAP` | Alignment / Factuality | Story retrieved and cited, but LLM distorted facts, hallucinated claims, or inverted evidence. | Claim evaluation marked `CONTRADICTED` or `PARTIALLY_SUPPORTED`, or context integrity `distorted`. |
| **J** | `AUTHORITY_GAP` | Domain Authority | Breakdown content is sound, but superseded in retrieval by high-authority institutional sources (PIB, RBI, Wikipedia). | Competitor domains cited instead of The Breakdown despite equal or superior content coverage. |
| **K** | `ENGINE_SPECIFIC_BEHAVIOR` | LLM Architecture | Engine refused query, applied proprietary guardrails, hallucinated without search, or excluded site via UI filter. | Proprietary safety refusal, zero citations provided across all queries, or direct hallucination without RAG. |
| **L** | `UNKNOWN_INSUFFICIENT_EVIDENCE` | Epistemic Integrity | Retrieval was unobserved, but all internal forensic checks pass and external index/SERP logs are unavailable. | **Default state** for `NOT_OBSERVED` when internal health = 100% and no empirical crawler error is proved. |

---

## 3. Seven Forensic Diagnostic Verification Vectors

For every benchmark query, the diagnostic engine (`scripts/run-geo-diagnostics.ts`) audits seven distinct physical and logical vectors:

```
                          ┌───────────────────────────┐
                          │   Benchmark Query (Qxxx)  │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
   [1. HTTP Reachability]      [2. Canonical Integrity]      [3. Content & Keywords]
   • 200 OK Status             • Self-referential match      • Substantive term match
   • Latency < 1000ms          • Exact domain match          • Entity token presence
   • No "noindex" headers      • Zero root drift             • Key facts coverage
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
   [4. Evidence Grounding]     [5. Schema Validity]         [6. Index Probe Status]
   • Primary source count      • JSON-LD NewsArticle         • Indexed vs Not Indexed
   • Statutory references      • Correct author entity       • Crawl error status
   • Data citations            • SSRF / safe URLs            • GSC Inspection status
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
                                        ▼
                           [7. Competitor Evaluation]
                           • Institutional displacement
                           • Wikipedia / PIB / RBI citations
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │     diagnoseRetrievalGap() Engine    │
                     │                 │                    │
                     │   Internal 100%? → UNKNOWN (L)       │
                     │   Defect Found?  → Specific Gap      │
                     └──────────────────────────────────────┘
```

### Telemetry Payload Specification (`diagnostic_signals` JSONB)

```json
{
  "httpReachability": {
    "status": 200,
    "latencyMs": 636,
    "blockedByRobots": false,
    "xRobotsTag": null
  },
  "canonicalMatch": true,
  "canonicalServed": "https://thebreakdown.in/story/mgnrega-reform",
  "canonicalExpected": "https://thebreakdown.in/story/mgnrega-reform",
  "contentKeywordMatch": true,
  "keywordsFound": ["mgnrega", "reform", "challenges", "rural", "development", "wage", "guarantee", "work"],
  "keywordsMissing": [],
  "primarySourceCount": 3,
  "schemaValidity": true,
  "schemaTypes": ["NewsArticle", "FAQPage"],
  "indexProbe": "not_tested",
  "competitorCitations": [],
  "notes": "Forensic audit: HTTP 200 (636ms), Canonical: MATCH, Schema: VALID, Keywords: 8/3 matched."
}
```

---

## 4. Decision Engine Logic (`diagnoseRetrievalGap`)

Implemented in `lib/seo/geo-measurement.ts`, the decision hierarchy executes:

1. **If Cited Correctly (`OBSERVED_CORRECT_CITATION`):**
   - Check claim verdicts: If any claim is `CONTRADICTED` → `REPRESENTATION_GAP` (I).
   - Check freshness: If `freshness = 'stale'` or `'outdated'` → `FRESHNESS_GAP` (H).
   - Otherwise → No failure gap.

2. **If Cited Incorrectly (`OBSERVED_INCORRECT_CITATION`):**
   - Attribute to `CANONICALIZATION_GAP` (G).

3. **If Mentioned Without Citation (`OBSERVED_MENTION_NO_CITATION`):**
   - If facts distorted → `REPRESENTATION_GAP` (I).
   - If primary sources = 0 → `EVIDENCE_GAP` (E).
   - If competitors cited → `AUTHORITY_GAP` (J).

4. **If Answer Present But No Mention (`OBSERVED_NO_MENTION`):**
   - If keywords missing → `CONTENT_GAP` (D).
   - If schema invalid → `STRUCTURED_DATA_GAP` (F).
   - If primary sources = 0 → `EVIDENCE_GAP` (E).
   - If index probe = `indexed` → `RANKING_RETRIEVAL_GAP` (B).
   - If index probe = `not_indexed` → `INDEXING_DISCOVERY_GAP` (A).
   - Otherwise → `UNKNOWN_INSUFFICIENT_EVIDENCE` (L).

5. **If Unobserved (`NOT_OBSERVED`):**
   - If HTTP status ≠ 200 or robots blocked → `INDEXING_DISCOVERY_GAP` (A).
   - If canonical mismatch → `CANONICALIZATION_GAP` (G).
   - If schema invalid → `STRUCTURED_DATA_GAP` (F).
   - If keywords missing → `CONTENT_GAP` (D).
   - If primary sources = 0 → `EVIDENCE_GAP` (E).
   - If empirical index probe = `not_indexed` → `INDEXING_DISCOVERY_GAP` (A).
   - If empirical index probe = `indexed` → `RANKING_RETRIEVAL_GAP` (B).
   - **Default:** In the absence of conclusive empirical proof, attribute to `UNKNOWN_INSUFFICIENT_EVIDENCE` (L).

---

## 5. Remote Database Schema Evolution (Migrations 017–019)

The Supabase table `public.ai_visibility_observations` comprises 29 canonical columns protected by Row-Level Security:

```sql
-- Migration 019: Expanded Failure Classification Constraint
ALTER TABLE public.ai_visibility_observations
    ADD CONSTRAINT ai_visibility_observations_failure_classification_check
    CHECK (failure_classification IN (
        'INDEXING_DISCOVERY_GAP',
        'RANKING_RETRIEVAL_GAP',
        'ENTITY_RECOGNITION_GAP',
        'CONTENT_GAP',
        'EVIDENCE_GAP',
        'STRUCTURED_DATA_GAP',
        'CANONICALIZATION_GAP',
        'FRESHNESS_GAP',
        'REPRESENTATION_GAP',
        'AUTHORITY_GAP',
        'ENGINE_SPECIFIC_BEHAVIOR',
        'UNKNOWN_INSUFFICIENT_EVIDENCE',
        'DISCOVERY_GAP',
        'CANONICAL_GAP',
        'EXTERNAL_INDEXING_GAP',
        'UNKNOWN'
    ));

-- Telemetry column and GIN index for deep diagnostic querying
ALTER TABLE public.ai_visibility_observations
    ADD COLUMN IF NOT EXISTS diagnostic_signals JSONB;

CREATE INDEX IF NOT EXISTS idx_geo_obs_diag_signals 
    ON public.ai_visibility_observations USING gin(diagnostic_signals);
```

---

## 6. Empirical T0 Baseline Telemetry Audit

Executed against live production deployment (`https://thebreakdown.in`):

| Query ID | HTTP Status | Served Canonical | Schema Valid | Keywords Matched | Diagnostic Attribution |
|---|---|---|---|---|---|
| **Q001** (1962 Border) | 200 OK (1874ms) | MATCH | VALID | 5/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q002** (RBI Repo) | 200 OK (786ms) | MATCH | VALID | 7/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q003** (MGNREGA) | 200 OK (636ms) | MATCH | VALID | 8/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q004** (UPI Payments) | 200 OK (604ms) | MATCH | VALID | 5/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q005** (PMFBY Claims) | 200 OK (711ms) | MATCH | VALID | 9/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q006** (Semiconductors) | 200 OK (425ms) | MATCH | VALID | 5/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q007** (DPDP Act) | 200 OK (431ms) | MATCH | VALID | 9/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q008** (Panchsheel) | 200 OK (621ms) | MATCH | VALID | 7/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q009** (Climate Finance) | 200 OK (601ms) | MATCH | VALID | 6/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |
| **Q010** (Groundwater) | 200 OK (663ms) | MATCH | VALID | 6/3 | `UNKNOWN_INSUFFICIENT_EVIDENCE` |

### Audit Conclusion

1. **Internal Architecture:** 100% healthy across all tested endpoints.
2. **Absence of Retrieval:** Accurately classified as `UNKNOWN_INSUFFICIENT_EVIDENCE`.
3. **Traceability:** Complete JSONB telemetry preserved in PostgreSQL.
4. **Follow-Up (T1):** The automated runner (`npm run geo:diagnostics`) will probe Search Console and LLM surfaces to track the emergence of citations as crawler cycles complete.
