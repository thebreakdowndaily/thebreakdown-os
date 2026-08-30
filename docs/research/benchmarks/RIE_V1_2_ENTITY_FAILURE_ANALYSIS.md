# RIE v1.2 — Entity Failure Analysis

**Status:** COMPLETE
**Date:** 2026-08-18
**Phase:** 3 (Multilingual Entity Resolution)

---

## Purpose

This document analyzes entity detection and resolution failures in the Research Intelligence Engine v1.2, classifies root causes, and documents the fixes applied.

## Entity Detection Pipeline (Current)

```
Mock Document Content
  → Topic Expansion (findProfiles)
    → Entity Search Terms (entitySearchTerms)
      → Sentence-level entity mention detection (includes())
        → Cross-script entity detection (CROSS_SCRIPT_ENTITY_REGISTRY)
          → Research Claim with entityMentions[]
```

## Failure Classification

### Category 1: Wrong Profile Matching (UNFIXABLE — Baseline Constraint)

| Symptom | Root Cause | Impact | Fix |
|---------|-----------|--------|-----|
| Bihar docs matched to "irrigation audit" profile | `findProfiles()` substring matching picks "irrigation" from audit content | Wrong entities selected for Bihar topic | **Cannot fix without breaking A-run baseline** |
| Wayanad docs matched to "land dispute" profile | "land" substring matches land dispute profile before landslide profile | Wrong entities selected for Wayanad topic | **Cannot fix without breaking A-run baseline** |

**Decision:** Profile matching is a known limitation. The entity resolver's layered matching compensates at the entity level.

### Category 2: Cross-Script Metric Mismatch (FIXED — Phase 2)

| Symptom | Root Cause | Impact | Fix |
|---------|-----------|--------|-----|
| Regional Entity Recall stuck at 53.3% | Expected entities in Malayalam/Devanagari not present in claim text | Metric undercount | Added native-script entity names to topic profiles |

**Applied in Phase 2:** Added `വയനാട്`, `കേരളം`, `अयोध्या`, `महाराष्ट्र`, `विभाग` to topic profiles.

### Category 3: Missing Entity Detection (FIXED — Phase 3)

| Symptom | Root Cause | Impact | Fix |
|---------|-----------|--------|-----|
| English "Wayanad" not detected in Malayalam claim text | `includes()` check requires exact script match | Entity not found in cross-language text | Added CROSS_SCRIPT_ENTITY_REGISTRY |
| Transliterated forms not matched | No transliteration layer in entity detection | Devanagari/Malayalam text not matched to English aliases | Created transliteration.ts with deterministic character maps |

**Applied in Phase 3:** Created entity-resolver.ts with layered matching pipeline.

### Category 4: False Merge Risk (MITIGATED — Phase 3)

| Symptom | Root Cause | Impact | Mitigation |
|---------|-----------|--------|------------|
| "Keralites" could match "Kerala" | Substring matching without word boundaries | False entity merge | `boundaryMatch()` with word-boundary checks |
| "CBI" could match "CAG" | Different acronyms | False entity merge | Short acronyms require exact match |
| "J&K Bank" matches "Kashmir" | "J&K" is a valid alias | Accepted match (not a false merge) | Documented as known behavior |

**Decision:** Boundary-aware matching prevents most false merges. Remaining edge cases (e.g., "J&K Bank") are acceptable because "J&K" IS a valid reference to Kashmir.

### Category 5: Ambiguity Risk (MEASURED — Phase 3)

| Symptom | Root Cause | Impact | Measurement |
|---------|-----------|--------|-------------|
| "Delhi" could match multiple entities | No Delhi profile in topic expansion | Low-confidence match | 0.0% ambiguity rate in A/B/C/D/E experiments |
| "India" too broad | No India-specific entity | Low-confidence match | 0.0% ambiguity rate in A/B/C/D/E experiments |

**Result:** 0.0% ambiguity rate across all experiment runs. Token context and fuzzy layers do not introduce false positives in the test corpus.

## Entity Resolver Match Provenance

Every entity match retains full provenance for evaluation:

```typescript
interface EntityMatchResult {
  canonicalName: string | null;      // Canonical entity name
  matchMethod: MatchMethod;          // How the match was achieved
  matchedAlias: string | null;       // The alias that triggered the match
  originalText: string;              // Original text from the document
  normalizedText: string;            // NFKC-normalized form
  transliteratedText: string | null; // Latin transliteration (if applicable)
  script: string;                    // Detected script
  language: string;                  // Detected language
  score: number;                     // Confidence score (0..1)
  reason: string;                    // Explanation of the match
}
```

## Cross-Language Entity Resolution Results

| Entity | English Form | Hindi Form | Malayalam Form | Canonical Name | Match Method |
|--------|-------------|-----------|---------------|----------------|-------------|
| Ayodhya | "Ayodhya" | "अयोध्या" | — | अयोध्या | EXACT/ALIAS |
| Wayanad | "Wayanad" | — | "വയനാട്" | വയനാട് | CROSS_SCRIPT/ALIAS |
| Kerala | "Kerala" | — | "കേരളം" | കേരളം | ALIAS/CROSS_SCRIPT |
| Maharashtra | "Maharashtra" | — | "മഹാരാഷ്ട്ര" | മഹാരാഷ്ട്ര | ALIAS/CROSS_SCRIPT |
| Bihar | "Bihar" | "बिहार" | — | बिहार | ALIAS/EXACT |

## Benchmark Impact

| Metric | Phase 2 | Phase 3 | Change |
|--------|---------|---------|--------|
| Regional Entity Recall | 53.3% | 73.3% | +20.0pp |
| A-Run Score | 0.647 | 0.647 | 0.000 |
| False Merge Rate | N/A | 0.0% | New metric |
| Ambiguity Rate | N/A | 0.0% | New metric |

## Recommendations

1. **Profile matching (long-term):** Consider topic-aware scoring that weights entity relevance alongside substring matching. Blocked by baseline constraint.

2. **Hindi cross-language (long-term):** Add Hindi forms to cross-script dictionary for entities like "केरल" (Kerala), "वयनाड" (Wayanad).

3. **Fuzzy matching (long-term):** Enable in production only after measuring false merge impact on full benchmark corpus.
