// ── Problem Explorer Service (Phase 24B, 25B, 26A, & 26B) ──────────────────────

import { Problem, getProblemBySlug } from '../problem-helpers';
import { CHAPTER_1_FIX } from '../editorial/chapter-1-data';

export class ProblemExplorerService {
  public static getCanonicalProblems(): readonly Problem[] {
    const defaultProblem: Problem = {
      slug: 'kashmir-1947-un-reference',
      title: 'Strategic Dilemma of the 1947–48 Kashmir Conflict and UN Reference',
      description: 'Multi-layered historical problem involving territorial integration, bilateral diplomacy, and international intervention.',
      category: 'governance',
      severity: 'critical',
      evidenceGrade: 'High',
      fixCount: 1,
      storyCount: 1,
      entityCount: 4,
      datasetCount: 2,
      fixes: [CHAPTER_1_FIX as any],
      lastUpdated: '1949-01-01',
      tags: ['Kashmir', '1947', 'UN Resolution 47', 'Bilateral Autonomy'],
    };
    return Object.freeze([defaultProblem]);
  }

  public static getProblemBySlug(slug: string): Problem | undefined {
    const problems = this.getCanonicalProblems();
    return getProblemBySlug(Array.from(problems), slug);
  }
}
