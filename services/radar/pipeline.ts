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
import { ChangeDetectionEngine } from './change-detection';
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
import type { NormalizedDocument } from '@/services/lifecycle/providers/SourceProvider';

export interface RadarPipelineOptions {
  repository?: RadarPersistenceRepository;
  customCore?: NewsroomIntelligenceCore;
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
  private isInitialized = false;

  constructor(
    private sources: RadarSourceDefinition[],
    options?: RadarPipelineOptions
  ) {
    this.repository = options?.repository || createRadarPersistenceRepository();
    this.core = options?.customCore || newsroomIntelligenceCore;
    this.changeDetection = new ChangeDetectionEngine(this.repository);
    this.healthMonitor = new RadarSourceHealthMonitor(this.repository);
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
              result.errors.join('; ')
            );
            continue;
          }

          successful++;
          this.healthMonitor.recordSuccess(source.id, fetchDurationMs, source.pollIntervalMinutes);

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

            if (changeResult.changeType === 'new') {
              newArtifacts++;
            } else if (changeResult.changeType === 'changed') {
              changedArtifacts++;
              try {
                const oldDoc: NormalizedDocument = {
                  id: `doc-${source.id}-prev`,
                  sourceId: source.id,
                  title: source.name,
                  content: '',
                  claims: [],
                  entities: entityIds,
                  publishedAt: artifact.publishedAt || artifact.retrievedAt,
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
                  const tasks = await this.lifecycleImpactAnalyzer.analyze(diff);
                  for (const t of tasks) {
                    globalEditorialQueue.enqueue(t);
                  }
                }
              } catch {
                // Non-blocking lifecycle dispatch
              }
            }

            // Build canonical NewsroomObservation
            const obsId = `obs-radar-${createHash('sha256').update(artifact.url + artifact.contentHash).digest('hex').substring(0, 16)}`;
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
              ingestionTimestamp: artifact.retrievedAt,
              publicationTimestamp: artifact.publishedAt || artifact.retrievedAt,
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

            const clusterId = `cluster-radar-${obsId}`;
            const cluster: StoryCluster = {
              id: clusterId,
              title: artifact.title || source.name,
              summary: artifact.content.substring(0, 500),
              firstDetectedAt: artifact.retrievedAt,
              lastUpdatedAt: new Date().toISOString(),
              observationIds: [obsId],
              sourceIds: [source.id],
              claimIds: [],
              entities: entityIds,
              geographicSpread: geoSpread,
              status: 'active',
              primarySourceCount: corroboration.primarySourceCount,
              independentSourceCount: corroboration.independentSourceCount,
            };

            this.core.upsertCluster(cluster);
            eventsOrSignalsCreated++;

            // Precision Latency Measurement
            let detectionLatencyMs: number | undefined;
            if (artifact.publishedAt) {
              const pubMs = new Date(artifact.publishedAt).getTime();
              const detMs = new Date(artifact.retrievedAt).getTime();
              if (!isNaN(pubMs) && !isNaN(detMs) && detMs >= pubMs) {
                detectionLatencyMs = detMs - pubMs;
                latencyRecords.push(detectionLatencyMs);
              }
            }

            const latencyRecord: RadarLatencyRecord = {
              clusterId,
              sourcePublishedAt: artifact.publishedAt,
              firstSeenAt: artifact.retrievedAt,
              firstDetectedAt: artifact.retrievedAt,
              detectionLatencyMs,
            };
            await this.repository.recordLatency(latencyRecord);
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

  public getChangeDetection(): ChangeDetectionEngine {
    return this.changeDetection;
  }

  public getRepository(): RadarPersistenceRepository {
    return this.repository;
  }
}
