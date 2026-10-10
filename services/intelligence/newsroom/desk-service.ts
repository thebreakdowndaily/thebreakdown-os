/**
 * ─── Newsroom Desk Service Layer (Phase 3B-M5) ──────────────────────────────
 *
 * Governing document: AGENTS.md (Operating Doctrine) & Editorial Constitution
 *
 * Exposes a coherent, role-based, read/triage service layer over the existing:
 *   - Detection & Ingestion Observations
 *   - Story Clusters & Claims
 *   - Prioritization & Signal Scoring (SNR)
 *   - Beat & Desk Routing
 *   - 7-Segment Operational Editorial Queue
 *   - Document Mutation Lineage (M2)
 *   - End-to-End Latency Measurement (M3)
 *   - Silent Feed & Source Health Context (M4)
 *   - Immutable Audit Trail
 *
 * Invariants:
 *   - Human authority is absolute (automated tasks cannot publish/verify).
 *   - Roles strictly enforced: guest rejected (403), unauthenticated rejected (401).
 *   - Optimistic concurrency control via expectedVersion (409 on race).
 *   - Zero database migrations (uses existing in-memory / Supabase persistence).
 */

import { NewsroomIntelligenceCore } from './index';
import { NewsroomAuditService } from './audit-service';
import { NewsroomQueueService } from './queue-service';
import { beatRoutingService } from './beat-routing-service';
import { IntelRole, intelRoleRank } from '@/features/auth/roles';
import type {
  NewsroomSignal,
  EditorialPriority,
  SignalLifecycleState,
  QueueSection,
  NewsroomTriageAction,
  NewsroomActionPayload,
  NewsroomAuditLogRecord,
} from '@/types/newsroom-intelligence';
import type {
  RadarSourceHealthStatus,
  RadarSourceScheduleState,
  RadarLatencyRecord,
  RadarSourceHealth,
} from '@/services/radar/types';

export interface NewsroomDeskItem {
  queueItemId: string;
  signalId: string;
  clusterId: string;
  title: string;
  summary: string;
  whyItMatters: string;
  canonicalUrl?: string;
  sourceId?: string;
  sourceName?: string;
  sourceAuthority: 't1' | 't2' | 't3' | 't4' | 't5';
  isPrimarySource: boolean;
  priority: EditorialPriority;
  beat?: string;
  geographicScope: string[];
  changeType: 'new' | 'changed' | 'unchanged';
  workflowState: SignalLifecycleState;
  assignedTo?: string;
  assignedAt?: string;
  confidence: number;
  evidenceStrength: number;
  uncertainty: number;
  observationCount: number;
  independentSourceCount: number;
  primarySourceCount: number;
  hasContradictions: boolean;
  contradictionIds: string[];
  relatedStoryId?: string;
  affectedStoryIds: string[];
  mutationContext?: {
    isMutation: boolean;
    mutationId?: string;
    previousObservationId?: string;
    previousContentHash?: string;
    newContentHash?: string;
    diffSummary?: string;
    revisionNumber?: number;
  };
  timestamps: {
    sourcePublishedAt?: string;
    firstSeenAt?: string;
    firstDetectedAt: string;
    lastUpdatedAt: string;
  };
  latencyContext?: {
    detectionLatencyMs?: number;
    observationLatencyMs?: number;
    verificationLatencyMs?: number;
    publicationLatencyMs?: number;
    endToEndPublicationLatencyMs?: number;
  };
  sourceHealthContext?: {
    status: RadarSourceHealthStatus;
    scheduleState?: RadarSourceScheduleState;
    consecutiveFailures: number;
    consecutiveEmptyRuns: number;
    silentFailureSuspected: boolean;
    lastSuccessAt?: string;
  };
  requiredHumanAction: string;
  availableActions: NewsroomTriageAction[];
  version: number;
  auditTrail: readonly NewsroomAuditLogRecord[];
}

export interface NewsroomDeskFilter {
  priority?: EditorialPriority;
  beat?: string;
  geography?: string;
  sourceId?: string;
  workflowState?: SignalLifecycleState;
  changeType?: 'new' | 'changed' | 'unchanged';
  needsVerification?: boolean;
  hasContradictions?: boolean;
  assignedTo?: string;
  section?: QueueSection;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export interface NewsroomDeskResponse {
  total: number;
  items: NewsroomDeskItem[];
  limit: number;
  offset: number;
  sections: Record<QueueSection, number>;
}

export interface NewsroomDeskSummary {
  totalSignals: number;
  breakingP0Count: number;
  importantP1Count: number;
  needsVerificationCount: number;
  contradictionsCount: number;
  coverageGapsCount: number;
  resolvedCount: number;
  activeAlertsCount: number;
  failingSourcesCount: number;
  persistenceStatus?: 'authoritative' | 'degraded_readonly';
  isDegradedReadOnly?: boolean;
}


export interface NewsroomDeskActionInput {
  signalId: string;
  action: NewsroomTriageAction;
  assignedTo?: string;
  note?: string;
  escalatedPriority?: NewsroomActionPayload['escalatedPriority'];
  mutationId?: string;
  expectedVersion?: number;
}

export class NewsroomDeskService {
  private _core?: NewsroomIntelligenceCore;

  constructor(core?: NewsroomIntelligenceCore) {
    if (core) {
      this._core = core;
    }
  }

  private get core(): NewsroomIntelligenceCore {
    if (!this._core) {
      this._core = NewsroomIntelligenceCore.getInstance();
    }
    return this._core;
  }

  /**
   * Evaluates available human actions based on user's institutional role and signal state.
   */
  public getAvailableActionsForRole(role: IntelRole, signal: NewsroomSignal): NewsroomTriageAction[] {
    const rank = intelRoleRank(role);

    // Guest has 0 editorial action privileges
    if (role === 'guest' || rank < intelRoleRank('fact_checker')) {
      return [];
    }

    const actions: NewsroomTriageAction[] = [];

    // Fact checker verification actions
    if (role === 'fact_checker' || rank >= intelRoleRank('editor')) {
      if (signal.lifecycleState !== 'confirmed' && signal.lifecycleState !== 'resolved') {
        actions.push('VERIFY', 'REVIEW');
      }
    }

    // Reporter, Analyst, Editor triage actions
    if (rank >= intelRoleRank('reporter')) {
      actions.push('FOLLOW', 'WATCH', 'MARK_RELEVANT', 'NOT_RELEVANT', 'PROMOTE_TO_RESEARCH');

      if (signal.lifecycleState !== 'retracted') {
        actions.push('ASSIGN', 'IGNORE', 'DISMISS');
      }

      if (rank >= intelRoleRank('reporter')) {
        actions.push('ESCALATE');
      }
    }

    // Senior Editor / Managing Editor / Owner privileges
    if (rank >= intelRoleRank('editor')) {
      actions.push('PRIORITIZE');
      if (signal.lifecycleState !== 'resolved') {
        actions.push('RESOLVE');
      }
      actions.push('MERGE', 'SPLIT');
    }

    return Array.from(new Set(actions));
  }

  /**
   * Builds canonical desk read item from existing internal objects.
   */
  public async buildDeskItem(
    sig: NewsroomSignal,
    userContext?: { id: string; role: IntelRole }
  ): Promise<NewsroomDeskItem> {
    const cluster = this.core.getCluster(sig.clusterId);
    const observations = cluster
      ? cluster.observationIds.map((id) => this.core.getObservation(id)).filter(Boolean)
      : [];

    const rootObs = observations[0];
    const latestObs = observations[observations.length - 1] || rootObs;

    // Change type from mutation or observation metadata
    let changeType: 'new' | 'changed' | 'unchanged' = 'new';
    if (latestObs?.metadata?.isMutation) {
      changeType = 'changed';
    } else if (latestObs?.duplicateState === 'exact_duplicate') {
      changeType = 'unchanged';
    }

    // Mutation context (from Phase 3B-M2)
    let mutationContext: NewsroomDeskItem['mutationContext'];
    if (latestObs?.metadata?.isMutation) {
      mutationContext = {
        isMutation: true,
        mutationId: latestObs.metadata.mutationId as string | undefined,
        previousObservationId: latestObs.metadata.previousObservationId as string | undefined,
        previousContentHash: latestObs.metadata.previousContentHash as string | undefined,
        newContentHash: latestObs.metadata.newContentHash as string | undefined,
        diffSummary: latestObs.metadata.diffSummary as string | undefined,
        revisionNumber: latestObs.metadata.revisionNumber as number | undefined,
      };
    }

    // Latency context (from Phase 3B-M3)
    let latencyContext: NewsroomDeskItem['latencyContext'];
    if (sig.clusterId) {
      const latRec = await this.core.getLatencyRecord(sig.clusterId);
      if (latRec) {
        latencyContext = {
          detectionLatencyMs: latRec.detectionLatencyMs,
          observationLatencyMs: latRec.observationLatencyMs,
          verificationLatencyMs: latRec.verificationLatencyMs,
          publicationLatencyMs: latRec.publicationLatencyMs,
          endToEndPublicationLatencyMs: latRec.endToEndPublicationLatencyMs,
        };
      }
    }

    // Source health context (from Phase 3B-M4)
    let sourceHealthContext: NewsroomDeskItem['sourceHealthContext'];
    if (rootObs?.sourceId) {
      const healthMap = await this.core.getRadarRepository().loadSourceHealth();
      const h: RadarSourceHealth | undefined = healthMap.get(rootObs.sourceId);
      if (h) {
        sourceHealthContext = {
          status: h.status,
          scheduleState: h.scheduleState,
          consecutiveFailures: h.consecutiveFailures || 0,
          consecutiveEmptyRuns: h.consecutiveEmptyRuns || 0,
          silentFailureSuspected: Boolean(h.silentFailureSuspected),
          lastSuccessAt: h.lastSuccessAt,
        };
      }
    }

    const availableActions = userContext?.role
      ? this.getAvailableActionsForRole(userContext.role, sig)
      : [];

    const auditTrail = NewsroomAuditService.getAuditTrail({ signalId: sig.id });

    return {
      queueItemId: `q-sig-${sig.id}`,
      signalId: sig.id,
      clusterId: sig.clusterId,
      title: sig.title,
      summary: sig.summary,
      whyItMatters: sig.explanation.whyItMatters,
      canonicalUrl: latestObs?.canonicalUrl || latestObs?.endpointUrl,
      sourceId: latestObs?.sourceId,
      sourceName: latestObs?.sourceId,
      sourceAuthority: latestObs?.sourceTier || 't3',
      isPrimarySource: latestObs?.isPrimarySource || sig.primarySourceCount > 0,
      priority: sig.priority,
      beat: sig.keyEntities?.[0] || 'general',
      geographicScope: cluster?.geographicSpread || [],
      changeType,
      workflowState: sig.lifecycleState,
      assignedTo: sig.assignedTo,
      assignedAt: sig.assignedAt,
      confidence: sig.scores.confidence,
      evidenceStrength: sig.scores.evidenceStrength,
      uncertainty: sig.scores.uncertainty,
      observationCount: sig.observationCount,
      independentSourceCount: sig.independentSourceCount,
      primarySourceCount: sig.primarySourceCount,
      hasContradictions: sig.contradictionIds.length > 0,
      contradictionIds: sig.contradictionIds,
      relatedStoryId: sig.linkedStoryId,
      affectedStoryIds: (latestObs?.metadata?.affectedStories as string[]) || (sig.linkedStoryId ? [sig.linkedStoryId] : []),
      mutationContext,
      timestamps: {
        sourcePublishedAt: latestObs?.publicationTimestamp,
        firstSeenAt: latestObs?.ingestionTimestamp,
        firstDetectedAt: sig.firstDetectedAt,
        lastUpdatedAt: sig.lastUpdatedAt,
      },
      latencyContext,
      sourceHealthContext,
      requiredHumanAction: sig.explanation.recommendedAction,
      availableActions,
      version: sig.version,
      auditTrail,
    };
  }

  /**
   * Returns filtered, paginated desk items with queue section breakdowns.
   */
  public async getDeskItems(
    filters?: NewsroomDeskFilter,
    userContext?: { id: string; role: IntelRole }
  ): Promise<NewsroomDeskResponse> {
    if (userContext && userContext.role === 'guest') {
      throw new Error('Forbidden: Guest role does not have desk read privileges.');
    }

    await this.core.ensureLoaded();

    let signals = this.core.getSignals(
      userContext ? { id: userContext.id, role: userContext.role } : undefined
    );

    // Filter signals deterministically (excluding section first so we can count correctly)
    if (filters?.priority) {
      signals = signals.filter((s) => s.priority === filters.priority);
    }

    if (filters?.workflowState) {
      signals = signals.filter((s) => s.lifecycleState === filters.workflowState);
    }

    if (filters?.assignedTo) {
      signals = signals.filter((s) => s.assignedTo === filters.assignedTo);
    }

    if (filters?.hasContradictions !== undefined) {
      signals = signals.filter((s) =>
        filters.hasContradictions ? s.contradictionIds.length > 0 : s.contradictionIds.length === 0
      );
    }

    if (filters?.needsVerification) {
      signals = signals.filter(
        (s) =>
          s.scores.uncertainty >= 60 ||
          s.scores.evidenceStrength < 35 ||
          s.lifecycleState === 'monitoring'
      );
    }

    if (filters?.beat) {
      signals = signals.filter(
        (s) =>
          s.keyEntities.includes(filters.beat!) ||
          s.title.toLowerCase().includes(filters.beat!.toLowerCase())
      );
    }

    if (filters?.geography) {
      signals = signals.filter((s) => {
        const cluster = this.core.getCluster(s.clusterId);
        return cluster?.geographicSpread.includes(filters.geography!);
      });
    }

    if (filters?.sourceId) {
      signals = signals.filter((s) => {
        const cluster = this.core.getCluster(s.clusterId);
        const obs = cluster?.observationIds.map((id) => this.core.getObservation(id)).filter(Boolean);
        return obs?.some((o) => o?.sourceId === filters.sourceId);
      });
    }

    if (filters?.changeType) {
      signals = signals.filter((s) => {
        const cluster = this.core.getCluster(s.clusterId);
        const observations = cluster
          ? cluster.observationIds.map((id) => this.core.getObservation(id)).filter(Boolean)
          : [];
        const rootObs = observations[0];
        const latestObs = observations[observations.length - 1] || rootObs;
        let cType: 'new' | 'changed' | 'unchanged' = 'new';
        if (latestObs?.metadata?.isMutation) {
          cType = 'changed';
        } else if (latestObs?.duplicateState === 'exact_duplicate') {
          cType = 'unchanged';
        }
        return cType === filters.changeType;
      });
    }

    if (filters?.since) {
      const sinceTime = new Date(filters.since).getTime();
      signals = signals.filter((s) => new Date(s.lastUpdatedAt).getTime() >= sinceTime);
    }

    if (filters?.until) {
      const untilTime = new Date(filters.until).getTime();
      signals = signals.filter((s) => new Date(s.lastUpdatedAt).getTime() <= untilTime);
    }

    // Compute queue section counts AFTER filters but BEFORE section filter
    const queue = NewsroomQueueService.buildQueue(signals, this.core.getCoverageGaps());
    const sections: Record<QueueSection, number> = {
      BREAKING_P0: queue.BREAKING_P0.length,
      P1_IMPORTANT: queue.P1_IMPORTANT.length,
      DEVELOPING: queue.DEVELOPING.length,
      NEEDS_VERIFICATION: queue.NEEDS_VERIFICATION.length,
      CONTRADICTIONS: queue.CONTRADICTIONS.length,
      COVERAGE_GAPS: queue.COVERAGE_GAPS.length,
      RESOLVED: queue.RESOLVED.length,
    };

    if (filters?.section) {
      const targetIds = new Set(queue[filters.section].map((item) => item.signalId));
      signals = signals.filter((s) => targetIds.has(s.id));
    }

    if (filters?.since) {
      const sinceTime = new Date(filters.since).getTime();
      signals = signals.filter((s) => new Date(s.lastUpdatedAt).getTime() >= sinceTime);
    }

    if (filters?.until) {
      const untilTime = new Date(filters.until).getTime();
      signals = signals.filter((s) => new Date(s.lastUpdatedAt).getTime() <= untilTime);
    }

    const total = signals.length;
    const offset = Math.max(0, filters?.offset || 0);
    const limit = Math.max(1, Math.min(100, filters?.limit || 25));
    const paginated = signals.slice(offset, offset + limit);

    const items = await Promise.all(
      paginated.map((sig) => this.buildDeskItem(sig, userContext))
    );

    return {
      total,
      items,
      limit,
      offset,
      sections,
    };
  }

  /**
   * Fetches a single desk item with full context.
   */
  public async getDeskItem(
    signalId: string,
    userContext?: { id: string; role: IntelRole }
  ): Promise<NewsroomDeskItem | null> {
    if (userContext && userContext.role === 'guest') {
      throw new Error('Forbidden: Guest role does not have desk read privileges.');
    }

    await this.core.ensureLoaded();
    const sig = this.core.getSignal(
      signalId,
      userContext ? { id: userContext.id, role: userContext.role } : undefined
    );

    if (!sig) return null;
    return this.buildDeskItem(sig, userContext);
  }

  /**
   * Executes a human triage action through the desk layer with optimistic locking and RBAC.
   */
  public async executeTriageAction(
    payload: NewsroomDeskActionInput,
    userContext: { id: string; role: IntelRole; name?: string }
  ): Promise<{ success: boolean; item: NewsroomDeskItem }> {
    if (userContext.role === 'guest') {
      throw new Error('Forbidden: Guest role cannot execute desk triage actions.');
    }

    await this.core.ensureLoaded();
    const signal = this.core.getSignal(payload.signalId);
    if (!signal) {
      throw new Error(`Signal not found: ${payload.signalId}`);
    }

    // Role-action compatibility check
    const allowed = this.getAvailableActionsForRole(userContext.role, signal);
    if (!allowed.includes(payload.action)) {
      throw new Error(
        `Action ${payload.action} not permitted for role ${userContext.role} on signal in state ${signal.lifecycleState}.`
      );
    }

    // Idempotency: If mutationId already exists in audit log for this signal, return current state
    if (payload.mutationId) {
      const pastAudits = NewsroomAuditService.getAuditTrail({ signalId: signal.id });
      const duplicate = pastAudits.find(
        (a) => (a.metadata as any)?.mutationId === payload.mutationId
      );
      if (duplicate) {
        const item = await this.buildDeskItem(signal, userContext);
        return { success: true, item };
      }
    }

    // Execute via core workflow service with atomic database persistence
    const updated = await this.core.executeActionAsync(
      {
        ...payload,
        actorId: userContext.id,
        actorName: userContext.name || userContext.role,
      },
      userContext.role
    );

    if (!updated) {
      throw new Error(`Failed to apply action ${payload.action} to signal ${payload.signalId}.`);
    }

    const item = await this.buildDeskItem(updated, userContext);
    return { success: true, item };
  }

  /**
   * Returns aggregate desk summary for newsroom mission control.
   */
  public async getDeskSummary(userContext?: { id: string; role: IntelRole }): Promise<NewsroomDeskSummary> {
    if (userContext && userContext.role === 'guest') {
      throw new Error('Forbidden: Guest role does not have desk summary privileges.');
    }

    await this.core.ensureLoaded();
    const signals = this.core.getSignals(
      userContext ? { id: userContext.id, role: userContext.role } : undefined
    );
    const queue = NewsroomQueueService.buildQueue(signals, this.core.getCoverageGaps());
    const activeAlerts = this.core.getAlerts(true);

    const healthMap = await this.core.getRadarRepository().loadSourceHealth();
    const failingCount = Array.from(healthMap.values()).filter(
      (h) => h.status === 'failing' || h.silentFailureSuspected
    ).length;

    return {
      totalSignals: signals.length,
      breakingP0Count: queue.BREAKING_P0.length,
      importantP1Count: queue.P1_IMPORTANT.length,
      needsVerificationCount: queue.NEEDS_VERIFICATION.length,
      contradictionsCount: queue.CONTRADICTIONS.length,
      coverageGapsCount: queue.COVERAGE_GAPS.length,
      resolvedCount: queue.RESOLVED.length,
      activeAlertsCount: activeAlerts.length,
      failingSourcesCount: failingCount,
      persistenceStatus: this.core.getPersistenceStatus(),
      isDegradedReadOnly: this.core.isDegradedReadOnly(),
    };
  }

}

export const newsroomDeskService = new NewsroomDeskService();

