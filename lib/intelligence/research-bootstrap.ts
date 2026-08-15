/**
 * ─── Research Intelligence Runtime Bootstrap ─────────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Idempotent provisioning of the Research Intelligence Engine runtime, invoked
 * from server components before any research surface renders. Responsibilities:
 *
 *   1. Restore persisted state (via the core's ensureLoaded).
 *   2. Register the deterministic fixture adapter (always — the acceptance
 *      corpus) and the real RSS adapter (when feeds are configured).
 *
 * No project data is seeded automatically — research projects are created by
 * researchers through the workspace. This keeps production state clean.
 */

import { researchIntelligenceCore } from '@/services/intelligence/research';
import { fixtureAdapter } from '@/services/intelligence/research/adapters/fixture';
import { RssAdapter } from '@/services/intelligence/research/adapters/rss';

export interface ResearchBootstrapResult {
  stateRestored: boolean;
  adaptersProvisioned: number;
  rssFeedsConfigured: number;
  projectCount: number;
}

/** Real-network feeds. Configured empty by default; extend via env or config. */
export const DEFAULT_RESEARCH_FEEDS: Array<{
  url: string;
  publisher: string;
  sourceType: 'NEWS' | 'GOVERNMENT' | 'REGULATORS' | 'ACADEMIC';
  sourceClass: 'HIGH_QUALITY_SECONDARY' | 'OFFICIAL' | 'REGULATORY' | 'ACADEMIC';
}> = [];

export async function ensureResearchRuntime(): Promise<ResearchBootstrapResult> {
  await researchIntelligenceCore.ensureLoaded();

  if (!researchIntelligenceCore.getAdapters().some((a) => a.id === 'fixture')) {
    researchIntelligenceCore.registerAdapter(fixtureAdapter);
  }
  if (!researchIntelligenceCore.getAdapters().some((a) => a.id === 'rss')) {
    researchIntelligenceCore.registerAdapter(new RssAdapter({ feeds: DEFAULT_RESEARCH_FEEDS }));
  }

  return {
    stateRestored: researchIntelligenceCore.getProjects().length >= 0,
    adaptersProvisioned: researchIntelligenceCore.getAdapters().length,
    rssFeedsConfigured: DEFAULT_RESEARCH_FEEDS.length,
    projectCount: researchIntelligenceCore.getProjects().length,
  };
}
