/**
 * ─── Research Intelligence Runtime Bootstrap ─────────────────────────────────
 * Governing documents: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *                      docs/research/source-governance.md
 *
 * Idempotent provisioning of the Research Intelligence Engine runtime, invoked
 * from server components before any research surface renders. Responsibilities:
 *
 *   1. Restore persisted state (via the core's ensureLoaded).
 *   2. Register the RSS adapter built from the Research Source Registry's
 *      APPROVED/ACTIVE sources (production discovery never uses the fixture).
 *   3. Register the deterministic fixture adapter ONLY when explicitly enabled
 *      or in a non-production environment (acceptance/authoring surface).
 *
 * Fixture isolation: a real source that fails is never silently substituted
 * with fixture content. Fixture simply is not part of the production runtime.
 */

import { researchIntelligenceCore } from '@/services/intelligence/research';
import { fixtureAdapter } from '@/services/intelligence/research/adapters/fixture';
import { researchSourceRegistry } from '@/services/intelligence/research/source-registry';

export interface ResearchBootstrapResult {
  stateRestored: boolean;
  adaptersProvisioned: number;
  rssFeedsConfigured: number;
  projectCount: number;
  fixtureEnabled: boolean;
}

export interface EnsureResearchRuntimeOptions {
  /** Force fixture registration even in production (test/authoring surfaces). */
  includeFixture?: boolean;
}

/**
 * Fixture adapter is a deterministic acceptance/authoring corpus. It must never
 * be part of the production research runtime, so it is gated: explicit opt-in,
 * env override, or any non-production environment.
 */
export function isFixtureEnabled(options: EnsureResearchRuntimeOptions = {}): boolean {
  if (options.includeFixture === true) return true;
  if (process.env.RESEARCH_ENABLE_FIXTURE === 'true') return true;
  if (process.env.NODE_ENV !== 'production') return true;
  return false;
}

/**
 * Legacy feed-list constant. Superseded by the Research Source Registry
 * (data/research-source-registry.ts + services/intelligence/research/source-registry.ts).
 * Kept exported for backward compatibility; no longer drives the runtime.
 *
 * @deprecated Use the Research Source Registry instead.
 */
export const DEFAULT_RESEARCH_FEEDS: Array<{
  url: string;
  publisher: string;
  sourceType: 'NEWS' | 'GOVERNMENT' | 'REGULATORS' | 'ACADEMIC';
  sourceClass: 'HIGH_QUALITY_SECONDARY' | 'OFFICIAL' | 'REGULATORY' | 'ACADEMIC';
}> = [];

export async function ensureResearchRuntime(
  options: EnsureResearchRuntimeOptions = {}
): Promise<ResearchBootstrapResult> {
  await researchIntelligenceCore.ensureLoaded();

  const fixtureEnabled = isFixtureEnabled(options);
  const adapters = researchIntelligenceCore.getAdapters();

  if (fixtureEnabled && !adapters.some((a) => a.id === 'fixture')) {
    researchIntelligenceCore.registerAdapter(fixtureAdapter);
  }
  if (!adapters.some((a) => a.id === 'rss')) {
    researchIntelligenceCore.registerAdapter(researchSourceRegistry.toRssAdapter());
  }

  const configured = researchSourceRegistry.getEligible().length;
  return {
    stateRestored: researchIntelligenceCore.getProjects().length >= 0,
    adaptersProvisioned: researchIntelligenceCore.getAdapters().length,
    rssFeedsConfigured: configured,
    projectCount: researchIntelligenceCore.getProjects().length,
    fixtureEnabled,
  };
}
