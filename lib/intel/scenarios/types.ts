import type { PartyProbability } from '@/lib/intel/predictions/types';

export type ScenarioType = 'uniform' | 'regional' | 'coalition' | 'stress';

export interface SwingScope {
  region?: string;
  district?: string;
  applyToAll?: boolean;
}

export interface Swing {
  target: string;
  delta: number;
  scope: SwingScope;
  note: string;
}

export interface ScenarioDef {
  id: string;
  label: string;
  description: string;
  rationale: string;
  type: ScenarioType;
  swings: Swing[];
}

export interface CoalitionDef {
  id: string;
  label: string;
  members: string[];
  note: string;
}

export interface SeatOutcome {
  canonical_constituency_id: string;
  constituency_name: string;
  region: string;
  district: string;
  baselineWinner: string;
  scenarioWinner: string;
  flipped: boolean;
  winnerProbability: number;
  baselineWinnerProbability: number;
  probabilities: PartyProbability[];
}

export interface CoalitionOutcome {
  coalitionId: string;
  label: string;
  seats: number;
  note: string;
}

export interface ScenarioResult {
  id: string;
  label: string;
  description: string;
  rationale: string;
  type: ScenarioType;
  seatShare: Record<string, number>;
  totalSeats: number;
  majority: number;
  flipCount: number;
  flips: SeatOutcome[];
  coalitions: CoalitionOutcome[];
  generatedAt: string;
}
