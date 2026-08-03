import type { ConstituencyPrediction } from '@/lib/intel/predictions/types';
import type { ScenarioDef, ScenarioResult, CoalitionDef } from './types';
import { runScenario } from './engine';
import { SCENARIOS, COALITIONS } from './definitions';

export type { ScenarioDef, ScenarioResult, CoalitionDef } from './types';
export { SCENARIOS, COALITIONS } from './definitions';
export { applySwings, projectSeat, buildSeatShare, scoreCoalitions, runScenario, MAJORITY } from './engine';

export function runScenarios(predictions: ConstituencyPrediction[], defs: ScenarioDef[] = SCENARIOS, coalitions: CoalitionDef[] = COALITIONS): ScenarioResult[] {
  return defs.map((def) => runScenario(predictions, def, coalitions));
}

export function findScenario(defs: ScenarioDef[], id: string): ScenarioDef | null {
  return defs.find((d) => d.id === id) ?? null;
}
