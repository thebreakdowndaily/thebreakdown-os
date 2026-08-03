import type { ConfidenceTier, ScoreDriver, ScoreAssumption } from './types';

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function clamp100(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n * 100)));
}

export function confidenceFrom(positive: number, total: number, fallback: ConfidenceTier): ConfidenceTier {
  if (total === 0) return fallback;
  const ratio = positive / total;
  if (ratio >= 0.9) return 'VERY_HIGH';
  if (ratio >= 0.75) return 'HIGH';
  if (ratio >= 0.5) return 'MEDIUM';
  if (ratio >= 0.3) return 'LOW';
  return 'VERY_LOW';
}

export function driver(factor: string, direction: ScoreDriver['direction'], magnitude: number, evidence: string, sourceField: string): ScoreDriver {
  return { factor, direction, magnitude, evidence, sourceField };
}

export function assumption(statement: string, basis: string): ScoreAssumption {
  return { assumption: statement, basis };
}

export function hasNumber(v: number | null | undefined): boolean {
  return typeof v === 'number' && !Number.isNaN(v);
}
