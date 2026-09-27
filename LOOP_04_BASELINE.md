# THE BREAKDOWN — LOOP 04 BASELINE AUDIT

**Loop:** `LOOP 04`  
**Mission:** Site-wide visual audit, forensic verification, alternative source discovery, and targeted remediation.  
**Baseline Git Commit:** `a4585d53a6f64ceac19fc72a81bd646a2eb10549`  
**Baseline Branch:** `main`  
**Working Tree Status:** Clean  
**Production Deployment:** `dpl_ALjpFqw7yHWR6PDsKDgj32yctW9u`  
**Canonical Domain:** `https://thebreakdown.in`  

---

## 1. System Inventory Baseline Counts

| Dimension | Count | Details / Verification Source |
|---|---|---|
| **Total Stories (All)** | 56 | 41 Public Published + 15 Quarantined Drafts (`ng-ch-01` .. `ng-ch-15`) |
| **Public Published Stories** | 41 | Verified via `utils/data-layer/store.ts` & `lib/story/publication.ts` |
| **Quarantined Draft Stories** | 15 | `namami-gange` investigation chapters quarantined from public feeds |
| **Topics** | 15 | Canonical topic directory (`lib/topics/directory.ts`) |
| **Entities** | 41 | Canonical knowledge entities (`data/entities`, `utils/data-layer/store.ts`) |
| **Timelines** | 13 | Structured historical event sequences (`utils/data-layer/store.ts`) |
| **Policy / Issue Trackers** | 4 | `mgnrega`, `pmfby`, `semiconductor`, `upi` (`lib/trackers/registry.ts`) |
| **Tracker Time-Series Datasets** | 6 | Multi-year quantitative series (loss ratios, volumes, spends, approvals) |
| **Verified Image Manifest Entries**| 25 | `lib/image-intelligence/manifest.ts` |
| **Total Static Image Assets (`public/`)** | 121 | Files ending in `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif` |
| **Total Vector SVGs (`public/`)** | 32 | Branded vector placeholders, diagrams, and historical vector maps |
| **Total Placeholders (`public/`)** | 13 | Category / domain themed vector placeholders |
| **Total Map Files (`public/`)** | 7 | Cartographic SVGs and raster maps (`public/images/library/`, etc.) |
| **Automated Image Gate Status** | **PASS** | 56/56 stories verified on disk, valid magic bytes, manifest-aligned |

---

## 2. Recent Repository Commits

- `a4585d5` docs(loop-03): close ISSUE-003 with verified production deployment dpl_ALjpFqw7yHWR6PDsKDgj32yctW9u
- `725e399` feat(visuals): deploy approved bespoke hero for accountability investigation and resolve ISSUE-003
- `50b0b54` docs(loop-02): close ISSUE-004 and ISSUE-005 with verified production deployment dpl_2i8DJHkHXRPqWsWjgpJoCTdmrwH2
- `4faf959` fix(seo,images): deduplicate index titles, align governance image intelligence, and add numeric integrity suite
- `49e6689` docs(release): record production deployment dpl_CWbyFsto7gnexxbWh3VoKyM2GB75

---

## 3. Scope of Loop 04 Visual Audit

The audit covers 100% of visual assets across the platform:
1. **Hero Images** across all 41 public stories and 15 quarantined drafts.
2. **Article Body Images & Diagrams** embedded in narrative chapters, case files, and timelines.
3. **Cartographic Maps** (e.g. `map-kashmir-1947.svg`, UP-403 maps, border maps).
4. **Data Visualizations & Quantitative Charts** (UPI rails, PMFBY insurance claims, MGNREGA expenditure, semiconductor capital outlay).
5. **Vector SVGs** across placeholders, diagrams, and icons.
6. **Topic & Entity Visuals** across `/topics` and `/entity/[slug]`.
7. **Social Sharing Assets** (OpenGraph `og:image` and Twitter cards).
8. **Responsive Derivatives** (mobile, webp, retina).
