/**
 * ─── Research Intelligence Engine — Entity Resolver ─────────────────────────
 *
 * Layered entity matching for cross-script, cross-language entity resolution.
 * Matching pipeline:
 *   1. EXACT — canonical name match
 *   2. NORMALIZED — NFKC + whitespace + case normalization
 *   3. ALIAS — explicit alias from entity definition
 *   4. CROSS_SCRIPT — cross-script dictionary match
 *   5. TRANSLITERATION — Latin transliteration of Indic text
 *   6. TOKEN_CONTEXT — shared significant tokens + contextual signals
 *   7. FUZZY — bounded edit-distance (only if preceding layers fail)
 *   8. AMBIGUOUS — multiple candidates with insufficient evidence
 *   9. NO_MATCH
 *
 * Every match retains full provenance for evaluation.
 */

import { normalizeEntityText, detectScript, detectLanguage, createNormalizedEntity } from './normalization';
import { transliterateToLatin } from './transliteration';

// ── Match method taxonomy ────────────────────────────────────────────────────

export type MatchMethod =
  | 'EXACT'
  | 'NORMALIZED'
  | 'ALIAS'
  | 'CROSS_SCRIPT'
  | 'TRANSLITERATION'
  | 'TOKEN_CONTEXT'
  | 'FUZZY'
  | 'AMBIGUOUS'
  | 'NO_MATCH';

// ── Result type ──────────────────────────────────────────────────────────────

export interface EntityMatchResult {
  /** The canonical entity name (if matched). */
  canonicalName: string | null;
  /** How the match was achieved. */
  matchMethod: MatchMethod;
  /** The alias or text that triggered the match. */
  matchedAlias: string | null;
  /** Original text from the document. */
  originalText: string;
  /** NFKC-normalized form. */
  normalizedText: string;
  /** Latin transliteration (if applicable). */
  transliteratedText: string | null;
  /** Detected script. */
  script: string;
  /** Detected language. */
  language: string;
  /** Confidence score (0..1). Higher = more confident. */
  score: number;
  /** Explanation of why this match was made (for diagnostics). */
  reason: string;
}

// ── Cross-script entity dictionary ───────────────────────────────────────────
// Production-owned generic entity knowledge. NOT derived from benchmark gold.

export interface CrossScriptEntity {
  canonicalName: string;
  englishAliases: string[];
  nativeAliases: string[];
  script: string;
  language: string;
  entityType: string;
  geographicScope: string;
}

export const CROSS_SCRIPT_ENTITY_REGISTRY: CrossScriptEntity[] = [
  {
    canonicalName: 'വയനാട്',
    englishAliases: ['Wayanad', 'Wayanad district'],
    nativeAliases: ['വയനാട്', 'വയനാട്ടിലെ'],
    script: 'malayalam',
    language: 'ml',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'കേരളം',
    englishAliases: ['Kerala', 'Kerala State'],
    nativeAliases: ['കേരളം', 'കേരളത്തിൽ'],
    script: 'malayalam',
    language: 'ml',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'മഹാരാഷ്ട്ര',
    englishAliases: ['Maharashtra', 'MH'],
    nativeAliases: ['മഹാരാഷ്ട്ര'],
    script: 'malayalam',
    language: 'ml',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'വിഭാഗ',
    englishAliases: ['Cabinet', 'Department', 'Division'],
    nativeAliases: ['വിഭാഗ'],
    script: 'malayalam',
    language: 'ml',
    entityType: 'GOVERNMENT',
    geographicScope: 'state',
  },
  {
    canonicalName: 'अयोध्या',
    englishAliases: ['Ayodhya'],
    nativeAliases: ['अयोध्या'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'REGION',
    geographicScope: 'national',
  },
  {
    canonicalName: 'बिहार',
    englishAliases: ['Bihar'],
    nativeAliases: ['बिहार', 'बिहार राज्य'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'पंचायती राज',
    englishAliases: ['Panchayati Raj', 'Panchayat'],
    nativeAliases: ['पंचायती राज', 'पंचायती राज विभाग'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'GOVERNMENT',
    geographicScope: 'national',
  },
  {
    canonicalName: 'कश्मीर',
    englishAliases: ['Kashmir', 'Jammu and Kashmir', 'J&K'],
    nativeAliases: ['कश्मीर'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'कर्नाटक',
    englishAliases: ['Karnataka', 'Karnataka State'],
    nativeAliases: ['कर्नाटक'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'तेलंगाना',
    englishAliases: ['Telangana', 'Telangana State'],
    nativeAliases: ['तेलंगाना'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'REGION',
    geographicScope: 'state',
  },
  {
    canonicalName: 'सुप्रीम कोर्ट',
    englishAliases: ['Supreme Court', 'SCI'],
    nativeAliases: ['सुप्रीम कोर्ट'],
    script: 'devanagari',
    language: 'hi',
    entityType: 'INSTITUTION',
    geographicScope: 'national',
  },
];

// ── Matching pipeline ────────────────────────────────────────────────────────

/**
 * Attempt to match an observed entity text against a known entity.
 * Returns the best match result (or NO_MATCH).
 */
export function resolveEntity(
  observedText: string,
  knownEntities: Array<{ name: string; aliases: string[] }>,
  options: {
    crossScriptEntities?: CrossScriptEntity[];
    enableFuzzy?: boolean;
    fuzzyThreshold?: number;
    /** Maximum matching layer to attempt (1=EXACT..7=FUZZY). Undefined = all. */
    maxLayer?: number;
  } = {}
): EntityMatchResult {
  const crossScript = options.crossScriptEntities ?? CROSS_SCRIPT_ENTITY_REGISTRY;
  const enableFuzzy = options.enableFuzzy ?? false;
  const fuzzyThreshold = options.fuzzyThreshold ?? 0.8;

  const normalized = normalizeEntityText(observedText);
  const script = detectScript(observedText);
  const language = detectLanguage(observedText);
  const transliterated = (script === 'devanagari' || script === 'malayalam')
    ? transliterateToLatin(observedText)
    : null;

  const base: Omit<EntityMatchResult, 'canonicalName' | 'matchMethod' | 'matchedAlias' | 'score' | 'reason'> = {
    originalText: observedText,
    normalizedText: normalized,
    transliteratedText: transliterated,
    script,
    language,
  };

  // Layer 1: EXACT — canonical name match
  if (!options.maxLayer || options.maxLayer >= 1) {
    for (const entity of knownEntities) {
      if (observedText === entity.name || boundaryMatch(observedText, entity.name)) {
        return { ...base, canonicalName: entity.name, matchMethod: 'EXACT', matchedAlias: entity.name, score: 1.0, reason: `Exact match against canonical name "${entity.name}"` };
      }
    }
  }

  // Layer 2: NORMALIZED — NFKC + whitespace + case normalization
  if (!options.maxLayer || options.maxLayer >= 2) {
    for (const entity of knownEntities) {
      const entityNorm = normalizeEntityText(entity.name);
      if (normalized === entityNorm || normalized.includes(entityNorm) || entityNorm.includes(normalized)) {
        return { ...base, canonicalName: entity.name, matchMethod: 'NORMALIZED', matchedAlias: entity.name, score: 0.95, reason: `Normalized match against "${entity.name}" (NFKC)` };
      }
    }
  }

  // Layer 3: ALIAS — explicit alias from entity definition
  if (!options.maxLayer || options.maxLayer >= 3) {
    for (const entity of knownEntities) {
      for (const alias of entity.aliases) {
        if (boundaryMatch(observedText, alias)) {
          return { ...base, canonicalName: entity.name, matchMethod: 'ALIAS', matchedAlias: alias, score: 0.9, reason: `Alias match "${alias}" → "${entity.name}"` };
        }
      }
      for (const alias of entity.aliases) {
        const aliasNorm = normalizeEntityText(alias);
        if (normalized === aliasNorm || normalized.includes(aliasNorm) || aliasNorm.includes(normalized)) {
          return { ...base, canonicalName: entity.name, matchMethod: 'ALIAS', matchedAlias: alias, score: 0.88, reason: `Normalized alias match "${alias}" → "${entity.name}"` };
        }
      }
    }
  }

  // Layer 4: CROSS_SCRIPT — cross-script dictionary match
  if (!options.maxLayer || options.maxLayer >= 4) {
    for (const cs of crossScript) {
      for (const alias of cs.englishAliases) {
        if (boundaryMatch(observedText, alias)) {
          return { ...base, canonicalName: cs.canonicalName, matchMethod: 'CROSS_SCRIPT', matchedAlias: alias, score: 0.85, reason: `Cross-script English alias "${alias}" → "${cs.canonicalName}"` };
        }
      }
      for (const alias of cs.nativeAliases) {
        if (boundaryMatch(observedText, alias)) {
          return { ...base, canonicalName: cs.canonicalName, matchMethod: 'CROSS_SCRIPT', matchedAlias: alias, score: 0.85, reason: `Cross-script native alias "${alias}" → "${cs.canonicalName}"` };
        }
      }
    }
  }

  // Layer 5: TRANSLITERATION — Latin transliteration of Indic text
  if ((!options.maxLayer || options.maxLayer >= 5) && transliterated) {
    const translitNorm = normalizeEntityText(transliterated);
    for (const cs of crossScript) {
      for (const alias of cs.englishAliases) {
        const aliasNorm = normalizeEntityText(alias);
        if (translitNorm === aliasNorm || translitNorm.includes(aliasNorm) || aliasNorm.includes(translitNorm)) {
          return { ...base, canonicalName: cs.canonicalName, matchMethod: 'TRANSLITERATION', matchedAlias: alias, score: 0.8, reason: `Transliteration match "${transliterated}" ≈ "${alias}" → "${cs.canonicalName}"` };
        }
      }
    }
    for (const entity of knownEntities) {
      const entityNorm = normalizeEntityText(entity.name);
      if (translitNorm === entityNorm || translitNorm.includes(entityNorm) || entityNorm.includes(translitNorm)) {
        return { ...base, canonicalName: entity.name, matchMethod: 'TRANSLITERATION', matchedAlias: entity.name, score: 0.78, reason: `Transliteration match "${transliterated}" ≈ "${entity.name}"` };
      }
    }
  }

  // Layer 6: TOKEN_CONTEXT — shared significant tokens
  if (!options.maxLayer || options.maxLayer >= 6) {
    const observedTokens = new Set(normalized.split(/\s+/).filter(t => t.length > 2));
    if (observedTokens.size > 0) {
      let bestEntity: string | null = null;
      let bestScore = 0;
      let bestReason = '';

      for (const cs of crossScript) {
        const englishTokens = cs.englishAliases.flatMap(a => normalizeEntityText(a).split(/\s+/)).filter(t => t.length > 2);
        let overlap = 0;
        for (const t of englishTokens) {
          if (observedTokens.has(t)) overlap += 1;
        }
        if (overlap >= 1 && overlap / englishTokens.length > bestScore) {
          bestScore = overlap / englishTokens.length;
          bestEntity = cs.canonicalName;
          bestReason = `Token context: ${overlap} shared tokens with "${cs.englishAliases[0]}"`;
        }
      }

      if (bestEntity && bestScore >= 0.3) {
        return { ...base, canonicalName: bestEntity, matchMethod: 'TOKEN_CONTEXT', matchedAlias: null, score: Math.min(0.7, bestScore), reason: bestReason };
      }
    }
  }

  // Layer 7: FUZZY — bounded edit-distance (only if enabled)
  if (enableFuzzy && (!options.maxLayer || options.maxLayer >= 7)) {
    let bestEntity: string | null = null;
    let bestScore = 0;
    let bestReason = '';

    for (const cs of crossScript) {
      for (const alias of cs.englishAliases) {
        const sim = simpleSimilarity(normalized, normalizeEntityText(alias));
        if (sim > bestScore && sim >= fuzzyThreshold) {
          bestScore = sim;
          bestEntity = cs.canonicalName;
          bestReason = `Fuzzy match: similarity ${sim.toFixed(3)} with "${alias}"`;
        }
      }
    }

    if (bestEntity) {
      return { ...base, canonicalName: bestEntity, matchMethod: 'FUZZY', matchedAlias: null, score: bestScore * 0.6, reason: bestReason };
    }
  }

  // No match
  return { ...base, canonicalName: null, matchMethod: 'NO_MATCH', matchedAlias: null, score: 0, reason: 'No matching entity found in any layer' };
}

// ── Utilities ────────────────────────────────────────────────────────────────

/**
 * Check if `alias` appears in `text` at a word boundary.
 * Prevents false merges like "Keralites" matching "Kerala".
 */
function matchesAtBoundary(text: string, alias: string): boolean {
  const textLower = text.toLowerCase();
  const aliasLower = alias.toLowerCase();
  if (!textLower.includes(aliasLower)) return false;
  const idx = textLower.indexOf(aliasLower);
  const beforeOk = idx === 0 || !/[a-zA-Z]/.test(text[idx - 1]);
  const afterIdx = idx + alias.length;
  const afterOk = afterIdx >= text.length || !/[a-zA-Z]/.test(text[afterIdx]);
  return beforeOk && afterOk;
}

/**
 * Bidirectional boundary-aware substring check.
 * `text` contains `alias` at boundary, OR `alias` contains `text` at boundary.
 */
function boundaryMatch(text: string, alias: string): boolean {
  return matchesAtBoundary(text, alias) || matchesAtBoundary(alias, text);
}

/** Simple Jaccard token similarity (for fuzzy layer only). */
function simpleSimilarity(a: string, b: string): number {
  const aTokens = new Set(a.split(/\s+/).filter(t => t.length > 1));
  const bTokens = new Set(b.split(/\s+/).filter(t => t.length > 1));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let intersection = 0;
  for (const t of aTokens) {
    if (bTokens.has(t)) intersection += 1;
  }
  const union = aTokens.size + bTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Resolve all entity mentions in a claim text against known entities.
 * Returns an array of match results (one per detected mention).
 */
export function resolveAllEntities(
  text: string,
  knownEntities: Array<{ name: string; aliases: string[] }>,
  options?: Parameters<typeof resolveEntity>[2]
): EntityMatchResult[] {
  const results: EntityMatchResult[] = [];
  const seen = new Set<string>();

  // Try each known entity against the text
  for (const entity of knownEntities) {
    // Check if any form of this entity appears in the text
    const allForms = [entity.name, ...entity.aliases];
    for (const form of allForms) {
      if (boundaryMatch(text, form) && !seen.has(entity.name)) {
        const result = resolveEntity(form, knownEntities, options);
        if (result.matchMethod !== 'NO_MATCH') {
          results.push(result);
          seen.add(entity.name);
        }
        break;
      }
    }
  }

  // Try cross-script entities
  const crossScript = options?.crossScriptEntities ?? CROSS_SCRIPT_ENTITY_REGISTRY;
  for (const cs of crossScript) {
    if (seen.has(cs.canonicalName)) continue;
    const allForms = [...cs.englishAliases, ...cs.nativeAliases];
    for (const form of allForms) {
      if (boundaryMatch(text, form)) {
        const result = resolveEntity(form, knownEntities, options);
        if (result.matchMethod !== 'NO_MATCH') {
          results.push(result);
          seen.add(cs.canonicalName);
        }
        break;
      }
    }
  }

  return results;
}
