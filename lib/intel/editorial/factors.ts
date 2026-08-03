import type { ConstituencyRecord } from '@/lib/up403/types';
import type { ConstituencyIntelligence, ConfidenceTier } from '@/lib/intel/scoring/types';
import type { ConstituencyPrediction } from '@/lib/intel/predictions/types';
import type { ConstituencyEvidence } from '@/lib/intel/evidence/types';
import { SCENARIOS } from '@/lib/intel/scenarios/definitions';
import type { EditorialFactor, EditorialFactorKey, ScenarioFlip } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Editorial Intelligence)
// Five factors make up the Investigation Priority Index. Each is a PURE CONSUMER of a
// shipped engine output — no scoring/prediction/evidence logic is re-implemented here.

export const EDITORIAL_FACTORS: EditorialFactorKey[] = [
  'structural_priority',
  'prediction_instability',
  'scenario_exposure',
  'evidence_debt',
  'verification_pressure',
];

export const EDITORIAL_WEIGHTS: Record<EditorialFactorKey, number> = {
  structural_priority: 0.25,
  prediction_instability: 0.25,
  scenario_exposure: 0.15,
  evidence_debt: 0.2,
  verification_pressure: 0.15,
};

export const FACTOR_LABELS: Record<EditorialFactorKey, string> = {
  structural_priority: 'Structural priority',
  prediction_instability: 'Prediction instability',
  scenario_exposure: 'Scenario exposure',
  evidence_debt: 'Evidence debt',
  verification_pressure: 'Verification pressure',
};

export const NON_BASELINE_SCENARIOS = SCENARIOS.filter((s) => s.id !== 'baseline');

function clamp(v: number, lo: number, hi: number): number {
  if (Number.isNaN(v)) return lo;
  return Math.round(Math.min(hi, Math.max(lo, v)));
}

// Factor 1 — structural_priority: direct reuse of the shipped investigation_priority score.
function structuralPriorityFactor(intel: ConstituencyIntelligence): EditorialFactor {
  const score = intel.scores.investigation_priority;
  const evidence = score.drivers.length > 0 ? score.drivers.map((d) => `${d.factor}: ${d.evidence}`) : ['No structural drivers present in the frozen dataset'];
  const limitation = score.dataGaps.length > 0 ? `Structural signals only; ${score.dataGaps.join('; ').toLowerCase()}.` : 'Structural signals only — excludes prediction fragility and evidence debt.';
  return {
    key: 'structural_priority',
    label: FACTOR_LABELS.structural_priority,
    value: score.value,
    weight: EDITORIAL_WEIGHTS.structural_priority,
    contribution: clamp(score.value * EDITORIAL_WEIGHTS.structural_priority, 0, 100),
    confidence: score.confidence,
    evidence,
    limitation,
  };
}

// Factor 2 — prediction_instability: how contested/fragile the prediction is.
function predictionInstabilityFactor(prediction: ConstituencyPrediction): EditorialFactor {
  const closeness = 100 - Math.abs(prediction.winner_probability - 50) * 2;
  const maxSensitivity = prediction.sensitivity.reduce((m, s) => Math.max(m, Math.abs(s.delta)), 0);
  const sensitivityNorm = clamp(maxSensitivity * 20, 0, 100);
  const value = clamp(closeness * 0.7 + sensitivityNorm * 0.3, 0, 100);

  const evidence: string[] = [
    `Predicted ${prediction.predicted_winner} at ${String(prediction.winner_probability)}% (CI ${String(prediction.winner_ci[0])}–${String(prediction.winner_ci[1])})`,
  ];
  const top = prediction.sensitivity.length > 0 ? prediction.sensitivity[0] : null;
  if (top) {
    evidence.push(`Top sensitivity ${top.score.replace('_', ' ')}: ${top.effect} (±${String(top.delta)} pts)`);
  }

  return {
    key: 'prediction_instability',
    label: FACTOR_LABELS.prediction_instability,
    value,
    weight: EDITORIAL_WEIGHTS.prediction_instability,
    contribution: clamp(value * EDITORIAL_WEIGHTS.prediction_instability, 0, 100),
    confidence: prediction.confidence,
    evidence,
    limitation: 'No temporal prediction history exists — "predictions changed materially" cannot be measured; sensitivity proxies model fragility.',
  };
}

// Factor 3 — scenario_exposure: how many non-baseline scenarios flip this seat.
function scenarioExposureFactor(flips: ScenarioFlip[]): EditorialFactor {
  const total = Math.max(1, NON_BASELINE_SCENARIOS.length);
  const value = clamp((flips.length / total) * 100, 0, 100);
  const evidence =
    flips.length > 0
      ? flips.map((f) => `${f.scenarioLabel}: ${f.from} → ${f.to}`)
      : ['No non-baseline scenario flips this seat'];

  return {
    key: 'scenario_exposure',
    label: FACTOR_LABELS.scenario_exposure,
    value,
    weight: EDITORIAL_WEIGHTS.scenario_exposure,
    contribution: clamp(value * EDITORIAL_WEIGHTS.scenario_exposure, 0, 100),
    confidence: flips.length >= 2 ? 'HIGH' : 'MEDIUM',
    evidence,
    limitation: 'Scenario flips assume uniform/regional swings; local coalition dynamics are not modelled.',
  };
}

// Factor 4 — evidence_debt: inverted coverage from the evidence graph.
function evidenceDebtFactor(evidence: ConstituencyEvidence): EditorialFactor {
  const value = clamp(100 - evidence.coverage, 0, 100);
  const available = evidence.items.length - evidence.gaps.length;
  const gapCategories = [...new Set(evidence.gaps.map((g) => g.label))].slice(0, 4);
  const evidenceLines = [
    `Coverage ${String(evidence.coverage)}% (${String(available)} of ${String(evidence.items.length)} fields present)`,
  ];
  if (evidence.gaps.length > 0) {
    evidenceLines.push(`${String(evidence.gaps.length)} registered gaps (${gapCategories.join(', ')})`);
  }

  return {
    key: 'evidence_debt',
    label: FACTOR_LABELS.evidence_debt,
    value,
    weight: EDITORIAL_WEIGHTS.evidence_debt,
    contribution: clamp(value * EDITORIAL_WEIGHTS.evidence_debt, 0, 100),
    confidence: evidence.confidence,
    evidence: evidenceLines,
    limitation: 'Development/health/education indicators are unavailable at constituency level in the frozen dataset — this inflates debt across all seats.',
  };
}

// Factor 5 — verification_pressure: structural conflicts between independent signals.
function verificationPressureFactor(rec: ConstituencyRecord, prediction: ConstituencyPrediction, evidence: ConstituencyEvidence): EditorialFactor {
  const signals: string[] = [];

  if (rec.ls2024_pc_winner_party && rec.current_mla_party && rec.ls2024_pc_winner_party !== rec.current_mla_party) {
    signals.push(`LS2024 segment voted ${rec.ls2024_pc_winner_party} while the sitting MLA is ${rec.current_mla_party}`);
  }
  if (rec.trajectory_total_shifts > 1) {
    signals.push(`${String(rec.trajectory_total_shifts)} party shifts across 2012→2017→2022`);
  }
  if (evidence.confidence === 'LOW' || evidence.confidence === 'VERY_LOW') {
    signals.push(`Evidence confidence is ${evidence.confidence.replace('_', ' ')} — ${evidence.confidenceReason}`);
  }
  if (prediction.dataGaps.length > 0) {
    signals.push(`Prediction carries ${String(prediction.dataGaps.length)} registered data gap(s)`);
  }

  const value = clamp(signals.length * 30, 0, 100);
  let confidence: ConfidenceTier;
  if (signals.length >= 2) confidence = 'HIGH';
  else if (signals.length === 1) confidence = 'MEDIUM';
  else confidence = evidence.confidence === 'HIGH' || evidence.confidence === 'VERY_HIGH' ? 'MEDIUM' : 'LOW';

  return {
    key: 'verification_pressure',
    label: FACTOR_LABELS.verification_pressure,
    value,
    weight: EDITORIAL_WEIGHTS.verification_pressure,
    contribution: clamp(value * EDITORIAL_WEIGHTS.verification_pressure, 0, 100),
    confidence,
    evidence: signals.length > 0 ? signals : ['No structural conflicts between independent signals'],
    limitation: 'Based on structural conflicts only; live verification workflow status is not yet tracked.',
  };
}

export interface FactorInputs {
  intel: ConstituencyIntelligence;
  prediction: ConstituencyPrediction;
  evidence: ConstituencyEvidence;
  flips: ScenarioFlip[];
  rec: ConstituencyRecord;
}

export function buildFactors(inputs: FactorInputs): EditorialFactor[] {
  return [
    structuralPriorityFactor(inputs.intel),
    predictionInstabilityFactor(inputs.prediction),
    scenarioExposureFactor(inputs.flips),
    evidenceDebtFactor(inputs.evidence),
    verificationPressureFactor(inputs.rec, inputs.prediction, inputs.evidence),
  ];
}

export function factorConfidence(tiers: ConfidenceTier[]): ConfidenceTier {
  const rank: Record<ConfidenceTier, number> = { VERY_HIGH: 4, HIGH: 3, MEDIUM: 2, LOW: 1, VERY_LOW: 0 };
  if (tiers.length === 0) return 'LOW';
  const avg = tiers.reduce((s, t) => s + rank[t], 0) / tiers.length;
  if (avg >= 3.25) return 'HIGH';
  if (avg >= 2.5) return 'MEDIUM';
  if (avg >= 1.75) return 'LOW';
  return 'VERY_LOW';
}

export function factorConfidenceReason(tiers: Array<{ label: string; tier: ConfidenceTier }>): string {
  return tiers.map((t) => `${t.label.toLowerCase()} ${t.tier.replace('_', ' ')}`).join('; ');
}
