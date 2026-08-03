import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type {
  StoryImpact,
  StoryImpactDimension,
  StoryImpactDimensionKey,
} from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Story Impact)
// Story Impact is a weighted, explainable composite over certified signals. It introduces no new
// intelligence — every dimension is a projection of an engine output (investigation IPI, evidence
// coverage, verification completion, scenario flips, research findings, institutional trust).
// Weights are explicit and versioned; validateWeights() asserts they sum to 1. Every dimension
// carries its inputs, weight, contribution, limitation, and source — the calculation is never hidden.

export const STORY_IMPACT_CALC_VERSION = '1.0.0';

export const STORY_IMPACT_WEIGHTS: Record<StoryImpactDimensionKey, number> = {
  editorial_priority: 0.2,
  investigation_priority: 0.15,
  research_depth: 0.1,
  evidence_strength: 0.15,
  verification_completion: 0.15,
  institutional_trust: 0.1,
  story_confidence: 0.1,
  public_interest: 0.05,
};

const WEIGHT_ORDER: StoryImpactDimensionKey[] = [
  'editorial_priority',
  'investigation_priority',
  'research_depth',
  'evidence_strength',
  'verification_completion',
  'institutional_trust',
  'story_confidence',
  'public_interest',
];

const DIMENSION_LABEL: Record<StoryImpactDimensionKey, string> = {
  public_interest: 'Public Interest',
  editorial_priority: 'Editorial Priority',
  investigation_priority: 'Investigation Priority',
  research_depth: 'Research Depth',
  evidence_strength: 'Evidence Strength',
  verification_completion: 'Verification Completion',
  institutional_trust: 'Institutional Trust',
  story_confidence: 'Story Confidence',
};

export function validateStoryImpactWeights(): boolean {
  const sum = Object.values(STORY_IMPACT_WEIGHTS).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1) < 1e-9;
}

export const CONFIDENCE_SCORE: Record<ConfidenceTier, number> = {
  VERY_HIGH: 95,
  HIGH: 85,
  MEDIUM: 65,
  LOW: 40,
  VERY_LOW: 25,
};

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export interface StoryImpactInputs {
  ipi: number;
  confidence: ConfidenceTier;
  evidenceCoverage: number;
  verifiedRatio: number;
  verificationScore: number | null;
  researchFindings: number | null;
  scenarioFlips: number | null;
  trustValue: number | null;
  verificationConfidence: ConfidenceTier | null;
}

function dimension(
  key: StoryImpactDimensionKey,
  value: number,
  confidence: ConfidenceTier,
  inputs: string[],
  limitation: string,
  source: string,
): StoryImpactDimension {
  return {
    key,
    label: DIMENSION_LABEL[key],
    value: clamp100(value),
    confidence,
    weight: STORY_IMPACT_WEIGHTS[key],
    contribution: clamp100(value) * STORY_IMPACT_WEIGHTS[key],
    inputs,
    limitation,
    source,
  };
}

/** Build the eight-dimension story impact with an explicit, versioned weighted composite. */
export function buildStoryImpact(inputs: StoryImpactInputs): StoryImpact {
  if (!validateStoryImpactWeights()) {
    throw new Error('STORY_IMPACT_WEIGHTS must sum to 1.0');
  }

  const { ipi, confidence, evidenceCoverage, verifiedRatio, verificationScore, researchFindings, scenarioFlips, trustValue, verificationConfidence } = inputs;

  const dimensions: StoryImpactDimension[] = [
    dimension(
      'editorial_priority',
      ipi,
      confidence,
      [`Investigation Priority Index ${String(Math.round(ipi))}`],
      'The IPI is a decision aid for editors, not a prediction of newsworthiness.',
      'lib/intel/editorial',
    ),
    dimension(
      'investigation_priority',
      ipi,
      confidence,
      [`Investigation Priority Index ${String(Math.round(ipi))}`],
      'Mirrors the IPI; framed as investigation pressure for this seat.',
      'lib/intel/editorial',
    ),
    dimension(
      'research_depth',
      researchFindings === null
        ? evidenceCoverage
        : clamp100(0.5 * evidenceCoverage + 0.5 * Math.min(100, researchFindings * 12)),
      researchFindings === null ? 'MEDIUM' : 'MEDIUM',
      researchFindings === null
        ? [`Evidence coverage ${String(Math.round(evidenceCoverage))}%`]
        : [`Evidence coverage ${String(Math.round(evidenceCoverage))}%`, `${String(researchFindings)} research finding(s)`],
      researchFindings === null
        ? 'Research findings unavailable for this surface; research depth proxied by evidence coverage only.'
        : 'Research finding count is a proxy for depth, not a measure of quality.',
      researchFindings === null ? 'lib/intel/evidence' : 'lib/intel/toolkit',
    ),
    dimension(
      'evidence_strength',
      evidenceCoverage,
      evidenceCoverage >= 75 ? 'HIGH' : evidenceCoverage >= 50 ? 'MEDIUM' : 'LOW',
      [`Evidence coverage ${String(Math.round(evidenceCoverage))}%`],
      'Coverage counts available fields, not source quality.',
      'lib/intel/evidence',
    ),
    dimension(
      'verification_completion',
      verificationScore ?? Math.round(verifiedRatio * 100),
      verificationConfidence ?? 'MEDIUM',
      verificationScore === null
        ? [`${String(Math.round(verifiedRatio * 100))}% claims verified (ratio proxy)`]
        : [`Verification readiness ${String(Math.round(verificationScore))}/100`],
      verificationScore === null
        ? 'No verification case readiness available; completion proxied by verified-claims ratio.'
        : 'Readiness reflects registered verification state within the process lifetime.',
      'lib/intel/verification',
    ),
    dimension(
      'institutional_trust',
      trustValue ?? verificationScore ?? 0,
      trustValue !== null ? 'MEDIUM' : verificationScore !== null ? 'MEDIUM' : 'LOW',
      trustValue !== null
        ? [`Institutional Trust Index ${String(Math.round(trustValue))}`]
        : verificationScore !== null
          ? [`Verification readiness ${String(Math.round(verificationScore))}/100 (proxy)`]
          : ['No trust signal available for this surface'],
      trustValue !== null
        ? 'The Institutional Trust Index is computed platform-wide by the Executive Intelligence Service.'
        : 'Standalone surface: institutional trust proxied by verification readiness, not the full Trust Index.',
      trustValue !== null ? 'lib/intel/trust' : 'lib/intel/verification',
    ),
    dimension(
      'story_confidence',
      clamp100(0.7 * CONFIDENCE_SCORE[confidence] + (verificationScore === null ? 0 : 0.3 * verificationScore)),
      confidence,
      [`Engine confidence ${confidence.replace('_', ' ')}`],
      verificationScore === null
        ? 'Verification not available on this surface; story confidence weighted on engine confidence only.'
        : 'Blend of engine confidence and verification readiness.',
      'lib/intel/scoring + lib/intel/verification',
    ),
    dimension(
      'public_interest',
      clamp100(0.6 * evidenceCoverage + 0.4 * Math.min(100, (scenarioFlips ?? 0) * 20)),
      'MEDIUM',
      [`Evidence coverage ${String(Math.round(evidenceCoverage))}%`, `${String(scenarioFlips ?? 0)} scenario flip(s)`],
      'Population-level public relevance is not modelled in the frozen dataset; this dimension is a structural proxy only and carries the smallest weight.',
      'lib/intel/evidence + lib/intel/scenarios',
    ),
  ];

  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.contribution, 0));

  return {
    overall,
    dimensions,
    weightsApplied: WEIGHT_ORDER.map((key) => ({ key, label: DIMENSION_LABEL[key], weight: STORY_IMPACT_WEIGHTS[key] })),
    calculationVersion: STORY_IMPACT_CALC_VERSION,
    limitations: [
      'Population-level public relevance is not modelled in the frozen dataset; public interest is a structural proxy with the smallest weight.',
      'Dimension values are projections of certified engine outputs and carry the underlying engines\' confidence and limitations.',
      'The composite is a weighted sum of explainable dimensions, not a claim about reader demand or newsworthiness.',
    ],
  };
}
