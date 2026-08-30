# RIE v1.2 Phase 4 — Cross-Language Claim Intelligence & Entity Coverage Trace

## Status: COMPLETE

## Objective

Reconcile the 90.9% standalone entity resolver recall vs 73.3% integrated benchmark entity recall. Implement language-independent cross-language claim evaluation. Trace every missed entity through the full extraction→candidate→resolver→benchmark pipeline. Add justified Hindi cross-script entities. Run A/B/C/D experiments.

---

## Phase 4 Results

### A/B/C/D Experiment Results

| Experiment | What It Measures | Result |
|-----------|-----------------|--------|
| **A — Baseline** | Standalone entity recall with current pipeline | **100.0%** (17/17 entities) |
| **B — Cross-Language Propositions** | Cross-script entity matching via `matchCanonicalPropositions` | **PROPOSITION_MATCH**, confidence=0.900 |
| **C — Hindi Entity Aliases** | New entities (Karnataka/Telangana/Supreme Court) resolve correctly | **CROSS_SCRIPT** resolution confirmed |
| **D — End-to-End Coverage** | All 5 benchmark expected entities have ≥1 resolution path | **All EXPANSION+REGISTRY** |
| **False-Merge Rate** | No unintended entity merges after adding new entries | **0.0%** (0/4 false traps) |

### Metric Reconciliation

| Metric | Value | Measures |
|--------|-------|----------|
| Standalone Entity Recall | **100.0%** | Resolver vs 17 entity strings |
| Integrated Entity Recall | **73.3%** | Benchmark per-topic (15 topics, 7 ineligible→1.0) |
| Cross-Language Claim Recall | N/A (new) | Proposition matching across scripts |
| Source Recall | **100.0%** | Gold source expansion |
| Primary Source Recall | **93.3%** | Primary source discovery |
| Regional Entity Recall | **73.3%** | Per-topic average |

The 90.9% vs 73.3% gap is reconciled: they measure different things. Standalone tests 11 entity strings against the resolver. Integrated measures entity mentions in claims across 15 topics (7 ineligible default to 1.0).

### Root Causes of 73.3% Integrated Ceiling

1. **7 ineligible topics** (English + national/international) default `regionalEntityRecall = 1.0`, inflating the average.
2. **Mock document content** lacks expected entities in 5 of 8 eligible topics.
3. **Entity extraction** uses `sentence.includes()` not the resolver.
4. **Expansion entity canonical names** don't always match expected list forms.
5. **CROSS_SCRIPT_ENTITY_REGISTRY** coverage was incomplete (now expanded 8→11 entries).

### New Cross-Script Entities Added

| Canonical Name | English Aliases | Justification |
|---------------|----------------|---------------|
| कर्नाटक | Karnataka, Karnataka State | State governance, benchmark topic-karnataka-res |
| तेलंगाना | Telangana, Telangana State | State governance, benchmark topic-kaleshwaram-cag |
| सुप्रीम कोर्ट | Supreme Court, SCI | Legal/judicial, benchmark topic-ayodhya-2019 |

### Infrastructure Fixes (Phase 4)

1. **`boundaryMatch` case-insensitivity**: `matchesAtBoundary` now compares lowercased forms. Fixes entity resolution for lowercase tokens from `extractEntityTokens`.
2. **Devanagari `\b` fix**: Extraction patterns now use `(?<!\w)` / `(?!\w)` instead of `\b` to handle combining marks (e.g., nukta in `करोड़`).
3. **Hindi numeric normalization**: Added `करोड़`/`लाख` patterns to `extractNumericValues` and `NUMERIC_NORMALIZATIONS`.
4. **`normalizeNumeric` currency pre-stripping**: Strips `₹$` and commas before scale normalization.
5. **Entity-based cross-script matching in `matchCanonicalPropositions`**: New step 4 resolves entities from both proposition texts through the cross-script registry.
6. **`traceEntity` case-insensitive comparison**: Entity mention matching now compares lowercased forms.

### Canonical Proposition Matching

Language-independent claim evaluation via:
- `buildCanonicalProposition()`: Extracts normalized tokens, numeric values, entity tokens.
- `matchCanonicalPropositions()`: 5-step matching (EXACT_TEXT → TRANSLATED_TEXT → NUMERIC_MATCH → entity-based cross-script → token Jaccard).
- `extractNumericValues()`: Handles ₹, $, lakh, crore, लाख, करोड़, billion, million.
- `extractEntityTokens()`: Latin proper noun extraction.

### Entity Coverage Trace

`traceEntity()` traces every expected entity through:
- Doc text presence (substring match)
- Expansion entity presence (name/alias)
- Cross-script registry presence
- Claim entityMention detection
- Resolution method (EXPANSION / CROSS_SCRIPT / NO_MATCH)

Returns `countedAsRecalled` boolean matching benchmark metric logic.

---

## Files Modified

| File | Changes |
|------|---------|
| `lib/intel/research/entity-resolver.ts` | Added 3 cross-script entities. Fixed `matchesAtBoundary` case-sensitivity. |
| `lib/intel/research/benchmark/metrics.ts` | Added `CanonicalProposition`, `buildCanonicalProposition()`, `matchCanonicalPropositions()`, `extractEntityTokens()`, `extractNumericValues()` fix, `normalizeNumeric()` fix, `traceEntity()`, `EntityTraceEntry`. Extended `ComputeMetricsInput` and `TopicMetrics`. Added Hindi numeric patterns. |
| `tests/research/phase4-cross-language-claims.test.ts` | New test suite: 22 tests across 4 describes. |

## Test Results

```
Test Suites: 4 passed, 4 total
Tests:       84 passed, 84 total
```

All Phase 3 tests (33 + 16) and benchmark tests (12) remain green. Phase 4 adds 22 new tests.
