import type { ConstituencyPrediction, PartyProbability } from '@/lib/intel/predictions/types';
import type { CoalitionOutcome, CoalitionDef, ScenarioDef, ScenarioResult, SeatOutcome, Swing } from './types';

export const MAJORITY = 202;

export function seatMatchesScope(region: string, district: string, swing: Swing): boolean {
  if (swing.scope.applyToAll) return true;
  if (swing.scope.region && swing.scope.region !== region) return false;
  if (swing.scope.district && swing.scope.district !== district) return false;
  return swing.scope.region !== undefined || swing.scope.district !== undefined;
}

export function applySwings(probs: PartyProbability[], swings: Swing[], region: string, district: string, incumbentParty?: string): PartyProbability[] {
  const result = probs.map((p) => ({ ...p }));
  const names = new Set(result.map((p) => p.party));

  for (const swing of swings) {
    if (!seatMatchesScope(region, district, swing)) continue;
    const target = swing.target === 'INCUMBENT' ? (incumbentParty ?? '') : swing.target;
    const delta = swing.delta / 100;

    if (!target) continue;

    if (!names.has(target)) {
      const other = result.find((p) => p.party === 'OTHER');
      if (other && delta > 0) {
        const move = Math.min(delta, other.probability);
        other.probability = Math.max(0, other.probability - move);
      }
      continue;
    }

    const targetProb = result.find((p) => p.party === target);
    if (!targetProb) continue;

    if (delta >= 0) {
      const taken = Math.min(delta, 1 - targetProb.probability);
      targetProb.probability += taken;
      const others = result.filter((p) => p.party !== target);
      const othersTotal = others.reduce((s, p) => s + p.probability, 0);
      if (othersTotal > 0) {
        for (const p of others) {
          p.probability = Math.max(0, p.probability - taken * (p.probability / othersTotal));
        }
      }
    } else {
      const removed = Math.min(-delta, targetProb.probability);
      targetProb.probability -= removed;
      const others = result.filter((p) => p.party !== target);
      const othersTotal = others.reduce((s, p) => s + p.probability, 0);
      if (othersTotal > 0) {
        for (const p of others) {
          p.probability += removed * (p.probability / othersTotal);
        }
      }
    }
  }

  const total = result.reduce((s, p) => s + p.probability, 0) || 1;
  for (const p of result) p.probability = p.probability / total;
  return result;
}

export function winnerOf(probs: PartyProbability[]): string {
  return [...probs].sort((a, b) => b.probability - a.probability)[0].party;
}

export function projectSeat(prediction: ConstituencyPrediction, swings: Swing[]): SeatOutcome {
  const adjusted = applySwings(prediction.probabilities, swings, prediction.region, prediction.district, prediction.current_mla_party);
  const scenarioWinner = winnerOf(adjusted);
  const baselineWinner = prediction.predicted_winner;
  const top = [...adjusted].sort((a, b) => b.probability - a.probability)[0];

  return {
    canonical_constituency_id: prediction.canonical_constituency_id,
    constituency_name: prediction.constituency_name,
    region: prediction.region,
    district: prediction.district,
    baselineWinner,
    scenarioWinner,
    flipped: scenarioWinner !== baselineWinner,
    winnerProbability: Math.round(top.probability * 100),
    baselineWinnerProbability: prediction.winner_probability,
    probabilities: adjusted,
  };
}

export function buildSeatShare(outcomes: SeatOutcome[]): Record<string, number> {
  const share: Record<string, number> = {};
  for (const o of outcomes) {
    share[o.scenarioWinner] = (share[o.scenarioWinner] ?? 0) + 1;
  }
  return share;
}

export function scoreCoalitions(seatShare: Record<string, number>, coalitions: CoalitionDef[]): CoalitionOutcome[] {
  return coalitions.map((c) => ({
    coalitionId: c.id,
    label: c.label,
    seats: c.members.reduce((sum, party) => sum + (seatShare[party] ?? 0), 0),
    note: c.note,
  }));
}

export function runScenario(predictions: ConstituencyPrediction[], def: ScenarioDef, coalitions: CoalitionDef[]): ScenarioResult {
  const outcomes = predictions.map((p) => projectSeat(p, def.swings));
  const seatShare = buildSeatShare(outcomes);
  const flips = outcomes.filter((o) => o.flipped);
  const majority = MAJORITY;
  const coalitionsResult = scoreCoalitions(seatShare, coalitions);

  return {
    id: def.id,
    label: def.label,
    description: def.description,
    rationale: def.rationale,
    type: def.type,
    seatShare,
    totalSeats: outcomes.length,
    majority,
    flipCount: flips.length,
    flips,
    coalitions: coalitionsResult,
    generatedAt: new Date().toISOString(),
  };
}
