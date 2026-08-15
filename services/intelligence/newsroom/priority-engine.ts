/**
 * ─── Priority Engine (Newsroom Intelligence OS) ──────────────────────────────
 *
 * Core rule:
 * Deterministic mapping of 9 component scores to P0, P1, P2, P3.
 * Fully transparent rules — no opaque AI prioritization.
 */

import {
  EditorialPriority,
  SignalComponentScores,
  SignalPriorityExplanation,
} from '@/types/newsroom-intelligence';

export class PriorityEngine {
  /**
   * Evaluates component scores and derives priority tier and full explanation.
   */
  public static calculatePriority(
    scores: SignalComponentScores,
    title: string,
    keyEntities: string[],
    hasContradictions: boolean,
    primarySourceEmergence: boolean
  ): SignalPriorityExplanation {
    const triggeredRules: string[] = [];
    const evidenceBasis: string[] = [];

    // Calculate composite base score
    // Weightings:
    // Importance (25%), Evidence Strength (20%), Velocity (20%),
    // Relevance (15%), Source Reliability (10%), Novelty (10%)
    // Penalty for uncertainty & misinformation risk
    const positiveScore =
      scores.importance * 0.25 +
      scores.evidenceStrength * 0.2 +
      scores.velocity * 0.2 +
      scores.relevance * 0.15 +
      scores.sourceReliability * 0.1 +
      scores.novelty * 0.1;

    const penalty = (scores.uncertainty * 0.15 + scores.misinformationRisk * 0.2);
    const compositeScore = Math.max(0, Math.min(100, Math.round(positiveScore - penalty)));

    // Rule Evaluations:
    // P0 Triggers:
    // 1. Extreme velocity + high importance (>=85) + strong primary evidence (>=80)
    // 2. National impact / critical public consequence with primary source confirmation
    let priority: EditorialPriority = 'P3';
    let threshold = 40;

    const isExtremeVelocity = scores.velocity >= 75;
    const isHighImportance = scores.importance >= 80;
    const isStrongEvidence = scores.evidenceStrength >= 75;
    const isHighConfidence = scores.confidence >= 75;

    if (isHighImportance && isStrongEvidence && (isExtremeVelocity || primarySourceEmergence)) {
      priority = 'P0';
      threshold = 85;
      triggeredRules.push(
        'RULE-P0-01: Major public consequence with strong primary corroboration and high velocity.'
      );
    } else if (compositeScore >= 70 || (scores.importance >= 70 && isStrongEvidence)) {
      priority = 'P1';
      threshold = 70;
      triggeredRules.push(
        'RULE-P1-01: High-value developing event with credible independent corroboration.'
      );
    } else if (compositeScore >= 45 || scores.importance >= 50) {
      priority = 'P2';
      threshold = 45;
      triggeredRules.push(
        'RULE-P2-01: Significant development requiring editorial tracking.'
      );
    } else {
      priority = 'P3';
      threshold = 0;
      triggeredRules.push(
        'RULE-P3-01: Contextual or early-stage emerging watch item.'
      );
    }

    // Special escalations
    if (hasContradictions && priority !== 'P0') {
      triggeredRules.push(
        'ESCALATION: High-severity contradiction detected between claims; verification required.'
      );
    }

    if (primarySourceEmergence) {
      evidenceBasis.push('Primary statutory/official document emerged.');
    }
    if (scores.sourceReliability >= 80) {
      evidenceBasis.push('High-tier authoritative sources cited.');
    }
    if (keyEntities.length > 0) {
      evidenceBasis.push(`Key entities involved: ${keyEntities.slice(0, 3).join(', ')}.`);
    }

    // Recommended Action
    let recommendedAction = 'Monitor development.';
    if (priority === 'P0') {
      recommendedAction = 'IMMEDIATE EDITORIAL DISPATCH: Assign breaking investigation desk and prepare live brief.';
    } else if (priority === 'P1') {
      recommendedAction = 'PRIORITY COVERAGE: Assign reporter to verify primary documents and interview key sources.';
    } else if (priority === 'P2') {
      recommendedAction = 'DEVELOPING: Track cluster evolution and aggregate subsequent reporting.';
    }

    const whyItMatters = `Priority ${priority} (Score ${compositeScore}/100) — Driven by importance (${scores.importance}), evidence (${scores.evidenceStrength}), and velocity (${scores.velocity}).`;

    return {
      priority,
      compositeScore,
      threshold,
      triggeredRules,
      whyItMatters,
      evidenceBasis,
      recommendedAction,
    };
  }
}
