import { confidenceFrom, clamp100 } from '@/lib/intel/scoring/util';
import { factorConfidence } from '@/lib/intel/editorial/factors';
import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { TrustComponent, TrustComponentKey, TrustIndex, TrustInputs } from './types';

// Governing document: AGENTS.md (Institutional Trust Index composition)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// Institutional Trust Index — pure, reusable, shareable. No UI, no side effects.
// Consumed by Mission Control, daily briefing, weekly reports, mobile dashboard, and
// future APIs. Weights are explicit and visible; every contribution is attributable.

export type { TrustComponent, TrustComponentKey, TrustIndex, TrustInputs, TrustComponentInput } from './types';

export const TRUST_VERSION = '1.0.0';

export const TRUST_COMPONENT_KEYS: TrustComponentKey[] = [
  'evidence_coverage',
  'evidence_confidence',
  'verification_completeness',
  'prediction_stability',
  'scenario_consistency',
  'research_completeness',
];

export const TRUST_WEIGHTS: Record<TrustComponentKey, number> = {
  evidence_coverage: 0.25,
  evidence_confidence: 0.2,
  verification_completeness: 0.15,
  prediction_stability: 0.15,
  scenario_consistency: 0.15,
  research_completeness: 0.1,
};

export const TRUST_COMPONENT_LABELS: Record<TrustComponentKey, string> = {
  evidence_coverage: 'Evidence coverage',
  evidence_confidence: 'Evidence confidence',
  verification_completeness: 'Verification completeness',
  prediction_stability: 'Prediction stability',
  scenario_consistency: 'Scenario consistency',
  research_completeness: 'Research completeness',
};

const TRUST_COMPONENT_SOURCE: Record<TrustComponentKey, string> = {
  evidence_coverage: 'Evidence Engine',
  evidence_confidence: 'Evidence Engine',
  verification_completeness: 'Editorial Engine (verification pressure factor)',
  prediction_stability: 'Prediction Engine',
  scenario_consistency: 'Scenario Engine',
  research_completeness: 'Evidence Engine (category coverage)',
};

const GLOBAL_LIMITATIONS = [
  'Computed from a frozen dataset snapshot — no temporal trend exists, so the index measures current cross-sectional state, not change over time.',
  'Weights are editorial policy (explicit and versioned), not statistical estimates.',
  'No live verification workflow status is tracked — verification completeness reflects structural conflict signals only.',
];

export function validateWeights(): boolean {
  const sum = TRUST_COMPONENT_KEYS.reduce((s, k) => s + TRUST_WEIGHTS[k], 0);
  return Math.abs(sum - 1) < 1e-9;
}

function defaultConfidence(key: TrustComponentKey): ConfidenceTier {
  switch (key) {
    case 'evidence_coverage':
      return 'HIGH';
    case 'evidence_confidence':
      return 'HIGH';
    default:
      return 'MEDIUM';
  }
}

function buildComponent(key: TrustComponentKey, input: TrustInputs[TrustComponentKey]): TrustComponent {
  const value = clamp100(input.value / 100);
  const weight = TRUST_WEIGHTS[key];
  const confidence = input.confidence ?? defaultConfidence(key);
  return {
    key,
    label: TRUST_COMPONENT_LABELS[key],
    value,
    weight,
    contribution: clamp100((value * weight) / 100),
    confidence,
    evidence: input.evidence.length > 0 ? input.evidence : ['No evidence summary supplied'],
    limitation: input.limitation ?? 'Component limitation not stated',
    source: TRUST_COMPONENT_SOURCE[key],
  };
}

export function computeTrustIndex(inputs: TrustInputs, dataSource = 'unknown'): TrustIndex {
  const components = TRUST_COMPONENT_KEYS.map((key) => buildComponent(key, inputs[key]));
  const value = clamp100(components.reduce((s, c) => s + c.contribution, 0) / 100);
  const confidence = factorConfidence(components.map((c) => c.confidence));
  const confidenceReason = components
    .map((c) => `${c.label.toLowerCase()} ${c.confidence.replace('_', ' ')}`)
    .join('; ');

  const limitations = [
    ...GLOBAL_LIMITATIONS,
    ...components
      .map((c) => c.limitation)
      .filter((l, i, arr) => arr.indexOf(l) === i && !GLOBAL_LIMITATIONS.includes(l)),
  ];

  return {
    value,
    version: TRUST_VERSION,
    generatedAt: new Date().toISOString(),
    dataSource,
    components,
    confidence,
    confidenceReason,
    limitations,
  };
}

export function trustConfidenceFromPositive(positive: number, total: number): ConfidenceTier {
  return confidenceFrom(positive, total, 'MEDIUM');
}
