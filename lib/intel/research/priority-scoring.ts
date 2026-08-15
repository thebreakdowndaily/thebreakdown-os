/**
 * ─── Research Intelligence Engine — Priority Scoring ─────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic, multi-component priority scoring for research projects,
 * signals and change events. Every score carries its component scores and a
 * human-readable explanation — a single opaque number is never presented.
 *
 * The priority score combines relevance, impact, freshness, corroboration,
 * source quality, and uncertainty. Social engagement affects *urgency* only,
 * never the truth score (see social-signals.ts).
 */

import type { ResearchPriorityScore, ResearchScoreComponents } from '@/types/research-intelligence';

export function explainScore(components: ResearchScoreComponents): string[] {
  const lines: string[] = [];
  if (components.impact >= 0.8) lines.push('High impact: affects a large population or major policy.');
  if (components.relevance >= 0.8) lines.push('Highly relevant to the research question.');
  if (components.freshness >= 0.8) lines.push('Fresh signal: published within the last day.');
  if (components.uncertainty >= 0.7) lines.push('High uncertainty: needs verification before use.');
  if (components.corroboration >= 0.7) lines.push('Well corroborated across independent sources.');
  if (components.independence >= 0.7) lines.push('Independent sources support this.');
  if (lines.length === 0) lines.push('Low-priority signal: no immediate action required.');
  return lines;
}

export function computePriorityScore(components: ResearchScoreComponents): ResearchPriorityScore {
  const value =
    0.25 * components.impact +
    0.2 * components.relevance +
    0.15 * components.freshness +
    0.1 * components.independence +
    0.1 * components.corroboration +
    0.1 * components.specificity +
    0.05 * components.novelty +
    0.05 * components.primarySourceProximity;

  return {
    value: Math.round(Math.min(1, Math.max(0, value)) * 100) / 100,
    components,
    explanation: explainScore(components),
  };
}

/** Map a [0,1] priority score to a P0–P3 tier. */
export function priorityTier(score: number): 'P0' | 'P1' | 'P2' | 'P3' {
  if (score >= 0.8) return 'P0';
  if (score >= 0.6) return 'P1';
  if (score >= 0.35) return 'P2';
  return 'P3';
}

/** Normalize an arbitrary non-negative quantity to [0,1] with a soft cap. */
export function normalizeUnit(value: number, cap: number): number {
  if (value <= 0) return 0;
  return Math.min(1, value / cap);
}
