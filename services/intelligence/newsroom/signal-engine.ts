/**
 * ─── Signal Engine (Newsroom Intelligence OS) ────────────────────────────────
 *
 * Core rule:
 * OBSERVATION → CLAIM → STORY CLUSTER → SIGNAL → ALERT
 * Evaluates a StoryCluster and computes all 9 component scores,
 * priority, lifecycle transitions, and explainability payloads.
 */

import {
  StoryCluster,
  NewsroomObservation,
  NewsroomExtractedClaim,
  ClaimContradiction,
  NewsroomSignal,
  SignalComponentScores,
  SignalLifecycleState,
} from '@/types/newsroom-intelligence';
import { VelocityEngine } from './velocity-engine';
import { ContradictionEngine } from './contradiction-engine';
import { PriorityEngine } from './priority-engine';

export class SignalEngine {
  /**
   * Generates or re-evaluates a deterministic NewsroomSignal from a StoryCluster.
   */
  public static evaluateSignal(
    cluster: StoryCluster,
    observations: NewsroomObservation[],
    claims: NewsroomExtractedClaim[],
    existingSignal?: NewsroomSignal,
    now: Date = new Date()
  ): { signal: NewsroomSignal; contradictions: ClaimContradiction[] } {
    const clusterObs = observations.filter((o) =>
      cluster.observationIds.includes(o.id)
    );
    const clusterClaims = claims.filter((c) => cluster.claimIds.includes(c.id));

    // 1. Calculate Velocity
    const velocity = VelocityEngine.calculateVelocity(cluster, observations, now);

    // 2. Detect Contradictions
    const contradictions = ContradictionEngine.detectContradictions(
      cluster,
      clusterClaims
    );

    // 3. Compute the 9 Component Scores
    // a. Source Reliability
    const tierWeights: Record<string, number> = {
      t1: 100,
      t2: 85,
      t3: 65,
      t4: 45,
      t5: 25,
    };
    const avgSourceReliability =
      clusterObs.length > 0
        ? Math.round(
            clusterObs.reduce((acc, o) => acc + (tierWeights[o.sourceTier] || 50), 0) /
              clusterObs.length
          )
        : 50;

    // b. Evidence Strength
    const primaryCount = clusterObs.filter(
      (o) => o.isPrimarySource || o.sourceTier === 't1' || o.sourceTier === 't2'
    ).length;
    const evidenceStrength = Math.min(
      100,
      Math.round(primaryCount * 30 + clusterObs.length * 5)
    );

    // c. Confidence
    const avgClaimConf =
      clusterClaims.length > 0
        ? clusterClaims.reduce((acc, c) => acc + c.confidence, 0) /
          clusterClaims.length
        : 0.5;
    let confidence = Math.round(avgClaimConf * 100);
    if (primaryCount > 0) confidence = Math.min(100, confidence + 15);
    if (contradictions.length > 0) confidence = Math.max(20, confidence - 25);

    // d. Uncertainty & Misinformation Risk
    const uncertainty = Math.min(
      100,
      Math.round(
        (100 - confidence) * 0.6 + (contradictions.length > 0 ? 35 : 0)
      )
    );

    const isOnlyLowTier = clusterObs.every(
      (o) => o.sourceTier === 't4' || o.sourceTier === 't5'
    );
    const misinformationRisk = Math.min(
      100,
      Math.round(
        (contradictions.length > 0 ? 40 : 0) +
          (isOnlyLowTier ? 35 : 0) +
          (cluster.independentSourceCount <= 1 ? 25 : 0)
      )
    );

    // e. Novelty
    const clusterAgeHours = Math.max(
      0.1,
      (now.getTime() - new Date(cluster.firstDetectedAt).getTime()) /
        (1000 * 60 * 60)
    );
    const novelty = Math.max(
      10,
      Math.min(100, Math.round(100 - clusterAgeHours * 4))
    );

    // f. Relevance & Importance
    const importance = Math.min(
      100,
      Math.round(
        (primaryCount > 0 ? 40 : 15) +
          cluster.entities.length * 10 +
          Math.min(40, cluster.independentSourceCount * 10)
      )
    );
    const relevance = Math.min(
      100,
      Math.round(importance * 0.7 + novelty * 0.3)
    );

    const scores: SignalComponentScores = {
      relevance,
      importance,
      novelty,
      velocity: velocity.velocityScore,
      evidenceStrength,
      confidence,
      uncertainty,
      misinformationRisk,
      sourceReliability: avgSourceReliability,
    };

    // 4. Calculate Priority & Explanation
    const explanation = PriorityEngine.calculatePriority(
      scores,
      cluster.title,
      cluster.entities,
      contradictions.length > 0,
      velocity.primarySourceEmergence
    );

    // 5. Determine Lifecycle State
    let lifecycleState: SignalLifecycleState = existingSignal
      ? existingSignal.lifecycleState
      : 'discovered';

    if (lifecycleState === 'discovered') {
      if (explanation.priority === 'P0' || explanation.priority === 'P1') {
        lifecycleState = 'escalated';
      } else {
        lifecycleState = 'monitoring';
      }
    } else if (lifecycleState === 'monitoring') {
      if (explanation.priority === 'P0' || explanation.priority === 'P1') {
        lifecycleState = 'escalated';
      } else if (contradictions.length > 0) {
        lifecycleState = 'contested';
      } else if (primaryCount >= 2 && confidence >= 80) {
        lifecycleState = 'confirmed';
      }
    } else if (lifecycleState === 'escalated') {
      if (contradictions.length > 0) {
        lifecycleState = 'contested';
      } else if (primaryCount >= 2 && confidence >= 85) {
        lifecycleState = 'confirmed';
      }
    }

    const signalId = existingSignal?.id || `sig-${cluster.id}`;
    const version = (existingSignal?.version || 0) + 1;

    const signal: NewsroomSignal = {
      id: signalId,
      clusterId: cluster.id,
      title: cluster.title,
      summary: cluster.summary,
      firstDetectedAt: cluster.firstDetectedAt,
      lastUpdatedAt: now.toISOString(),
      lifecycleState,
      priority: explanation.priority,
      scores,
      explanation,
      observationCount: clusterObs.length,
      independentSourceCount: cluster.independentSourceCount,
      primarySourceCount: primaryCount,
      keyEntities: cluster.entities,
      keyClaims: clusterClaims.map((c) => c.statement),
      contradictionIds: contradictions.map((c) => c.id),
      assignedTo: existingSignal?.assignedTo,
      assignedAt: existingSignal?.assignedAt,
      editorialNotes: existingSignal?.editorialNotes || [],
      linkedStoryId: existingSignal?.linkedStoryId,
      version,
    };

    return { signal, contradictions };
  }
}
