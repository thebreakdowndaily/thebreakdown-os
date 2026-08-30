# RIE v1.2 Phase 2 — Regional Baseline

**Timestamp:** 2026-08-18T15:27:49.879Z
**Corpus Version:** 1.1
**Baseline Tag:** rie-v1.2-phase2-baseline
**Registry Sources (eligible):** 15

## Aggregate Performance

| Metric | Value |
|--------|-------|
| Overall Source Recall | 100.0% |
| Primary Source Recall | 93.3% |
| Independent Publisher Recall | 0.0% |
| Regional Source Recall | 13.3% |
| Regional Source Discovery Recall | 100.0% |
| Regional Entity Recall | 73.3% |
| Translation Preservation Rate | 100.0% |
| Claim Extraction Recall | 35.6% |
| Event Extraction Recall | 33.3% |
| Retrieval Precision | 9.5% |
| Independent Publisher Ratio | 85.3% |
| Median TTD (hours) | 0.1 |

## Environmental Breakdown

| Environment | Recall | Eligible | Recalled |
|-------------|--------|----------|----------|
| official | 100.0% | 5 | 5 |
| court | 100.0% | 3 | 3 |
| regulator | 100.0% | 5 | 5 |
| regional | 100.0% | 4 | 4 |

## Language Breakdown

| Language | Recall | Eligible | Recalled |
|----------|--------|----------|----------|
| English | 100.0% | 12 | 12 |
| Hindi | 100.0% | 4 | 4 |
| Malayalam | 100.0% | 1 | 1 |

## Gold Source Inventory

| Source ID | Topic | Category | Class | Language | Geography | Environment | Domain |
|-----------|-------|----------|-------|----------|-----------|-------------|--------|
| `gold-dpdp-gazette` | `topic-dpdp-2023` | PRIMARY | PRIMARY | English | national | official | `meity.gov.in` |
| `gold-ayodhya-sc-verdict` | `topic-ayodhya-2019` | COURT | PRIMARY | Hindi | national | court | `sci.gov.in` |
| `gold-ayodhya-regional-media` | `topic-ayodhya-2019` | REGIONAL | GENERAL_MEDIA | Hindi | national | court | `jagran.com` |
| `gold-rbi-mpc-statement` | `topic-rbi-2026` | REGULATORY | PRIMARY | English | national | regulator | `rbi.org.in` |
| `gold-kaleshwaram-cag-report` | `topic-kaleshwaram-cag` | PRIMARY | PRIMARY | English | state | regulator | `cag.gov.in` |
| `gold-bihar-panchayat-notif` | `topic-bihar-panchayat` | PRIMARY | PRIMARY | Hindi | local | regional | `panchayatiraj.bih.nic.in` |
| `gold-kashmir-unres-47` | `topic-kashmir-un-1948` | PRIMARY | PRIMARY | English | international | court | `undocs.org` |
| `gold-wayanad-malayalam-news` | `topic-wayanad-landslide` | REGIONAL | GENERAL_MEDIA | Malayalam | local | regional | `mathrubhumi.com` |
| `gold-panchsheel-treaty` | `topic-panchsheel-1954` | PRIMARY | PRIMARY | English | international | official | `pib.gov.in` |
| `gold-pmjay-audit-cag` | `topic-pmjay-audit` | PRIMARY | PRIMARY | English | national | regulator | `cag.gov.in` |
| `gold-karnataka-bill-pr` | `topic-karnataka-res` | PRIMARY | PRIMARY | English | state | regional | `karnataka.gov.in` |
| `gold-ngt-wghats-order` | `topic-ngt-wghats` | REGULATORY | REGULATORY | English | state | regulator | `greentribunal.gov.in` |
| `gold-mumbai-metro-safety` | `topic-mumbai-metro` | PRIMARY | PRIMARY | English | local | official | `cmrs.gov.in` |
| `gold-sebi-adani-warning` | `topic-sebi-adani` | REGULATORY | REGULATORY | English | national | regulator | `sebi.gov.in` |
| `gold-gst-mof-release` | `topic-gst-august` | PRIMARY | PRIMARY | English | national | official | `pib.gov.in` |
| `gold-gst-independent-report` | `topic-gst-august` | SECONDARY | HIGH_QUALITY_SECONDARY | English | national | official | `thehindu.com` |
| `gold-mh-cabinet-notif` | `topic-mh-portfolio` | PRIMARY | PRIMARY | Hindi | state | regional | `maharashtra.gov.in` |

## Mock Index Inventory

| Domain | Language | Class | Title |
|--------|----------|-------|-------|
| `meity.gov.in` | en | PRIMARY | The Digital Personal Data Protection Act, 2023 Gazette Notification |
| `sci.gov.in` | en | PRIMARY | M Siddiq (D) Thr Lrs v. Mahant Suresh Das & Ors Judgement |
| `jagran.com` | hi | GENERAL_MEDIA | अयोध्या विवाद पर सुप्रीम कोर्ट का ऐतिहासिक फैसला: हिंदू पक्ष को मिली व |
| `rbi.org.in` | en | PRIMARY | Monetary Policy Statement 2026-27 Resolution of the Monetary Policy Co |
| `cag.gov.in` | en | PRIMARY | Report of the Comptroller and Auditor General of India on Kaleshwaram  |
| `panchayatiraj.bih.nic.in` | hi | PRIMARY | पंचायती राज विभाग बिहार सरकार का ऑडिट रिपोर्ट २०२५ फंड विचलन दिशानिर्द |
| `undocs.org` | en | PRIMARY | Resolution 47 (1948) on the India-Pakistan Question |
| `mathrubhumi.com` | ml | GENERAL_MEDIA | വയനാട് ഉരുൾപൊട്ടൽ: മുന്നറിയിപ്പുകൾ നൽകുന്നതിൽ വീഴ്ച വരുത്തിയെന്ന് പ്രാ |
| `pib.gov.in` | en | PRIMARY | Agreement on Trade and Intercourse between Tibet Region of China and I |
| `cag.gov.in` | en | PRIMARY | Performance Audit of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana |
| `karnataka.gov.in` | en | PRIMARY | Karnataka Private Sector Local Candidates Employment Bill Cabinet Brie |
| `greentribunal.gov.in` | en | PRIMARY | Directives on Western Ghats Ecologically Sensitive Areas Finalization |
| `cmrs.gov.in` | en | PRIMARY | CMRS Safety Certification for Mumbai Metro Line-3 Phase-1 Operations |
| `sebi.gov.in` | en | PRIMARY | SEBI Administrative Warning on Related Party Disclosures compliance |
| `pib.gov.in` | en | PRIMARY | GST Revenue Collections for August 2026 hit record levels |
| `thehindu.com` | en | HIGH_QUALITY_SECONDARY | GST revenue collections hit record in August: Report |
| `maharashtra.gov.in` | hi | PRIMARY | महाराष्ट्र कैबिनेट मंत्रियों के विभाग आवंटन की आधिकारिक अधिसूचना २०२६ |
| `aninews.in` | en | SPECIALIST_MEDIA | RBI MPC keeps policy repo rate unchanged at 6.50% (reprint) |
| `economictimes.indiatimes.com` | en | HIGH_QUALITY_SECONDARY | RBI holds repo rate at 6.50% in August meeting |
| `example.com` | en | GENERAL_MEDIA | Stock market indices fluctuate amid global tech earnings results |

## Miss Diagnostics

| Topic ID | Gold Source ID | Gold URL | Classification | Language | Geography |
|----------|----------------|----------|----------------|----------|-----------|

