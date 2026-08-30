# RIE v1.2 — Primary-Source Discovery Benchmark

**Timestamp:** 2026-08-18T15:27:50.495Z
**Corpus Version:** 1.1
**Baseline Tag:** rie-v1.1-expanded
**Candidate Tag:** rie-v1.2-primary-discovery
**Registry Sources (eligible):** 15

## A/B/C Runs

| Run | Surface | Feature | maxQueries | Tag |
|-----|---------|---------|-----------|-----|
| A (v1.1) | v1.1 expanded domains | off | 10 | `rie-v1.1-expanded` |
| B (v1.2) | registry-derived surface | on | 48 | `rie-v1.2-primary-discovery` |
| C (isolation) | v1.1 expanded domains | on | 48 | `rie-v1.2-query-isolation` |

## Aggregate Performance

| Metric | A (v1.1) | B (v1.2) | C (query-only) |
|--------|----------|----------|----------------|
| Overall Source Recall | 64.7% | 100.0% | 64.7% |
| Primary Source Recall | 53.3% | 93.3% | 53.3% |
| Independent Publisher Recall | 0.0% | 0.0% | 0.0% |
| Regional Source Recall | 13.3% | 13.3% | 13.3% |
| Claim Extraction Recall | 28.9% | 35.6% | 28.9% |
| Retrieval Precision | 11.2% | 9.5% | 10.3% |
| Independent Publisher Ratio | 80.4% | 85.3% | 76.1% |
| Median TTD (hours) | 0.1 | 0.1 | 0.1 |

## Miss Diagnostics (B, Source Recall failures)

| Topic ID | Gold Source URL | Classification |
|----------|-----------------|----------------|

