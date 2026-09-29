# The Breakdown OS — GEO External Evidence Status Report v1.1

**System State:** Platform Beta — Evidence Attribution & External Decoupling  
**Date:** 2026-09-29  
**Target Domain:** `https://thebreakdown.in`  
**Database Schema:** PostgreSQL / Supabase Migrations 001–020  
**Governing Documents:**
- [`docs/aeo-geo/architecture.md`](file:///c:/newsjack-content/thebreakdown-os/docs/aeo-geo/architecture.md)
- [`docs/aeo-geo/diagnostic-attribution-framework.md`](file:///c:/newsjack-content/thebreakdown-os/docs/aeo-geo/diagnostic-attribution-framework.md)
- Editorial Constitution §XIII & §XIV (Defensibility, Verification & Quality Gates)

---

## 1. Executive Summary & Epistemic Doctrine

The GEO External Evidence Bridge v1.1 establishes an evidence attribution architecture that enforces complete separation between **internal site health** and **external discovery and retrieval**.

### Core Epistemic Directives

1. **Local Health Is Not External Indexing**:
   HTTP 200 responses, XML sitemaps, `robots.txt` directives, valid JSON-LD schemas, and 100% semantic content coverage establish **local discoverability and technical readiness only**. They are never substituted for external index confirmation.
2. **Two Decoupled Scores**:
   - `LOCAL_EVIDENCE_READINESS`: Evaluated per URL (0–100%). Average: **94.5%**.
   - `EXTERNAL_RETRIEVAL_SCORE`: Strictly **`NULL`** at T0 baseline until external search engine retrieval or LLM citation is empirically observed.
3. **Absence of Evidence is Not Evidence of Deficiency**:
   When external telemetry (Google Search Console URL inspection, Bing Webmaster tools, SERP rankings) is unavailable, observations are diagnosed as **`UNKNOWN_INSUFFICIENT_EVIDENCE`**. We never infer indexing failure or ranking gaps without empirical evidence.
4. **T0 Baseline Immutability**:
   The 10 canonical T0 baseline rows in `public.ai_visibility_observations` remain immutable. All subsequent evidence assessments, query variant evaluations, and diagnostic revisions are recorded additively in `public.geo_evidence_assessments`.

---

## 2. External Evidence Provider Status

The system abstracts external evidence acquisition through the [`ExternalEvidenceProvider`](file:///c:/newsjack-content/thebreakdown-os/lib/seo/external-evidence-providers.ts) interface. In adherence to the **Zero Fabrications Rule**, any provider lacking valid production API credentials reports `NOT_CONFIGURED` and sets signal status to `NOT_TESTED`.

| Provider | Type | Config Status | Signal Generated | Signal Status | Fallback Action |
|:---|:---|:---|:---|:---|:---|
| **Google Search Console** | Search Console API | `NOT_CONFIGURED` | `google_index_status` | `NOT_TESTED` | Operator export via `npm run geo:import-evidence` |
| **Bing Webmaster Tools** | Webmaster API | `NOT_CONFIGURED` | `bing_index_status` | `NOT_TESTED` | Operator export via `npm run geo:import-evidence` |
| **Search Observation** | Live / Manual Probe | `AVAILABLE` | `search_retrieval_status` | `OBSERVED` | Automated & manual evaluation runs |
| **Crawler Telemetry** | Edge / CDN Access Logs | `NOT_CONFIGURED` | `crawler_bot_access` | `NOT_TESTED` | Edge log ingestion pipeline |
| **Authority Data** | Backlinks / Domain Metrics | `NOT_CONFIGURED` | `authority_metrics` | `NOT_TESTED` | OpenAlex citation graph integration |

---

## 3. Queryable Evidence Graph: Q001–Q010 Benchmark

All 10 benchmark queries have been systematically evaluated against live production endpoints (`https://thebreakdown.in`) and persisted additively to `public.geo_evidence_assessments`.

| ID | Query Intent | Target Route | HTTP | Robots | Canonical | JSON-LD | Local Readiness | Intent Coverage | Google Index | Bing Index | External Retrieval | Diagnosis | Conf. |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---:|
| **Q001** | `historical_context` | `/story/india-china-1962` | 200 | ALLOW | MATCH | VALID | **100.0%** | **100.0%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q002** | `current_policy` | `/story/rbi-monetary-policy` | 200 | ALLOW | MATCH | VALID | **95.0%** | **75.0%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q003** | `controversial_issue` | `/story/mgnrega-reform` | 200 | ALLOW | MATCH | VALID | **90.0%** | **50.0%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q004** | `institutional_entity` | `/story/digital-payments-boom` | 200 | ALLOW | MATCH | VALID | **90.0%** | **50.0%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q005** | `data_evidence_query` | `/story/pm-fasal-bima-claims` | 200 | ALLOW | MATCH | VALID | **91.7%** | **58.3%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q006** | `definition` | `/story/semiconductor-pli` | 200 | ALLOW | MATCH | VALID | **95.0%** | **75.0%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q007** | `policy_impact` | `/story/dpdp-bill` | 200 | ALLOW | MATCH | VALID | **96.7%** | **83.3%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q008** | `source_specific` | `/story/indias-foreign-policy` | 200 | ALLOW | MATCH | VALID | **98.3%** | **91.7%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q009** | `comparative_question` | `/story/climate-finance` | 200 | ALLOW | MATCH | VALID | **93.3%** | **66.7%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |
| **Q010** | `timeline` | `/story/groundwater-depletion` | 200 | ALLOW | MATCH | VALID | **93.3%** | **66.7%** | `UNKNOWN` | `UNKNOWN` | `NULL` | `UNKNOWN_INSUFFICIENT_EVIDENCE` | 0.35 |

---

## 4. Hardened Diagnostic Attribution Logic

### Canonical Scenarios
The diagnostic attribution engine distinguishes four granular citation and canonical pathways:
1. **Wrong Citation URL + Clean 301/308 Redirect** → `CITATION_REDIRECT_RESOLVED` (confidence: 0.90)
2. **Wrong Citation URL + Canonical Conflict** → `CANONICALIZATION_GAP` (confidence: 0.95)
3. **Wrong Citation URL + Alternate Representation / Syndication** → `CITATION_SELECTION_GAP` (confidence: 0.85)
4. **Wrong Citation URL + Unverified Relationship** → `UNKNOWN_INSUFFICIENT_EVIDENCE` (confidence: 0.35)

### Authority Gap Hardening
- **Rule**: Competitor citation alone does **not** prove an `AUTHORITY_GAP`.
- If a competitor is cited while The Breakdown is unretrieved or unmentioned, but **no** external backlink or domain authority telemetry has been measured, the observation remains `UNKNOWN_INSUFFICIENT_EVIDENCE` (or an unproven hypothesis).
- `AUTHORITY_GAP` is confirmed **only** when empirical authority data (backlink gap, referring domain deficit, or proven SERP displacement) is provided.

### Engine Index Status Decoupling
- Google and Bing index statuses are evaluated and stored independently.
- If Bing is confirmed indexed while Google is unknown, Google retrieval failure remains `UNKNOWN_INSUFFICIENT_EVIDENCE` rather than assuming indexing parity.

---

## 5. Operator-Assisted Fallback Ingestion Pipeline

To incorporate real-world external evidence without waiting for direct API service account credentials, an operator-assisted CLI is provided:

```bash
# Ingest operator-verified inspection results with schema validation
npm run geo:import-evidence -- --file data/manual-external-evidence.json

# Dry run mode to validate format and preview diagnoses without database writes
npm run geo:import-evidence -- --dry-run
```

### Schema Validation Guarantees
- Rejects malformed structures, missing `queryId`, invalid `targetUrl`, and missing source provenance.
- Enforces strict enumerated values for `googleIndexStatus`, `bingIndexStatus`, `searchRetrieval`, `mentionStatus`, `citationStatus`, and `claimGrounding`.
- Flags and rejects invalid timestamp formats.

---

## 6. Adversarial Verification & Test Coverage

The test suite in [`tests/geo-measurement-stress.test.ts`](file:///c:/newsjack-content/thebreakdown-os/tests/geo-measurement-stress.test.ts) provides **153 automated assertions**, verifying all 16 required canonical adversarial scenarios:

1. **Adv 1**: Google indexed + not retrieved → `RANKING_RETRIEVAL_GAP` (Passed)
2. **Adv 2**: Google not indexed → `INDEXING_DISCOVERY_GAP` (Passed)
3. **Adv 3**: Google unavailable (`NOT_TESTED`) → `UNKNOWN_INSUFFICIENT_EVIDENCE` (Passed)
4. **Adv 4**: Bing indexed + Google unknown → `UNKNOWN_INSUFFICIENT_EVIDENCE` (Passed)
5. **Adv 5**: Sitemap declared + Google not indexed → `INDEXING_DISCOVERY_GAP` (Passed)
6. **Adv 6**: HTTP 200 + Google not indexed → `INDEXING_DISCOVERY_GAP` (Passed)
7. **Adv 7**: Canonical match + Google unknown → `UNKNOWN_INSUFFICIENT_EVIDENCE` (Passed)
8. **Adv 8**: Wrong citation + redirect works → `CITATION_REDIRECT_RESOLVED` (Passed)
9. **Adv 9**: Wrong citation + canonical conflict → `CANONICALIZATION_GAP` (Passed)
10. **Adv 10**: Competitor citation without authority evidence → `UNKNOWN_INSUFFICIENT_EVIDENCE` (Passed)
11. **Adv 11**: Competitor citation + measured authority evidence → `AUTHORITY_GAP` (Passed)
12. **Adv 12**: Local readiness 100% + external retrieval null → Valid independent states (Passed)
13. **Adv 13**: Local readiness 50% + external retrieval observed → Valid independent states (Passed)
14. **Adv 14**: Conflicting Google/Bing status → Independent reporting (Passed)
15. **Adv 15**: Stale/corrupt external evidence → Rejected by schema validator (Passed)
16. **Adv 16**: Malformed import payload → Rejected with detailed field errors (Passed)

### Master Loopback Gate Verification
All 6 master verification gates pass 100% green:
1. Forensic Schema.org & JSON-LD Validator: **PASS** (1,097 assertions)
2. Entity & Citation Graph Integrity Audit: **PASS**
3. Rendered Page Metadata & Canonical Audit: **PASS** (107 pages)
4. GEO Measurement Adversarial Stress Suite: **PASS** (153 assertions)
5. Security, SSRF & Adversarial Crawler Suite: **PASS**
6. Database Migration Safety Gate: **PASS** (20 migrations monotonic)
