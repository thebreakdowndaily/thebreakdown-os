// ── Evidence Evolution Projection Builder (Phase 26B WP3) ─────────────────────────

import { EvidenceEvolutionProjection } from '../../types/evidence-evolution';
import { EvidenceEvolutionService } from './evidence-evolution-service';

export class EvidenceEvolutionProjectionBuilder {
  /**
   * Builds an immutable EvidenceEvolutionProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    problemSlug?: string;
    currentTime?: Date;
  }): EvidenceEvolutionProjection {
    const timestamp = options?.currentTime || new Date();
    let nodes = EvidenceEvolutionService.getCanonicalTrajectories();

    if (options?.problemSlug) {
      nodes = nodes.filter((n) => n.relatedProblemSlugs.includes(options.problemSlug!));
    }

    return Object.freeze({
      projectionId: options?.projectionId || `proj-evo-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      problemSlug: options?.problemSlug,
      nodeCount: nodes.length,
      trajectoryNodes: Object.freeze(nodes.map((n) => Object.freeze({ ...n }))),
      evolutionDisclaimer:
        'Evidence Evolution records, compares, and explains revisions. Evidence Evolution never assumes newer evidence is inherently stronger or rewrites historical context.',
    });
  }
}
