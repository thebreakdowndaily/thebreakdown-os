# Controlled Production Batch — Gate Decision

**Batch:** PROD-12CONSTITUENCY-CONTROLLED
**Date:** 20 Jul 2026
**Decision:** **VALIDATED WITH CONDITIONS**

---

## Summary

| Metric | Result |
|--------|--------|
| Constituencies ingested | 12/12 |
| Claims | 22 |
| Evidence items | 31 |
| Sources | 30 |
| Financial records | 14 |
| Junction records | 49 (25 claim-evidence + 24 claim-subject) |
| P0 blockers | 0 |
| P1 flags | 2 (human review required) |
| P2 flags | 2 (advisory) |
| P3 flags | 1 (informational) |
| Contradictions | 0 |
| Test suite | 77/77 pass |
| Checkpoint recovery | PASS (resume skips all, no duplication) |

---

## Gate Criteria Met

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Reproducible ingestion | PASS | `--fresh` runs cleanly end-to-end |
| Idempotent resume | PASS | `--resume` skips all 12, no data mutation |
| No SQL errors | PASS | All inserts succeed (after SSL fix) |
| Checkpoint recovery | PASS | Interrupted batches resume from last completed constituency |
| Quality gates functional | PASS | 5 flags surfaced, 0 P0 |
| Regression suite clean | PASS | 77/77 tests pass |
| Data persists in DB | PASS | All 12 constituencies + claims + sources verified |

---

## Issues Discovered and Resolved

| Issue | Severity | Resolution |
|-------|----------|------------|
| `project_id` NOT NULL on `research_financial_records` | P0_BLOCKING | Added `project_id` and `project_id_ref` to manifest |
| `canonical_id` CHECK constraint only accepted `UP-AC-NNN` | P0_BLOCKING | Migration 008: relaxed to `^[A-Z]{2}-AC-[0-9]{2,4}$` |
| `OFFICIAL` not in `value_availability_status_type` enum | P0_BLOCKING | Replaced with `KNOWN` in manifest |
| Missing `ssl: { rejectUnauthorized: false }` on pg client | P0_BLOCKING | Added SSL option to batch-ingest.js connection |
| `research_constituencies.canonical_id` VARCHAR(20) too narrow | P1 | Expanded to VARCHAR(100) via migration 008 |

---

## Human Review Queue

| Priority | Constituency | Flag | Description |
|----------|-------------|------|-------------|
| P1_HIGH | JH-AC-60 (Khunti) | NEEDS_SECONDARY_REVIEW | PESA compliance claim from academic journal, needs gov records verification |
| P1_HIGH | RJ-AC-144 (Jalore) | NEEDS_SECONDARY_REVIEW | Statewide judicial precedent attributed to Jalore as SC-reserved representative |
| P2_MEDIUM | UK-AC-48 (Pithoragarh) | BOUNDARY_COMPLEXITY | ₹4,200 cr covers district-wide projects, not just constituency |
| P2_MEDIUM | AR-AC-22 (Tawang) | AMBIGUOUS_GEOGRAPHY | Frontier Highway spans 12 districts, Tawang attribution approximate |
| P3_LOW | MH-AC-191 (Mumbai South) | FINANCIAL_STAGE_EQUIVALENCE | Multiple cost figures represent different reporting dates, not contradictions |

---

## Conditions for Next Batch (40-50 constituencies)

1. **Resolve P1 flags** — The 2 human review items must be adjudicated before the next batch
2. **Manifest validation enhancement** — The batch-ingest.js should validate `amount_status` against the DB enum before attempting INSERT
3. **Manifest schema should require `project_id`** — Currently optional in schema but required by DB
4. **SSL option should be default** — The pg client SSL fix should be documented as a required Supabase configuration

---

## Constituency Coverage

| State | Constituencies | Type |
|-------|---------------|------|
| UP | 4 (Varanasi Cantt, Lalganj, Gorakhpur Urban, Lucknow West) | AC |
| GJ | 1 (Ahmedabad West) | AC |
| MH | 1 (Mumbai South) | AC |
| HP | 1 (Hamirpur) | AC |
| ML | 1 (East Shillong) | AC |
| UK | 1 (Pithoragarh) | AC |
| AR | 1 (Tawang) | AC |
| JH | 1 (Khunti) | AC |
| RJ | 1 (Jalore) | AC |
| **Total** | **12** | **All AC** |

---

## Next Steps

1. Adjudicate the 2 P1 human review flags
2. Proceed to Batch 2: 40-50 constituencies (mixed infrastructure, elections, legal across 8-10 states)
3. Add manifest validation for enum values before live INSERT
4. Consider adding `project_id` as a required manifest field
