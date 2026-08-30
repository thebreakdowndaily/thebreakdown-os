# RIE v1.2 — Cross-Language Claims

**Status:** COMPLETE
**Date:** 2026-08-18
**Phase:** 3 (Cross-Language Claim Evaluation)

---

## Purpose

This document describes the cross-language claim evaluation framework for the Research Intelligence Engine v1.2. It defines how claims expressed in different languages (English, Hindi, Malayalam) are compared using canonical entity resolution.

## Architecture

### Claim Processing Pipeline

```
Claim Text (any language)
  → Language Detection (detectLanguage)
  → Entity Extraction (extractEntitiesFromText)
    → Entity Resolution (resolveEntity with layered pipeline)
      → Canonical Entity Names
        → Cross-Language Comparison
```

### Cross-Language Matching Strategy

Cross-language claim matching does NOT translate text between languages. Instead, it:

1. **Extracts entity mentions** from claims in any script
2. **Resolves entities** to canonical names using the layered matching pipeline
3. **Compares canonical names** across languages

This approach is language-independent because:
- Entity names are the primary bridge between languages
- The entity resolver maps any script form to the same canonical name
- Proposition comparison uses canonical entity names, not surface text

## Entity Resolution Across Scripts

### English → Devanagari

| English Text | Resolved Entity | Canonical Name | Match Method |
|-------------|----------------|----------------|-------------|
| "Ayodhya" | अयोध्या | अयोध्या | ALIAS (layer 3) |
| "Bihar" | बिहार | बिहार | ALIAS (layer 3) |
| "Kashmir" | कश्मीर | कश्मीर | ALIAS (layer 3) |

### English → Malayalam

| English Text | Resolved Entity | Canonical Name | Match Method |
|-------------|----------------|----------------|-------------|
| "Wayanad" | വയനാട് | വയനാട് | CROSS_SCRIPT (layer 4) |
| "Kerala" | കേരളം | കേരളം | ALIAS (layer 3) |
| "Maharashtra" | മഹാരാഷ്ട്ര | മഹാരാഷ്ട്ര | ALIAS (layer 3) |

### Malayalam → Canonical

| Malayalam Text | Canonical Name | Match Method |
|---------------|----------------|-------------|
| "വയനാട്" | വയനാട് | EXACT (layer 1) |
| "കേരളം" | കേരളം | EXACT (layer 1) |
| "മഹാരാഷ്ട്ര" | മഹാരാഷ്ട്ര | EXACT (layer 1) |

### Hindi → Canonical

| Hindi Text | Canonical Name | Match Method |
|-----------|----------------|-------------|
| "अयोध्या" | अयोध्या | EXACT (layer 1) |
| "बिहार" | बिहार | EXACT (layer 1) |
| "कश्मीर" | कश्मीर | EXACT (layer 1) |

## Cross-Language Claim Examples

### Example 1: Ayodhya Verdict

**English:** "The Supreme Court delivered the Ayodhya verdict on November 9, 2019."
- Entities: ["अयोध्या"]

**Hindi:** "सुप्रीम कोर्ट ने 9 नवंबर 2019 को अयोध्या फैसला सुनाया।"
- Entities: ["अयोध्या"]

**Cross-language match:** ✅ Both resolve to canonical "अयोध्या"

### Example 2: Wayanad Landslide

**English:** "Kerala reported 23 landslide deaths in Wayanad."
- Entities: ["കേരളം", "വയനാട്"]

**Malayalam:** "വയനാട്ടിൽ ഉരുൾപൊട്ടലിൽ 23 മരണം റിപ്പോർട്ട് ചെയ്തു."
- Entities: ["വയനാട്"]

**Cross-language match:** ✅ Both resolve to canonical "വയനാട്"

### Example 3: Maharashtra Cabinet

**English:** "Maharashtra Cabinet reshuffled portfolios among ministers."
- Entities: ["മഹാരാഷ്ട്ര", "വിഭാഗ"]

**Malayalam:** "മഹാരാഷ്ട്ര കാബിനറ്റ് മന്ത്രിമാർക്കിടയിൽ വകുപ്പുകൾ പുനർവിതരണം ചെയ്തു."
- Entities: ["മഹാരാഷ്ട്ര"]

**Cross-language match:** ✅ Both resolve to canonical "മഹാരാഷ്ട്ര"

## Limitations

1. **Hindi cross-language gap:** Hindi forms like "केरल" (Kerala) and "वयनाड" (Wayanad) are not in the cross-script dictionary. Cross-language matching for Hindi relies on the ALIAS layer, which requires English aliases to be present in the Hindi text (e.g., "RBI" appears in Hindi text as-is).

2. **Translation not implemented:** The `multilingualPropositionKey` function normalizes text but does NOT translate between languages. Cross-language matching relies entirely on entity resolution.

3. **Proposition comparison:** Current proposition extraction is template-based (regex patterns for subject/verb/object). A production system would need NLP-based proposition extraction for robust cross-language claim comparison.

## Test Coverage

- 16 tests in `phase3-cross-language-claims.test.ts`
- Language detection: 3 scripts (English, Hindi, Malayalam)
- Entity extraction: 7 test cases across 3 languages
- Cross-language canonical matching: 5 entity pairs
- Normalization: 3 tests (determinism, mixed scripts, proposition key)

## Future Work

1. **Hindi cross-script dictionary:** Add Hindi forms for Malayalam-script entities
2. **NLP proposition extraction:** Replace regex-based extraction with NLP models
3. **Translation layer:** Optional machine translation for proposition comparison
4. **Claim similarity scoring:** Compute semantic similarity between canonical propositions
