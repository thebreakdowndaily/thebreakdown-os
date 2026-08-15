/**
 * ─── Contradiction Engine (Newsroom Intelligence OS) ─────────────────────────
 *
 * Core rule:
 * Propositional conflict detection between claims within a StoryCluster.
 * Increases uncertainty and misinformation risk; escalates verification priority.
 */

import {
  StoryCluster,
  NewsroomExtractedClaim,
  ClaimContradiction,
} from '@/types/newsroom-intelligence';

export class ContradictionEngine {
  /**
   * Evaluates pairwise claims within a cluster for explicit contradictions.
   */
  public static detectContradictions(
    cluster: StoryCluster,
    claims: NewsroomExtractedClaim[]
  ): ClaimContradiction[] {
    const clusterClaims = claims.filter((c) => cluster.claimIds.includes(c.id));
    const contradictions: ClaimContradiction[] = [];

    for (let i = 0; i < clusterClaims.length; i++) {
      for (let j = i + 1; j < clusterClaims.length; j++) {
        const cA = clusterClaims[i];
        const cB = clusterClaims[j];

        // 1. Explicit contradiction pointer
        const isExplicitPointer =
          cA.contradictingClaimIds?.includes(cB.id) ||
          cB.contradictingClaimIds?.includes(cA.id);

        // 2. Action/Subject conflict on same entity & object with differing values/states
        let isSemanticConflict = false;
        let conflictReason = '';

        if (
          cA.actor &&
          cB.actor &&
          cA.actor.toLowerCase() === cB.actor.toLowerCase() &&
          cA.action &&
          cB.action
        ) {
          const actA = cA.action.toLowerCase();
          const actB = cB.action.toLowerCase();

          // Incompatible antonyms/actions
          const incompatiblePairs = [
            ['approved', 'rejected'],
            ['passed', 'rejected'],
            ['approved', 'disapproved'],
            ['denied', 'confirmed'],
            ['arrested', 'released'],
            ['won', 'lost'],
            ['increased', 'decreased'],
            ['signed', 'vetoed'],
          ];

          for (const [p1, p2] of incompatiblePairs) {
            if (
              (actA.includes(p1) && actB.includes(p2)) ||
              (actA.includes(p2) && actB.includes(p1))
            ) {
              isSemanticConflict = true;
              conflictReason = `Incompatible predicate actions: "${cA.action}" vs "${cB.action}" for actor "${cA.actor}".`;
              break;
            }
          }
        }

        if (isExplicitPointer || isSemanticConflict) {
          const contradictionId = `cntr-${cluster.id}-${cA.id}-${cB.id}`;
          contradictions.push({
            id: contradictionId,
            clusterId: cluster.id,
            claimIdA: cA.id,
            claimIdB: cB.id,
            statementA: cA.statement,
            statementB: cB.statement,
            sourceIdA: cA.observationId,
            sourceIdB: cB.observationId,
            severity:
              cA.confidence > 0.8 && cB.confidence > 0.8
                ? 'critical'
                : 'high',
            incompatibleProposition:
              conflictReason ||
              `Contradictory assertions: "${cA.statement}" vs "${cB.statement}"`,
            detectedAt: new Date().toISOString(),
            resolved: false,
          });
        }
      }
    }

    return contradictions;
  }
}
