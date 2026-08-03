import { loadData, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { buildEvidenceGraphAll, aggregateEvidence } from './index';
import type { ConstituencyEvidence, EvidenceAggregate } from './types';

export interface EvidenceOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  aggregate: EvidenceAggregate;
  all: ConstituencyEvidence[];
}

export async function computeEvidenceOverview(limit = 403): Promise<EvidenceOverview> {
  const data = await loadData();
  const evidence = buildEvidenceGraphAll(data);
  const aggregate = aggregateEvidence(evidence);

  return {
    generatedAt: new Date().toISOString(),
    dataSource: getDatasetVersion(),
    researchCutoff: getResearchCutoff(),
    aggregate,
    all: evidence.slice(0, limit),
  };
}
