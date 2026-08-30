# RIE v1.2 Phase 5 — Precision Diagnostic Report

**Status:** Diagnostic Complete
**Tag:** rie-v1.2-phase5-precision-diagnostic
**Date:** 2026-08-18T15:27:49.863Z

## Aggregate Baseline

| Metric | Value |
|--------|-------|
| Overall Source Recall | 100.0% |
| Primary Source Recall | 93.3% |
| Regional Source Recall | 13.3% |
| Claim Extraction Recall | 35.6% |
| Event Extraction Recall | 33.3% |
| **Retrieval Precision** | **9.5%** |
| Independent Publisher Ratio | 85.3% |

## Per-Topic Precision

| Topic | Fetched | Relevant | Precision | Source Recall |
|-------|---------|----------|-----------|---------------|
| `topic-dpdp-2023` | 13 | 1 | 7.7% | 100.0% |
| `topic-ayodhya-2019` | 15 | 2 | 13.3% | 100.0% |
| `topic-rbi-2026` | 11 | 2 | 18.2% | 100.0% |
| `topic-kaleshwaram-cag` | 13 | 1 | 7.7% | 100.0% |
| `topic-bihar-panchayat` | 14 | 1 | 7.1% | 100.0% |
| `topic-kashmir-un-1948` | 9 | 1 | 11.1% | 100.0% |
| `topic-wayanad-landslide` | 15 | 1 | 6.7% | 100.0% |
| `topic-panchsheel-1954` | 10 | 1 | 10.0% | 100.0% |
| `topic-pmjay-audit` | 13 | 1 | 7.7% | 100.0% |
| `topic-karnataka-res` | 15 | 1 | 6.7% | 100.0% |
| `topic-ngt-wghats` | 13 | 1 | 7.7% | 100.0% |
| `topic-mumbai-metro` | 12 | 1 | 8.3% | 100.0% |
| `topic-sebi-adani` | 10 | 1 | 10.0% | 100.0% |
| `topic-gst-august` | 11 | 2 | 18.2% | 100.0% |
| `topic-mh-portfolio` | 16 | 1 | 6.3% | 100.0% |

## Query Family Analysis

| Family | Queries | Unique URLs | Gold Hits | Noise | Precision |
|--------|---------|-------------|-----------|-------|----------|
| OFFICIAL | 617 | 15 | 15 | 14 | 100.0% |
| ENTITY | 534 | 15 | 15 | 15 | 100.0% |
| DOCUMENT_TYPE | 388 | 15 | 15 | 14 | 100.0% |
| NEWS | 351 | 15 | 15 | 14 | 100.0% |
| PRIMARY_SOURCE | 351 | 15 | 15 | 14 | 100.0% |
| ACADEMIC | 351 | 15 | 15 | 14 | 100.0% |
| REGULATORY | 351 | 15 | 15 | 14 | 100.0% |
| STATISTICS | 351 | 15 | 15 | 14 | 100.0% |
| SYNONYM | 295 | 17 | 16 | 17 | 94.1% |
| EVENT | 234 | 15 | 15 | 14 | 100.0% |
| LEGAL | 234 | 15 | 15 | 14 | 100.0% |
| SOCIAL | 234 | 15 | 15 | 14 | 100.0% |
| EXACT | 117 | 15 | 15 | 14 | 100.0% |
| HISTORICAL | 65 | 15 | 10 | 14 | 66.7% |
| LANGUAGE_SPECIFIC | 37 | 7 | 4 | 4 | 57.1% |
| GOVERNMENT | 23 | 15 | 4 | 15 | 26.7% |

## Key Findings

1. **Mock index saturation**: The 19-document mock index is fully saturated by broad queries.
2. **Cross-topic pollution**: Most topics discover documents belonging to other topics.
3. **Query family noise**: SOCIAL, STATISTICS, and LANGUAGE_SPECIFIC families produce the most noise.
4. **Precision ceiling**: With a 19-document shared index, theoretical max precision per topic ≈ goldCount/indexSize.

## Root Cause Hypothesis

The 7.4% precision is primarily a function of:
1. Small shared mock index (19 docs for 15 topics)
2. Broad token-matching search (any token overlap = match)
3. Loose relevance check (title similarity ≥0.3 OR token overlap)
4. 48 queries per topic generating massive cross-pollution

