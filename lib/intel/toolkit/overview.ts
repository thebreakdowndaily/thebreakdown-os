import { loadData, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { predictRecord } from '@/lib/intel/predictions';
import { buildConstituencyToolkit, toConstituencyEntry } from './index';
import type { ConstituencyToolkit, ToolkitConstituencyEntry } from './types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

export interface ToolkitOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  total: number;
  entries: ToolkitConstituencyEntry[];
}

export async function computeToolkitOverview(): Promise<ToolkitOverview> {
  const data = await loadData();
  const entries = data.map((rec) => {
    const p = predictRecord(rec);
    return toConstituencyEntry(rec, p.predicted_winner, p.winner_probability);
  });

  return {
    generatedAt: new Date().toISOString(),
    dataSource: getDatasetVersion(),
    researchCutoff: getResearchCutoff(),
    total: entries.length,
    entries,
  };
}

export async function getConstituencyToolkit(id: string): Promise<ConstituencyToolkit | null> {
  const data = await loadData();
  const rec = data.find((r) => r.canonical_constituency_id === id);
  return rec ? buildConstituencyToolkit(rec) : null;
}
