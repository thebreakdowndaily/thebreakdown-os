import { loadData, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { rankInvestigationPipeline, pipelineByRegion, factorAggregatesFor } from './index';
import type { EditorialOverview } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Editorial Intelligence)

const GLOBAL_LIMITATIONS = [
  'Population and development indicators are unavailable at constituency level in the frozen dataset — public-relevance weighting is not computed.',
  'No temporal prediction history exists — "predictions changed materially" is proxied by model sensitivity, never measured directly.',
  'Candidate finance/affidavit data is not present in the frozen dataset — candidate-level investigation pressure is not modelled.',
  'The index ranks attention priority from evidence structure. It is a decision aid for editors, not a prediction of newsworthiness.',
];

export async function computeEditorialOverview(limit = 403): Promise<EditorialOverview> {
  const data = await loadData();
  const ranked = rankInvestigationPipeline(data);

  return {
    generatedAt: new Date().toISOString(),
    dataSource: getDatasetVersion(),
    researchCutoff: getResearchCutoff(),
    total: ranked.length,
    ranked: ranked.slice(0, limit),
    byRegion: pipelineByRegion(ranked),
    factorAggregates: factorAggregatesFor(ranked),
    topOverall: ranked.length > 0 ? ranked[0].ipi : 0,
    limitations: GLOBAL_LIMITATIONS,
  };
}
