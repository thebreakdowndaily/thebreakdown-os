import type { ConstituencyRecord } from '@/lib/up403/types';
import type { IntelligenceScore } from './types';
import { clamp100, confidenceFrom, driver, assumption, hasNumber } from './util';

export function incumbencyRiskScore(rec: ConstituencyRecord): IntelligenceScore {
  const drivers = [];

  const lastMargin = rec.victory_margin_pct_2022;
  if (hasNumber(lastMargin)) {
    const risk = Math.max(0, 1 - lastMargin / 12);
    drivers.push(driver(
      'Incumbent winning margin (2022)',
      risk > 0.5 ? 'positive' : 'negative',
      risk,
      `Incumbent held the seat by ${String(lastMargin)}% in 2022`,
      'victory_margin_pct_2022',
    ));
  }

  const volatility = rec.seat_volatility_index || 0;
  drivers.push(driver(
    'Seat volatility',
    volatility >= 2 ? 'positive' : 'negative',
    Math.min(1, volatility / 2),
    `Seat volatility index ${String(volatility)}`,
    'seat_volatility_index',
  ));

  const turnover = rec.party_turnover_count || 0;
  drivers.push(driver(
    'Party turnover',
    turnover > 0 ? 'positive' : 'negative',
    Math.min(1, turnover / 2),
    `${String(turnover)} party changes across consecutive elections`,
    'party_turnover_count',
  ));

  const continuity = rec.winner_continuity_score;
  if (hasNumber(continuity)) {
    drivers.push(driver(
      'Winner continuity',
      continuity > 0 ? 'negative' : 'positive',
      Math.min(1, 1 - continuity),
      `Winner continuity score ${String(continuity)} (1 = same winner every election)`,
      'winner_continuity_score',
    ));
  }

  const dna = rec.dna_classification || '';
  if (dna === 'INCUMBENT_STRONGHOLD') {
    drivers.push(driver('Political DNA', 'negative', 0, 'Classified as incumbent stronghold', 'dna_classification'));
  } else if (dna === 'SWING' || dna === 'CONTESTED') {
    drivers.push(driver('Political DNA', 'positive', 0.5, `Classified as ${dna}`, 'dna_classification'));
  }

  const lsChanged = rec.ls2024_party_changed_flag;
  if (lsChanged) {
    drivers.push(driver('LS 2024 party change in parent PC', 'positive', 0.4, 'Parent parliamentary seat changed party in 2024', 'ls2024_party_changed_flag'));
  }

  const weighted = drivers.reduce((sum, d) => sum + (d.direction === 'positive' ? d.magnitude : -d.magnitude), 0);
  const maxAbs = drivers.reduce((sum, d) => sum + d.magnitude, 0) || 1;
  const value = clamp100(0.5 + weighted / (2 * maxAbs));

  return {
    key: 'incumbency_risk',
    label: 'Incumbency Risk',
    value,
    range: [0, 100],
    confidence: confidenceFrom(drivers.length, 6, 'LOW'),
    confidenceReason: `${String(drivers.length)} of 6 incumbency signals present`,
    drivers,
    assumptions: [
      assumption('Recent margin and turnover best predict incumbent survival', '2022 margin weighted as the most recent evidence'),
      assumption('DNA classification reflects competitive reality', 'DNA is a verified dataset field (v1.1.0, 4,836 QA checks)'),
    ],
    dataGaps: !hasNumber(lastMargin) ? ['2022 victory margin unavailable'] : [],
    interpretation: 'Higher incumbency risk means the sitting party is more likely to lose the seat next cycle; lower means the incumbent is comparatively safer.',
  };
}
