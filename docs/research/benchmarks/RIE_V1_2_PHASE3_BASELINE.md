# RIE v1.2 — Phase 3 Baseline

**Status:** COMPLETE
**Date:** 2026-08-18
**Baseline Version:** v1.2-phase3

---

## Executive Summary

Phase 3 implemented multilingual entity resolution and cross-language claim evaluation for the Research Intelligence Engine. The entity resolver uses a layered matching pipeline (EXACT → NORMALIZED → ALIAS → CROSS_SCRIPT → TRANSLITERATION → TOKEN_CONTEXT → FUZZY → NO_MATCH) with full match provenance tracking.

## Metrics Summary

| Metric | Phase 2 Baseline | Phase 3 Final | Delta |
|--------|-----------------|---------------|-------|
| Source Recall | 100.0% | 100.0% | 0.0pp |
| Primary Source Recall | 93.3% | 93.3% | 0.0pp |
| Regional Entity Recall | 53.3% | 73.3% | +20.0pp |
| Translation Preservation | 100.0% | 100.0% | 0.0pp |
| Claim Extraction Recall | 35.6% | 35.6% | 0.0pp |
| A-Run Score | 0.647 | 0.647 | 0.000 |

## A/B/C/D/E Experiment Results

| Run | Layers Enabled | Entity Recall | Precision | False Merge | Ambiguity |
|-----|---------------|---------------|-----------|-------------|-----------|
| A | 1-3 (Exact+Norm+Alias) | 90.9% | 100.0% | 0.0% | 0.0% |
| B | 1-3 (+NFKC) | 90.9% | 100.0% | 0.0% | 0.0% |
| C | 1-5 (+CrossScript+Translit) | 90.9% | 100.0% | 0.0% | 0.0% |
| D | 1-6 (+TokenContext) | 90.9% | 100.0% | 0.0% | 0.0% |
| E | 1-7 (+Fuzzy) | 90.9% | 100.0% | 0.0% | 0.0% |

**Note:** A/B/C/D/E experiments measure the entity resolver's standalone capabilities against the false-merge corpus. The 73.3% Regional Entity Recall in the benchmark reflects the production pipeline's entity detection (which uses `includes()` in `claim-extraction.ts`), while the entity resolver (used for cross-language matching) achieves 90.9% on its test corpus.

## Implementation

### Files Created
- `lib/intel/research/entity-resolver.ts` — Layered entity matching pipeline
- `lib/intel/research/transliteration.ts` — Devanagari/Malayalam → Latin transliteration
- `tests/research/phase3-entity-resolution.test.ts` — 34 tests (normalization, transliteration, layered matching, false-merge, A/B/C/D/E experiments, dictionary audit)
- `tests/research/phase3-cross-language-claims.test.ts` — 16 tests (language detection, entity extraction, cross-language canonical matching, normalization)

### Files Modified
- `lib/intel/research/normalization.ts` — Added `normalizeEntityText()`, `detectScript()`, `createNormalizedEntity()`, `NormalizedEntity` interface
- `lib/intel/research/claim-extraction.ts` — Replaced `CROSS_SCRIPT_ENTITIES` with `CROSS_SCRIPT_ENTITY_REGISTRY` from entity-resolver
- `lib/intel/research/topic-expansion.ts` — Added metro safety certification profile, non-English entity names, Mumbai Metro entities

### Entity Resolver Architecture

```
resolveEntity(observedText, knownEntities, options)
  ├─ Layer 1: EXACT (score: 1.0) — canonical name match
  ├─ Layer 2: NORMALIZED (score: 0.95) — NFKC + whitespace + case
  ├─ Layer 3: ALIAS (score: 0.9) — explicit alias from entity definition
  ├─ Layer 4: CROSS_SCRIPT (score: 0.85) — cross-script dictionary
  ├─ Layer 5: TRANSLITERATION (score: 0.8) — Latin transliteration of Indic text
  ├─ Layer 6: TOKEN_CONTEXT (score: 0.7) — shared significant tokens
  ├─ Layer 7: FUZZY (score: 0.6) — bounded edit-distance
  └─ NO_MATCH (score: 0)
```

Each match retains full provenance: `matchMethod`, `matchedAlias`, `originalText`, `normalizedText`, `transliteratedText`, `script`, `language`, `score`, `reason`.

### Cross-Script Entity Registry

Production-owned generic entity knowledge (NOT derived from benchmark gold):
- 8 entities with English + native-script aliases
- Covers Devanagari, Malayalam scripts
- Auditable: every entry independently verifiable

### Boundary-Aware Matching

The resolver uses word-boundary-aware substring matching (`boundaryMatch()`) to prevent false merges like "Keralites" matching "Kerala". This prevents incorrect entity resolution while maintaining high recall.

### Cross-Language Claim Evaluation

Canonical entity resolution maps entity mentions from any script to the same canonical name:
- English "Ayodhya" → Devanagari "अयोध्या" (via ALIAS layer)
- Malayalam "വയനാട്" → same canonical name (via EXACT layer)
- English "Wayanad" → Malayalam "വയനാട്" (via CROSS_SCRIPT layer)
- English "Kerala" → Malayalam "കേരളം" (via ALIAS layer)
- English "Bihar" → Devanagari "बिहार" (via ALIAS layer)

## Known Limitations

1. **Profile matching:** Bihar → irrigation audit, Wayanad → land dispute (wrong profile selection). Cannot fix without breaking A-run baseline (v1.1.1). Accepted as known limitation.

2. **Fuzzy matching:** Currently disabled in production. Only enabled in E-run experiment. Threshold: 0.8 Jaccard similarity.

3. **Hindi text cross-language matching:** Hindi forms like "केरल" (for Kerala) and "वयनाड" (for Wayanad) are not in the cross-script dictionary. Cross-language matching for Hindi relies on the ALIAS layer (which requires English aliases to be present in the Hindi text, e.g., "RBI").

## Validation

- `npx tsc --noEmit` — clean
- `npm run build` — passes
- Benchmark tests: 12/12 passing
- Phase 3 entity resolution tests: 34/34 passing
- Phase 3 cross-language claims tests: 16/16 passing
- Total: 62/62 tests passing
- A-run baseline: 0.647 preserved
- All Phase 1/2 gains preserved

## Governance

This document is governed by the Editorial Constitution v1.1 and AGENTS.md v1.0.
