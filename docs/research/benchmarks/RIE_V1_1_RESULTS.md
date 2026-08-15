# RIE v1.1 Recall Benchmark — Results

**Timestamp:** 2026-08-15T12:26:55.405Z
**Corpus Version:** 1.1
**Benchmark Tag:** rie-v1.1-expanded
**Approved Sources Count:** 15

## Aggregate Performance

| Metric | Value |
|--------|-------|
| Overall Source Recall | 64.7% |
| Primary Source Recall | 53.3% |
| Independent Publisher Recall | 0.0% |
| Regional Source Recall | 13.3% |
| Regional Source Discovery Recall | 100.0% |
| Regional Entity Recall | 46.7% |
| Translation Preservation Rate | 100.0% |
| Claim Extraction Recall | 28.9% |
| Event Extraction Recall | 33.3% |
| Retrieval Precision | 7.5% |
| Independent Publisher Ratio | 80.4% |
| Median TTD (hours) | 0.1 |

## Latency Distributions (hours)

| Metric | n | Mean | Min | Median | p90 | p95 | Max |
|--------|---|------|-----|--------|-----|-----|-----|
| First-Source Discovery | 2 | 0.04 | 0.01 | 0.04 | 0.07 | 0.08 | 0.08 |
| Primary-Source Discovery | 2 | 0.04 | 0.01 | 0.04 | 0.07 | 0.08 | 0.08 |
| Independent Corroboration | 1 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 |

## Environmental Breakdown

| Environment | Recall | Eligible | Recalled |
|-------------|--------|----------|----------|
| official | 60.0% | 5 | 3 |
| court | 66.7% | 3 | 2 |
| regulator | 60.0% | 5 | 3 |
| regional | 75.0% | 4 | 3 |

## Language Breakdown

| Language | Recall | Eligible | Recalled |
|----------|--------|----------|----------|
| English | 50.0% | 12 | 6 |
| Hindi | 100.0% | 4 | 4 |
| Malayalam | 100.0% | 1 | 1 |

## Miss Diagnostics (Source Recall failures)

| Topic ID | Gold Source URL | Classification | Reason |
|----------|-----------------|----------------|--------|
| `topic-dpdp-2023` | `https://www.meity.gov.in/writereaddata/files/Digital-Personal-Data-Protection-Act-2023.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-dpdp-gazette (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-kashmir-un-1948` | `https://undocs.org/S/RES/47(1948)` | **PRIMARY_SOURCE_GAP** | Gold source gold-kashmir-unres-47 (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-karnataka-res` | `https://www.karnataka.gov.in/press-release/local-candidates-private-sector-employment-bill-2024.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-karnataka-bill-pr (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-ngt-wghats` | `https://greentribunal.gov.in/orders/ngt-western-ghats-esa-direction-2024.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-ngt-wghats-order (REGULATORY, REGULATORY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-mumbai-metro` | `https://cmrs.gov.in/certifications/mumbai-metro-line-3-phase-1-safety-clearance.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-mumbai-metro-safety (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-sebi-adani` | `https://www.sebi.gov.in/sebiweb/home/warning-letters/sebi-administrative-warning-adani-disclosures.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-sebi-adani-warning (REGULATORY, REGULATORY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |

