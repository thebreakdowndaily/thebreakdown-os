import type { ConstituencyRecord } from '@/lib/up403/types';
import type { IntelligenceScore } from './types';
import { clamp100, confidenceFrom, driver, assumption, hasNumber } from './util';

export function momentumScore(rec: ConstituencyRecord): IntelligenceScore {
  const drivers = [];

  const margins = [rec.victory_margin_pct_2012, rec.victory_margin_pct_2017, rec.victory_margin_pct_2022].filter(hasNumber);
  const shares = [rec.winner_vote_share_2012, rec.winner_vote_share_2017, rec.winner_vote_share_2022].filter(hasNumber);

  const marginDrift = margins.length >= 2 ? margins[margins.length - 1] - margins[0] : null;
  if (marginDrift !== null) {
    drivers.push(driver(
      'Winning margin drift',
      marginDrift > 0 ? 'positive' : 'negative',
      Math.min(1, Math.abs(marginDrift) / 25),
      `Latest margin ${String(margins[margins.length - 1])}% vs earliest ${String(margins[0])}% (net ${marginDrift.toFixed(1)}pp)`,
      'victory_margin_pct_*',
    ));
  }

  const shareDrift = shares.length >= 2 ? shares[shares.length - 1] - shares[0] : null;
  if (shareDrift !== null) {
    drivers.push(driver(
      'Winner vote-share drift',
      shareDrift > 0 ? 'positive' : 'negative',
      Math.min(1, Math.abs(shareDrift) / 20),
      `Latest winner share ${String(shares[shares.length - 1])}% vs earliest ${String(shares[0])}%`,
      'winner_vote_share_*',
    ));
  }

  const shifts = rec.trajectory_total_shifts || 0;
  drivers.push(driver(
    'Party trajectory shifts',
    shifts <= 1 ? 'positive' : 'negative',
    Math.min(1, shifts / 4),
    `${String(shifts)} party shifts across observed elections`,
    'trajectory_total_shifts',
  ));

  const lsChanged = rec.ls2024_party_changed_flag;
  drivers.push(driver(
    'Lok Sabha 2024 party change',
    lsChanged ? 'negative' : 'positive',
    lsChanged ? 0.6 : 0,
    lsChanged ? 'The parent PC changed party in LS 2024' : 'The parent PC held party in LS 2024',
    'ls2024_party_changed_flag',
  ));

  const weighted = drivers.reduce((sum, d) => sum + (d.direction === 'positive' ? d.magnitude : -d.magnitude), 0);
  const maxAbs = drivers.reduce((sum, d) => sum + d.magnitude, 0) || 1;
  const value = clamp100(0.5 + weighted / (2 * maxAbs));

  const completeDrivers = drivers.length;

  return {
    key: 'momentum',
    label: 'Political Momentum',
    value,
    range: [0, 100],
    confidence: confidenceFrom(completeDrivers, 4, 'LOW'),
    confidenceReason: `${String(completeDrivers)} of 4 momentum signals present`,
    drivers,
    assumptions: [
      assumption('Margin and vote-share drift proxy momentum', 'Drift measured across the three observed Vidhan Sabha elections'),
      assumption('Current direction extends to next cycle', 'No post-cutoff events incorporated'),
    ],
    dataGaps: margins.length < 3 || shares.length < 3 ? ['Earlier election margins/vote shares unavailable for some years'] : [],
    interpretation: 'Higher momentum means the seat is trending toward the incumbent coalition; lower means the seat is trending away.',
  };
}
