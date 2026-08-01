// ── Policy Matrix Projection Builder (Phase 25A WP3) ───────────────────────────

import { SolutionComparisonProjection } from '@/types/solution-comparison';
import { SolutionComparisonEngine } from './solution-comparison-engine';

export class PolicyMatrixProjectionBuilder {
  /**
   * Builds an immutable SolutionComparisonProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    problemSlug?: string;
    currentTime?: Date;
  }): SolutionComparisonProjection {
    const timestamp = options?.currentTime || new Date();
    const slug = options?.problemSlug || 'kashmir-1947-un-reference';
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem(slug);

    return Object.freeze({
      projectionId: options?.projectionId || `proj-sol-comp-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      problemId: 'prob-kashmir-1947',
      problemSlug: slug,
      problemTitle: 'Strategic Dilemma of the 1947–48 Kashmir Conflict and UN Reference',
      fixCount: solutions.length,
      solutions: Object.freeze(solutions.map((s) => Object.freeze({ ...s }))),
      comparisonDisclaimer:
        'Solution Comparison compares, explains, and highlights trade-offs. Solution Comparison never recommends or ranks a preferred policy.',
    });
  }
}
