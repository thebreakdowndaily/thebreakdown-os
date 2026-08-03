import { loadData, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { predictAll, aggregatePredictions } from './index';
import type { ConstituencyPrediction, PredictionAggregate } from './types';

export interface PredictionsOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  aggregate: PredictionAggregate;
  topCertain: ConstituencyPrediction[];
  topTossups: ConstituencyPrediction[];
  all: ConstituencyPrediction[];
}

function certainty(p: ConstituencyPrediction): number {
  return Math.abs(p.winner_probability - 50) / 50;
}

export async function computePredictionsOverview(limit = 403): Promise<PredictionsOverview> {
  const data = await loadData();
  const predictions = predictAll(data);
  const aggregate = aggregatePredictions(predictions);

  const topCertain = [...predictions].sort((a, b) => certainty(b) - certainty(a)).slice(0, 10);
  const topTossups = [...predictions]
    .filter((p) => p.winner_probability <= 60)
    .sort((a, b) => a.winner_probability - b.winner_probability)
    .slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    dataSource: getDatasetVersion(),
    researchCutoff: getResearchCutoff(),
    aggregate,
    topCertain,
    topTossups,
    all: predictions.slice(0, limit),
  };
}
