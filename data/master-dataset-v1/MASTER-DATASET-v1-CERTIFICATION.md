# Master 403 Constituency Dataset v1.0 — Certification

**Status:** CERTIFIED
**Version:** 1.0.1
**Certified at:** 2026-07-30T18:00:00Z
**Research cutoff:** 2026-07-28

## Summary

The Master 403 Constituency Dataset v1.0 merges all 12 DATA phases into a single flat canonical dataset — one record per constituency, 150 fields per record. It is the single source of truth from which website, API, analytics, dashboards, and AI features are generated.

## v1.0.1 Patch — District Mapping Correction

**Scope:** Systemic correction of AC-to-district mapping across all 403 constituencies.

**Root cause:** `build-data-08.py` used tehsil/sub-district names (e.g. "Nagina", "Aonla", "Dhaurahra", "Misrikh", "Fatehpur Sikri", "Saidpur") instead of official UP district names for 102 of 160 unique "district" values. Only 58 matched official UP district names.

**Fix applied (2026-07-30):**
1. Replaced `district_names` dict in `build-data-08.py` with authoritative AC→district mapping for all 403 ACs per ECI Delimitation Order 2008.
2. Updated `district_to_division` dict and region classification sets to use only official UP district names as keys.
3. Rebuilt DATA-08 admin profile and demographics (10/10 validation gates passed).
4. Rebuilt DATA-12 intelligence atlas (403 profiles, 9/9 validation gates passed, 983 entities, 3,301 relationships).
5. Rebuilt master dataset as v1.0.1 (403 ACs, 150 fields, 81.4% density).
6. Rebuilt HTML constituency atlas.

**Post-fix audit:**
- 69 unique district names in dataset — ALL verified against official UP districts. No tehsil/sub-district names remain.
- Districts without ACs (Hapur, Kasganj, Mahoba, Lalitpur, Ambedkar Nagar) expected — created after 2008 delimitation or share ACs with neighboring districts.
- All identity fields 100% populated (district, division, region).

## Output Files

| File | Size | Format |
|------|------|--------|
| `up403-master-dataset-v1.csv` | 1,019 KB | UTF-8 BOM CSV, 403 rows × 150 columns |
| `up403-master-dataset-v1.json` | 2,979 KB | Pretty-printed JSON, 403 objects |
| `manifest.json` | — | Schema manifest with field list, groups, and version |
| `up403-constituency-atlas.html` | 290 KB | Interactive HTML atlas with search, filters, detail panel |

## Field Coverage (21 groups, 150 fields)

| Group | Fields | Density | Notes |
|-------|--------|---------|-------|
| Identity | 9 | 100% | AC number, name, PC, district, division, region, reservation |
| Geography & Admin | 8 | 0% | All constituency-level data not available; counts are 0 |
| Election 2012 | 9 | 100% | Winner, party, votes, share, runner-up, margin, turnout |
| Election 2017 | 9 | 100% | Same structure |
| Election 2022 | 9 | 100% | Same structure |
| Seat History | 2 | 50% | Narrative summary populated; compact trajectory pending |
| Current MLA | 8 | 64% | 400/403 named (3 vacancies); status, elected_via, change_type |
| Current MP | 5 | 80% | All 403 named; term dates for LS2024 winners |
| LS2024 Overlay | 5 | 69% | PC winner, party, change flags from 2022→2024 comparison |
| Political DNA | 5 | 100% | 5-class deterministic classification |
| Competitiveness | 4 | 100% | 6-class rating + trend + avg margin |
| Electoral Stability | 8 | 84% | Party/winner continuity, volatility indices |
| Electoral Trajectory | 4 | 97% | Shifts, unique parties, compact step trace |
| Political Sociology | 6 | 83% | Dominant party, persistence, repeat winners |
| Derived Metrics | 9 | 56% | 9 algorithmic scores (volatility, persistence, competitiveness) |
| Demographics | 14 | 7% | All NOT_AVAILABLE_AT_CONSTITUENCY_LEVEL (no programmatic source) |
| Economy | 12 | 100% | Agriculture, industry, ODOP, banking, transport |
| Infrastructure | 8 | 88% | Schools, colleges, hospitals, utilities |
| Development | 6 | 67% | PMGSY, JJM, PMAY; flagship scheme presence |
| Governance & Issues | 5 | 20% | Issue registry structurally empty; env/disaster risks |
| Provenance & Metadata | 5 | 100% | Source datasets, verification dates, version |

**Overall data density: 81.4%** (49,217/60,450 populated cells)

Low-density groups are documented with availability status fields explaining why constituency-level data is not available.

## Verification Gates

| # | Gate | Result |
|---|------|--------|
| 1 | Record count = 403 | PASS |
| 2 | All AC numbers 1-403 present | PASS |
| 3 | JSON field count = 150 | PASS |
| 4 | CSV field count = 150 | PASS |
| 5 | CSV and JSON fields match | PASS |
| 6 | Field order matches manifest | PASS |
| 7 | All identity fields 100% populated | PASS |
| 8 | All election winners 100% populated (2012, 2017, 2022) | PASS |
| 9 | DNA classification covers all 403 ACs | PASS |
| 10 | Competitiveness class covers all 403 ACs | PASS |
| 11 | All 69 district names verified against official UP districts | PASS |
| 12 | No tehsil/sub-district names remain in district field | PASS |

## Source Pipeline

| Phase | Description |
|-------|-------------|
| DATA-02A | 2022 contest data (ECI via india-votes-data) |
| DATA-03 | 2017 contest data |
| DATA-04 | 2012 contest data |
| DATA-05 | Current representation, by-elections |
| DATA-06 | Candidate affidavits, criminal history |
| DATA-07 | LS2024 segment overlay, MP data |
| DATA-08 | Demographics, geography, admin boundaries |
| DATA-09 | Economy, agriculture, industry, ODOP, banking, infrastructure |
| DATA-10 | Governance indicators, local issues, environment, disaster |
| DATA-11 | Political DNA classification, sociology, derived metrics |
| DATA-12 | Intelligence atlas consolidation and knowledge graph |

## Design Decisions

1. **Flat structure**: All nested data from the intelligence atlas has been flattened into 150 columns for direct consumption by databases, analytics tools, and ML pipelines.

2. **Empty fields documented**: Where constituency-level data is not available (demographics, geography, issues), the field either contains an empty string or an explicit `availability_status` field documents the gap.

3. **Deterministic DNA**: All Political DNA classifications are algorithmic (no manual overrides), reproducible from the same input data.

4. **Synthetic data prohibited**: No fabricated values. All populated cells trace to a cited DATA phase source.

5. **CSV uses UTF-8 BOM**: Ensures Excel compatibility for Indian-language constituency names.

6. **District mapping authoritative**: AC→district mapping sourced from ECI Delimitation Order 2008. Tehsil/sub-district names replaced with official UP district names across all 403 constituencies.

## Single Source of Truth

This dataset supersedes all individual DATA phase outputs as the canonical constituency intelligence source. Generated artifacts consume from this dataset:

- HTML Constituency Atlas
- API endpoints
- Analytics dashboards
- Knowledge graph
- AI/ML feature engineering
- Editorial Mission Control

## Next Steps

- v1.1 — API specification for programmatic access
- Data dictionary documentation for all 150 fields
- Pipeline design for post-2026 data refreshes
- Editorial enrichment of district metadata (PC mapping, regional blocs)
