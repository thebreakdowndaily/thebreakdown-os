import type { ScenariosOverview } from '@/lib/intel/scenarios/overview';
import type { ScenarioMonitor, ScenarioMonitorItem } from './types';

// Governing document: Phase IV sprint brief (Scenario Monitor).
// Reuses the certified Scenario Engine. Displays only meaningful flips — scenarios with a
// material number of seat changes, ranked by editorial impact. Never re-runs the engine.

const MEANINGFUL_FLIP_THRESHOLD = 3;
const FLIPS_SHOWN_PER_SCENARIO = 5;

function impactFor(flipCount: number): ScenarioMonitorItem['editorialImpact'] {
  if (flipCount >= 30) return 'high';
  if (flipCount >= 10) return 'medium';
  return 'low';
}

export function buildScenarioMonitor(scenarios: ScenariosOverview): ScenarioMonitor {
  const nonBaseline = scenarios.scenarios.filter((s) => s.id !== 'baseline');

  const items: ScenarioMonitorItem[] = nonBaseline
    .filter((s) => s.flipCount >= MEANINGFUL_FLIP_THRESHOLD)
    .map((s) => ({
      scenarioId: s.id,
      label: s.label,
      type: s.type,
      flipCount: s.flipCount,
      totalSeats: s.totalSeats,
      seatShareTop: Object.entries(s.seatShare)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([party, seats]) => ({ party, seats })),
      majority: s.majority,
      editorialImpact: impactFor(s.flipCount),
      flips: s.flips
        .slice()
        .sort((a, b) => b.winnerProbability - a.winnerProbability)
        .slice(0, FLIPS_SHOWN_PER_SCENARIO)
        .map((f) => ({
          constituency: f.constituency_name,
          from: f.baselineWinner,
          to: f.scenarioWinner,
          winnerProbability: f.winnerProbability,
        })),
      note: s.description,
    }))
    .sort((a, b) => b.flipCount - a.flipCount);

  return {
    items,
    totalFlips: items.reduce((sum, i) => sum + i.flipCount, 0),
  };
}
