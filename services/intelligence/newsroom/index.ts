/**
 * ─── Newsroom Intelligence Core Facade ───────────────────────────────────────
 *
 * Operational layer coordination facade:
 * OBSERVATION → CLAIM → STORY CLUSTER → SIGNAL → PRIORITY → ALERT → QUEUE → WORKFLOW
 *
 * Governing document: NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §21
 * (Persistence & Durability). Authoritative state is a versioned snapshot
 * persisted after every mutation and restored on construction, so worker
 * restarts yield zero state loss.
 */

import {
  StoryCluster,
  NewsroomObservation,
  NewsroomExtractedClaim,
  NewsroomSignal,
  IntelligenceAlert,
  CoverageGap,
  NewsroomOperationalMetrics,
  NewsroomActionPayload,
  EditorialJudgement,
} from '@/types/newsroom-intelligence';
import { SignalEngine } from './signal-engine';
import { AlertEngine } from './alert-engine';
import { NewsroomQueueService } from './queue-service';
import { NewsroomWorkflowService } from './workflow-service';
import { CoverageGapEngine, MonitoredTopicExpectation } from './coverage-gap-engine';
import { EditorialCalibrationService } from './calibration-service';
import { beatRoutingService } from './beat-routing-service';
import { NewsroomAuditService } from './audit-service';
import {
  NewsroomPersistedState,
  NewsroomStateRepository,
  NewsroomPersistenceError,
} from './persistence/state';
import { createNewsroomStateRepository } from './persistence';

import { computeNewsroomScorecard } from './scorecard-service';
import { loadNewsroomScorecardBaseline } from '@/lib/intelligence/newsroom-scorecard-baseline';
import type { RadarLatencyRecord } from '@/services/radar/types';
import type { RadarPersistenceRepository } from '@/services/radar/persistence/types';
import { createRadarPersistenceRepository } from '@/services/radar/persistence';
import { recordEditorialVerification, recordStoryPublication } from '@/services/radar/latency-tracker';

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function medianOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return Math.round(sorted[mid]);
}

export class VerificationPreconditionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerificationPreconditionError';
  }
}

export class NewsroomIntelligenceCore {
  private static instance: NewsroomIntelligenceCore | null = null;

  private readonly persistence: NewsroomStateRepository;
  private evidenceVault?: import('../evidence-vault.service').EvidenceVaultService;

  public setEvidenceVault(vault: import('../evidence-vault.service').EvidenceVaultService): void {
    this.evidenceVault = vault;
  }

  public getEvidenceVault(): import('../evidence-vault.service').EvidenceVaultService | undefined {
    return this.evidenceVault;
  }

  /**
   * Optional News Intelligence → Research bridge. When set, every evaluated
   * signal is offered to the bridge; the bridge applies its own researchTrigger
   * gate, so most signals never create research projects. Absent by default —
   * the newsroom core behaves exactly as before.
   *
   * Governing document: docs/research/source-governance.md
   */
  private researchBridge: ((signal: NewsroomSignal) => void | Promise<void>) | null = null;

  private clusters: Map<string, StoryCluster> = new Map();
  private observations: Map<string, NewsroomObservation> = new Map();
  private claims: Map<string, NewsroomExtractedClaim> = new Map();
  private signals: Map<string, NewsroomSignal> = new Map();
  private gaps: Map<string, CoverageGap> = new Map();

  private alertEngine = new AlertEngine();
  private workflowService = new NewsroomWorkflowService();
  private radarRepository: RadarPersistenceRepository | null = null;

  public setRadarRepository(repo: RadarPersistenceRepository): void {
    this.radarRepository = repo;
  }

  public getRadarRepository(): RadarPersistenceRepository {
    if (!this.radarRepository) {
      this.radarRepository = createRadarPersistenceRepository();
    }
    return this.radarRepository;
  }

  private constructor(repository?: NewsroomStateRepository) {
    this.persistence = repository ?? createNewsroomStateRepository();
    this.restoreFromPersistence();
  }

  public static getInstance(repository?: NewsroomStateRepository): NewsroomIntelligenceCore {
    if (!NewsroomIntelligenceCore.instance) {
      NewsroomIntelligenceCore.instance = new NewsroomIntelligenceCore(repository);
    }
    return NewsroomIntelligenceCore.instance;
  }

  /** Test hook: replace the singleton with a fresh instance over a repository. */
  public static resetInstance(repository?: NewsroomStateRepository): NewsroomIntelligenceCore {
    NewsroomIntelligenceCore.instance = new NewsroomIntelligenceCore(repository);
    return NewsroomIntelligenceCore.instance;
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  public async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const state = await this.persistence.load();
        if (state) {
          this.observations.clear();
          for (const o of state.observations) this.observations.set(o.id, o);
          this.claims.clear();
          for (const c of state.claims) this.claims.set(c.id, c);
          this.clusters.clear();
          for (const c of state.clusters) this.clusters.set(c.id, c);
          this.signals.clear();
          for (const s of state.signals) this.signals.set(s.id, s);
          this.gaps.clear();
          for (const g of state.gaps) this.gaps.set(g.id, g);

          this.alertEngine.restore(state.alerts, state.engine);
          beatRoutingService.restore({
            beats: state.beats,
            recipients: state.recipients,
            authorization: state.authorization,
            escalations: state.escalations,
            fatigue: state.fatigue,
          });
          this.workflowService.restoreReputations(state.sourceReputations);
          NewsroomAuditService.restoreAll(state.audit);

          this.isLoaded = true;
        } else {
          this.isLoaded = true;
        }
      } catch (err) {
        this.loadPromise = null;
        console.error('[NewsroomIntelligenceCore] Critical state load failure:', err);
        throw new Error(`Newsroom state unavailable: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();

    return this.loadPromise;
  }

  private restoreFromPersistence(): void {
    const state = this.persistence.load();
    if (!state || state instanceof Promise) return;

    this.observations.clear();
    for (const o of state.observations) this.observations.set(o.id, o);
    this.claims.clear();
    for (const c of state.claims) this.claims.set(c.id, c);
    this.clusters.clear();
    for (const c of state.clusters) this.clusters.set(c.id, c);
    this.signals.clear();
    for (const s of state.signals) this.signals.set(s.id, s);
    this.gaps.clear();
    for (const g of state.gaps) this.gaps.set(g.id, g);

    this.alertEngine.restore(state.alerts, state.engine);
    beatRoutingService.restore({
      beats: state.beats,
      recipients: state.recipients,
      authorization: state.authorization,
      escalations: state.escalations,
      fatigue: state.fatigue,
    });
    this.workflowService.restoreReputations(state.sourceReputations);
    NewsroomAuditService.restoreAll(state.audit);
    this.isLoaded = true;
  }

  public isDegradedReadOnly(): boolean {
    return Boolean(this.persistence.isDegradedReadOnly);
  }

  public getPersistenceStatus(): 'authoritative' | 'degraded_readonly' {
    return this.persistence.isDegradedReadOnly ? 'degraded_readonly' : 'authoritative';
  }

  public buildPersistedState(): NewsroomPersistedState {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      observations: Array.from(this.observations.values()),
      claims: Array.from(this.claims.values()),
      clusters: Array.from(this.clusters.values()),
      signals: Array.from(this.signals.values()),
      gaps: Array.from(this.gaps.values()),
      alerts: this.alertEngine.snapshotAlerts(),
      audit: Array.from(NewsroomAuditService.getAllRecords()),
      beats: beatRoutingService.snapshot().beats,
      recipients: beatRoutingService.snapshot().recipients,
      authorization: beatRoutingService.snapshot().authorization,
      escalations: beatRoutingService.snapshot().escalations,
      fatigue: beatRoutingService.snapshot().fatigue,
      sourceReputations: this.workflowService.snapshotReputations(),
      engine: this.alertEngine.snapshotEngine(),
    };
  }

  /**
   * Asynchronously commits the current authoritative snapshot to persistence.
   * Throws if persistence fails or if the repository is in read-only degraded mode.
   */
  public async persistAsync(): Promise<void> {
    const state = this.buildPersistedState();
    const res = this.persistence.save(state);
    if (res instanceof Promise) {
      await res;
    }
  }

  /** Builds and persists the current authoritative snapshot (best-effort async). */
  public persist(): void {
    const state = this.buildPersistedState();
    const res = this.persistence.save(state);
    if (res instanceof Promise) {
      res.catch((err: unknown) => {
        console.error('[NewsroomIntelligenceCore] Async persist failed:', err);
      });
    }
  }


  // ── Ingestion & Clustering ──────────────────────────────────────────────────

  public ingestObservation(obs: NewsroomObservation): void {
    if (this.observations.has(obs.id)) {
      return;
    }

    // 1. Natural key matching (canonicalUrl or sourceId + externalId)
    const matchingUrl = obs.canonicalUrl
      ? Array.from(this.observations.values()).filter((e) => e.canonicalUrl === obs.canonicalUrl)
      : [];
    const matchingExt = (obs.externalId && obs.sourceId)
      ? Array.from(this.observations.values()).filter(
          (e) => e.sourceId === obs.sourceId && e.externalId === obs.externalId
        )
      : [];

    const priorMatches = matchingUrl.length > 0 ? matchingUrl : matchingExt;

    if (priorMatches.length > 0) {
      // Check if this exact content version was already ingested (idempotent / duplicate fetch)
      const exactVersionAlreadyIngested = priorMatches.some(
        (e) =>
          (obs.contentHash && e.contentHash === obs.contentHash) ||
          (!obs.contentHash && !e.contentHash)
      );

      if (exactVersionAlreadyIngested) {
        // CASE A: Same URL/key + same fingerprint => unchanged / deduplicated
        return;
      }

      // CASE B/C/D/E/G: Same URL/key + changed fingerprint => MATERIAL MUTATION!
      // Identify the immediate prior version (latest retrieval)
      const sortedPrior = [...priorMatches].sort(
        (a, b) =>
          new Date(b.ingestionTimestamp).getTime() - new Date(a.ingestionTimestamp).getTime()
      );
      const immediatePrior = sortedPrior[0];

      const priorRev = (immediatePrior.metadata?.revisionNumber as number) || 1;
      const revisionNumber = priorRev + 1;

      // Link to prior state without destructive overwrite
      obs.duplicateOfId = immediatePrior.id;
      obs.duplicateState = 'unique';
      obs.metadata = {
        ...obs.metadata,
        isMutation: true,
        previousObservationId: immediatePrior.id,
        previousContentHash: immediatePrior.contentHash,
        newContentHash: obs.contentHash,
        previousRetrievalTimestamp: immediatePrior.ingestionTimestamp,
        newRetrievalTimestamp: obs.ingestionTimestamp,
        revisionNumber,
        mutationId: obs.metadata?.mutationId || `mut-${obs.id}`,
      };

      this.observations.set(obs.id, obs);
      this.persist();
      return;
    }

    // 2. Cross-URL identical content hash duplication (CASE F: Syndication)
    if (obs.contentHash) {
      for (const existing of this.observations.values()) {
        if (existing.contentHash === obs.contentHash) {
          // Exact content hash already exists elsewhere => syndicated / duplicate
          return;
        }
      }
    }

    this.observations.set(obs.id, obs);
    this.persist();
  }

  public registerClaim(claim: NewsroomExtractedClaim): void {
    this.claims.set(claim.id, claim);
    this.persist();
  }

  public upsertCluster(cluster: StoryCluster): {
    signal: NewsroomSignal;
    alert: IntelligenceAlert | null;
  } {
    this.clusters.set(cluster.id, cluster);

    const allObs = Array.from(this.observations.values());
    const allClaims = Array.from(this.claims.values());
    const existingSignal = Array.from(this.signals.values()).find(
      (s) => s.clusterId === cluster.id
    );

    const { signal, contradictions } = SignalEngine.evaluateSignal(
      cluster,
      allObs,
      allClaims,
      existingSignal
    );

    this.signals.set(signal.id, signal);

    // Evaluate for alert
    const alert = this.alertEngine.evaluateSignalForAlert(
      signal,
      existingSignal,
      contradictions.length > 0
    );

    // Offer the signal to the research bridge (gated internally; fire-and-forget).
    if (this.researchBridge) {
      try {
        void this.researchBridge(signal);
      } catch (err) {
        console.error('[NewsroomIntelligenceCore] research bridge error:', err);
      }
    }

    this.persist();
    return { signal, alert };
  }

  // ── Research bridge (News Intelligence → RIE) ─────────────────────────────

  /** Registers (or clears) the gated News Intelligence → Research bridge. */
  public setResearchBridge(handler: ((signal: NewsroomSignal) => void | Promise<void>) | null): void {
    this.researchBridge = handler;
  }

  public getResearchBridge(): ((signal: NewsroomSignal) => void | Promise<void>) | null {
    return this.researchBridge;
  }

  // ── Queries & Queue ─────────────────────────────────────────────────────────

  public getSignals(userContext?: { id: string; role: string }): NewsroomSignal[] {
    const list = Array.from(this.signals.values()).sort(
      (a, b) =>
        new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
    );
    if (!userContext) return list;
    return list.filter((s) => beatRoutingService.checkUserAccess(userContext, s));
  }

  public getSignal(id: string, userContext?: { id: string; role: string }): NewsroomSignal | undefined {
    const signal = this.signals.get(id);
    if (!signal) return undefined;
    if (userContext && !beatRoutingService.checkUserAccess(userContext, signal)) {
      throw new Error('Access denied to unauthorized beat signal.');
    }
    return signal;
  }

  public getQueue(userContext?: { id: string; role: string }) {
    return NewsroomQueueService.buildQueue(
      this.getSignals(userContext),
      Array.from(this.gaps.values())
    );
  }

  public getAlerts(unacknowledgedOnly = false, userContext?: { id: string; role: string }): IntelligenceAlert[] {
    const list = this.alertEngine.getAlerts(unacknowledgedOnly);
    if (!userContext) return list;
    return list.filter((a) => {
      const sig = this.signals.get(a.signalId);
      if (!sig) return false;
      return beatRoutingService.checkUserAccess(userContext, sig);
    });
  }

  public acknowledgeAlert(alertId: string, actorId: string, userRole?: string): boolean {
    const alerts = this.getAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const signal = this.signals.get(alert.signalId);
    if (signal && userRole) {
      const hasAccess = beatRoutingService.checkUserAccess({ id: actorId, role: userRole }, signal);
      if (!hasAccess) {
        throw new Error('Access denied to acknowledge alert on unauthorized beat.');
      }
    }
    const acked = this.alertEngine.acknowledgeAlert(alertId, actorId);
    if (acked) this.persist();
    return acked;
  }

  public getCoverageGaps(): CoverageGap[] {
    return Array.from(this.gaps.values());
  }

  /**
   * Registers an externally detected coverage gap (e.g. a collection-side
   * source gap raised by the PIB ingestion adapter). Additive — extends the
   * existing gap surface consumed by the queue and Mission Control.
   *
   * Governing document: NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
   */
  public registerCoverageGap(gap: CoverageGap): void {
    this.gaps.set(gap.id, gap);
    this.persist();
  }

  /** Read accessor for ingestion deduplication (authoritative canonical state). */
  public getObservations(): NewsroomObservation[] {
    return Array.from(this.observations.values());
  }

  public getObservation(id: string): NewsroomObservation | undefined {
    return this.observations.get(id);
  }

  public getObservationsForUrl(url: string): NewsroomObservation[] {
    return Array.from(this.observations.values()).filter((o) => o.canonicalUrl === url);
  }

  public getClusters(): StoryCluster[] {
    return Array.from(this.clusters.values());
  }

  public getCluster(id: string): StoryCluster | undefined {
    return this.clusters.get(id);
  }

  public runCoverageGapCheck(expectations: MonitoredTopicExpectation[]): CoverageGap[] {
    const detected = CoverageGapEngine.detectCoverageGaps(
      Array.from(this.clusters.values()),
      Array.from(this.observations.values()),
      expectations
    );
    for (const g of detected) {
      this.gaps.set(g.id, g);
    }
    if (detected.length > 0) this.persist();
    return detected;
  }

  public applyAction(payload: NewsroomActionPayload, userRole?: string): NewsroomSignal | null {
    return this.executeAction(payload, userRole);
  }

  /**
   * Asynchronously executes an editorial action with full transactional durability:
   * 1. Validates preconditions (RBAC, evidence vault archives).
   * 2. Snapshots previous signal state and audit count.
   * 3. Applies the mutation in memory.
   * 4. Awaits authoritative database commit via persistAsync().
   * 5. If persistence fails: rolls back the in-memory signal, rolls back the audit log,
   *    does NOT advance signal version, and rethrows NewsroomPersistenceError.
   * 6. If persistence succeeds: triggers research bridge & latency metrics and returns updated signal.
   */
  public async executeActionAsync(
    payload: NewsroomActionPayload,
    userRole?: string
  ): Promise<NewsroomSignal | null> {
    if (this.persistence.isDegradedReadOnly) {
      throw new NewsroomPersistenceError(
        'Database persistence unavailable: Newsroom is in read-only degraded mode. Editorial mutations cannot be committed.',
        'PERSISTENCE_DEGRADED_READONLY'
      );
    }

    const signal = this.signals.get(payload.signalId);
    if (!signal) return null;

    if (userRole) {
      const hasAccess = beatRoutingService.checkUserAccess(
        { id: payload.actorId, role: userRole },
        signal
      );
      if (!hasAccess) {
        throw new Error('Access denied to execute action on unauthorized beat.');
      }
    }

    // Phase 4B-2E: Evidence Provenance Verification Gate
    if (payload.action === 'VERIFY') {
      if (signal.clusterId) {
        const cluster = this.clusters.get(signal.clusterId);
        if (cluster && cluster.observationIds && cluster.observationIds.length > 0) {
          for (const obsId of cluster.observationIds) {
            const obs = this.observations.get(obsId);
            if (!obs) continue;
            if (!obs.archiveId || obs.archivalState === 'archive_failed' || obs.archivalState === 'corrupted') {
              throw new VerificationPreconditionError(
                `Cannot verify signal ${signal.id}: Observation ${obs.id} lacks a verified archive artifact.`
              );
            }
            if (this.evidenceVault) {
              void this.evidenceVault.lockRetention(obs.archiveId, {
                signalId: signal.id,
                verifierId: payload.actorId,
                reason: `Verified by editor ${payload.actorName || payload.actorId}`,
              }).catch((err) => {
                console.error('[NewsroomIntelligenceCore] failed to lock evidence retention:', err);
              });
            }
          }
        }
      }
    }

    // Snapshot state for atomic rollback if persistence fails
    const previousSignal = { ...signal };
    const auditCountBefore = NewsroomAuditService.getAllRecords().length;

    const updated = this.workflowService.applyAction(signal, payload);
    this.signals.set(updated.id, updated);

    // Commit to authoritative persistence before declaring success
    try {
      await this.persistAsync();
    } catch (persistErr) {
      // Transactional rollback: restore prior signal state and discard audit record
      this.signals.set(signal.id, previousSignal);
      NewsroomAuditService.rollbackTo(auditCountBefore);
      console.error('[NewsroomIntelligenceCore] Action persistence failed, rolled back in-memory mutation:', persistErr);
      throw persistErr;
    }

    // If human editor explicitly promoted signal to research, trigger the bridge
    if (payload.action === 'PROMOTE_TO_RESEARCH' && this.researchBridge) {
      try {
        void this.researchBridge(updated);
      } catch (err) {
        console.error('[NewsroomIntelligenceCore] research bridge promotion error:', err);
      }
    }

    // Bridge human verification into radar latency measurement
    if ((payload.action === 'VERIFY' || payload.action === 'REVIEW') && signal.clusterId) {
      const isHuman = userRole ? userRole !== 'system' && userRole !== 'crawler' : true;
      void this.recordVerification(
        signal.clusterId,
        { id: payload.actorId, role: userRole || 'editor', isHuman },
        new Date().toISOString()
      ).catch((err) => {
        console.error('[NewsroomIntelligenceCore] failed to record verification latency:', err);
      });
    }

    return updated;
  }

  public executeAction(payload: NewsroomActionPayload, userRole?: string): NewsroomSignal | null {
    if (this.persistence.isDegradedReadOnly) {
      throw new NewsroomPersistenceError(
        'Database persistence unavailable: Newsroom is in read-only degraded mode. Editorial mutations cannot be committed.',
        'PERSISTENCE_DEGRADED_READONLY'
      );
    }

    const signal = this.signals.get(payload.signalId);
    if (!signal) return null;

    if (userRole) {
      const hasAccess = beatRoutingService.checkUserAccess(
        { id: payload.actorId, role: userRole },
        signal
      );
      if (!hasAccess) {
        throw new Error('Access denied to execute action on unauthorized beat.');
      }
    }

    // Phase 4B-2E: Evidence Provenance Verification Gate
    if (payload.action === 'VERIFY') {
      if (signal.clusterId) {
        const cluster = this.clusters.get(signal.clusterId);
        if (cluster && cluster.observationIds && cluster.observationIds.length > 0) {
          for (const obsId of cluster.observationIds) {
            const obs = this.observations.get(obsId);
            if (!obs) continue;
            if (!obs.archiveId || obs.archivalState === 'archive_failed' || obs.archivalState === 'corrupted') {
              throw new VerificationPreconditionError(
                `Cannot verify signal ${signal.id}: Observation ${obs.id} lacks a verified archive artifact.`
              );
            }
            if (this.evidenceVault) {
              void this.evidenceVault.lockRetention(obs.archiveId, {
                signalId: signal.id,
                verifierId: payload.actorId,
                reason: `Verified by editor ${payload.actorName || payload.actorId}`,
              }).catch((err) => {
                console.error('[NewsroomIntelligenceCore] failed to lock evidence retention:', err);
              });
            }
          }
        }
      }
    }

    const updated = this.workflowService.applyAction(signal, payload);
    this.signals.set(updated.id, updated);

    // If human editor explicitly promoted signal to research, trigger the bridge
    if (payload.action === 'PROMOTE_TO_RESEARCH' && this.researchBridge) {
      try {
        void this.researchBridge(updated);
      } catch (err) {
        console.error('[NewsroomIntelligenceCore] research bridge promotion error:', err);
      }
    }

    // Bridge human verification into radar latency measurement
    if ((payload.action === 'VERIFY' || payload.action === 'REVIEW') && signal.clusterId) {
      const isHuman = userRole ? userRole !== 'system' && userRole !== 'crawler' : true;
      void this.recordVerification(
        signal.clusterId,
        { id: payload.actorId, role: userRole || 'editor', isHuman },
        new Date().toISOString()
      ).catch((err) => {
        console.error('[NewsroomIntelligenceCore] failed to record verification latency:', err);
      });
    }

    this.persist();
    return updated;
  }


  // ── End-to-End Latency Instrumentation ──────────────────────────────────────

  public async getLatencyRecord(clusterId: string): Promise<RadarLatencyRecord | null> {
    return this.getRadarRepository().getLatencyRecord(clusterId);
  }

  public async getLatencyRecords(): Promise<RadarLatencyRecord[]> {
    return this.getRadarRepository().getLatencyRecords();
  }

  public async recordVerification(
    clusterId: string,
    actor: { id: string; role: string; isHuman?: boolean },
    verifiedAt?: string
  ): Promise<RadarLatencyRecord | null> {
    return recordEditorialVerification(this.getRadarRepository(), {
      clusterId,
      actor,
      verifiedAt,
      verificationStatus: 'verified',
    });
  }

  public async recordPublication(
    clusterId: string,
    publishedAt?: string,
    storyStatus: string = 'published'
  ): Promise<RadarLatencyRecord | null> {
    return recordStoryPublication(this.getRadarRepository(), {
      clusterId,
      publishedAt,
      storyStatus,
    });
  }

  public getSourceReputations() {
    return this.workflowService.getSourceReputations();
  }

  public registerSource(source: { id: string; name: string; tier: 't1' | 't2' | 't3' | 't4' | 't5' }) {
    const rep = this.workflowService.registerSourceReputation(source);
    this.persist();
    return rep;
  }

  public recordSourceFeedback(
    sourceId: string,
    outcome: 'confirmed' | 'contradicted' | 'false_alarm' | 'correction'
  ) {
    const rep = this.workflowService.recordSourceFeedback(sourceId, outcome);
    if (rep) this.persist();
    return rep;
  }

  public setShadowMode(active: boolean) {
    this.alertEngine.setShadowMode(active);
    this.persist();
  }

  public isShadowMode() {
    return this.alertEngine.isShadowMode();
  }

  public activatePhase1InternalAlerting(authorized: boolean): boolean {
    const activated = this.alertEngine.activatePhase1InternalAlerting(authorized);
    if (activated) this.persist();
    return activated;
  }

  public engageKillSwitch(): void {
    this.alertEngine.engageKillSwitch();
    this.persist();
  }

  public isPhase1Active(): boolean {
    return this.alertEngine.isPhase1Active();
  }

  // ── Metrics ─────────────────────────────────────────────────────────────────

  public getMetrics(): NewsroomOperationalMetrics {
    const signals = this.getSignals();
    const alerts = this.getAlerts();
    const unacked = alerts.filter((a) => !a.acknowledged);
    const nowMs = Date.now();

    const p0 = signals.filter((s) => s.priority === 'P0').length;
    const p1 = signals.filter((s) => s.priority === 'P1').length;
    const p2 = signals.filter((s) => s.priority === 'P2').length;
    const p3 = signals.filter((s) => s.priority === 'P3').length;

    const contradictionsCount = signals.filter(
      (s) => s.contradictionIds.length > 0
    ).length;

    // ── Real telemetry, computed from canonical state timestamps ─────────────
    const observations = Array.from(this.observations.values());
    const clusters = Array.from(this.clusters.values());

    const observationsPerMinute = observations.filter(
      (o) => nowMs - Date.parse(o.ingestionTimestamp) < MINUTE_MS
    ).length;

    const newClustersPerHour = clusters.filter(
      (c) => nowMs - Date.parse(c.firstDetectedAt) < HOUR_MS
    ).length;

    const signalsPerHour = signals.filter(
      (s) => nowMs - Date.parse(s.firstDetectedAt) < HOUR_MS
    ).length;

    const clusterBySignal = new Map<string, StoryCluster>();
    for (const c of clusters) clusterBySignal.set(c.id, c);

    const timeToSignalValues = signals
      .map((s) => {
        const cluster = clusterBySignal.get(s.clusterId);
        if (!cluster) return null;
        return Date.parse(s.firstDetectedAt) - Date.parse(cluster.firstDetectedAt);
      })
      .filter((v): v is number => v !== null && v >= 0);

    const timeToAlertValues = alerts
      .map((a) => {
        const sig = this.signals.get(a.signalId);
        if (!sig) return null;
        return Date.parse(a.triggeredAt) - Date.parse(sig.firstDetectedAt);
      })
      .filter((v): v is number => v !== null && v >= 0);

    const reputations = this.workflowService.getSourceReputations();
    const evaluated = reputations.filter((r) => r.totalObservationsIngested > 0 || r.confirmedClaimsCount > 0 || r.falseAlarmCount > 0 || r.contradictedClaimsCount > 0);
    const avgConfirmationRate =
      evaluated.length > 0
        ? Math.round((evaluated.reduce((sum, r) => sum + r.confirmationRate, 0) / evaluated.length) * 100) / 100
        : 0;
    const avgFalseAlarmRate =
      evaluated.length > 0
        ? Math.round((evaluated.reduce((sum, r) => sum + r.falseAlarmRate, 0) / evaluated.length) * 100) / 100
        : 0;

    return {
      observationsPerMinute,
      newClustersPerHour,
      signalsPerHour,
      p0Count: p0,
      p1Count: p1,
      p2Count: p2,
      p3Count: p3,
      alertVolume: alerts.length,
      unacknowledgedAlerts: unacked.length,
      medianTimeToSignalMs: medianOf(timeToSignalValues),
      medianTimeToAlertMs: medianOf(timeToAlertValues),
      primarySourceConfirmationRate: avgConfirmationRate,
      contradictionRate:
        signals.length > 0
          ? Math.round((contradictionsCount / signals.length) * 100) / 100
          : 0,
      falseAlertRate: avgFalseAlarmRate,
      queueBacklog: signals.filter((s) => s.lifecycleState !== 'resolved').length,
      verificationBacklog: signals.filter(
        (s) => s.scores.uncertainty >= 60 || s.scores.evidenceStrength < 40
      ).length,
      shadowModeActive: this.isShadowMode(),
      generatedAt: new Date().toISOString(),
      phase2Authorized: beatRoutingService.isPhase2Active(),
      phase2Active: this.alertEngine.isPhase2Active(),
    };
  }

  public recordCalibrationJudgement(
    signalId: string,
    judgement: EditorialJudgement,
    reviewerId: string,
    domain?: string,
    notes?: string
  ) {
    const signal = this.signals.get(signalId);
    if (!signal) return null;
    return EditorialCalibrationService.recordJudgement(signal, judgement, reviewerId, domain, notes);
  }

  public getCalibrationMetrics() {
    const alerts = this.getAlerts();
    const gaps = this.getCoverageGaps();
    return EditorialCalibrationService.computeMetrics(
      alerts.length,
      0,
      alerts.filter((a) => !a.acknowledged).length,
      gaps.length,
      gaps.length
    );
  }

  /**
   * Live operational scorecard for the observation period. Pure projection
   * over canonical state + the frozen v1.2 baseline reference — no mutation.
   *
   * Governing document: NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
   * (Baseline 1.2 freeze + observation-mode section).
   */
  public getScorecard() {
    return computeNewsroomScorecard({
      observations: Array.from(this.observations.values()),
      clusters: Array.from(this.clusters.values()),
      signals: Array.from(this.signals.values()),
      alerts: this.getAlerts(),
      gaps: Array.from(this.gaps.values()),
      audit: NewsroomAuditService.getAllRecords(),
      baseline: loadNewsroomScorecardBaseline(),
    });
  }

  public clear(): void {
    this.clusters.clear();
    this.observations.clear();
    this.claims.clear();
    this.signals.clear();
    this.gaps.clear();
    this.alertEngine.clear();
    EditorialCalibrationService.clear();
    beatRoutingService.clear();
  }
}

export const newsroomIntelligenceCore = NewsroomIntelligenceCore.getInstance();

export { NewsroomPersistenceError } from './persistence/state';
export { NewsroomDeskService, newsroomDeskService } from './desk-service';
export type {
  NewsroomDeskItem,
  NewsroomDeskFilter,
  NewsroomDeskResponse,
  NewsroomDeskSummary,
  NewsroomDeskActionInput,
} from './desk-service';

