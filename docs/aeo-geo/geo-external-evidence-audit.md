# The Breakdown OS — GEO External Evidence Pre-Implementation Audit

**Audit Date:** 2026-09-29  
**Phase:** UNKNOWN → EMPIRICALLY SUPPORTED DIAGNOSTIC ATTRIBUTION  
**Governing Standard:** Editorial Constitution §XIII, AGENTS.md, `docs/aeo-geo/architecture.md`  

---

## 1. Executive Summary

This audit establishes the empirical boundaries of external evidence collection before implementing the **External Evidence Bridge v1.1**.

### Current System Truth:
- **Baseline:** T0 (2026-09-29)
- **Benchmark Corpus:** Q001–Q010 (10 canonical queries)
- **External Search Retrieval:** `NOT_RETRIEVED` (0/10 observed on public generative surfaces)
- **External Index Status:** `INDEX_STATUS_UNKNOWN` (10/10)
- **Diagnosis:** `UNKNOWN_INSUFFICIENT_EVIDENCE` (10/10)
- **Local Readiness:** 94.5% average (Technical, Schema, Canonical, Semantic coverage)
- **Core Doctrine:** Local readiness (94.5%) measures internal indexability and content representation only. It must **never** be conflated with external GEO retrieval or indexation. External retrieval score remains `NULL` until empirical external citations occur.

---

## 2. Evidence Source Audit Matrix

### A. Which External Evidence Sources Are Currently Available?
1. **Live Production HTTP & Edge Telemetry:** Direct HTTPS probing of `https://thebreakdown.in` yielding HTTP status, latency, headers (`x-robots-tag`, `x-vercel-id`), served canonical tags, and rendered Schema.org markup.
2. **Public Discovery Endpoints:** Real-time fetching and validation of `/robots.txt`, `/sitemap.xml`, `/news-sitemap.xml`, `/feed.xml` (RSS), and `/llms.txt`.
3. **Local Semantic Content Model:** Analysis of required information units against rendered story text in the canonical database.
4. **Structured Operator-Assisted Ingestion:** Verified manual evidence import format (`scripts/import-external-evidence.ts`) for Google Search Console URL inspection exports and browser SERP audits.

### B. Which Credentials Already Exist in Environment?
- `DATABASE_URL` / `TEST_DATABASE_URL`: **AVAILABLE** (Supabase PostgreSQL connection).
- `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` / `GSC_API_KEY`: **NOT CONFIGURED** (No service account or OAuth tokens exist in `.env.local` or `.env.test`).
- `BING_WEBMASTER_API_KEY`: **NOT CONFIGURED**.
- `INDEXNOW_KEY`: **NOT CONFIGURED**.
- Third-party SERP/Backlink APIs (Ahrefs, Semrush, SerpApi): **NOT CONFIGURED**.

### C. Which Signals are Currently `NOT_TESTED`?
1. `google_index_status` (Whether URL is `INDEXED` or `CRAWLED_NOT_INDEXED` or `URL_NOT_ON_GOOGLE`).
2. `bing_index_status` (Bing index coverage).
3. `crawler_edge_visits` (Server access log timestamps of Googlebot/PerplexityBot requests).
4. `measured_backlink_gap` (Empirical domain rating / referring domain counts vs competitors).
5. `repeated_serp_displacement` (Multi-engine position tracking across days).

### D. Which Signals Can Be Collected Automatically?
- Live HTTP status code and roundtrip latency.
- Served canonical tag identity and verification against the target URL.
- Schema.org JSON-LD structural validity and author identity verification.
- Content intent coverage rate across defined information units.
- Discovery endpoint availability (`robots.txt`, `sitemap.xml`, `news-sitemap.xml`, `llms.txt`, `feed.xml`).

### E. Which Signals Require Manual Operator Input?
- Google Search Console URL Inspection exports (manual inspection from Search Console web UI).
- Bing Webmaster Tools URL status exports.
- Browser-based manual SERP audits (observing query positions and competitor citations).
- Real-time LLM chat interface observations (ChatGPT, Perplexity, Claude, Copilot web browsing responses).

### F. Which Signals Must Remain `UNKNOWN` Under Current Automated Telemetry?
- Any signal requiring authenticated Google Search Console or Bing Webmaster APIs must remain **`INDEX_STATUS_UNKNOWN`**.
- Any diagnostic attribution for unobserved queries where internal health is 100% must remain **`UNKNOWN_INSUFFICIENT_EVIDENCE`**.
- Competitor displacement without empirical backlink data must remain **`UNKNOWN`** or **`HYPOTHESIS`**, never `CONFIRMED`.

---

## 3. Epistemic Guardrails for External Evidence Bridge v1.1

1. **Independent Engine Storage:** Google and Bing index statuses must be stored in independent fields (`google_index_status` vs `bing_index_status`). They must never be conflated.
2. **Authority Gap Hardening:** An observed competitor citation alone does NOT prove `AUTHORITY_GAP`. It requires measured backlink, domain rating, or repeated SERP displacement data. Without these, it remains a hypothesis.
3. **Canonicalization Gap Hardening:** Differentiate between:
   - Wrong URL + canonical conflict (`CANONICALIZATION_GAP`)
   - Wrong URL + redirect to canonical (`CITATION_REDIRECT_RESOLVED`)
   - Wrong URL + alternate representation (`CITATION_SELECTION_GAP`)
   - Unknown relationship (`UNKNOWN`)
4. **Metric Naming:** Rename "Local Readiness Score" to **`LOCAL_EVIDENCE_READINESS`** to make it obvious that it is an internal serving readiness metric, not external GEO visibility.
5. **Operator Fallback Ingestion:** Provide `scripts/import-external-evidence.ts` with strict schema validation so operators can import verified GSC exports without inventing data.
