import { loadData, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { predictAll } from '@/lib/intel/predictions';
import { runScenarios, SCENARIOS, COALITIONS } from './index';
import type { ScenarioResult } from './types';

export interface ScenariosOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  scenarios: ScenarioResult[];
  majority: number;
}

export async function computeScenariosOverview(): Promise<ScenariosOverview> {
  const data = await loadData();
  const predictions = predictAll(data);
  const scenarios = runScenarios(predictions, SCENARIOS, COALITIONS);

  return {
    generatedAt: new Date().toISOString(),
    dataSource: getDatasetVersion(),
    researchCutoff: getResearchCutoff(),
    scenarios,
    majority: scenarios[0]?.majority ?? 202,
  };
}
