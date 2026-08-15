/**
 * ─── Research Intelligence Engine — Contradiction Detection ──────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic contradiction detection between corroborated claims.
 *
 * Method (v1.0, honest about its limits):
 *   1. Extract a predicate-key from a claim: the non-value skeleton
 *      (normalized claim minus the numeric/metric value). Two claims that share
 *      a predicate-key but carry different metric values are candidates.
 *   2. Numeric values are extracted (%, $/₹ amounts, counts).
 *   3. The pair is classified:
 *        TRUE_CONTRADICTION   — same predicate, clearly conflicting values
 *        TEMPORAL_DIFFERENCE  — values differ and a date phrase differs
 *        SCOPE_DIFFERENCE     — values differ and scope words differ (e.g., "all" vs "some")
 *        DEFINITION_MISMATCH  — the predicate keys are near-identical but not the same measure
 *        UNRESOLVED           — any ambiguity
 *   4. Contradictions are NEVER silently resolved — they are recorded with a
 *      classification, nextAction, and status OPEN until a human adjudicates.
 */

import type { ContradictionClassification, ResearchClaim, ResearchSource } from '@/types/research-intelligence';
import { propositionKey } from './normalization';

export interface ContradictionCandidate {
  claimA: ResearchClaim;
  claimB: ResearchClaim;
  sourceA: ResearchSource | undefined;
  sourceB: ResearchSource | undefined;
}

export interface ContradictionDetectionResult {
  claimA: ResearchClaim;
  claimB: ResearchClaim;
  classification: ContradictionClassification;
  metric?: string;
  valueA?: string;
  valueB?: string;
  possibleExplanation?: string;
  nextAction: string;
}

const VALUE_PATTERN = /\$?\s?₹?\s?\d[\d,]*(\.\d+)?\s?(%|percent|billion|million|trillion|crore|lakh|usd|dollars|rupees)?/gi;

function extractValues(text: string): string[] {
  const matches = text.match(VALUE_PATTERN) ?? [];
  return matches.map((m) => m.trim()).filter((m) => m.length > 0);
}

/** Strip numeric values + connector words + scope words to get the predicate skeleton. */
export function predicateKey(text: string): string {
  return propositionKey(text)
    .replace(VALUE_PATTERN, ' ')
    .replace(/\b(in|of|by|at|to|for|than|from|with|is|are|was|were)\b/g, ' ')
    .replace(new RegExp(SCOPE_WORDS.source, 'gi'), ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SCOPE_WORDS = /\b(all|every|most|some|few|none|always|never|entire|entirely|partly|partially|completely|universal)\b/i;
const TEMPORAL_WORDS = /\b(in|by|during|as of|until|before|after)\s+(19|20)\d\d|(19|20)\d\d(?!\s?%|\s?billion|\s?million)/i;

/** Detect a contradiction candidate pair and classify it. Pure + deterministic. */
export function detectContradiction(input: ContradictionCandidate): ContradictionDetectionResult | null {
  const { claimA, claimB } = input;

  const keyA = predicateKey(claimA.claimText);
  const keyB = predicateKey(claimB.claimText);

  // Only claims with the same predicate skeleton can contradict each other.
  if (keyA.length < 12 || keyA !== keyB) return null;

  const valuesA = extractValues(claimA.claimText);
  const valuesB = extractValues(claimB.claimText);
  if (valuesA.length === 0 || valuesB.length === 0) return null;

  const metric = keyA;
  const valueA = valuesA[0];
  const valueB = valuesB[0];
  if (valueA === valueB) return null;

  // Classify.
  const aHasScope = SCOPE_WORDS.test(claimA.claimText);
  const bHasScope = SCOPE_WORDS.test(claimB.claimText);
  const aHasTime = TEMPORAL_WORDS.test(claimA.claimText);
  const bHasTime = TEMPORAL_WORDS.test(claimB.claimText);

  let classification: ContradictionClassification = 'TRUE_CONTRADICTION';
  let explanation: string | undefined;
  let nextAction = 'Resolve with primary source (official/regulatory document).';

  if ((aHasTime || bHasTime) && !(aHasTime && bHasTime)) {
    classification = 'TEMPORAL_DIFFERENCE';
    explanation = 'Claims reference different time periods; they may both be true of different dates.';
    nextAction = 'Confirm the date of each claim against the primary source before adjudicating.';
  } else if (aHasScope && bHasScope) {
    classification = 'SCOPE_DIFFERENCE';
    explanation = 'Claims differ in scope (e.g., "all" vs "some"); both may be partially correct.';
    nextAction = 'Clarify the population/sector each claim refers to using primary sources.';
  } else if (claimA.claimType !== claimB.claimType) {
    classification = 'DEFINITION_MISMATCH';
    explanation = 'The claims measure different things despite similar wording.';
    nextAction = 'Compare the definitions/metrics used by each source before adjudicating.';
  }

  return {
    claimA,
    claimB,
    classification,
    metric,
    valueA,
    valueB,
    possibleExplanation: explanation,
    nextAction,
  };
}

/** Detect all contradiction pairs within a set of claims (O(n²), bounded). */
export function detectContradictions(
  claims: ResearchClaim[],
  sourcesById: Map<string, ResearchSource>,
  maxPairs = 200
): ContradictionDetectionResult[] {
  const results: ContradictionDetectionResult[] = [];
  for (let i = 0; i < claims.length && results.length < maxPairs; i += 1) {
    for (let j = i + 1; j < claims.length && results.length < maxPairs; j += 1) {
      const a = claims[i];
      const b = claims[j];
      if (a.id === b.id) continue;
      if (a.sourceId === b.sourceId) continue;
      const result = detectContradiction({
        claimA: a,
        claimB: b,
        sourceA: sourcesById.get(a.sourceId),
        sourceB: sourcesById.get(b.sourceId),
      });
      if (result) results.push(result);
    }
  }
  return results;
}
