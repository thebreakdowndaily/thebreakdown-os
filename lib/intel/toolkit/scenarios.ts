import type { ScenarioDef, SeatOutcome } from '@/lib/intel/scenarios/types';
import type { ToolkitScenarios, ScenarioFlip } from './types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Reuses the scenario engine's projectSeat for this seat across every scenario def.

export function buildScenarios(
  baselineWinner: string,
  outcomes: Array<{ def: ScenarioDef; outcome: SeatOutcome }>,
): ToolkitScenarios {
  const flips: ScenarioFlip[] = outcomes.map(({ def, outcome }) => ({
    scenarioId: def.id,
    label: def.label,
    type: def.type,
    baselineWinner,
    scenarioWinner: outcome.scenarioWinner,
    flipped: outcome.flipped,
    winnerProbability: outcome.winnerProbability,
  }));

  const flipped = flips.filter((f) => f.flipped);
  const stable = flips.filter((f) => !f.flipped);

  return {
    baselineWinner,
    flips,
    vulnerableScenarios: flipped.map((f) => f.label),
    safestScenarios: stable.slice(0, 3).map((f) => f.label),
  };
}
