import type { AnalyticsMetrics } from './types';
import { getCachedData } from './loader';

export function computeAnalytics(): AnalyticsMetrics {
  const d = getCachedData();

  const dnaDist: Record<string, number> = {};
  const compDist: Record<string, number> = {};
  const partyHolds: Record<string, number> = {};
  const regionParty: Record<string, Record<string, number>> = {};
  let totalVolatility = 0;
  let totalPartyVol = 0;
  let highVolSeats = 0;
  let stableSeats = 0;
  const resSummary: Record<string, number> = {};

  for (const rec of d) {
    dnaDist[rec.dna_classification] = (dnaDist[rec.dna_classification] || 0) + 1;
    compDist[rec.competitiveness_class] = (compDist[rec.competitiveness_class] || 0) + 1;
    if (rec.current_mla_party) {
      partyHolds[rec.current_mla_party] = (partyHolds[rec.current_mla_party] || 0) + 1;
    }
    resSummary[rec.reservation_type] = (resSummary[rec.reservation_type] || 0) + 1;

    if (rec.region) {
      if (!(rec.region in regionParty)) regionParty[rec.region] = {};
      const winnerParty = rec.current_mla_party || rec.winner_party_2022;
      if (winnerParty) {
        regionParty[rec.region][winnerParty] = (regionParty[rec.region][winnerParty] || 0) + 1;
      }
    }

    totalVolatility += rec.derived_seat_volatility || 0;
    totalPartyVol += rec.derived_electoral_competitiveness_score || 0;

    if ((rec.seat_volatility_index || 0) >= 2) highVolSeats++;
    if ((rec.seat_volatility_index || 0) === 0) stableSeats++;
  }

  const n = d.length;

  return {
    dna_distribution: dnaDist,
    competitiveness_distribution: compDist,
    party_hold_counts: partyHolds,
    regional_party_dominance: regionParty,
    volatility_summary: {
      avg_seat_volatility: Math.round((totalVolatility / n) * 100) / 100,
      avg_party_volatility: Math.round((totalPartyVol / n) * 100) / 100,
      high_volatility_seats: highVolSeats,
      stable_seats: stableSeats,
    },
    reservation_summary: resSummary,
  };
}
