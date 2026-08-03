import type { ConstituencyRecord } from '@/lib/up403/types';
import type { ConstituencyIntelligence, IntelligenceScore, ScoreKey, ScoreAggregate } from './types';
import { momentumScore } from './momentum';
import { competitivenessScore } from './competitiveness';
import { incumbencyRiskScore } from './incumbency-risk';
import { volatilityScore } from './volatility';
import { investigationPriorityScore } from './investigation-priority';

const SCORE_KEYS: ScoreKey[] = ['momentum', 'competitiveness', 'incumbency_risk', 'volatility', 'investigation_priority'];

export const SCORE_WEIGHTS: Record<ScoreKey, number> = {
  momentum: 0.25,
  competitiveness: 0.2,
  incumbency_risk: 0.2,
  volatility: 0.15,
  investigation_priority: 0.2,
};

export function computeIntelligenceScores(rec: ConstituencyRecord): Record<ScoreKey, IntelligenceScore> {
  return {
    momentum: momentumScore(rec),
    competitiveness: competitivenessScore(rec),
    incumbency_risk: incumbencyRiskScore(rec),
    volatility: volatilityScore(rec),
    investigation_priority: investigationPriorityScore(rec),
  };
}

export function overallScore(scores: Record<ScoreKey, IntelligenceScore>): number {
  const totalWeight = SCORE_KEYS.reduce((sum, key) => sum + SCORE_WEIGHTS[key], 0);
  const weighted = SCORE_KEYS.reduce((sum, key) => sum + SCORE_WEIGHTS[key] * scores[key].value, 0);
  return Math.round(Math.min(100, Math.max(0, weighted / totalWeight)));
}

export function toConstituencyIntelligence(rec: ConstituencyRecord): ConstituencyIntelligence {
  const scores = computeIntelligenceScores(rec);
  return {
    canonical_constituency_id: rec.canonical_constituency_id,
    constituency_name: rec.constituency_name,
    ac_number: rec.ac_number,
    district: rec.district,
    region: rec.region,
    current_mla_party: rec.current_mla_party,
    scores,
    overall: overallScore(scores),
  };
}

export function scoreConstituencies(records: ConstituencyRecord[]): ConstituencyIntelligence[] {
  return records.map(toConstituencyIntelligence);
}

export function aggregateScores(items: ConstituencyIntelligence[]): ScoreAggregate {
  const seed = SCORE_KEYS.reduce<ScoreAggregate['byScore']>((acc, key) => {
    acc[key] = { avg: 0, min: 100, max: 0 };
    return acc;
  }, {} as ScoreAggregate['byScore']);

  const result = seed;

  if (items.length === 0) {
    return { count: 0, byScore: result, overall: { avg: 0, min: 0, max: 0 } };
  }

  for (const item of items) {
    for (const key of SCORE_KEYS) {
      const v = item.scores[key].value;
      result[key].avg += v;
      result[key].min = Math.min(result[key].min, v);
      result[key].max = Math.max(result[key].max, v);
    }
  }

  for (const key of SCORE_KEYS) {
    result[key].avg = result[key].avg / items.length;
  }

  const overallValues = items.map((i) => i.overall);
  return {
    count: items.length,
    byScore: result,
    overall: {
      avg: overallValues.reduce((a, b) => a + b, 0) / items.length,
      min: Math.min(...overallValues),
      max: Math.max(...overallValues),
    },
  };
}

export function rankedWatchList(items: ConstituencyIntelligence[], by: ScoreKey | 'overall' = 'investigation_priority', limit = 25): ConstituencyIntelligence[] {
  return [...items]
    .sort((a, b) => {
      const va = by === 'overall' ? a.overall : a.scores[by].value;
      const vb = by === 'overall' ? b.overall : b.scores[by].value;
      return vb - va;
    })
    .slice(0, limit);
}
