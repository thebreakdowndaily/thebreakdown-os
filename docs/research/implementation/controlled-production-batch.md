# Controlled Production Batch — Design Document

**Date:** 20 Jul 2026
**Status:** DESIGN — Not yet executed
**Purpose:** Test operational scalability of the batch ingestion pipeline with 10-20 diverse constituencies

---

## Selection Criteria

The batch must include constituencies that exercise every evidence pattern and edge case the pipeline can encounter:

| Dimension | Minimum Coverage | Rationale |
|-----------|-----------------|-----------|
| Urban vs Rural | ≥3 urban, ≥3 rural | Urban = infrastructure projects, budget data; rural = scheme data, agricultural patterns |
| Reserved category | ≥2 SC, ≥1 ST | Reservation affects representation data |
| Boundary complexity | ≥2 with non-trivial boundaries | Tests geographic disambiguation |
| Major infrastructure | ≥3 with identifiable projects | Tests financial lifecycle tracking |
| Sparse data | ≥2 with NOT_FOUND gaps | Tests gap documentation and search protocols |
| Incumbent changes | ≥2 with recent turnover | Tests electoral chronology patterns |
| Politically volatile | ≥2 with party-switching | Tests contradiction pair detection |
| Different states | ≥3 different states | Tests cross-state schema consistency |
| Financial complexity | ≥3 with multi-source financials | Tests independent sourcing per stage |

---

## Proposed Constituencies (12 target)

### Tier 1 — Infrastructure-Heavy (financial lifecycle testing)

1. **Varanasi Cantt (UP-AC-390)** — Major infrastructure: Kashi Vishwanath Corridor, Rs 900+ crore
   - Pattern: Multiple financial stages, state + central funding
   - State: UP (consistency with pilot)

2. **Ahmedabad West (GJ-AC-61)** — Metro Phase 1, Rs 12,000+ crore
   - Pattern: Large-scale urban infrastructure, multi-year expenditure
   - State: Gujarat (new state)

3. **Mumbai South (MH-AC-191)** — Coastal Road, Rs 12,000+ crore
   - Pattern: Urban infrastructure, environmental controversy
   - State: Maharashtra (new state)

### Tier 2 — Electoral Chronology (turnover patterns)

4. **Sultanpur (UP-PC-38)** — Multiple by-elections, incumbent changes
   - Pattern: Conviction/disqualification chain
   - State: UP (pilot consistency)

5. **Jalore (RJ-AC-144)** — Recent SC reservation case
   - Pattern: Constitutional/legal challenge to reservation
   - State: Rajasthan (new state)

6. **Hamirpur (HP-AC-36)** — BJP-Congress oscillation
   - Pattern: Party-switching, contradictory claims
   - State: Himachal Pradesh (new state)

### Tier 3 — Boundary Complexity

7. **Kairana (UP-AC-110)** — Already in pilot; use as regression fixture
   - Pattern: Town ≠ AC ≠ Block ≠ district
   - State: UP

8. **Shillong (ML-AC-18)** — Khasi Hills autonomous district overlap
   - Pattern: Tribal autonomy, overlapping jurisdictions
   - State: Meghalaya (new state, NE India)

### Tier 4 — Sparse Data (gap documentation)

9. **Pithoragarh (UK-AC-48)** — Remote hill constituency
   - Pattern: Limited government data, NOT_FOUND gaps
   - State: Uttarakhand (new state)

10. **Tawang (AR-AC-22)** — Border constituency, limited public data
    - Pattern: Security restrictions on data, sparse records
    - State: Arunachal Pradesh (new state, NE India)

### Tier 5 — SC/ST Reserved

11. **Lalganj (UP-AC-340)** — SC reserved, rural
    - Pattern: Scheme-level data, agricultural patterns
    - State: UP

12. **Khunti (JH-AC-41)** — ST reserved, tribal area
    - Pattern: Forest rights, PESA governance
    - State: Jharkhand (new state)

---

## Batch Composition Summary

| Dimension | Count | Constituencies |
|-----------|-------|---------------|
| Urban | 3 | Varanasi, Ahmedabad, Mumbai |
| Rural | 6 | Sultanpur, Jalore, Hamirpur, Pithoragarh, Lalganj, Khunti |
| Mixed | 3 | Shillong, Tawang, Kairana |
| SC Reserved | 2 | Jalore, Lalganj |
| ST Reserved | 1 | Khunti |
| General | 9 | Others |
| Infrastructure | 3 | Varanasi, Ahmedabad, Mumbai |
| Sparse Data | 2 | Pithoragarh, Tawang |
| Boundary Complex | 2 | Kairana, Shillong |
| States | 8 | UP, Gujarat, Maharashtra, Rajasthan, HP, Meghalaya, Uttarakhand, AR, Jharkhand |

---

## Expected Evidence Patterns

| Pattern | Constituencies | Expected Count |
|---------|---------------|---------------|
| Financial lifecycle | Varanasi, Ahmedabad, Mumbai | 3+ financial records each |
| Electoral chronology | Sultanpur, Hamirpur | 3+ claims per constituency |
| Contradiction pairs | Hamirpur, Khunti | 1-2 pairs |
| Boundary distinction | Kairana, Shillong | 1-2 claims each |
| NOT_FOUND gaps | Pithoragarh, Tawang | 2-3 gaps each |
| SC/ST representation | Jalore, Lalganj, Khunti | Reservation-specific claims |

---

## Quality Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Claims per constituency | 2-5 | Automated count |
| Evidence per claim | ≥1.5 | Automated ratio |
| Sources per constituency | ≥2 | Automated count |
| Financial records with source | 100% | Automated check |
| Provenance coverage | 100% | Automated check |
| Human review flags | Track count | Quality gate output |
| Researcher time per constituency | Track | Manual timing |
| Inaccessible source rate | Track | Gap analysis |
| Geographic ambiguity rate | Track | Flag analysis |

---

## Execution Plan

1. Create manifest for all 12 constituencies
2. Dry-run validation
3. Live ingestion (batch mode)
4. Quality gate results
5. Human review queue assessment
6. Gate decision: proceed to 50 → 100 → 233 remaining

---

## Gate Criteria for Progression

Before expanding beyond 12 constituencies:
- [ ] 100% provenance coverage
- [ ] All financial records have reporting_source_id
- [ ] No P0_BLOCKING quality flags unresolved
- [ ] Human review queue < 5% of total records
- [ ] All 77 tests still passing
- [ ] Build still passes
- [ ] Researcher time per constituency < 30 minutes (automated portion)
