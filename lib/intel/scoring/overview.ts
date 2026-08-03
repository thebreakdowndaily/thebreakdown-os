import { loadData, getDatasetVersion } from '@/lib/up403/loader';
import { scoreConstituencies, aggregateScores, rankedWatchList, toConstituencyIntelligence } from './index';
import type { ConstituencyIntelligence, ScoreAggregate, ScoreKey } from './types';

export interface WatchListQuery {
  by?: ScoreKey | 'overall';
  limit?: number;
}

export interface ScoringOverview {
  generatedAt: string;
  recordCount: number;
  aggregate: ScoreAggregate;
  topInvestigation: ConstituencyIntelligence[];
  topVolatility: ConstituencyIntelligence[];
  topCompetitiveness: ConstituencyIntelligence[];
  dataSource: string;
}

export async function computeScoringOverview(query: WatchListQuery = {}): Promise<ScoringOverview> {
  const data = await loadData();
  const items = scoreConstituencies(data);
  const aggregate = aggregateScores(items);
  return {
    generatedAt: new Date().toISOString(),
    recordCount: items.length,
    aggregate,
    topInvestigation: rankedWatchList(items, 'investigation_priority', query.limit ?? 25),
    topVolatility: rankedWatchList(items, 'volatility', 10),
    topCompetitiveness: rankedWatchList(items, 'competitiveness', 10),
    dataSource: getDatasetVersion(),
  };
}

export async function getConstituencyIntelligence(id: string): Promise<ConstituencyIntelligence | null> {
  const data = await loadData();
  const rec = data.find((r) => r.canonical_constituency_id === id);
  return rec ? toConstituencyIntelligence(rec) : null;
}
