import type { ConstituencyRecord } from '@/lib/up403/types';
import type { PartyProbability } from './types';

export const PARTY_LABELS: Record<string, string> = {
  BJP: 'BJP',
  SP: 'Samajwadi Party',
  BSP: 'Bahujan Samaj Party',
  INC: 'Indian National Congress',
  RLD: 'Rashtriya Lok Dal',
  'AD(S)': 'Apna Dal (Sonelal)',
  NISHAD: 'NISHAD Party',
  SBSP: 'Suheldev Bharatiya Samaj Party',
  JSDL: 'Janata Dal (S)',
  ADAL: 'Apna Dal (Kamerawadi)',
  AD: 'Apna Dal',
  ASPKr: 'Azad Samaj Party',
  PECP: 'Peace Party',
  QED: 'Qaumi Ekta Dal',
  NCP: 'Nationalist Congress Party',
  IEMC: 'Indian Empire Movement Congress',
  IND: 'Independent',
};

export interface CandidatePartyInput {
  party: string;
  share: number;
  weight: number;
}

export interface BaseStrengthResult {
  candidates: PartyProbability[];
  other: PartyProbability;
  allParties: string[];
}

const RECENCY_WEIGHTS: Record<string, number> = {
  '2012': 1,
  '2017': 2,
  '2022': 3,
};

export function collectCandidateParties(rec: ConstituencyRecord): string[] {
  const set = new Set<string>();
  for (const p of [rec.winner_party_2012, rec.winner_party_2017, rec.winner_party_2022, rec.current_mla_party, rec.ls2024_pc_winner_party, rec.sociology_dominant_party_by_avg_share]) {
    if (p && p.trim() !== '' && p !== 'OTH' && p !== 'NOTA') set.add(p.trim());
  }
  return [...set];
}

export function computeBaseStrength(rec: ConstituencyRecord): BaseStrengthResult {
  const candidateParties = collectCandidateParties(rec);

  const strengths: Record<string, number> = {};
  const weights: Record<string, number> = {};

  const addSignal = (party: string | null | undefined, share: number | null | undefined, weight: number) => {
    if (!party || party.trim() === '') return;
    if (typeof share !== 'number' || Number.isNaN(share) || share <= 0) return;
    strengths[party] = (strengths[party] ?? 0) + share * weight;
    weights[party] = (weights[party] ?? 0) + weight;
  };

  addSignal(rec.winner_party_2012, rec.winner_vote_share_2012, RECENCY_WEIGHTS['2012']);
  addSignal(rec.winner_party_2017, rec.winner_vote_share_2017, RECENCY_WEIGHTS['2017']);
  addSignal(rec.winner_party_2022, rec.winner_vote_share_2022, RECENCY_WEIGHTS['2022']);
  addSignal(rec.sociology_dominant_party_by_avg_share, rec.sociology_dominant_party_avg_vote_share, 1);
  addSignal('BJP', rec.derived_bjp_competitiveness_score, 0.5);
  addSignal('SP', rec.derived_sp_competitiveness_score, 0.5);

  const baseByParty: Record<string, number> = {};
  for (const party of candidateParties) {
    baseByParty[party] = weights[party] ? strengths[party] / weights[party] : 0;
  }

  const sorted = candidateParties
    .map((party) => ({ party, strength: baseByParty[party] }))
    .sort((a, b) => b.strength - a.strength);

  const top = sorted.filter((s) => s.strength > 0).slice(0, 4).map((s) => s.party);
  if (top.length === 0) {
    top.push(rec.current_mla_party || 'OTHER');
  }

  const candidates = top.map((party) => ({
    party,
    partyLabel: PARTY_LABELS[party] ?? party,
    probability: 0,
    ciLow: 0,
    ciHigh: 0,
    baseStrength: baseByParty[party] ?? 0,
  }));

  const otherStrength = sorted
    .filter((s) => !top.includes(s.party) && s.strength > 0)
    .reduce((sum, s) => sum + s.strength, 0);

  const other: PartyProbability = {
    party: 'OTHER',
    partyLabel: 'Others',
    probability: 0,
    ciLow: 0,
    ciHigh: 0,
    baseStrength: otherStrength,
  };

  return {
    candidates,
    other,
    allParties: sorted.map((s) => s.party),
  };
}
