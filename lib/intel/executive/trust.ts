import { computeTrustIndex, trustConfidenceFromPositive } from '@/lib/intel/trust';
import type { TrustInputs, TrustIndex } from '@/lib/intel/trust/types';
import type { PredictionsOverview } from '@/lib/intel/predictions/overview';
import type { ScenariosOverview } from '@/lib/intel/scenarios/overview';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { EditorialOverview } from '@/lib/intel/editorial/types';

// Governing document: AGENTS.md (Institutional Trust Index) + Phase IV sprint brief.
// Adapter between certified engine overviews and the reusable Trust Index service.
// This file derives the six component inputs from engine outputs. The Trust Index itself
// (lib/intel/trust) is engine-agnostic and reusable by any surface.

export interface TrustEngineInputs {
  predictions: PredictionsOverview;
  scenarios: ScenariosOverview;
  evidence: EvidenceOverview;
  editorial: EditorialOverview;
}

function round100(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n)));
}

function avgOf(editorial: EditorialOverview, key: string): number {
  const row = editorial.factorAggregates.find((f) => f.key === key);
  return row?.avg ?? 0;
}

export function buildTrustInputs(inputs: TrustEngineInputs): TrustInputs {
  const evidence = inputs.evidence.aggregate;
  const predictions = inputs.predictions.aggregate;
  const scenarios = inputs.scenarios.scenarios;
  const editorial = inputs.editorial;

  const count = evidence.count;
  const highConfidence = (evidence.confidenceDistribution.VERY_HIGH ?? 0) + (evidence.confidenceDistribution.HIGH ?? 0);
  const evidenceConfidenceValue = count === 0 ? 0 : round100((highConfidence / count) * 100);

  const highPrediction = predictions.highConfidence;
  const predictionHighPct = predictions.count === 0 ? 0 : round100((highPrediction / predictions.count) * 100);
  const avgMargin = round100((predictions.avgWinnerProbability - 50) * 2);
  const predictionStabilityValue = round100(predictionHighPct * 0.5 + avgMargin * 0.5);

  const nonBaseline = scenarios.filter((s) => s.id !== 'baseline');
  const avgFlipPct =
    nonBaseline.length === 0
      ? 0
      : round100(nonBaseline.reduce((sum, s) => sum + (s.totalSeats === 0 ? 0 : (s.flipCount / s.totalSeats) * 100), 0) / nonBaseline.length);
  const scenarioConsistencyValue = round100(100 - avgFlipPct);

  const categories = Object.values(evidence.byCategory);
  const researchCompletenessValue = categories.length === 0 ? 0 : round100(categories.reduce((sum, c) => sum + c.pct, 0) / categories.length);

  const avgVerificationPressure = avgOf(editorial, 'verification_pressure');
  const verificationCompletenessValue = round100(100 - avgVerificationPressure);

  return {
    evidence_coverage: {
      value: round100(evidence.avgCoverage),
      confidence: 'HIGH',
      evidence: [
        `Average evidence coverage ${String(round100(evidence.avgCoverage))}% across ${String(count)} constituencies`,
        `Total registered evidence debt: ${String(evidence.totalDebt)} fields`,
      ],
      limitation: 'Coverage measures field presence in the frozen dataset, not source quality or recency.',
    },
    evidence_confidence: {
      value: evidenceConfidenceValue,
      confidence: trustConfidenceFromPositive(highConfidence, count),
      evidence: [`${String(highConfidence)} of ${String(count)} constituencies at HIGH/VERY_HIGH evidence confidence`],
      limitation: 'Confidence derives from structural provenance rules, not live verification of each field.',
    },
    verification_completeness: {
      value: verificationCompletenessValue,
      confidence: 'MEDIUM',
      evidence: [`Verification pressure averages ${String(avgVerificationPressure)}/100 across the pipeline (structural conflicts only)`],
      limitation: 'No live verification workflow status is tracked — this reflects structural conflict signals only.',
    },
    prediction_stability: {
      value: predictionStabilityValue,
      confidence: trustConfidenceFromPositive(predictions.highConfidence, predictions.count),
      evidence: [
        `${String(predictions.highConfidence)} of ${String(predictions.count)} predictions at HIGH/VERY_HIGH confidence`,
        `Average winner probability ${String(round100(predictions.avgWinnerProbability))}%`,
      ],
      limitation: 'Stability is cross-sectional — no temporal prediction history exists to measure change over time.',
    },
    scenario_consistency: {
      value: scenarioConsistencyValue,
      confidence: 'MEDIUM',
      evidence: [
        `Across ${String(nonBaseline.length)} non-baseline scenarios, an average ${String(avgFlipPct)}% of seats flip`,
      ],
      limitation: 'Scenarios model uniform/regional swings; local coalition dynamics and candidate effects are not modelled.',
    },
    research_completeness: {
      value: researchCompletenessValue,
      confidence: 'MEDIUM',
      evidence: [`Average category coverage ${String(researchCompletenessValue)}% across ${String(categories.length)} evidence categories`],
      limitation: 'Development/health/education indicators are absent at constituency level in the frozen dataset, depressing this score.',
    },
  };
}

export function buildTrustIndexForEngines(inputs: TrustEngineInputs): TrustIndex {
  return computeTrustIndex(buildTrustInputs(inputs), inputs.evidence.dataSource);
}
