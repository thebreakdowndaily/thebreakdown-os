# Forensic Audit of the GEO Diagnostic & Attribution Engine

**Audit Date:** 2026-09-29  
**Target:** The Breakdown OS (`https://thebreakdown.in`)  
**Scope:** Diagnostic Engine, Discovery Endpoints, Schema, Index Probing, and Attribution Logic  
**Governing Standard:** Editorial Constitution §XIII, AGENTS.md, `docs/aeo-geo/architecture.md`  

---

## 1. Executive Summary

A forensic review of `lib/seo/geo-measurement.ts`, `scripts/run-geo-diagnostics.ts`, `scripts/record-t0-baseline.ts`, `scripts/verify-production-aeo-geo.ts`, and database migrations 017–019 was performed.

The objective is to establish an unassailable evidentiary baseline: distinguishing **empirically collected evidence** from **inferences**, identifying what is **not tested**, and defining precisely which failure modes can and cannot be confirmed under current telemetry.

---

## 2. Evidence Categorization Matrix

### A. What Evidence is Actually Collected? (Empirical Local & Live Probing)

| Signal / Vector | Collection Method | Data Source | Reliability |
|---|---|---|---|
| **HTTP Status Code** | HTTPS GET probe in `scripts/run-geo-diagnostics.ts` | Live Production Server (`thebreakdown.in`) | 100% Empirical (200 OK across all 10 target routes) |
| **Response Latency** | Timing HTTPS roundtrip | Live Production Edge (Vercel HKG/IAD) | 100% Empirical (425ms – 1874ms) |
| **`X-Robots-Tag` Header** | Header extraction from HTTPS response | Live Server Headers | 100% Empirical (null / no `noindex` emitted) |
| **Served Canonical Tag** | Regex extraction of `<link rel="canonical">` | Rendered HTML Document | 100% Empirical (Self-referential match on all 10 routes) |
| **Robots.txt Directives** | Fetch `/robots.txt` and parse rules | Live Production Server | 100% Empirical (`User-Agent: *` allows `/story/`, `/series/`, `/entity/`) |
| **XML Sitemaps** | Fetch `/sitemap.xml` and `/news-sitemap.xml` | Live Production Endpoints | 100% Empirical (Valid XML, declares canonical URLs, 200 OK) |
| **Machine Manifest (`llms.txt`)**| Fetch `/llms.txt` | Live Production Endpoint | 100% Empirical (Declares newsroom identity, guidelines, stories) |
| **RSS / Atom Feeds** | Fetch `/feed.xml` | Live Production Endpoint | 100% Empirical (RSS 2.0 XML with story items) |
| **Schema.org JSON-LD** | JSON parsing of `<script type="application/ld+json">` | Rendered HTML Document | 100% Empirical (`NewsArticle`, `Organization`, `FAQPage`, author URL valid) |
| **Keyword Substring Presence**| Substantive term match against HTML body | Rendered HTML Document | 100% Empirical (Target terms present in rendered DOM) |
| **Primary Sourcing Rigor** | Count and classification of primary source types | Content Model / Registry | 100% Empirical (Statutes, committee reports, official datasets) |
| **External Retrieval Probe** | Direct query to search interface / LLM web mode | External surface at T0 | 100% Empirical (The Breakdown was unobserved across surfaces) |

---

### B. What Evidence is Merely Inferred? (Causal & Behavioral Assumptions)

1. **Inference of Indexing Absence from Retrieval Absence:**
   - *Previous assumption:* If an LLM or search engine does not return The Breakdown at T0, the page must not be indexed (`EXTERNAL_INDEXING_GAP`).
   - *Flaw:* A page can be fully indexed by Googlebot or Bingbot, but ranked on page 5 or excluded from the top-10 snippet context window passed to an LLM prompt. Absence of retrieval does NOT prove absence from the index.
2. **Inference of Content Comprehensiveness from Keyword Counts:**
   - *Previous assumption:* If 8 keywords appear in the document body, the story satisfies the query intent.
   - *Flaw:* Keyword presence does not evaluate whether all required information units (e.g., effective date, administrative mechanism, legal citations, budget allocation) are answered.
3. **Inference of Crawler Ingestion from Sitemap Accessibility:**
   - *Previous assumption:* Serving a 200 OK on `/sitemap.xml` and `/news-sitemap.xml` means search engines have processed them.
   - *Flaw:* Sitemaps are submission signals. Until Google Search Console or Bing Webmaster reports crawl logs, crawler pickup is an inference.

---

### C. What Evidence is Currently NOT_TESTED? (Telemetry Gaps)

1. **Google Search Console (GSC) URL Inspection API:**
   - Real-time index coverage state (`INDEXED`, `CRAWLED_CURRENTLY_NOT_INDEXED`, `DISCOVERED_CURRENTLY_NOT_INDEXED`, `URL_NOT_ON_GOOGLE`).
   - *Status:* **`NOT_TESTED`** (GSC API credentials are not provisioned in the repository environment).
2. **Bing Webmaster Tools API:**
   - Bing index status and IndexNow submission feedback.
   - *Status:* **`NOT_TESTED`**.
3. **Edge Crawler Bot Log Analysis:**
   - Real server access logs filtering for verified `Googlebot`, `Bingbot`, `GPTBot`, `PerplexityBot`, or `ClaudeBot` IP ranges.
   - *Status:* **`NOT_TESTED`** (Access logs reside in Cloudflare / Vercel Enterprise telemetry, not local code).
4. **Independent Backlink & Domain Authority Telemetry:**
   - Third-party link graph data (Ahrefs, Moz, Majestic, OpenAlex citation index) measuring domain rating vs competitors (PIB, RBI, Wikipedia).
   - *Status:* **`NOT_TESTED`**.
5. **Model Ingestion vs Real-Time Search RAG Attribution:**
   - Whether an engine retrieved The Breakdown via live browsing (RAG) versus model parametric weights.
   - *Status:* **`NOT_TESTED`** (Requires structured prompt comparison with search enabled vs disabled).

---

### D. Which Classifications Can Currently Be CONFIRMED?

Under current instrumentation, only classifications with **direct internal or live surface proof** can be confirmed:

| Classification | Conclusive Test Available | Current Telemetry State |
|---|---|---|
| `INDEXING_DISCOVERY_GAP` (A) | **YES** — If HTTP ≠ 200, `robots.txt` disallows, `noindex` header exists, or GSC confirms absent. | Confirmed NOT the cause internally (HTTP is 200, robots allow, no `noindex`). External status remains `NOT_TESTED`. |
| `CANONICALIZATION_GAP` (G) | **YES** — If served `<link rel="canonical">` mismatches expected URL or route redirects unexpectedly. | Confirmed NOT the cause (10/10 routes match canonical). |
| `STRUCTURED_DATA_GAP` (F) | **YES** — If JSON-LD fails Schema.org validation or lacks `NewsArticle` type. | Confirmed NOT the cause (10/10 routes pass forensic schema validator). |
| `CONTENT_GAP` (D) | **YES** — If semantic query requirements audit reveals key information units are absent from the document. | Evaluated via semantic query-requirements model. |
| `EVIDENCE_GAP` (E) | **YES** — If primary source count = 0 or statutory citations are missing. | Confirmed NOT the cause for baseline queries (all have verified primary sources). |
| `REPRESENTATION_GAP` (I) | **YES** — If an observed citation/mention makes claims contradicted by the story's evidence. | Only testable when retrieval/mention occurs (`OBSERVED`). |

---

### E. Which Classifications Are Currently Impossible to Confirm?

| Classification | Why Confirmation is Currently Impossible | Required Evidence to Resolve |
|---|---|---|
| `RANKING_RETRIEVAL_GAP` (B) | Requires knowing that the page IS indexed (`INDEXED_CONFIRMED`) before ranking failure can be asserted. | GSC URL Inspection confirming indexed + SERP position > 10. |
| `AUTHORITY_GAP` (J) | Requires comparative competitor backlink and SERP displacement data. | SERP citation logs showing Wikipedia/PIB/RBI cited for identical queries while Breakdown is excluded. |
| `ENGINE_SPECIFIC_BEHAVIOR` (K) | Requires explicit evidence of model safety refusal, policy block, or proprietary UI exclusion. | Raw response payload showing model refusal or policy disclosure. |
| `UNKNOWN_INSUFFICIENT_EVIDENCE` (L) | **This is the current truthful classification.** When internal health is 100% and external index telemetry is unavailable, attributing cause to anything else is speculative. | Gathering external index telemetry and SERP competitor data. |

---

## 3. Mandatory Engineering Next Steps

1. Implement formal **Evidence Status Model** (`NOT_TESTED`, `OBSERVED`, `SUPPORTED`, `CONFIRMED`, `CONTRADICTED`).
2. Separate **Index Evidence States** (`INDEXED_CONFIRMED`, `NOT_INDEXED_CONFIRMED`, `INDEX_STATUS_UNKNOWN`) from Retrieval States.
3. Transition **Content Gap** from raw keyword matching to a semantic **Query-Requirements Model** (`intent_coverage_rate`).
4. Establish the **Query Variant Framework** (`Qxxx-V1` ... `Qxxx-Vn`) preserving original benchmarks.
5. Create **Two Independent Scores**: Local Readiness Score vs External Retrieval Score.
6. Enforce **T0 Immutability**: All diagnostic assessments and evidence updates must be additive.
