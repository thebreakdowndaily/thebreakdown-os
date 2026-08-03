import type { ConstituencyRecord } from '@/lib/up403/types';
import type { IntelligenceScore } from './types';
import { clamp100, confidenceFrom, driver, assumption, hasNumber } from './util';

export function competitivenessScore(rec: ConstituencyRecord): IntelligenceScore {
  const drivers = [];

  const margins = [rec.victory_margin_pct_2012, rec.victory_margin_pct_2017, rec.victory_margin_pct_2022].filter(hasNumber);
  const avgMargin = rec.competitiveness_avg_margin_pct;

  if (hasNumber(avgMargin)) {
    const tightness = Math.max(0, 1 - avgMargin / 20);
    drivers.push(driver(
      'Average winning margin',
      'positive',
      tightness,
      `Average margin ${String(avgMargin)}% across observed elections`,
      'competitiveness_avg_margin_pct',
    ));
  }

  if (margins.length > 0) {
    const tightest = Math.min(...margins);
    drivers.push(driver(
      'Tightest race',
      'positive',
      Math.max(0, 1 - tightest / 10),
      `Narrowest observed margin ${tightest.toFixed(2)}%`,
      'victory_margin_pct_*',
    ));
  }

  const uniqueParties = rec.unique_parties_across_elections || 0;
  drivers.push(driver(
    'Multi-party turnover',
    uniqueParties >= 3 ? 'positive' : 'negative',
    Math.min(1, uniqueParties / 3),
    `${String(uniqueParties)} distinct parties have won the seat`,
    'unique_parties_across_elections',
  ));

  const derivedComp = rec.derived_electoral_competitiveness_score;
  if (hasNumber(derivedComp)) {
    drivers.push(driver(
      'Derived competitiveness index',
      'positive',
      derivedComp,
      `Derived score ${derivedComp.toFixed(3)} (0 = dominant, 1 = competitive)`,
      'derived_electoral_competitiveness_score',
    ));
  }

  const weighted = drivers.reduce((sum, d) => sum + d.magnitude, 0) / Math.max(1, drivers.length);
  const value = clamp100(weighted);

  return {
    key: 'competitiveness',
    label: 'Electoral Competitiveness',
    value,
    range: [0, 100],
    confidence: confidenceFrom(drivers.length, 4, 'LOW'),
    confidenceReason: `${String(drivers.length)} of 4 competitiveness signals present`,
    drivers,
    assumptions: [
      assumption('Margin-based competitiveness is a fair proxy for seat closeness', 'Uses official ECI victory margins'),
      assumption('Past volatility indicates future openness', 'Turnover signals combined with margin tightness'),
    ],
    dataGaps: margins.length < 3 ? ['Earlier election margins unavailable for some years'] : [],
    interpretation: 'Higher competitiveness means a closer, more open seat; lower means a dominant-party seat.',
  };
}
