/**
 * ─── Newsroom Workflow & Source Reputation Service ───────────────────────────
 *
 * Core rule:
 * Executes human editorial actions (verify, assign, follow, ignore, merge, split, escalate, resolve),
 * updates persistent audit log, and deterministically adjusts source reputation feedback.
 *
 * Human editorial authority is always final.
 */

import {
  NewsroomSignal,
  NewsroomActionPayload,
  SourceReputationMetrics,
} from '@/types/newsroom-intelligence';
import { NewsroomAuditService } from './audit-service';
import { beatRoutingService } from './beat-routing-service';

export class NewsroomWorkflowService {
  private reputationStore: Map<string, SourceReputationMetrics> = new Map();

  /**
   * Initializes or updates a source reputation record.
   */
  public registerSourceReputation(source: {
    id: string;
    name: string;
    tier: 't1' | 't2' | 't3' | 't4' | 't5';
  }): SourceReputationMetrics {
    if (this.reputationStore.has(source.id)) {
      return this.reputationStore.get(source.id)!;
    }

    const defaultScore =
      source.tier === 't1'
        ? 95
        : source.tier === 't2'
        ? 85
        : source.tier === 't3'
        ? 70
        : source.tier === 't4'
        ? 50
        : 35;

    const rep: SourceReputationMetrics = {
      sourceId: source.id,
      sourceName: source.name,
      tier: source.tier,
      reliabilityScore: defaultScore,
      totalObservationsIngested: 0,
      confirmedClaimsCount: 0,
      contradictedClaimsCount: 0,
      falseAlarmCount: 0,
      correctionsIssuedCount: 0,
      primarySourceCount: source.tier === 't1' || source.tier === 't2' ? 1 : 0,
      confirmationRate: 1.0,
      falseAlarmRate: 0.0,
      lastEvaluatedAt: new Date().toISOString(),
    };

    this.reputationStore.set(source.id, rep);
    return rep;
  }

  public getSourceReputations(): SourceReputationMetrics[] {
    return Array.from(this.reputationStore.values()).sort(
      (a, b) => b.reliabilityScore - a.reliabilityScore
    );
  }

  /**
   * Applies a human editorial action to a signal.
   */
  public applyAction(
    signal: NewsroomSignal,
    payload: NewsroomActionPayload
  ): NewsroomSignal {
    if (payload.expectedVersion !== undefined && signal.version !== payload.expectedVersion) {
      throw new Error(`Version conflict: Signal has been modified by another editor.`);
    }

    const prevState = signal.lifecycleState;
    const updatedSignal: NewsroomSignal = {
      ...signal,
      version: signal.version + 1,
      lastUpdatedAt: new Date().toISOString(),
    };

    switch (payload.action) {
      case 'ASSIGN':
        if (payload.assignedTo) {
          updatedSignal.assignedTo = payload.assignedTo;
          updatedSignal.assignedAt = new Date().toISOString();
        }
        break;

      case 'VERIFY':
        updatedSignal.lifecycleState = 'confirmed';
        break;

      case 'ESCALATE':
        if (payload.escalatedPriority) {
          updatedSignal.priority = payload.escalatedPriority;
          updatedSignal.lifecycleState = 'escalated';
        }
        beatRoutingService.recordEscalation({
          signalId: signal.id,
          previousOwner: signal.assignedTo,
          newOwner: payload.assignedTo || 'managing_editor',
          reason: payload.note || 'Escalated by reporter/editor',
          timestamp: new Date().toISOString(),
          actor: payload.actorName || payload.actorId,
        });
        break;

      case 'RESOLVE':
        updatedSignal.lifecycleState = 'resolved';
        break;

      case 'FOLLOW':
        if (!updatedSignal.editorialNotes) updatedSignal.editorialNotes = [];
        updatedSignal.editorialNotes.push(`Following signal by ${payload.actorName}`);
        break;

      case 'IGNORE':
        updatedSignal.lifecycleState = 'retracted';
        break;

      case 'MARK_RELEVANT':
        updatedSignal.scores.relevance = Math.min(100, updatedSignal.scores.relevance + 10);
        break;

      case 'NOT_RELEVANT':
        updatedSignal.scores.relevance = Math.max(0, updatedSignal.scores.relevance - 20);
        if (updatedSignal.scores.relevance < 20) {
          updatedSignal.lifecycleState = 'retracted';
        }
        break;

      case 'MERGE':
        updatedSignal.lifecycleState = 'superseded';
        break;

      case 'SPLIT':
        if (!updatedSignal.editorialNotes) updatedSignal.editorialNotes = [];
        updatedSignal.editorialNotes.push(`Cluster split by ${payload.actorName}`);
        break;
    }

    if (payload.note) {
      if (!updatedSignal.editorialNotes) updatedSignal.editorialNotes = [];
      updatedSignal.editorialNotes.push(`${payload.actorName}: ${payload.note}`);
    }

    // Record in immutable audit trail
    NewsroomAuditService.logAction({
      signalId: signal.id,
      clusterId: signal.clusterId,
      actorId: payload.actorId,
      actorName: payload.actorName,
      action: payload.action,
      previousState: prevState,
      newState: updatedSignal.lifecycleState,
      reason: payload.note || `Action ${payload.action} executed by ${payload.actorName}`,
      metadata: { mutationId: payload.mutationId },
    });

    return updatedSignal;
  }

  /**
   * Applies deterministic source reputation feedback from editorial actions.
   */
  public recordSourceFeedback(
    sourceId: string,
    outcome: 'confirmed' | 'contradicted' | 'false_alarm' | 'correction'
  ): SourceReputationMetrics | null {
    const rep = this.reputationStore.get(sourceId);
    if (!rep) return null;

    if (outcome === 'confirmed') {
      rep.confirmedClaimsCount += 1;
      rep.reliabilityScore = Math.min(100, rep.reliabilityScore + 2);
    } else if (outcome === 'contradicted') {
      rep.contradictedClaimsCount += 1;
      rep.reliabilityScore = Math.max(10, rep.reliabilityScore - 3);
    } else if (outcome === 'false_alarm') {
      rep.falseAlarmCount += 1;
      rep.reliabilityScore = Math.max(10, rep.reliabilityScore - 5);
    } else if (outcome === 'correction') {
      rep.correctionsIssuedCount += 1;
      rep.reliabilityScore = Math.max(10, rep.reliabilityScore - 4);
    }

    const totalEvaluated =
      rep.confirmedClaimsCount +
      rep.contradictedClaimsCount +
      rep.falseAlarmCount;

    if (totalEvaluated > 0) {
      rep.confirmationRate =
        Math.round((rep.confirmedClaimsCount / totalEvaluated) * 100) / 100;
      rep.falseAlarmRate =
        Math.round((rep.falseAlarmCount / totalEvaluated) * 100) / 100;
    }

    rep.lastEvaluatedAt = new Date().toISOString();
    return rep;
  }

  /**
   * Durable snapshot of the source reputation store (Operating Standard §21).
   */
  public snapshotReputations(): SourceReputationMetrics[] {
    return Array.from(this.reputationStore.values());
  }

  public restoreReputations(reputations: SourceReputationMetrics[]): void {
    this.reputationStore.clear();
    for (const rep of reputations) {
      this.reputationStore.set(rep.sourceId, rep);
    }
  }
}
