# RIE v1.1 Recall Benchmark — Baseline

**Timestamp:** 2026-08-18T15:27:51.145Z
**Corpus Version:** 1.1
**Benchmark Tag:** rie-v1.0-baseline
**Approved Sources Count:** 15

## Aggregate Performance

| Metric | Value |
|--------|-------|
| Overall Source Recall | 5.9% |
| Primary Source Recall | 0.0% |
| Independent Publisher Recall | 0.0% |
| Regional Source Recall | 0.0% |
| Regional Source Discovery Recall | 73.3% |
| Regional Entity Recall | 46.7% |
| Translation Preservation Rate | 100.0% |
| Claim Extraction Recall | 26.7% |
| Event Extraction Recall | 26.7% |
| Retrieval Precision | 11.1% |
| Independent Publisher Ratio | 100.0% |
| Median TTD (hours) | 0.05 |

## Latency Distributions (hours)

| Metric | n | Mean | Min | Median | p90 | p95 | Max |
|--------|---|------|-----|--------|-----|-----|-----|
| First-Source Discovery | 1 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 |
| Primary-Source Discovery | 0 | N/A | N/A | N/A | N/A | N/A | N/A |
| Independent Corroboration | 1 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 |

## Environmental Breakdown

| Environment | Recall | Eligible | Recalled |
|-------------|--------|----------|----------|
| official | 20.0% | 5 | 1 |
| court | 0.0% | 3 | 0 |
| regulator | 0.0% | 5 | 0 |
| regional | 0.0% | 4 | 0 |

## Language Breakdown

| Language | Recall | Eligible | Recalled |
|----------|--------|----------|----------|
| English | 8.3% | 12 | 1 |
| Hindi | 0.0% | 4 | 0 |
| Malayalam | 0.0% | 1 | 0 |

## Miss Diagnostics (Source Recall failures)

| Topic ID | Gold Source URL | Classification | Reason |
|----------|-----------------|----------------|--------|
| `topic-dpdp-2023` | `https://www.meity.gov.in/writereaddata/files/Digital-Personal-Data-Protection-Act-2023.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-dpdp-gazette (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-ayodhya-2019` | `https://sci.gov.in/judgments/Ayodhya_Judgement_2019.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-ayodhya-sc-verdict (COURT, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-ayodhya-2019` | `https://www.jagran.com/news/national-ayodhya-verdict-supreme-court-judgment-hindi-19747582.html` | **LANGUAGE_GAP** | Gold source gold-ayodhya-regional-media (REGIONAL, GENERAL_MEDIA, lang=hi) not recalled; classified as LANGUAGE_GAP. |
| `topic-rbi-2026` | `https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=58102` | **PRIMARY_SOURCE_GAP** | Gold source gold-rbi-mpc-statement (REGULATORY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-kaleshwaram-cag` | `https://cag.gov.in/uploads/download_audit_report/2023/Report_No_6_of_2023_Kaleshwaram_Telangana.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-kaleshwaram-cag-report (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-bihar-panchayat` | `https://panchayatiraj.bih.nic.in/documents/audit-report-local-funds-2025.pdf` | **LANGUAGE_GAP** | Gold source gold-bihar-panchayat-notif (PRIMARY, PRIMARY, lang=hi) not recalled; classified as LANGUAGE_GAP. |
| `topic-kashmir-un-1948` | `https://undocs.org/S/RES/47(1948)` | **PRIMARY_SOURCE_GAP** | Gold source gold-kashmir-unres-47 (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-wayanad-landslide` | `https://www.mathrubhumi.com/rss/news/kerala-1.976543` | **LANGUAGE_GAP** | Gold source gold-wayanad-malayalam-news (REGIONAL, GENERAL_MEDIA, lang=ml) not recalled; classified as LANGUAGE_GAP. |
| `topic-panchsheel-1954` | `https://pib.gov.in/PressReleasePage.aspx?PRID=Panchsheel1954` | **PRIMARY_SOURCE_GAP** | Gold source gold-panchsheel-treaty (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-pmjay-audit` | `https://cag.gov.in/uploads/download_audit_report/2023/PMJAY_Audit_Report_2023.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-pmjay-audit-cag (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-karnataka-res` | `https://www.karnataka.gov.in/press-release/local-candidates-private-sector-employment-bill-2024.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-karnataka-bill-pr (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-ngt-wghats` | `https://greentribunal.gov.in/orders/ngt-western-ghats-esa-direction-2024.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-ngt-wghats-order (REGULATORY, REGULATORY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-mumbai-metro` | `https://cmrs.gov.in/certifications/mumbai-metro-line-3-phase-1-safety-clearance.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-mumbai-metro-safety (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-sebi-adani` | `https://www.sebi.gov.in/sebiweb/home/warning-letters/sebi-administrative-warning-adani-disclosures.pdf` | **PRIMARY_SOURCE_GAP** | Gold source gold-sebi-adani-warning (REGULATORY, REGULATORY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-gst-august` | `https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue` | **PRIMARY_SOURCE_GAP** | Gold source gold-gst-mof-release (PRIMARY, PRIMARY, lang=en) not recalled; classified as PRIMARY_SOURCE_GAP. |
| `topic-mh-portfolio` | `https://maharashtra.gov.in/cabinet/portfolio-allocation-2026.pdf` | **LANGUAGE_GAP** | Gold source gold-mh-cabinet-notif (PRIMARY, PRIMARY, lang=hi) not recalled; classified as LANGUAGE_GAP. |

