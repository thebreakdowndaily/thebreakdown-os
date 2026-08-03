import type { ConstituencyRecord } from '@/lib/up403/types';
import type { ConstituencyIntelligence, ScoreKey } from '@/lib/intel/scoring/types';
import type {
  ConstituencyPrediction,
  PartyProbability,
  PredictionConfidence,
  PredictionDriver,
  PredictionSensitivity,
} from './types';
import { computeBaseStrength } from './base';

const ADJUSTABLE_SCORES: ScoreKey[] = ['momentum', 'competitiveness', 'incumbency_risk', 'volatility'];

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function pct(n: number): number {
  return Math.round(n * 100);
}

export function buildBaseProbabilities(rec: ConstituencyRecord): PartyProbability[] {
  const { candidates, other } = computeBaseStrength(rec);
  const all = [...candidates];
  if (other.baseStrength > 0) all.push(other);

  const total = all.reduce((sum, c) => sum + c.baseStrength, 0);
  if (total <= 0) {
    for (const c of all) c.probability = 1 / all.length;
  } else {
    for (const c of all) c.probability = c.baseStrength / total;
  }
  return all;
}

function applyAdjustments(probs: PartyProbability[], rec: ConstituencyRecord, intel: ConstituencyIntelligence): { probs: PartyProbability[]; drivers: PredictionDriver[] } {
  const drivers: PredictionDriver[] = [];
  const incumbentParty = rec.current_mla_party || rec.winner_party_2022 || '';
  const incumbent = probs.find((p) => p.party === incumbentParty);
  const leading = [...probs].sort((a, b) => b.probability - a.probability)[0];
  const leadingParty = leading.party;

  const momentum = intel.scores.momentum.value / 100;
  const incRisk = intel.scores.incumbency_risk.value / 100;
  const volatility = intel.scores.volatility.value / 100;
  const competitiveness = intel.scores.competitiveness.value / 100;

  if (incumbent && incRisk > 0.35) {
    const penalty = (incRisk - 0.35) * 0.5;
    const before = incumbent.probability;
    incumbent.probability = Math.max(0, incumbent.probability * (1 - penalty));
    const delta = before - incumbent.probability;
    drivers.push({
      factor: 'Incumbency risk penalty',
      direction: 'negative',
      magnitude: penalty,
      evidence: `Incumbent ${incumbentParty} penalised ${String(pct(penalty))} because incumbency risk ${String(pct(incRisk))}`,
      sourceField: 'intel.scoring.incumbency_risk',
    });
    const redist = probs.filter((p) => p.party !== incumbent.party);
    const redistTotal = redist.reduce((s, p) => s + p.probability, 0) || 1;
    for (const p of redist) p.probability += delta * (p.probability / redistTotal);
  }

  if (momentum > 0.55) {
    const boost = (momentum - 0.55) * 0.4;
    const before = leading.probability;
    leading.probability = Math.min(1, leading.probability * (1 + boost));
    const delta = leading.probability - before;
    drivers.push({
      factor: 'Momentum boost',
      direction: 'positive',
      magnitude: boost,
      evidence: `Leader ${leadingParty} boosted ${String(pct(boost))} for momentum ${String(pct(momentum))}`,
      sourceField: 'intel.scoring.momentum',
    });
    const rest = probs.filter((p) => p.party !== leadingParty);
    const restTotal = rest.reduce((s, p) => s + p.probability, 0);
    if (restTotal > 0) for (const p of rest) p.probability = Math.max(0, p.probability - delta * (p.probability / restTotal));
  }

  const flatness = (volatility * 0.35 + competitiveness * 0.2) / 1.15;
  if (flatness > 0.05) {
    const n = probs.length;
    const uniform = 1 / n;
    for (const p of probs) {
      p.probability = p.probability * (1 - flatness) + uniform * flatness;
    }
    drivers.push({
      factor: 'Volatility/competitiveness flattening',
      direction: 'neutral',
      magnitude: flatness,
      evidence: `Probabilities flattened ${String(pct(flatness))} toward uniform by volatility ${String(pct(volatility))} and competitiveness ${String(pct(competitiveness))}`,
      sourceField: 'intel.scoring.volatility|intel.scoring.competitiveness',
    });
  }

  const total = probs.reduce((s, p) => s + p.probability, 0);
  for (const p of probs) p.probability = p.probability / total;

  return { probs, drivers };
}

function confidenceTier(rec: ConstituencyRecord): { tier: PredictionConfidence; reason: string } {
  const years = [rec.winner_vote_share_2012, rec.winner_vote_share_2017, rec.winner_vote_share_2022].filter((v) => typeof v === 'number' && !Number.isNaN(v)).length;
  const dna = rec.dna_confidence || '';
  if (years >= 3 && dna === 'HIGH') return { tier: 'HIGH', reason: 'Full vote-share history (3 elections) and HIGH DNA confidence' };
  if (years >= 2 && dna === 'HIGH') return { tier: 'HIGH', reason: 'Two-plus elections of vote-share history and HIGH DNA confidence' };
  if (years >= 2) return { tier: 'MEDIUM', reason: 'Two-plus elections of vote-share history' };
  if (years >= 1) return { tier: 'LOW', reason: 'Partial vote-share history only' };
  return { tier: 'VERY_LOW', reason: 'No usable vote-share history; derived scores only' };
}

function confidenceInterval(prob: number, volatility: number, competitiveness: number): [number, number] {
  const width = clamp01(0.06 + volatility * 0.2 + (1 - competitiveness) * 0.04);
  const low = Math.max(0, prob - width);
  const high = Math.min(1, prob + width);
  return [low, high];
}

function computeSensitivity(rec: ConstituencyRecord, intel: ConstituencyIntelligence, baseWinner: string): PredictionSensitivity[] {
  const result: PredictionSensitivity[] = [];
  for (const scoreKey of ADJUSTABLE_SCORES) {
    const original = intel.scores[scoreKey].value;
    const up = { ...intel, scores: { ...intel.scores, [scoreKey]: { ...intel.scores[scoreKey], value: Math.min(100, original + 10) } } };
    const down = { ...intel, scores: { ...intel.scores, [scoreKey]: { ...intel.scores[scoreKey], value: Math.max(0, original - 10) } } };
    const probsUp = applyAdjustments(buildBaseProbabilities(rec), rec, up).probs;
    const probsDown = applyAdjustments(buildBaseProbabilities(rec), rec, down).probs;
    const upWin = probsUp.find((p) => p.party === baseWinner)?.probability ?? 0;
    const downWin = probsDown.find((p) => p.party === baseWinner)?.probability ?? 0;
    const delta = Math.max(Math.abs(upWin - 0.5), Math.abs(downWin - 0.5));
    result.push({
      score: scoreKey,
      factor: scoreKey.replace('_', ' '),
      delta: Math.round(delta * 1000) / 10,
      effect: `±10 pts on ${scoreKey} moves winner probability by up to ${(delta * 100).toFixed(1)}pp`,
    });
  }
  return result.sort((a, b) => b.delta - a.delta);
}

function buildNarratives(probs: PartyProbability[], drivers: PredictionDriver[], rec: ConstituencyRecord): { whyLeading: string; whyNot: string; whatCouldChangeIt: string } {
  const ranked = [...probs].sort((a, b) => b.probability - a.probability);
  const winner = ranked[0];
  const runnerUp = ranked.length > 1 ? ranked[1] : null;
  const incumbentParty = rec.current_mla_party || rec.winner_party_2022 || '';
  const driverSummary = drivers.map((d) => d.factor.toLowerCase()).join(', ') || 'no adjustments applied';

  const whyLeading = `${winner.party} leads at ${(winner.probability * 100).toFixed(1)}% (base strength ${winner.baseStrength.toFixed(1)}). ${driverSummary}.`;
  const whyNot = runnerUp
    ? `${runnerUp.party} trails at ${(runnerUp.probability * 100).toFixed(1)}%${incumbentParty === runnerUp.party ? ' despite being the incumbent' : ''}. Closing the gap needs a swing the current signals do not support.`
    : 'No credible challenger in current signals.';

  const sortedDrivers = [...drivers].sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude));
  const strongest = sortedDrivers.length > 0 ? sortedDrivers[0] : null;
  const whatCouldChangeIt = strongest
    ? `A ${strongest.factor.toLowerCase()} would move the projection most. Watch ${strongest.sourceField} for change.`
    : 'Projection is pure base-strength; only new election data changes it.';

  return { whyLeading, whyNot, whatCouldChangeIt };
}

export function predictConstituency(rec: ConstituencyRecord, intel: ConstituencyIntelligence): ConstituencyPrediction {
  let probs = buildBaseProbabilities(rec);
  const { probs: adjusted, drivers } = applyAdjustments(probs, rec, intel);
  probs = adjusted;

  const ranked = [...probs].sort((a, b) => b.probability - a.probability);
  const winner = ranked[0] ?? { party: 'OTHER', partyLabel: 'Others', probability: 0, baseStrength: 0 };
  const volatility = intel.scores.volatility.value / 100;
  const competitiveness = intel.scores.competitiveness.value / 100;

  for (const p of probs) {
    const [low, high] = confidenceInterval(p.probability, volatility, competitiveness);
    p.ciLow = low;
    p.ciHigh = high;
  }

  const [ciLow, ciHigh] = confidenceInterval(winner.probability, volatility, competitiveness);
  const { tier, reason } = confidenceTier(rec);
  const sensitivity = computeSensitivity(rec, intel, winner.party);
  const narratives = buildNarratives(probs, drivers, rec);

  const dataGaps: string[] = [];
  if (![rec.winner_vote_share_2012, rec.winner_vote_share_2017, rec.winner_vote_share_2022].every((v) => typeof v === 'number')) {
    dataGaps.push('Incomplete vote-share history');
  }

  return {
    canonical_constituency_id: rec.canonical_constituency_id,
    constituency_name: rec.constituency_name,
    ac_number: rec.ac_number,
    district: rec.district,
    region: rec.region,
    current_mla_party: incumbentParty(rec),
    predicted_winner: winner.party,
    winner_probability: pct(winner.probability),
    winner_ci: [pct(ciLow), pct(ciHigh)],
    probabilities: probs,
    confidence: tier,
    confidenceReason: reason,
    drivers,
    assumptions: [
      { assumption: 'Past vote share is the best predictor of future vote share', basis: 'Recency-weighted winner vote shares across 2012/2017/2022' },
      { assumption: 'Intelligence scores adjust the baseline', basis: 'Momentum, incumbency risk, volatility, competitiveness from scoring engine' },
      { assumption: 'No post-cutoff events incorporated', basis: 'Research cutoff ' + (rec.research_cutoff_date || '2026-07-30') },
    ],
    sensitivity,
    whyLeading: narratives.whyLeading,
    whyNot: narratives.whyNot,
    whatCouldChangeIt: narratives.whatCouldChangeIt,
    dataGaps,
    generatedFrom: 'intel.predictions v1 (recency-weighted base + score adjustments)',
  };
}

function incumbentParty(rec: ConstituencyRecord): string {
  return rec.current_mla_party || rec.winner_party_2022 || '';
}
