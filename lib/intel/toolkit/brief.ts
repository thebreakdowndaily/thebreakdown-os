import type { ConstituencyBrief } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

function reservationPhrase(res: string): string {
  if (!res || res.trim() === '') return '';
  const label: Record<string, string> = {
    GENERAL: 'General',
    SC: 'Scheduled Caste reserved',
    ST: 'Scheduled Tribe reserved',
    OBC: 'OBC reserved',
  };
  return label[res] ?? res;
}

export function buildBrief(facts: SeatFacts): ConstituencyBrief {
  const rec = facts.record;
  const intel = facts.intel;
  const prediction = facts.prediction;
  const evidence = facts.evidence;

  const reservation = reservationPhrase(rec.reservation_type);
  const incumbent = rec.current_mla_name || 'not recorded';

  const overview = [
    `${rec.constituency_name} (AC ${String(rec.ac_number)}) is a ${rec.region} constituency in ${rec.district} district${reservation ? `, ${reservation.toLowerCase()} seat` : ''}.`,
    `The current MLA is ${incumbent} of ${facts.incumbentParty || 'the seat-holder party'}, elected in ${rec.current_mla_elected_via || 'the most recent recorded election'}.`,
    `The seat's recorded history spans ${facts.historyLine}.`,
  ].join(' ');

  const politicalSummary = [
    facts.historyLine ? `Vidhan Sabha history: ${facts.historyLine}.` : 'No recorded election history.',
    rec.dna_reasoning ? `Political DNA: ${rec.dna_classification} (${rec.dna_reasoning}).` : `Political DNA: ${rec.dna_classification || 'unclassified'}.`,
    facts.ls2024Changed && facts.ls2024Party
      ? `The parent Lok Sabha segment changed party to ${facts.ls2024Party} in 2024.`
      : `The parent Lok Sabha segment is held by ${facts.ls2024Party || 'not recorded'} (2024).`,
  ].join(' ');

  const predictionSummary = [
    `Predicted winner: ${facts.predictedWinner} at ${String(facts.predictedProb)}% (CI ${String(prediction.winner_ci[0])}–${String(prediction.winner_ci[1])}%).`,
    `Confidence: ${facts.predictionConfidence.replace('_', ' ')} — ${prediction.confidenceReason}.`,
    prediction.whyLeading,
  ].join(' ');

  const comp = intel.scores.competitiveness;
  const competitiveness = [
    `Competitiveness score ${String(comp.value)}/100 (${comp.interpretation})`,
    rec.competitiveness_class ? `classified ${rec.competitiveness_class}` : '',
    rec.competitiveness_avg_margin_pct > 0 ? `with an average winning margin of ${String(rec.competitiveness_avg_margin_pct)}%` : '',
  ]
    .filter(Boolean)
    .join('; ')
    + '.';

  const momentum = intel.scores.momentum;
  const momentumDrivers = momentum.drivers.length > 0 ? momentum.drivers.slice(0, 2).map((d) => d.evidence).join('; ') : 'No momentum drivers available';
  const momentumText = [
    `Momentum score ${String(momentum.value)}/100 — ${momentum.interpretation}`,
    momentumDrivers,
  ].join('. ');

  const historicalTrends = [
    facts.historyLine,
    rec.competitiveness_trend ? `Competitiveness trend: ${rec.competitiveness_trend}.` : '',
    rec.seat_volatility_index > 0 ? `Seat volatility index ${String(rec.seat_volatility_index)}.` : '',
    rec.most_persistent_party ? `Most persistent party: ${rec.most_persistent_party}.` : '',
  ].filter(Boolean);

  const regionalContext = [
    `Region: ${rec.region}`,
    rec.pc_name ? `Lok Sabha segment: ${rec.pc_name}.` : '',
    rec.current_mp_name ? `Current MP: ${rec.current_mp_name} (${rec.current_mp_party || 'party not recorded'}).` : '',
    facts.ls2024Party ? `LS2024 winner: ${facts.ls2024Party}${facts.ls2024Changed ? ' — changed from previous cycle' : ''}.` : '',
  ].filter(Boolean).join(' ');

  const researchSummary = [
    `Evidence coverage ${String(evidence.coverage)}% (${evidence.confidenceReason}).`,
    rec.dna_reasoning ? `DNA reasoning: ${rec.dna_reasoning}.` : '',
    prediction.whatCouldChangeIt,
  ].filter(Boolean).join(' ');

  const knownRisks = prediction.sensitivity.slice(0, 3).map((s) => s.effect);
  if (facts.ls2024Changed) knownRisks.push('2024 Lok Sabha segment changed party — alignment may still be in flux.');
  if (evidence.debt > 0) knownRisks.push(`${String(evidence.debt)} registered evidence gaps limit local verification.`);

  const dataGaps = [
    ...evidence.categoryCoverage.filter((c) => c.pct < 100).map((c) => `${c.label}: ${String(c.available)}/${String(c.total)} fields`),
    ...prediction.dataGaps,
  ];

  const sourcesUsed = evidence.items
    .filter((i) => i.status === 'available' && i.sourceDataset)
    .map((i) => `${i.sourceDataset} (${i.authority})`)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return {
    overview,
    politicalSummary,
    predictionSummary,
    competitiveness,
    momentum: momentumText,
    evidenceConfidence: `${evidence.confidence.replace('_', ' ')} — ${evidence.confidenceReason}`,
    historicalTrends,
    regionalContext,
    researchSummary,
    knownRisks,
    dataGaps,
    lastUpdated: rec.verification_date || 'not recorded',
    sourcesUsed,
  };
}
