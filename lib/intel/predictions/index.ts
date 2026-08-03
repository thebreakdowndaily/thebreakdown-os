import type { ConstituencyRecord } from '@/lib/up403/types';
import { toConstituencyIntelligence } from '@/lib/intel/scoring';
import type { ConstituencyPrediction, PredictionSensitivity, PartyProbability, PredictionAggregate } from './types';
import { predictConstituency, buildBaseProbabilities } from './model';

export { buildBaseProbabilities, predictConstituency };
export type { PartyProbability, PredictionAggregate };

export function predictRecord(rec: ConstituencyRecord): ConstituencyPrediction {
  const intel = toConstituencyIntelligence(rec);
  return predictConstituency(rec, intel);
}

export function predictAll(records: ConstituencyRecord[]): ConstituencyPrediction[] {
  return records.map(predictRecord);
}

export function aggregatePredictions(predictions: ConstituencyPrediction[]): PredictionAggregate {
  const seatShare: Record<string, number> = {};
  for (const p of predictions) {
    seatShare[p.predicted_winner] = (seatShare[p.predicted_winner] ?? 0) + 1;
  }
  const avgWinnerProbability = predictions.reduce((s, p) => s + p.winner_probability, 0) / Math.max(1, predictions.length);
  const highConfidence = predictions.filter((p) => p.confidence === 'HIGH' || p.confidence === 'VERY_HIGH').length;

  const sensitiveSeats = [...predictions]
    .sort((a, b) => {
      const aTop = a.sensitivity[0]?.delta ?? 0;
      const bTop = b.sensitivity[0]?.delta ?? 0;
      return bTop - aTop;
    })
    .slice(0, 10);

  return { count: predictions.length, seatShare, avgWinnerProbability, highConfidence, sensitiveSeats };
}

export function topSensitivity(prediction: ConstituencyPrediction): PredictionSensitivity | null {
  return prediction.sensitivity[0] ?? null;
}
