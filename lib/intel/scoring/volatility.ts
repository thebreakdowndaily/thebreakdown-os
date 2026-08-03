import type { ConstituencyRecord } from '@/lib/up403/types';
import type { IntelligenceScore } from './types';
import { clamp100, confidenceFrom, driver, assumption, hasNumber } from './util';

export function volatilityScore(rec: ConstituencyRecord): IntelligenceScore {
  const drivers = [];

  const seatVol = rec.seat_volatility_index;
  if (hasNumber(seatVol)) {
    drivers.push(driver(
      'Seat volatility index',
      'positive',
      Math.min(1, seatVol / 2),
      `Seat volatility index ${String(seatVol)}`,
      'seat_volatility_index',
    ));
  }

  const partyVol = rec.party_volatility_index;
  if (hasNumber(partyVol)) {
    drivers.push(driver(
      'Party volatility index',
      'positive',
      Math.min(1, partyVol / 2),
      `Party volatility index ${String(partyVol)}`,
      'party_volatility_index',
    ));
  }

  const shifts = rec.trajectory_total_shifts;
  if (hasNumber(shifts)) {
    drivers.push(driver(
      'Trajectory shifts',
      'positive',
      Math.min(1, shifts / 4),
      `${String(shifts)} winner shifts in the observed trajectory`,
      'trajectory_total_shifts',
    ));
  }

  const uniqueWinners = rec.unique_winners_across_elections;
  if (hasNumber(uniqueWinners)) {
    drivers.push(driver(
      'Unique winners',
      'positive',
      Math.min(1, uniqueWinners / 3),
      `${String(uniqueWinners)} distinct winners across elections`,
      'unique_winners_across_elections',
    ));
  }

  const derived = rec.derived_seat_volatility;
  if (hasNumber(derived)) {
    drivers.push(driver(
      'Derived seat volatility',
      'positive',
      Math.min(1, derived / 2),
      `Derived seat volatility ${String(derived)}`,
      'derived_seat_volatility',
    ));
  }

  const weighted = drivers.reduce((sum, d) => sum + d.magnitude, 0) / Math.max(1, drivers.length);
  const value = clamp100(weighted);

  return {
    key: 'volatility',
    label: 'Electoral Volatility',
    value,
    range: [0, 100],
    confidence: confidenceFrom(drivers.length, 5, 'LOW'),
    confidenceReason: `${String(drivers.length)} of 5 volatility signals present`,
    drivers,
    assumptions: [
      assumption('Volatility indices from the frozen dataset are reliable', 'Derived from three Vidhan Sabha elections + LS 2024 overlay'),
      assumption('Past instability signals future unpredictability', 'No external political shocks included'),
    ],
    dataGaps: [],
    interpretation: 'Higher volatility means the seat changes hands more often and is harder to predict; lower means a stable seat.',
  };
}
