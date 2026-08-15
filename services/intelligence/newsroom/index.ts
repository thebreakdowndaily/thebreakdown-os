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
import { NewsroomPersistedState, NewsroomStateRepository } from './persistence/state';
import { createNewsroomStateRepository } from './persistence';
import { computeNewsroomScorecard } from './scorecard-service';
import { loadNewsroomScorecardBaseline } from '@/lib/intelligence/newsroom-scorecard-baseline';

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

export class NewsroomIntelligenceCore {
  private static instance: NewsroomIntelligenceCore | null = null;

  private readonly persistence: NewsroomStateRepository;

  private clusters: Map<string, StoryCluster> = new Map();
  private observations: Map<string, NewsroomObservation> = new Map();
  private claims: Map<string, NewsroomExtractedClaim> = new Map();
  private signals: Map<string, NewsroomSignal> = new Map();
  private gaps: Map<string, CoverageGap> = new Map();

  private alertEngine = new AlertEngine();
  private workflowService = new NewsroomWorkflowService();

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
          if (this.persistence.kind === 'supabase') {
            throw new Error('Supabase state load returned empty, possible configuration or table error.');
          }
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

  /** Builds and persists the current authoritative snapshot. */
  public persist(): void {
    const state: NewsroomPersistedState = {
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

    const res = this.persistence.save(state);
    if (res instanceof Promise) {
      res.catch((err: unknown) => {
        console.error('[NewsroomIntelligenceCore] Async persist failed:', err);
      });
    }
  }

  // ── Ingestion & Clustering ──────────────────────────────────────────────────

  public ingestObservation(obs: NewsroomObservation): void {
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

    this.persist();
    return { signal, alert };
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

  public executeAction(payload: NewsroomActionPayload, userRole?: string): NewsroomSignal | null {
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

    const updated = this.workflowService.applyAction(signal, payload);
    this.signals.set(updated.id, updated);
    this.persist();
    return updated;
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
