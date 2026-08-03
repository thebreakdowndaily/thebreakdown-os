import type { ConstituencyRecord } from '@/lib/up403/types';
import type { ConstituencyIntelligence, ScoreKey } from '@/lib/intel/scoring/types';
import type { ConstituencyPrediction } from '@/lib/intel/predictions/types';
import type { ConstituencyEvidence } from '@/lib/intel/evidence/types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

export interface SeatFacts {
  record: ConstituencyRecord;
  intel: ConstituencyIntelligence;
  prediction: ConstituencyPrediction;
  evidence: ConstituencyEvidence;
  incumbentName: string;
  incumbentParty: string;
  runnerUpParty: string;
  runnerUpName: string;
  historyLine: string;
  ls2024Changed: boolean;
  ls2024Party: string;
  predictedWinner: string;
  predictedProb: number;
  predictionConfidence: string;
  topSensitivityScore: ScoreKey | null;
  topSensitivityEffect: string;
  devGapLabels: string[];
  dataGapCount: number;
}

const ELECTION_YEARS = [2012, 2017, 2022] as const;

export function historyLine(rec: ConstituencyRecord): string {
  const parts: string[] = [];
  for (const year of ELECTION_YEARS) {
    const party = rec[`winner_party_${String(year)}` as keyof ConstituencyRecord];
    if (typeof party === 'string' && party.trim() !== '') {
      parts.push(`${party} (${String(year)})`);
    }
  }
  return parts.join(' → ') || 'No recorded election history';
}

export function buildSeatFacts(
  rec: ConstituencyRecord,
  intel: ConstituencyIntelligence,
  prediction: ConstituencyPrediction,
  evidence: ConstituencyEvidence,
): SeatFacts {
  const topSensitivity = prediction.sensitivity.length > 0 ? prediction.sensitivity[0] : null;
  const devGapLabels = evidence.categoryCoverage
    .filter((c) => c.category === 'development_indicators' && c.pct < 100)
    .map((c) => c.label);

  return {
    record: rec,
    intel,
    prediction,
    evidence,
    incumbentName: rec.current_mla_name || rec.winner_2022 || 'the incumbent MLA',
    incumbentParty: rec.current_mla_party || rec.winner_party_2022 || '',
    runnerUpParty: rec.runner_up_party_2022 || '',
    runnerUpName: rec.runner_up_2022 || '',
    historyLine: historyLine(rec),
    ls2024Changed: rec.ls2024_party_changed_flag,
    ls2024Party: rec.ls2024_pc_winner_party || '',
    predictedWinner: prediction.predicted_winner,
    predictedProb: prediction.winner_probability,
    predictionConfidence: prediction.confidence,
    topSensitivityScore: topSensitivity?.score ?? null,
    topSensitivityEffect: topSensitivity?.effect ?? '',
    devGapLabels,
    dataGapCount: evidence.debt,
  };
}

export function partyPhrase(party: string): string {
  if (!party || party.trim() === '') return 'the current seat-holder';
  return `the ${party}`;
}
