import type { ResearchSummary } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

export function buildResearchSummary(facts: SeatFacts): ResearchSummary {
  const rec = facts.record;
  const ev = facts.evidence;
  const prediction = facts.prediction;

  const historicalTrends = [
    facts.historyLine,
    rec.competitiveness_trend ? `Competitiveness trend: ${rec.competitiveness_trend}.` : '',
    rec.seat_volatility_index > 0 ? `Seat volatility index ${String(rec.seat_volatility_index)} (higher = more turnover).` : '',
    rec.party_turnover_count > 0 ? `Party turnover count: ${String(rec.party_turnover_count)}.` : '',
  ].filter(Boolean);

  const findings = [
    rec.dna_reasoning ? `DNA reasoning: ${rec.dna_reasoning}.` : '',
    prediction.whyLeading,
    prediction.whatCouldChangeIt,
  ].filter(Boolean);

  const officialReports = ev.items
    .filter((i) => i.status === 'available' && i.sourceDataset)
    .map((i) => i.sourceDataset)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const evidenceStrength = `Evidence coverage ${String(ev.coverage)}% across ${String(ev.items.length)} registered fields; overall confidence ${ev.confidence.replace('_', ' ')} (${ev.confidenceReason}).`;

  const unknowns = [
    ...ev.categoryCoverage.filter((c) => c.pct < 100).map((c) => `${c.label} incomplete (${String(c.available)}/${String(c.total)})`),
    ...prediction.dataGaps,
  ];

  const monitoringAreas = [
    ...prediction.sensitivity.slice(0, 3).map((s) => `Sensitivity: ${s.effect}`),
    facts.ls2024Changed ? 'Watch the LS2024 party-change alignment for reversal or persistence' : '',
    ev.debt > 0 ? 'Recheck data gaps against fresh district/official publications' : '',
  ].filter(Boolean);

  return {
    historicalTrends,
    findings,
    officialReports,
    evidenceStrength,
    unknowns,
    monitoringAreas,
  };
}
