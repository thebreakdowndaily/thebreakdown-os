/**
 * ─── News Radar Pipeline Orchestrator (Phase 2 Operational sensing) ───────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 *
 * Continuous sensing loop:
 *   Scheduled Polling Endpoint (/api/v2/radar/poll)
 *     ↓ (Acquire Distributed Lock: radar:poll:global)
 *   Source Scheduler (Filter DUE sources based on interval & exponential backoff)
 *     ↓ (Universal Collectors: RSS/HTML/JSON with SSRF & stream guards)
 *   Raw Artifacts
 *     ↓ (Persistent Change Detection Engine: content fingerprints)
 *   Changed / New Artifacts
 *     ↓ (Entity + Geo Multilingual Resolution)
 *   NewsroomObservation (Deduplicated ingestion)
 *     ↓ (NewsroomIntelligenceCore: cluster, signal scoring, alert, queue)
 *   Persistence (Health, fingerprints, latency, pipeline run log)
 *     ↓ (Release Distributed Lock)
 *   Radar Operational Telemetry Response
 */

import type {
  RadarSourceDefinition,
  RadarPipelineMetrics,
  RawArtifact,
  RadarLatencyRecord,
  RadarPipelineRunRecord,
} from './types';
import type {
  NewsroomObservation,
  StoryCluster,
} from '@/types/newsroom-intelligence';
import { newsroomIntelligenceCore, NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { ChangeDetectionEngine, resolveDocumentChangeState, detectDocumentMutationMarkers } from './change-detection';
import type { EditorialTask } from '@/types/canonical';
import { RadarSourceHealthMonitor } from './source-health';
import { SourceScheduler } from './source-scheduler';
import { RssCollector } from './collectors/rss';
import { HtmlCollector } from './collectors/html';
import { PdfCollector } from './collectors/pdf';
import { BrowserCollector } from './collectors/browser';
import { evaluateClusterCorroboration } from './corroboration';
import { resolveLocation, getGeoHierarchy } from '@/data/radar/geo-india';
import { resolveEntities } from './entity-resolution';
import type { RadarCollector } from './collectors/interface';
import type { RadarPersistenceRepository } from './persistence/types';
import { createRadarPersistenceRepository } from './persistence';
import { createHash } from 'node:crypto';
import { ChangeDetector } from '@/services/lifecycle/change-detector/ChangeDetector';
import { ImpactAnalyzer } from '@/services/lifecycle/impact-analyzer/ImpactAnalyzer';
import { globalEditorialQueue } from '@/services/lifecycle/queue/EditorialQueue';
import { AlertDispatcher, createAlertDispatcher, globalAlertDispatcher } from '@/services/notifications';
import { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import type { NormalizedDocument } from '@/services/lifecycle/providers/SourceProvider';

export interface RadarPipelineOptions {
  repository?: RadarPersistenceRepository;
  customCore?: NewsroomIntelligenceCore;
  alertDispatcher?: AlertDispatcher;
  evidenceVault?: EvidenceVaultService;
  forceAllSources?: boolean; // Override scheduler (e.g. for testing)
  lockTtlMs?: number;        // Default 120,000ms (2 minutes)
}

export class RadarPipeline {
  private changeDetection: ChangeDetectionEngine;
  private healthMonitor: RadarSourceHealthMonitor;
  private rssCollector = new RssCollector();
  private htmlCollector = new HtmlCollector();
  private pdfCollector = new PdfCollector();
  private browserCollector = new BrowserCollector();
  private core: NewsroomIntelligenceCore;
  private repository: RadarPersistenceRepository;
  private lifecycleChangeDetector = new ChangeDetector();
  private lifecycleImpactAnalyzer = new ImpactAnalyzer();
  private alertDispatcher: AlertDispatcher;
  private evidenceVault?: EvidenceVaultService;
  private isInitialized = false;

  constructor(
    private sources: RadarSourceDefinition[],
    options?: RadarPipelineOptions
  ) {
    this.repository = options?.repository || createRadarPersistenceRepository();
    this.core = options?.customCore || newsroomIntelligenceCore;
    this.changeDetection = new ChangeDetectionEngine(this.repository);
    this.healthMonitor = new RadarSourceHealthMonitor(this.repository);
    this.alertDispatcher = options?.alertDispatcher || createAlertDispatcher();
    this.evidenceVault = options?.evidenceVault;
  }

  /**
   * Returns the pipeline's alert dispatcher instance.
   */
  public getAlertDispatcher(): AlertDispatcher {
    return this.alertDispatcher;
  }

  /**
   * Initializes persistent state across server restarts.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    await Promise.all([
      this.core.ensureLoaded(),
      this.changeDetection.load(),
      this.healthMonitor.load(),
    ]);
    this.isInitialized = true;
  }

  private getCollector(type: string): RadarCollector {
    switch (type) {
      case 'rss':
        return this.rssCollector;
      case 'pdf':
        return this.pdfCollector;
      case 'browser':
        return this.browserCollector;
      case 'html':
      default:
        return this.htmlCollector;
    }
  }

  private mapAuthorityClassToTier(authorityClass: string): 't1' | 't2' | 't3' | 't4' | 't5' {
    switch (authorityClass) {
      case 'PRIMARY':
      case 'OFFICIAL':
        return 't1';
      case 'REGULATORY':
      case 'JUDICIAL':
      case 'PARLIAMENTARY':
        return 't2';
      case 'ACADEMIC':
      case 'HIGH_QUALITY_SECONDARY':
        return 't3';
      case 'SPECIALIST_MEDIA':
      case 'GENERAL_MEDIA':
        return 't4';
      case 'SOCIAL':
      case 'USER_PROVIDED':
      default:
        return 't5';
    }
  }

  /**
   * Executes one scheduled polling cycle with concurrency protection, bounded backoff,
   * fingerprint change detection, and operational persistence.
   */
  public async poll(options?: { forceAll?: boolean; workerId?: string }): Promise<RadarPipelineMetrics> {
    await this.init();

    const runId = `run_${Date.now()}_${createHash('sha256').update(Math.random().toString()).digest('hex').substring(0, 8)}`;
    const workerId = options?.workerId || `worker_${runId}`;
    const cycleStart = Date.now();
    const lockKey = 'radar:poll:global';
    const lockTtlMs = 120_000; // 2 minutes

    // 1. Concurrency control: Acquire distributed lock
    const lockAcquired = await this.repository.acquireLock(lockKey, workerId, lockTtlMs);
    if (!lockAcquired) {
      return {
        id: runId,
        runId,
        generatedAt: new Date().toISOString(),
        cycleDurationMs: Date.now() - cycleStart,
        sourcesConsidered: this.sources.length,
        sourcesPolled: 0,
        successful: 0,
        failed: 0,
        newArtifacts: 0,
        changedArtifacts: 0,
        unchanged: 0,
        eventsOrSignalsCreated: 0,
        status: 'failed',
        error: 'Concurrency lock contention: another radar poll worker is currently active.',
        sourceFailureRate: 0,
        duplicateRate: 0,
        medianDetectionLatencyMs: null,
        p90DetectionLatencyMs: null,
      };
    }

    let sourcesPolled = 0;
    let successful = 0;
    let failed = 0;
    let newArtifacts = 0;
    let changedArtifacts = 0;
    let unchanged = 0;
    let eventsOrSignalsCreated = 0;
    const latencyRecords: number[] = [];

    try {
      // 2. Source Scheduling & Eligibility
      const healthMap = this.healthMonitor.getHealthMap();
      const activeSources = this.sources.filter((s) => s.enabled);
      const { dueSources } = SourceScheduler.getDueSources(activeSources, healthMap, new Date());

      const sourcesToPoll = options?.forceAll ? activeSources : dueSources;

      for (const source of sourcesToPoll) {
        sourcesPolled++;
        this.healthMonitor.setScheduleState(source.id, 'RUNNING');

        const collector = this.getCollector(source.collectorType);
        const fetchStart = Date.now();

        try {
          const result = await collector.collect(source);
          const fetchDurationMs = Date.now() - fetchStart;

          if (result.errors.length > 0 && result.artifacts.length === 0) {
            failed++;
            this.healthMonitor.recordFailure(
              source.id,
              result.httpStatus || 500,
              result.errors.join('; '),
              undefined,
              source
            );
            continue;
          }

          if (result.artifacts.length === 0) {
            // Successful HTTP connection but zero artifacts extracted (empty feed or broken selector)
            successful++;
            this.healthMonitor.recordEmptyFetch(
              source.id,
              fetchDurationMs,
              source.pollIntervalMinutes,
              source
            );
            continue;
          }

          successful++;
          this.healthMonitor.recordSuccess(
            source.id,
            fetchDurationMs,
            source.pollIntervalMinutes,
            result.artifacts.length
          );

          for (const artifact of result.artifacts) {
            const changeResult = this.changeDetection.detect(artifact);

            if (changeResult.changeType === 'unchanged') {
              unchanged++;
              continue;
            }

            this.healthMonitor.recordChange(source.id);

            // Entity and Geo Resolution
            const combinedText = `${artifact.title || ''} ${artifact.content}`;
            const resolvedEntities = resolveEntities(combinedText);
            const entityIds = resolvedEntities.map((e) => e.id);

            const resolvedGeo = resolveLocation(combinedText);
            const geoNodes = resolvedGeo ? getGeoHierarchy(resolvedGeo.id) : [];
            const geoSpread = geoNodes.map((g) => g.id);

            let impactTasks: EditorialTask[] = [];

            // Detect legal / document mutation markers (corrigendum, amendment, withdrawal)
            const mutationMarkers = detectDocumentMutationMarkers(combinedText);
            const mergedMetadata = {
              ...artifact.metadata,
              isCorrigendum: Boolean(artifact.metadata?.isCorrigendum || mutationMarkers.isCorrigendum),
              isAmendment: Boolean(artifact.metadata?.isAmendment || mutationMarkers.isAmendment),
              isWithdrawn: Boolean(artifact.metadata?.isWithdrawn || mutationMarkers.isWithdrawn),
            };

            const changeState = resolveDocumentChangeState(
              changeResult.changeType,
              mergedMetadata,
              result.httpStatus
            );

            // Find immediate prior observation for this document if available
            const priorObservation = this.core.getObservations().find(
              (o) =>
                (o.canonicalUrl && o.canonicalUrl === artifact.url) ||
                (changeResult.previousHash && o.contentHash === changeResult.previousHash)
            );

            if (changeResult.changeType === 'new') {
              newArtifacts++;
            } else if (changeResult.changeType === 'changed') {
              changedArtifacts++;
              try {
                const oldDoc: NormalizedDocument = {
                  id: `doc-${source.id}-prev`,
                  sourceId: source.id,
                  title: priorObservation?.title || source.name,
                  content: priorObservation?.snippet || '',
                  claims: priorObservation?.snippet ? [{ text: priorObservation.snippet }] : [],
                  entities: priorObservation?.entities || entityIds,
                  publishedAt: priorObservation?.publicationTimestamp || artifact.publishedAt || artifact.retrievedAt,
                  url: artifact.url,
                };
                const newDoc: NormalizedDocument = {
                  id: `doc-${source.id}-curr`,
                  sourceId: source.id,
                  title: artifact.title || source.name,
                  content: artifact.content,
                  claims: [{ text: artifact.content.substring(0, 300) }],
                  entities: entityIds,
                  publishedAt: artifact.publishedAt || artifact.retrievedAt,
                  url: artifact.url,
                };
                const diff = await this.lifecycleChangeDetector.compare(oldDoc, newDoc);
                if (diff.hasChanges) {
                  impactTasks = await this.lifecycleImpactAnalyzer.analyze(diff);
                  for (const t of impactTasks) {
                    globalEditorialQueue.enqueue(t);
                  }
                }
              } catch {
                // Non-blocking lifecycle dispatch
              }
            }

            // Build canonical NewsroomObservation preserving full mutation lineage
            const obsId = `obs-radar-${createHash('sha256').update(artifact.url + artifact.contentHash).digest('hex').substring(0, 16)}`;

            // Phase 4B-2B & Phase 4B-2E: Preserve raw artifact in Evidence Vault (fail-safe)
            let archiveId: string | undefined;
            let archivalState: 'staged' | 'archive_failed' = 'staged';
            if (this.evidenceVault) {
              try {
                const archiveRecord = await this.evidenceVault.archiveArtifact(artifact, {
                  sourceRevisionId: `rev-${obsId}`,
                  observationId: obsId,
                  captureProvenance: {
                    changeType: changeState,
                    detectedAt: changeResult.detectedAt,
                  },
                });
                archiveId = archiveRecord.id;
                archivalState = 'staged';
              } catch (vaultErr) {
                console.error('[RadarPipeline] Evidence Vault preservation notice (fail-safe):', vaultErr);
                archivalState = 'archive_failed';
              }
            }

            const observation: NewsroomObservation = {
              id: obsId,
              sourceId: source.id,
              sourceTier: this.mapAuthorityClassToTier(source.authorityClass),
              contentHash: artifact.contentHash,
              canonicalUrl: artifact.url,
              title: artifact.title || source.name,
              snippet: artifact.content.substring(0, 300),
              entities: entityIds,
              isPrimarySource: source.primarySource,
              duplicateState: 'unique',
              duplicateOfId: priorObservation?.id,
              ingestionTimestamp: artifact.retrievedAt,
              publicationTimestamp: artifact.publishedAt || artifact.retrievedAt,
              archiveId,
              archivalState,
              metadata: {
                ...mergedMetadata,
                changeType: changeState,
                previousHash: changeResult.previousHash,
                newContentHash: artifact.contentHash,
                detectedAt: changeResult.detectedAt,
                previousObservationId: priorObservation?.id,
                previousRetrievalTimestamp: priorObservation?.ingestionTimestamp,
                newRetrievalTimestamp: artifact.retrievedAt,
                mutationId: `mut-${obsId}`,
                archiveId,
                impactTaskIds: impactTasks.map((t) => t.id),
                diffSummary: impactTasks.map((t) => t.evidence?.diffSummary).filter(Boolean).join('; '),
                affectedStories: Array.from(new Set(impactTasks.flatMap((t) => t.affectedContent?.stories || []))),
                isMutation: changeResult.changeType === 'changed',
              },
            };

            this.core.ingestObservation(observation);

            // Cluster creation & signal evaluation with wire syndication / independence tracking
            const corroboration = evaluateClusterCorroboration([
              {
                sourceId: source.id,
                publisher: source.publisher,
                sourceTier: this.mapAuthorityClassToTier(source.authorityClass),
                isPrimary: source.primarySource,
                syndicatedFrom: source.syndicatedFrom,
                contentSnippet: artifact.content.substring(0, 300),
              },
            ]);

            // Reconcile with existing cluster if prior observation was already clustered
            const existingCluster = priorObservation
              ? this.core.getClusters().find((c) => c.observationIds.includes(priorObservation.id))
              : undefined;

            const clusterId = existingCluster ? existingCluster.id : `cluster-radar-${obsId}`;
            const clusterObsIds = existingCluster
              ? (existingCluster.observationIds.includes(obsId)
                  ? existingCluster.observationIds
                  : [...existingCluster.observationIds, obsId])
              : [obsId];

            const cluster: StoryCluster = {
              id: clusterId,
              title: artifact.title || existingCluster?.title || source.name,
              summary: artifact.content.substring(0, 500),
              firstDetectedAt: existingCluster?.firstDetectedAt || artifact.retrievedAt,
              lastUpdatedAt: new Date().toISOString(),
              observationIds: clusterObsIds,
              sourceIds: Array.from(new Set([...(existingCluster?.sourceIds || []), source.id])),
              claimIds: existingCluster?.claimIds || [],
              entities: Array.from(new Set([...(existingCluster?.entities || []), ...entityIds])),
              geographicSpread: Array.from(new Set([...(existingCluster?.geographicSpread || []), ...geoSpread])),
              status: 'active',
              primarySourceCount: Math.max(existingCluster?.primarySourceCount || 0, corroboration.primarySourceCount),
              independentSourceCount: Math.max(existingCluster?.independentSourceCount || 0, corroboration.independentSourceCount),
            };

            this.core.upsertCluster(cluster);
            eventsOrSignalsCreated++;

            // Precision Latency Measurement
            let detectionLatencyMs: number | undefined;
            if (artifact.publishedAt) {
              const pubMs = new Date(artifact.publishedAt).getTime();
              const detMs = new Date(cluster.firstDetectedAt).getTime();
              if (!isNaN(pubMs) && !isNaN(detMs) && detMs >= pubMs) {
                detectionLatencyMs = detMs - pubMs;
                latencyRecords.push(detectionLatencyMs);
              }
            }

            const latencyRecord: RadarLatencyRecord = {
              clusterId,
              sourcePublishedAt: artifact.publishedAt,
              firstSeenAt: artifact.retrievedAt,
              firstDetectedAt: cluster.firstDetectedAt,
              detectionLatencyMs,
            };
            await this.repository.recordLatency(latencyRecord);

            // If this is a document mutation, also record a discrete revision latency record
            if (changeResult.changeType === 'changed') {
              const revNum = ((priorObservation?.metadata?.revisionNumber as number) || 1) + 1;
              const mutationClusterId = `${clusterId}:rev:${revNum}`;
              let mutationDetLatencyMs: number | undefined;
              if (artifact.publishedAt) {
                const pubMs = new Date(artifact.publishedAt).getTime();
                const detMs = new Date(artifact.retrievedAt).getTime();
                if (!isNaN(pubMs) && !isNaN(detMs) && detMs >= pubMs) {
                  mutationDetLatencyMs = detMs - pubMs;
                }
              }

              const mutationLatencyRecord: RadarLatencyRecord = {
                clusterId: mutationClusterId,
                sourcePublishedAt: artifact.publishedAt,
                firstSeenAt: artifact.retrievedAt,
                firstDetectedAt: artifact.retrievedAt,
                detectionLatencyMs: mutationDetLatencyMs,
              };
              await this.repository.recordLatency(mutationLatencyRecord);
            }
          }
        } catch (err) {
          failed++;
          this.healthMonitor.recordFailure(
            source.id,
            500,
            err instanceof Error ? err.message : String(err)
          );
        }
      }

      // Flush state to persistent storage
      await Promise.all([
        this.changeDetection.flush(),
        this.healthMonitor.flush(),
      ]);

      // Phase 4B-1: Outbound notification dispatch (failure-isolated)
      if (this.alertDispatcher) {
        try {
          await this.alertDispatcher.dispatchPipelineAlerts(
            this.healthMonitor,
            this.core.getSignals()
          );
        } catch (err) {
          // Failure isolation: notification delivery failure must NEVER fail the radar polling cycle
          console.error('[RadarPipeline] Outbound notification failure (isolated):', err instanceof Error ? err.message : String(err));
        }
      }

      const cycleDurationMs = Date.now() - cycleStart;
      const sortedLatency = [...latencyRecords].sort((a, b) => a - b);
      const medianDetectionLatencyMs =
        sortedLatency.length > 0
          ? sortedLatency[Math.floor(sortedLatency.length / 2)]
          : null;
      const p90DetectionLatencyMs =
        sortedLatency.length > 0
          ? sortedLatency[Math.floor(sortedLatency.length * 0.9)]
          : null;

      const runRecord: RadarPipelineRunRecord = {
        id: runId,
        generatedAt: new Date().toISOString(),
        cycleDurationMs,
        sourcesConsidered: this.sources.length,
        sourcesPolled,
        successful,
        failed,
        newArtifacts,
        changedArtifacts,
        unchanged,
        eventsOrSignalsCreated,
        status: 'completed',
        medianDetectionLatencyMs,
        p90DetectionLatencyMs,
      };

      await this.repository.recordPipelineRun(runRecord);

      return {
        ...runRecord,
        runId,
        sourceFailureRate:
          sourcesPolled > 0 ? Math.round((failed / sourcesPolled) * 100) / 100 : 0,
        duplicateRate:
          sourcesPolled > 0 && newArtifacts + changedArtifacts + unchanged > 0
            ? Math.round((unchanged / (newArtifacts + changedArtifacts + unchanged)) * 100) / 100
            : 0,
      };
    } finally {
      // Release lock regardless of outcome
      await this.repository.releaseLock(lockKey, workerId);
    }
  }

  public getHealthMonitor(): RadarSourceHealthMonitor {
    return this.healthMonitor;
  }

  public getSourceAlerts(activeOnly = true) {
    return this.healthMonitor.getAlerts(activeOnly);
  }

  public getChangeDetection(): ChangeDetectionEngine {
    return this.changeDetection;
  }

  public getRepository(): RadarPersistenceRepository {
    return this.repository;
  }
}
