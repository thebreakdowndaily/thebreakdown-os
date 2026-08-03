import type { ConstituencyRecord } from '@/lib/up403/types';
import type { IntelligenceScore } from './types';
import { clamp100, confidenceFrom, driver, assumption, hasNumber } from './util';

export function investigationPriorityScore(rec: ConstituencyRecord): IntelligenceScore {
  const drivers = [];

  const turnover = rec.party_turnover_count || 0;
  drivers.push(driver(
    'Party turnover',
    turnover > 0 ? 'positive' : 'negative',
    Math.min(1, turnover / 2),
    `${String(turnover)} party changes across consecutive elections`,
    'party_turnover_count',
  ));

  const volatility = rec.seat_volatility_index || 0;
  drivers.push(driver(
    'Seat volatility',
    volatility >= 2 ? 'positive' : 'negative',
    Math.min(1, volatility / 2),
    `Seat volatility index ${String(volatility)}`,
    'seat_volatility_index',
  ));

  const dna = rec.dna_classification || '';
  if (dna === 'SWING' || dna === 'CONTESTED') {
    drivers.push(driver('Political DNA', 'positive', 0.5, `Classified as ${dna} — genuinely contested seat`, 'dna_classification'));
  }

  const derived = rec.derived_governance_issue_density;
  if (hasNumber(derived)) {
    drivers.push(driver(
      'Governance issue density',
      derived > 0 ? 'positive' : 'negative',
      Math.min(1, derived),
      `Derived governance issue density ${derived.toFixed(3)}`,
      'derived_governance_issue_density',
    ));
  }

  const lsChanged = rec.ls2024_party_changed_flag;
  if (lsChanged) {
    drivers.push(driver('LS 2024 party change in parent PC', 'positive', 0.4, 'Parent parliamentary seat changed party in 2024', 'ls2024_party_changed_flag'));
  }

  const continuity = rec.derived_winner_persistence_score;
  if (hasNumber(continuity)) {
    drivers.push(driver(
      'Low winner persistence',
      continuity < 0.5 ? 'positive' : 'negative',
      Math.min(1, 1 - continuity),
      `Winner persistence score ${continuity.toFixed(2)}`,
      'derived_winner_persistence_score',
    ));
  }

  const weighted = drivers.reduce((sum, d) => sum + (d.direction === 'positive' ? d.magnitude : -d.magnitude), 0);
  const maxAbs = drivers.reduce((sum, d) => sum + d.magnitude, 0) || 1;
  const value = clamp100(0.5 + weighted / (2 * maxAbs));

  return {
    key: 'investigation_priority',
    label: 'Investigation Priority',
    value,
    range: [0, 100],
    confidence: confidenceFrom(drivers.length, 6, 'LOW'),
    confidenceReason: `${String(drivers.length)} of 6 investigation signals present`,
    drivers,
    assumptions: [
      assumption('Turnover + volatility + contested DNA flag newsworthy seats', 'Composite editorial heuristic from the master prompt'),
      assumption('Governance issue density signals reporting demand', 'Dataset field captures registered issue load'),
    ],
    dataGaps: !hasNumber(derived) ? ['Governance issue density unavailable'] : [],
    interpretation: 'Higher investigation priority means this seat deserves journalistic attention — contested, volatile, or structurally unstable.',
  };
}
