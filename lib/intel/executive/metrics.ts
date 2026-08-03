import { confidenceFrom } from '@/lib/intel/scoring/util';
import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { TrustIndex } from '@/lib/intel/trust/types';
import type { PredictionsOverview } from '@/lib/intel/predictions/overview';
import type { ScenariosOverview } from '@/lib/intel/scenarios/overview';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { ExecutiveMetric, ExecutiveMetricKey } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + Phase IV sprint brief (Executive Summary). Seven executive metrics aggregated from the
// certified engines. No engine logic here — only aggregation and explanation.

export interface MetricsInputs {
  predictions: PredictionsOverview;
  scenarios: ScenariosOverview;
  evidence: EvidenceOverview;
  editorial: EditorialOverview;
  trustIndex: TrustIndex;
}

export const EXECUTIVE_CALC_VERSION = '1.0.0';

function round100(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n)));
}

const NO_TREND = {
  direction: 'na' as const,
  label: 'No baseline',
  note: 'Frozen dataset snapshot — temporal trend requires versioned history.',
};

function avgOf(editorial: EditorialOverview, key: string): number {
  const row = editorial.factorAggregates.find((f) => f.key === key);
  return row?.avg ?? 0;
}

function confidenceFromRanked(editorial: EditorialOverview): ConfidenceTier {
  const high = editorial.ranked.filter((c) => c.confidence === 'HIGH' || c.confidence === 'VERY_HIGH').length;
  return confidenceFrom(high, editorial.ranked.length, 'MEDIUM');
}

function metric(
  key: ExecutiveMetricKey,
  label: string,
  value: number,
  unit: string,
  display: string,
  confidence: ConfidenceTier,
  primaryDriver: string,
  lastUpdated: string,
  source: string,
  evidenceSummary: string[],
  limitations: string[],
): ExecutiveMetric {
  return {
    key,
    label,
    value: round100(value),
    unit,
    display,
    trend: NO_TREND,
    confidence,
    primaryDriver,
    lastUpdated,
    calculationVersion: EXECUTIVE_CALC_VERSION,
    source,
    evidenceSummary: evidenceSummary.length > 0 ? evidenceSummary : ['Aggregated from certified engine outputs.'],
    limitations: limitations.length > 0 ? limitations : ['No stated limitation.'],
  };
}

export function buildExecutiveMetrics(inputs: MetricsInputs): ExecutiveMetric[] {
  const { predictions, scenarios, evidence, editorial, trustIndex } = inputs;
  const lastUpdated = trustIndex.generatedAt;

  const ranked = editorial.ranked;
  const count = ranked.length;
  const avgIpi = count === 0 ? 0 : ranked.reduce((s, c) => s + c.ipi, 0) / count;
  const topFactor = [...editorial.factorAggregates].sort((a, b) => b.avg - a.avg)[0];

  const avgStructural = avgOf(editorial, 'structural_priority');
  const avgInstability = avgOf(editorial, 'prediction_instability');
  const avgScenario = avgOf(editorial, 'scenario_exposure');
  const avgDebt = avgOf(editorial, 'evidence_debt');
  const avgVerification = avgOf(editorial, 'verification_pressure');

  const highPriority = ranked.filter((c) => c.ipi >= 60).length;
  const pressurePct = count === 0 ? 0 : (highPriority / count) * 100;

  const agg = predictions.aggregate;
  const predictionHighPct = agg.count === 0 ? 0 : round100((agg.highConfidence / agg.count) * 100);
  const avgMargin = round100((agg.avgWinnerProbability - 50) * 2);
  const stability = round100(predictionHighPct * 0.5 + avgMargin * 0.5);
  const mostSensitive = agg.sensitiveSeats[0];

  const evAgg = evidence.aggregate;
  const worstCategory = [...Object.values(evAgg.byCategory)].sort((a, b) => a.pct - b.pct)[0];
  const avgCoverage = round100(evAgg.avgCoverage);

  const verificationReadiness = round100(100 - avgVerification);
  const verificationHotSeats = ranked.filter((c) => (c.factors.find((f) => f.key === 'verification_pressure')?.value ?? 0) >= 50).length;

  const scenarioExposure = round100(avgScenario);
  const nonBaseline = scenarios.scenarios.filter((s) => s.id !== 'baseline');
  const busiestScenario = [...nonBaseline].sort((a, b) => b.flipCount - a.flipCount)[0];

  const trustLowest = [...trustIndex.components].sort((a, b) => a.contribution - b.contribution)[0];

  return [
    metric(
      'investigation_priority',
      'Overall Investigation Priority',
      avgIpi,
      '/100',
      `${String(round100(avgIpi))} / 100`,
      confidenceFromRanked(editorial),
      topFactor ? `${topFactor.label} (avg ${String(topFactor.avg)}/100)` : 'No factor aggregates available',
      lastUpdated,
      'Editorial Engine',
      [
        `Investigation Priority Index ranks ${String(count)} seats across 5 weighted factors`,
        ranked.length > 0 ? `Top seat: ${ranked[0].constituency_name} at IPI ${String(ranked[0].ipi)}` : 'No seats ranked',
        `Factor pressure averages — structural ${String(round100(avgStructural))}, instability ${String(round100(avgInstability))}, scenario ${String(round100(avgScenario))}, evidence debt ${String(round100(avgDebt))}, verification ${String(round100(avgVerification))}`,
      ],
      editorial.limitations.length > 0 ? editorial.limitations : ['No temporal history — IPI is cross-sectional.'],
    ),
    metric(
      'editorial_pressure',
      'Editorial Pressure',
      pressurePct,
      '% of seats',
      `${String(round100(pressurePct))}% of seats`,
      'MEDIUM',
      `${String(highPriority)} seats at IPI ≥ 60 (high investigation demand)`,
      lastUpdated,
      'Editorial Engine',
      [
        `${String(highPriority)} of ${String(count)} seats carry IPI ≥ 60`,
        `Highest factor pressure is ${topFactor ? topFactor.label : 'n/a'} at avg ${String(topFactor?.avg ?? 0)}/100`,
      ],
      ['Threshold-based (IPI ≥ 60). The threshold is editorial policy, not a statistical property.'],
    ),
    metric(
      'prediction_stability',
      'Prediction Stability',
      stability,
      '%',
      `${String(stability)}%`,
      confidenceFrom(agg.highConfidence, agg.count, 'MEDIUM'),
      mostSensitive ? `Most sensitive seat: ${mostSensitive.constituency_name} (±${String(mostSensitive.sensitivity[0]?.delta ?? 0)} pts)` : 'No sensitivity data',
      lastUpdated,
      'Prediction Engine',
      [
        `${String(agg.highConfidence)} of ${String(agg.count)} predictions at HIGH/VERY_HIGH confidence`,
        `Average winner probability ${String(round100(agg.avgWinnerProbability))}% across ${String(agg.count)} seats`,
        `${String(agg.sensitiveSeats.length)} most sensitivity-exposed seats tracked`,
      ],
      ['Stability blends high-confidence share with average winner margin; no temporal prediction history exists.'],
    ),
    metric(
      'evidence_coverage',
      'Evidence Coverage',
      avgCoverage,
      '%',
      `${String(avgCoverage)}%`,
      'HIGH',
      worstCategory ? `Lowest category: ${worstCategory.label} at ${String(worstCategory.pct)}%` : 'No categories available',
      lastUpdated,
      'Evidence Engine',
      [
        `Average evidence coverage ${String(avgCoverage)}% across ${String(evAgg.count)} constituencies`,
        `Total registered evidence debt: ${String(evAgg.totalDebt)} fields`,
      ],
      ['Coverage measures field presence, not source quality or recency.'],
    ),
    metric(
      'verification_readiness',
      'Verification Readiness',
      verificationReadiness,
      '%',
      `${String(verificationReadiness)}%`,
      'MEDIUM',
      `${String(verificationHotSeats)} seats with verification pressure ≥ 50`,
      lastUpdated,
      'Editorial Engine',
      [
        `Average verification pressure ${String(round100(avgVerification))}/100 across the pipeline`,
        `Structural conflict signals in ${String(verificationHotSeats)} seats`,
      ],
      ['Structural conflict signals only — no live verification workflow status is tracked.'],
    ),
    metric(
      'scenario_exposure',
      'Scenario Exposure',
      scenarioExposure,
      '%',
      `${String(scenarioExposure)}%`,
      'MEDIUM',
      busiestScenario ? `${busiestScenario.label}: ${String(busiestScenario.flipCount)} flips` : 'No scenarios available',
      lastUpdated,
      'Scenario Engine',
      [
        `Average scenario-exposure factor ${String(scenarioExposure)}/100 across seats`,
        `${String(nonBaseline.length)} non-baseline scenarios modelled`,
      ],
      ['Scenarios model uniform/regional swings; local coalition dynamics and candidate effects are not modelled.'],
    ),
    metric(
      'institutional_trust',
      'Institutional Trust Index',
      trustIndex.value,
      '/100',
      `${String(trustIndex.value)} / 100`,
      trustIndex.confidence,
      trustLowest ? `Lowest contributor: ${trustLowest.label} (${String(trustLowest.contribution)} weighted)` : 'No components available',
      lastUpdated,
      'Trust Index Service',
      [
        `${String(trustIndex.components.length)} explicit components with published weights`,
        trustIndex.confidenceReason,
      ],
      trustIndex.limitations,
    ),
  ];
}
