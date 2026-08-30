/**
 * ─── Research Intelligence — Approved-Source Discovery ───────────────────────
 * Governing documents: docs/research/source-governance.md
 *                      docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * The production discovery path. Runs the pipeline against the Research Source
 * Registry's APPROVED/ACTIVE sources ONLY. The fixture adapter is never an
 * input and can never be a fallback: a real source that fails yields a partial
 * failure recorded in the run, not fabricated content and not fixture content.
 */

import { runResearchPipeline, PipelineOptions } from './pipeline';
import { ResearchIntelligenceCore } from './core';
import { ResearchSourceRegistry, researchSourceRegistry } from './source-registry';
import type { ResearchRun, ResearchRunTrigger } from '@/types/research-intelligence';

export interface ApprovedSourceDiscoveryOptions
  extends Omit<PipelineOptions, 'adapters' | 'trigger' | 'triggeredBy'> {
  triggeredBy: string;
  trigger?: ResearchRunTrigger;
}

export class NoApprovedSourcesError extends Error {
  constructor() {
    super(
      'No approved research sources are configured. Sources require editorial approval in the Research Source Registry before production discovery.'
    );
    this.name = 'NoApprovedSourcesError';
  }
}

export class NoValidatedDiscoverySourcesError extends Error {
  constructor() {
    super(
      'No validated RSS or Atom discovery endpoints are configured. Authoritative sources awaiting endpoint validation remain in source context but cannot be polled by the RSS adapter.'
    );
    this.name = 'NoValidatedDiscoverySourcesError';
  }
}

/**
 * Runs one bounded discovery pass over approved registry sources. Throws
 * NoApprovedSourcesError when the registry has no eligible source, so an
 * unconfigured registry can never silently succeed with zero content.
 */
export async function runApprovedSourceDiscovery(
  core: ResearchIntelligenceCore,
  projectId: string,
  options: ApprovedSourceDiscoveryOptions,
  registry: ResearchSourceRegistry = researchSourceRegistry
): Promise<ResearchRun> {
  if (registry.getEligible().length === 0) {
    throw new NoApprovedSourcesError();
  }
  if (registry.toRssFeedConfigs().length === 0) {
    throw new NoValidatedDiscoverySourcesError();
  }
  const adapter = registry.toRssAdapter();
  const sourceContext = registry.getEligible().map((d) => ({
    domain: d.canonicalDomain,
    authorityClass: d.authorityClass,
    documentTypes: d.documentTypes,
    priority: d.priority,
  }));
  return runResearchPipeline(core, projectId, {
    ...options,
    adapters: [adapter],
    trigger: options.trigger ?? 'MANUAL',
    // Primary-source discovery is always on for the production path; it is
    // gated behind an option only so benchmark controls can stay isolated.
    primarySourceDiscovery: true,
    sourceContext,
  });
}
