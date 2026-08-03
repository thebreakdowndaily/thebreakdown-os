import type { ConstituencyRecord } from '@/lib/up403/types';
import { toConstituencyIntelligence } from '@/lib/intel/scoring';
import { predictRecord } from '@/lib/intel/predictions';
import { buildEvidenceGraph } from '@/lib/intel/evidence';
import { projectSeat } from '@/lib/intel/scenarios/engine';
import {
  EDITORIAL_FACTORS,
  EDITORIAL_WEIGHTS,
  NON_BASELINE_SCENARIOS,
  buildFactors,
  factorConfidence,
  factorConfidenceReason,
} from './factors';
import type { EditorialFactor, EditorialReason, InvestigationCase, ScenarioFlip } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Editorial Intelligence)
// + docs/intelligence/roadmap.md (Part 14 — Editorial Intelligence)
// The Investigation Priority Index (IPI) is a weighted factor surface OVER the shipped engines.
// It consumes investigation_priority scoring, prediction instability, scenario flip exposure,
// evidence coverage/debt, and verification pressure. No engine logic is duplicated here.

export type { InvestigationCase, EditorialFactor, EditorialReason, ScenarioFlip, EditorialOverview, EditorialFactorAggregate, EditorialFactorKey, EditorialRecommendation } from './types';
export { EDITORIAL_FACTORS, EDITORIAL_WEIGHTS, NON_BASELINE_SCENARIOS, buildFactors } from './factors';

export function computeFlips(prediction: ReturnType<typeof predictRecord>): ScenarioFlip[] {
  return NON_BASELINE_SCENARIOS.map((def) => ({ def, outcome: projectSeat(prediction, def.swings) }))
    .filter((o) => o.outcome.flipped)
    .map((o) => ({
      scenarioId: o.def.id,
      scenarioLabel: o.def.label,
      from: o.outcome.baselineWinner,
      to: o.outcome.scenarioWinner,
    }));
}

function recommendationFor(f: EditorialFactor, flips: ScenarioFlip[], prediction: ReturnType<typeof predictRecord>, evidence: ReturnType<typeof buildEvidenceGraph>, rec: ConstituencyRecord): string {
  switch (f.key) {
    case 'structural_priority':
      return `Standing coverage: structural signals score ${String(f.value)}/100 (${String(rec.party_turnover_count || 0)} party changes, volatility ${String(rec.seat_volatility_index || 0)}, DNA ${rec.dna_classification || 'unclassified'}).`;
    case 'prediction_instability':
      return `Treat as contested: predicted ${prediction.predicted_winner} at ${String(prediction.winner_probability)}% — verify both camps before writing.`;
    case 'scenario_exposure':
      return `Stress-test for waves: seat flips in ${String(flips.length)} of ${String(NON_BASELINE_SCENARIOS.length)} scenarios — report on swing conditions.`;
    case 'evidence_debt':
      return `Field-verify registered gaps: coverage ${String(evidence.coverage)}%, ${String(evidence.debt)} missing fields — request district datasets.`;
    case 'verification_pressure':
      return `Resolve conflicting signals before publication: LS2024 segment vs sitting MLA, turnover, or low-confidence evidence.`;
  }
}

function structuralWhy(f: EditorialFactor, intel: ReturnType<typeof toConstituencyIntelligence>): string {
  const score = intel.scores.investigation_priority;
  const strongest = [...score.drivers].sort((a, b) => b.magnitude - a.magnitude)[0];
  if (strongest.magnitude > 0) return `${strongest.factor}: ${strongest.evidence}`;
  return `Score ${String(f.value)}/100 across ${String(score.drivers.length)} structural signals`;
}

function buildTopReasons(factors: EditorialFactor[], intel: ReturnType<typeof toConstituencyIntelligence>): EditorialReason[] {
  const sorted = [...factors].sort((a, b) => b.contribution - a.contribution);
  const picks = sorted.filter((f) => f.contribution >= 8).slice(0, 3);
  const reasons = (picks.length > 0 ? picks : [sorted[0]]).map((f) => ({
    factor: f.key,
    label: f.label,
    why: f.key === 'structural_priority' ? structuralWhy(f, intel) : (f.evidence[0] ?? f.label),
  }));
  return reasons;
}

function collectLimitations(rec: ConstituencyRecord, factors: EditorialFactor[], prediction: ReturnType<typeof predictRecord>, evidence: ReturnType<typeof buildEvidenceGraph>): string[] {
  const limits = new Set<string>();
  for (const f of factors) limits.add(f.limitation);
  for (const gap of prediction.dataGaps) {
    limits.add(`Prediction gap: ${gap}`);
  }
  if (!rec.population_value) {
    limits.add('Public-relevance weighting (population-based) is not computed — the frozen dataset has no constituency population.');
  }
  if (evidence.categoryCoverage.some((c) => c.category === 'development_indicators' && c.pct < 100)) {
    limits.add('Development indicators unavailable at constituency level — evidence debt overstates in that category.');
  }
  return [...limits];
}

export function buildInvestigationCase(rec: ConstituencyRecord): InvestigationCase {
  const intel = toConstituencyIntelligence(rec);
  const prediction = predictRecord(rec);
  const evidence = buildEvidenceGraph(rec);
  const flips = computeFlips(prediction);
  const factors = buildFactors({ rec, intel, prediction, evidence, flips });

  const ipi = Math.round(factors.reduce((s, f) => s + f.contribution, 0));
  const confidence = factorConfidence(factors.map((f) => f.confidence));
  const confidenceReason = factorConfidenceReason(
    factors.map((f) => ({ label: f.label, tier: f.confidence })),
  );

  const topReasons = buildTopReasons(factors, intel);

  const recommendations = factors
    .filter((f) => f.contribution >= 8)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((f) => ({ factor: f.key, action: recommendationFor(f, flips, prediction, evidence, rec) }));

  return {
    canonical_constituency_id: rec.canonical_constituency_id,
    constituency_name: rec.constituency_name,
    ac_number: rec.ac_number,
    district: rec.district,
    region: rec.region,
    reservation_type: rec.reservation_type,
    current_mla_party: rec.current_mla_party || '',
    predicted_winner: prediction.predicted_winner,
    winner_probability: prediction.winner_probability,
    ipi,
    confidence,
    confidenceReason,
    factors,
    topReasons,
    recommendations,
    limitations: collectLimitations(rec, factors, prediction, evidence),
    generatedFrom: `up403-master-dataset-v1@${rec.master_dataset_version || '1.1.0'}`,
  };
}

export function rankInvestigationPipeline(records: ConstituencyRecord[]): InvestigationCase[] {
  return records
    .map(buildInvestigationCase)
    .sort((a, b) => b.ipi - a.ipi || a.canonical_constituency_id.localeCompare(b.canonical_constituency_id));
}

export function pipelineByRegion(ranked: InvestigationCase[]): Record<string, number> {
  const byRegion: Record<string, number> = {};
  for (const c of ranked) {
    const key = c.region || 'Unknown';
    byRegion[key] = (byRegion[key] ?? 0) + 1;
  }
  return byRegion;
}

export function factorAggregatesFor(ranked: InvestigationCase[]): Array<{ key: EditorialFactor['key']; label: string; weight: number; avg: number; min: number; max: number }> {
  return EDITORIAL_FACTORS.map((key) => {
    const values = ranked.map((c) => c.factors.find((f) => f.key === key)?.value ?? 0);
    return {
      key,
      label: ranked[0]?.factors.find((f) => f.key === key)?.label ?? key,
      weight: EDITORIAL_WEIGHTS[key],
      avg: values.length === 0 ? 0 : Math.round(values.reduce((s, v) => s + v, 0) / values.length),
      min: values.length === 0 ? 0 : Math.min(...values),
      max: values.length === 0 ? 0 : Math.max(...values),
    };
  });
}
