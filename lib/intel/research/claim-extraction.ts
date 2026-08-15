/**
 * ─── Research Intelligence Engine — Claim Extraction ─────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic claim extraction from normalized document text.
 *   - Attribution detection (said/announced/according to + person/org)
 *   - Statistic detection (percentages, currency, counts)
 *   - Claim-type classification (FACT / STATISTIC / QUOTE / ...)
 *   - Entity mentions matched against the project lexicon
 *   - Extraction confidence from signal length, concreteness, attribution
 *
 * The engine is explicit that extraction ≠ verification: claims are emitted
 * with verificationState 'SIGNAL_ONLY' and corroboration runs later.
 */

import type {
  ResearchClaim,
  ResearchClaimType,
  TopicExpansion,
} from '@/types/research-intelligence';
import { sentenceSplit, normalizeText, propositionKey, detectLanguage } from './normalization';
import { findEntity, entitySearchTerms } from './topic-expansion';
import { createClaimId } from './ids';

const ATTRIBUTION_PATTERNS = [
  /\b(said|stated|announced|declared|told|according to|confirmed|revealed|argued|claimed|reported)\b/i,
];

const STATISTIC_PATTERNS = [
  /\d+(\.\d+)?\s?%/,
  /\$\s?\d[\d,]*\s?(billion|million|trillion)?/i,
  /₹\s?\d[\d,]*(?:\s?(crore|lakh|billion|million))?/i,
  /\b\d[\d,]*\s?(billion|million|trillion|crore|lakh)\b/i,
];

const BOILERPLATE_PATTERNS = [
  /^©\s?/i,
  /^reuters\b/i,
  /^press trust of india/i,
  /^copyright/i,
  /^all rights reserved/i,
  /subscribe|newsletter/i,
];

const CAUSAL_PATTERNS = [/\b(because|caused|led to|resulted in|due to|therefore)\b/i];
const COMPARISON_PATTERNS = [/\b(compared to|higher than|lower than|greater than|more than|less than)\b/i];
const PREDICTION_PATTERNS = [/\b(will|expected to|projected to|is set to|is likely to|forecast)\b/i];
const ALLEGATION_PATTERNS = [/\b(accused|alleged|allegedly|charged)\b/i];
const DENIAL_PATTERNS = [/\b(denied|refuted|rejected the claim|no truth to)\b/i];
const FORECAST_PATTERNS = [/\b(forecast|prediction|outlook)\b/i];

export interface ClaimExtractionOptions {
  maxClaimsPerDocument?: number;
  /** Clock injection for deterministic firstSeenAt in tests. */
  now?: () => Date;
}

/** Detect whether a sentence is boilerplate / boilerplate content. */
export function isBoilerplate(text: string): boolean {
  return BOILERPLATE_PATTERNS.some((p) => p.test(text));
}

function matchesAny(patterns: RegExp[], text: string): boolean {
  return patterns.some((p) => p.test(text));
}

function classifyClaimType(sentence: string): ResearchClaimType {
  const text = sentence.trim();
  if (matchesAny(ALLEGATION_PATTERNS, text)) return 'ALLEGATION';
  if (matchesAny(DENIAL_PATTERNS, text)) return 'DENIAL';
  if (matchesAny(FORECAST_PATTERNS, text)) return 'FORECAST';
  if (matchesAny(STATISTIC_PATTERNS, text)) return 'STATISTIC';
  if (matchesAny(CAUSAL_PATTERNS, text)) return 'CAUSAL_CLAIM';
  if (matchesAny(COMPARISON_PATTERNS, text)) return 'COMPARISON';
  if (matchesAny(PREDICTION_PATTERNS, text)) return 'PREDICTION';
  return 'FACT';
}

function extractSpeaker(sentence: string): { speaker?: string; attributed: boolean } {
  const match = sentence.match(/^(?:according to|said|as|by|in|at)?\s*([A-Z][A-Za-z.\- ]{2,60}?)\s+(said|stated|announced|declared|told|confirmed|according to)/i);
  if (match) return { speaker: match[1].trim(), attributed: true };
  return { attributed: false };
}

function confidenceFor(attributed: boolean, length: number, concreteness: number): number {
  let score = 0.35;
  if (attributed) score += 0.25;
  score += Math.min(0.2, length / 400) * 0.2;
  score += concreteness * 0.25;
  return Math.round(Math.min(0.95, Math.max(0.1, score)) * 100) / 100;
}

/** Extract claims from a normalized document. Deterministic + stateless. */
export function extractClaims(
  text: string,
  expansion: TopicExpansion,
  options: ClaimExtractionOptions = {}
): ResearchClaim[] {
  const maxClaims = options.maxClaimsPerDocument ?? 60;
  const sentences = sentenceSplit(text);
  const lexicon = entitySearchTerms(expansion.entities).map((t) => t.toLowerCase());
  const claims: ResearchClaim[] = [];
  const now = (options.now ?? (() => new Date()))().toISOString();

  for (const sentence of sentences) {
    if (claims.length >= maxClaims) break;
    if (sentence.length < 40 || sentence.length > 600) continue;
    if (isBoilerplate(sentence)) continue;

    const normalized = propositionKey(sentence);
    if (normalized.length < 8) continue;

    const { speaker, attributed } = extractSpeaker(sentence);
    const entityMentions = expansion.entities
      .filter((e) => [e.name, ...e.aliases].some((a) => sentence.includes(a)))
      .map((e) => e.name);
    if (entityMentions.length === 0) continue;

    const concreteness =
      (matchesAny(STATISTIC_PATTERNS, sentence) ? 0.6 : 0) +
      (entityMentions.length >= 2 ? 0.3 : 0) +
      (attributed ? 0.2 : 0);

    claims.push({
      id: createClaimId(),
      projectId: '',
      claimText: normalizeText(sentence),
      normalizedClaim: normalized,
      documentId: '',
      sourceId: '',
      evidenceSpan: normalizeText(sentence),
      speaker,
      claimType: classifyClaimType(sentence),
      entityMentions,
      extractionConfidence: confidenceFor(attributed, sentence.length, concreteness),
      attribution: {
        isAttributed: attributed,
        attributionSource: speaker,
        statement: speaker ? `${speaker}: ${normalizeText(sentence)}` : normalizeText(sentence),
      },
      verificationState: 'SIGNAL_ONLY',
      contradictionIds: [],
      firstSeenAt: now,
    });
  }

  return claims;
}

export { sentenceSplit, detectLanguage, ATTRIBUTION_PATTERNS, lexiconSearchTerms };
function lexiconSearchTerms(expansion: TopicExpansion): string[] {
  return entitySearchTerms(expansion.entities).map((t) => t.toLowerCase());
}
