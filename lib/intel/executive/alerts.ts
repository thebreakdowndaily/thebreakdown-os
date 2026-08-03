import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { PredictionsOverview } from '@/lib/intel/predictions/overview';
import type { EditorialAlert, EditorialAlertCategory, EditorialAlertSeverity } from './types';

// Governing document: Phase IV sprint brief (Editorial Alerts).
// Surfaces only meaningful, actionable alerts — high investigation priority, prediction
// fragility, scenario exposure, evidence debt, verification blockers, and research gaps.
// No temporal history exists in the frozen dataset, so "changes" alerts are represented
// honestly as cross-sectional signals, never as fabricated deltas.

const ALERT_CAP = 10;

function severityFor(category: EditorialAlertCategory, magnitude: number): EditorialAlertSeverity {
  if (category === 'investigation_priority') {
    return magnitude >= 88 ? 'critical' : 'high';
  }
  if (category === 'verification_blocker' || category === 'evidence_debt') {
    return 'high';
  }
  return magnitude >= 66 ? 'high' : magnitude >= 40 ? 'medium' : 'info';
}

export function buildEditorialAlerts(
  editorial: EditorialOverview,
  evidence: EvidenceOverview,
  predictions: PredictionsOverview,
): EditorialAlert[] {
  const alerts: EditorialAlert[] = [];

  const ranked = editorial.ranked;

  for (const c of ranked.filter((x) => x.ipi >= 80).slice(0, 3)) {
    alerts.push({
      id: `ipi-${c.canonical_constituency_id}`,
      category: 'investigation_priority',
      severity: severityFor('investigation_priority', c.ipi),
      title: `Highest investigation priority: ${c.constituency_name}`,
      detail: `IPI ${String(c.ipi)}/100 — ${c.topReasons[0]?.why ?? c.confidenceReason}`,
      confidence: c.confidence,
      action: c.recommendations[0]?.action ?? 'Assign coverage.',
      basis: `Investigation Priority Index ${String(c.ipi)} (threshold 80)`,
      relatedConstituency: c.canonical_constituency_id,
      source: 'Editorial Engine',
    });
  }

  for (const s of predictions.aggregate.sensitiveSeats.slice(0, 3)) {
    const top = s.sensitivity[0];
    if (!top) continue;
    alerts.push({
      id: `fragility-${s.canonical_constituency_id}`,
      category: 'prediction_fragility',
      severity: severityFor('prediction_fragility', Math.abs(top.delta) * 20),
      title: `Fragile prediction: ${s.constituency_name}`,
      detail: `Predicted ${s.predicted_winner} at ${String(s.winner_probability)}% — most sensitive to ${top.score.replace('_', ' ')} (${top.effect}, ±${String(top.delta)} pts).`,
      confidence: s.confidence,
      action: 'Verify both camps on the ground; treat the prediction as contested.',
      basis: `Top sensitivity ±${String(top.delta)} points`,
      relatedConstituency: s.canonical_constituency_id,
      source: 'Prediction Engine',
    });
  }

  for (const c of ranked.filter((x) => (x.factors.find((f) => f.key === 'scenario_exposure')?.value ?? 0) >= 66).slice(0, 3)) {
    const exposure = c.factors.find((f) => f.key === 'scenario_exposure');
    alerts.push({
      id: `scenario-${c.canonical_constituency_id}`,
      category: 'scenario_exposure',
      severity: severityFor('scenario_exposure', exposure?.value ?? 0),
      title: `High scenario exposure: ${c.constituency_name}`,
      detail: `Seat flips under ${exposure?.evidence[0] ?? 'multiple scenarios'}.`,
      confidence: c.confidence,
      action: 'Test the seat under each wave scenario before committing to an angle.',
      basis: `Scenario-exposure factor ${String(exposure?.value ?? 0)}/100 (threshold 66)`,
      relatedConstituency: c.canonical_constituency_id,
      source: 'Editorial Engine',
    });
  }

  for (const g of evidence.aggregate.mostGapped.slice(0, 3)) {
    alerts.push({
      id: `debt-${g.canonical_constituency_id}`,
      category: 'evidence_debt',
      severity: severityFor('evidence_debt', g.debt),
      title: `Evidence debt: ${g.constituency_name}`,
      detail: `Coverage ${String(g.coverage)}% with ${String(g.debt)} missing fields.`,
      confidence: g.confidence,
      action: 'Request district datasets and field-verify the registered gaps.',
      basis: `Evidence debt ${String(g.debt)} fields`,
      relatedConstituency: g.canonical_constituency_id,
      source: 'Evidence Engine',
    });
  }

  for (const c of ranked.filter(
    (x) => (x.factors.find((f) => f.key === 'verification_pressure')?.value ?? 0) >= 90,
  ).slice(0, 3)) {
    const vp = c.factors.find((f) => f.key === 'verification_pressure');
    alerts.push({
      id: `blocker-${c.canonical_constituency_id}`,
      category: 'verification_blocker',
      severity: 'high',
      title: `Verification blocker: ${c.constituency_name}`,
      detail: vp?.evidence[0] ?? 'Multiple conflicting signals registered.',
      confidence: c.confidence,
      action: 'Resolve conflicting signals before any publication moves forward.',
      basis: `Verification-pressure factor ${String(vp?.value ?? 0)}/100`,
      relatedConstituency: c.canonical_constituency_id,
      source: 'Editorial Engine',
    });
  }

  const predictionGapCount = predictions.all.filter((p) => (p.dataGaps?.length ?? 0) > 0).length;
  alerts.push({
    id: 'gap-development-indicators',
    category: 'research_gap',
    severity: 'info',
    title: 'Research gap: development indicators unavailable at constituency level',
    detail: 'Population, health, and education indicators are absent from the frozen dataset — public-relevance weighting is not computed and evidence debt is overstated.',
    confidence: 'HIGH',
    action: 'Source constituency-level development/health/education datasets before these factors can be modelled.',
    basis: 'Global dataset limitation, documented by the Editorial Engine',
    source: 'Evidence Engine',
  });

  if (predictionGapCount > 0) {
    alerts.push({
      id: 'gap-prediction-data',
      category: 'research_gap',
      severity: 'medium',
      title: `Prediction data gaps in ${String(predictionGapCount)} seats`,
      detail: `${String(predictionGapCount)} predictions carry at least one registered data gap.`,
      confidence: 'MEDIUM',
      action: 'Prioritise gap-field verification for the seats above.',
      basis: 'Prediction engine data-gap registry',
      source: 'Prediction Engine',
    });
  }

  const sorted = [...alerts].sort((a, b) => {
    const order: Record<EditorialAlertSeverity, number> = { critical: 3, high: 2, medium: 1, info: 0 };
    return order[b.severity] - order[a.severity];
  });

  return sorted.slice(0, ALERT_CAP);
}
