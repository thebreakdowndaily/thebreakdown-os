/**
 * ─── Newsroom Intelligence — Observation Mode v1.2 Harness ───────────────────
 *
 * Operating instrument for the 7-day observation window (2026-08-15 → 2026-08-22).
 * Two commands:
 *
 *   npx tsx scripts/run-newsroom-observation-report.ts snapshot   (default)
 *     Runs the real PIB pull through the production adapter against a
 *     file-persisted observation state, then writes the day's snapshot to
 *     data/newsroom-observation-YYYY-MM-DD.json.
 *
 *   npx tsx scripts/run-newsroom-observation-report.ts report
 *     Validates every daily snapshot, aggregates the window, and emits:
 *       - data/newsroom-observation-v1.2.json            (consolidated dataset)
 *       - data/newsroom-observation-v1.2-summary.json    (machine summary)
 *       - docs/newsroom/NEWSROOM_OPERATIONAL_OBSERVATION_V1_2_REPORT.md
 *
 * Measurement principles (governing document: NEWS_INTELLIGENCE_V1_2_
 * COVERAGE_RECOVERY_REPORT.md §11 — Observation Mode):
 *   - Measure, do not optimize. No thresholds, weights, or logic are tuned.
 *   - Never infer an unobservable metric: record NOT_MEASURED, never zero.
 *   - Live ground-truth recall is not measurable without an independent
 *     observer, so eligible/detected/missed/silent-losses are recorded as
 *     NOT_MEASURED and the measured ingestion funnel is reported instead.
 *   - The frozen v1.2 baseline is read-only and is never modified.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import { createNewsroomStateRepository } from '@/services/intelligence/newsroom/persistence';
import {
  pullPibObservations,
  PIB_SOURCE_ID,
  DEFAULT_PIB_FEED_URL,
  type FeedFetcher,
  type PullPibResult,
} from '@/lib/intelligence/pib-adapter';
import { loadNewsroomScorecardBaseline } from '@/lib/intelligence/newsroom-scorecard-baseline';
import {
  TRIAGE_ACTIONS,
  FALSE_POSITIVE_ACTIONS,
} from '@/services/intelligence/newsroom/scorecard-service';
import type { CoverageGap } from '@/types/newsroom-intelligence';

const WINDOW_START_DATE = '2026-08-15';
const WINDOW_END_DATE = '2026-08-22';
const WINDOW_EXPECTED_DAYS = 7;

const OBSERVATION_STATE_FILE = path.join('data', 'newsroom', 'observation-runtime-state.json');
const SNAPSHOT_PREFIX = 'newsroom-observation-';
const SNAPSHOT_GLOB = path.join('data', 'newsroom-observation-*.json');
const CONSOLIDATED_FILE = path.join('data', 'newsroom-observation-v1.2.json');
const SUMMARY_FILE = path.join('data', 'newsroom-observation-v1.2-summary.json');
const REPORT_FILE = path.join('docs', 'newsroom', 'NEWSROOM_OPERATIONAL_OBSERVATION_V1_2_REPORT.md');

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

type MeasuredCount = number | 'NOT_MEASURED';

const INCIDENT_CLASSIFICATIONS = [
  'DETECTION',
  'COVERAGE',
  'SIGNAL_QUALITY',
  'ALERTING',
  'ROUTING',
  'PERSISTENCE',
  'EDITORIAL_WORKFLOW',
  'OBSERVABILITY',
] as const;

type IncidentClassification = (typeof INCIDENT_CLASSIFICATIONS)[number];

type GapFailureType = 'TRANSIENT_FAILURE' | 'ROTATION_GAP' | 'PERSISTENT_FAILURE' | 'UNKNOWN';

interface SourceDailyMetrics {
  requests: number;
  successfulFetches: number;
  failedFetches: number;
  retries: number;
  rotationEvents: number;
  persistentFailures: number;
  itemsIngested: number;
  itemsRejected: number;
  itemsDuplicated: number;
}

interface GapTelemetryRecord {
  id: string;
  sourceId: string;
  failureType: GapFailureType;
  detectedAt: string;
  retryAttempts: number;
  status: CoverageGap['status'];
  recoveryStatus: 'recovered_manual' | 'unrecovered';
  backfillCandidate: boolean;
}

interface IncidentRecord {
  id: string;
  classification: IncidentClassification;
  sourceId: string;
  description: string;
  detectedAt: string;
  status: 'open' | 'resolved';
}

interface DailyObservationSnapshot {
  date: string;
  generatedAt: string;
  provenance: string;
  baseline: {
    commit: string;
    version: string;
    tag: string;
  };
  pull: {
    ran: boolean;
    fetched: number;
    ingested: number;
    duplicates: number;
    skippedInvalid: number;
    errors: string[];
    registeredGapIds: string[];
    rotationGapDetected: boolean;
    feedOldest: string | null;
    feedNewest: string | null;
    feedItemCount: number;
    requests: number;
    failedRequests: number;
    retries: number;
  };
  counts: {
    eligibleObservableEvents: MeasuredCount;
    detectedEvents: MeasuredCount;
    missedEvents: MeasuredCount;
    coverageGaps: MeasuredCount;
    silentLosses: MeasuredCount;
    signals: MeasuredCount;
    evaluatedSignals: MeasuredCount;
    falsePositives: MeasuredCount;
    duplicates: MeasuredCount;
    alerts: MeasuredCount;
    acknowledgedAlerts: MeasuredCount;
    editorialActions: MeasuredCount;
    publishedFromAlert: MeasuredCount;
  };
  lifetime: {
    observations: number;
    clusters: number;
    signals: number;
    alerts: number;
    acknowledgedAlerts: number;
    coverageGapsOpen: number;
    coverageGapsResolved: number;
    triageActions: number;
    publishedFromAlert: number;
    observationStartAt: string | null;
    daysElapsed: number;
  };
  sourceHealth: Record<string, SourceDailyMetrics>;
  gaps: GapTelemetryRecord[];
  incidents: IncidentRecord[];
  latency: {
    medianTimeToSignalMs: number | null;
    medianTimeToAlertMs: number | null;
    medianTimeToEditorMs: number | null;
    medianTimeToActionMs: number | null;
    medianVerifiedLeadMsReference: number | null;
    timeToEditorSamples: number;
    timeToActionSamples: number;
  };
  notMeasured: string[];
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function dayBounds(dateKey: string): { start: number; end: number } {
  const parts = dateKey.split('-').map((p) => Number(p));
  const start = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getTime();
  return { start, end: start + DAY_MS };
}

function currentGitHead(): string {
  try {
    const out = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim();
  } catch {
    return 'unknown';
  }
}

function medianOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function classifyGap(g: CoverageGap): GapFailureType {
  if (g.gapType !== 'source_gap') return 'UNKNOWN';
  const id = g.id.toLowerCase();
  const title = g.title.toLowerCase();
  if (id.includes('rotation') || title.includes('rotation')) return 'ROTATION_GAP';
  if (id.includes('fetch-failed') || title.includes('fetch failed')) return 'PERSISTENT_FAILURE';
  return 'UNKNOWN';
}

function isMeasured(v: MeasuredCount): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function measuredOrNull(v: MeasuredCount): number | null {
  return isMeasured(v) ? v : null;
}

function fmtMs(v: number | null): string {
  if (v === null) return 'not measured';
  if (v < 60_000) return String(Math.round(v)) + ' ms';
  return String(Math.round(v / 60_000)) + ' min';
}

function pct(num: number, den: number): string {
  if (den <= 0) return 'n/a';
  return String(Math.round((num / den) * 1000) / 10) + '%';
}

// ── Command 1: snapshot ──────────────────────────────────────────────────────

async function runSnapshot(): Promise<void> {
  const now = new Date();
  const dateKey = toDateKey(now);
  if (dateKey < WINDOW_START_DATE || dateKey > WINDOW_END_DATE) {
    console.warn(
      '[observation] WARNING: snapshot date ' +
        dateKey +
        ' is outside the observation window ' +
        WINDOW_START_DATE +
        ' → ' +
        WINDOW_END_DATE
    );
  }

  const repo = createNewsroomStateRepository({
    provider: 'file',
    filePath: OBSERVATION_STATE_FILE,
  });
  const core = NewsroomIntelligenceCore.resetInstance(repo);
  await core.ensureLoaded();

  const gapIdsBefore = new Set(core.getCoverageGaps().map((g) => g.id));

  let attempts = 0;
  let failedAttempts = 0;
  const countingFetcher: FeedFetcher = async (url) => {
    attempts += 1;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) failedAttempts += 1;
      return { ok: res.ok, text: () => res.text() };
    } catch (err) {
      failedAttempts += 1;
      throw err;
    }
  };

  let result: PullPibResult | null = null;
  let pullThrew = false;
  let pullError = '';
  try {
    result = await pullPibObservations(core, {
      feedUrl: DEFAULT_PIB_FEED_URL,
      fetcher: countingFetcher,
      now: () => new Date(),
      detectRotationGap: true,
    });
  } catch (err) {
    pullThrew = true;
    pullError = err instanceof Error ? err.message : String(err);
  }

  const gapIdsAfter = core.getCoverageGaps().map((g) => g.id);
  const newGapIds = gapIdsAfter.filter((id) => !gapIdsBefore.has(id));

  const day = dayBounds(dateKey);
  const inDay = (iso: string | undefined): boolean => {
    if (!iso) return false;
    const t = Date.parse(iso);
    return Number.isFinite(t) && t >= day.start && t < day.end;
  };

  const signals = core.getSignals();
  const alerts = core.getAlerts();
  const audit = Array.from(NewsroomAuditService.getAllRecords());
  const gaps = core.getCoverageGaps();
  const observations = core.getObservations();
  const scorecard = core.getScorecard();
  const baseline = loadNewsroomScorecardBaseline();

  const signalsOnDay = signals.filter((s) => inDay(s.firstDetectedAt)).length;
  const alertsOnDay = alerts.filter((a) => inDay(a.triggeredAt)).length;
  const ackOnDay = alerts.filter((a) => a.acknowledged && inDay(a.acknowledgedAt)).length;
  const humanAuditOnDay = audit.filter(
    (r) => TRIAGE_ACTIONS.has(r.action) && inDay(r.timestamp)
  ).length;
  const fpAuditOnDay = audit.filter(
    (r) => FALSE_POSITIVE_ACTIONS.has(r.action) && inDay(r.timestamp)
  ).length;
  const evaluatedSignalsOnDay = new Set(
    audit.filter((r) => inDay(r.timestamp)).map((r) => r.signalId)
  ).size;
  const gapsOnDay = gaps.filter((g) => inDay(g.detectedAt)).length;

  const mojibakeObs = observations.filter(
    (o) => o.title.includes('\uFFFD') || o.snippet.includes('\uFFFD')
  );
  const dateFallbackObs = observations.filter((o) => {
    const pub = Date.parse(o.publicationTimestamp ?? '');
    const ing = Date.parse(o.ingestionTimestamp);
    return Number.isNaN(pub) || Math.abs(pub - ing) <= 1000;
  });

  const pulled = result ?? null;
  const pullRan = attempts > 0;
  const feedOldest = pulled?.coverage?.oldestPublicationDate ?? null;
  const feedNewest = pulled?.coverage?.newestPublicationDate ?? null;
  const rotationGapDetected = pulled?.coverage?.rotationGapDetected ?? false;

  const retriesUsed = attempts > 0 ? Math.max(0, attempts - 1) : 0;

  const observationsIngestedOnDay = observations.filter((o) => inDay(o.ingestionTimestamp)).length;
  const detectedEvents: MeasuredCount = observationsIngestedOnDay;
  const duplicatesMeasured: MeasuredCount = pullRan ? (pulled?.duplicates ?? 0) : 'NOT_MEASURED';

  const gapTelemetry: GapTelemetryRecord[] = gaps.map((g) => {
    const failureType = classifyGap(g);
    const backfillCandidate =
      failureType === 'ROTATION_GAP' &&
      g.status !== 'resolved' &&
      rotationGapAfterLastIngested(g, core.getObservations());
    return {
      id: g.id,
      sourceId: 'pib',
      failureType,
      detectedAt: g.detectedAt,
      retryAttempts: failureType === 'PERSISTENT_FAILURE' ? retriesUsed : 0,
      status: g.status,
      recoveryStatus: g.status === 'resolved' ? 'recovered_manual' : 'unrecovered',
      backfillCandidate,
    };
  });

  const incidents: IncidentRecord[] = [];
  if (rotationGapDetected) {
    incidents.push({
      id: 'inc-cover-rotation-' + dateKey,
      classification: 'COVERAGE',
      sourceId: PIB_SOURCE_ID,
      description:
        'PIB feed window rotation: releases between the previously ingested newest and the current feed oldest were not observed by the scheduled pull.',
      detectedAt: now.toISOString(),
      status: 'open',
    });
  }
  if (pullThrew) {
    incidents.push({
      id: 'inc-cover-fetch-' + dateKey,
      classification: 'COVERAGE',
      sourceId: PIB_SOURCE_ID,
      description: 'PIB pull failed: ' + pullError,
      detectedAt: now.toISOString(),
      status: 'open',
    });
  } else if (result && result.errors.length > 0) {
    incidents.push({
      id: 'inc-cover-partial-' + dateKey,
      classification: 'COVERAGE',
      sourceId: PIB_SOURCE_ID,
      description: 'PIB pull completed with errors: ' + result.errors.join('; '),
      detectedAt: now.toISOString(),
      status: 'open',
    });
  }
  for (const g of gapTelemetry.filter((g) => g.failureType === 'ROTATION_GAP')) {
    incidents.push({
      id: 'inc-cover-gap-' + g.id,
      classification: 'COVERAGE',
      sourceId: PIB_SOURCE_ID,
      description: 'Open coverage gap: ' + g.id + ' (' + g.failureType + ')',
      detectedAt: g.detectedAt,
      status: g.status === 'resolved' ? 'resolved' : 'open',
    });
  }
  if (mojibakeObs.length > 0) {
    incidents.push({
      id: 'inc-signal-encoding-' + dateKey,
      classification: 'SIGNAL_QUALITY',
      sourceId: PIB_SOURCE_ID,
      description:
        String(mojibakeObs.length) +
        ' ingested observation(s) contain U+FFFD replacement characters — feed content is not valid UTF-8 as decoded by the pipeline.',
      detectedAt: now.toISOString(),
      status: 'open',
    });
  }
  if (dateFallbackObs.length > 0) {
    incidents.push({
      id: 'inc-cover-dates-' + dateKey,
      classification: 'COVERAGE',
      sourceId: PIB_SOURCE_ID,
      description:
        String(dateFallbackObs.length) +
        ' observation(s) carry no parseable publication date; publicationTimestamp falls back to ingestion time, which disables feed-window rotation-gap detection on this feed.',
      detectedAt: now.toISOString(),
      status: 'open',
    });
  }

  const sourceHealth: Record<string, SourceDailyMetrics> = {};
  sourceHealth[PIB_SOURCE_ID] = {
    requests: attempts,
    successfulFetches: Math.max(0, attempts - failedAttempts),
    failedFetches: failedAttempts,
    retries: retriesUsed,
    rotationEvents: rotationGapDetected ? 1 : 0,
    persistentFailures: pullThrew ? 1 : 0,
    itemsIngested: observationsIngestedOnDay,
    itemsRejected: pulled?.skippedInvalid ?? 0,
    itemsDuplicated: pulled?.duplicates ?? 0,
  };

  const notMeasured: string[] = [];
  if (!isMeasured(detectedEvents)) notMeasured.push('detectedEvents');
  if (!isMeasured(duplicatesMeasured)) notMeasured.push('duplicates');
  notMeasured.push('eligibleObservableEvents');
  notMeasured.push('missedEvents');
  notMeasured.push('silentLosses');
  notMeasured.push('publishedFromAlert');

  const snapshot: DailyObservationSnapshot = {
    date: dateKey,
    generatedAt: now.toISOString(),
    provenance: 'local_observation_harness_v1',
    baseline: {
      commit: currentGitHead(),
      version: baseline.version,
      tag: baseline.tag,
    },
    pull: {
      ran: pullRan,
      fetched: pulled?.fetched ?? 0,
      ingested: pulled?.ingested ?? 0,
      duplicates: pulled?.duplicates ?? 0,
      skippedInvalid: pulled?.skippedInvalid ?? 0,
      errors: pullThrew ? [pullError] : (result?.errors ?? []),
      registeredGapIds: pullThrew ? newGapIds : (result?.registeredGapIds ?? []),
      rotationGapDetected,
      feedOldest,
      feedNewest,
      feedItemCount: pulled?.coverage?.itemCount ?? 0,
      requests: attempts,
      failedRequests: failedAttempts,
      retries: retriesUsed,
    },
    counts: {
      eligibleObservableEvents: 'NOT_MEASURED',
      detectedEvents,
      missedEvents: 'NOT_MEASURED',
      coverageGaps: gapsOnDay,
      silentLosses: 'NOT_MEASURED',
      signals: signalsOnDay,
      evaluatedSignals: evaluatedSignalsOnDay,
      falsePositives: fpAuditOnDay,
      duplicates: duplicatesMeasured,
      alerts: alertsOnDay,
      acknowledgedAlerts: ackOnDay,
      editorialActions: humanAuditOnDay,
      publishedFromAlert: 'NOT_MEASURED',
    },
    lifetime: {
      observations: scorecard.detection.observations,
      clusters: scorecard.detection.clusters,
      signals: scorecard.detection.signals,
      alerts: scorecard.alerts.generated,
      acknowledgedAlerts: scorecard.alerts.acknowledged,
      coverageGapsOpen: scorecard.coverage.coverageGapsOpen,
      coverageGapsResolved: scorecard.coverage.resolved,
      triageActions: scorecard.editorial.triageActions,
      publishedFromAlert: scorecard.editorial.publishedFromAlert,
      observationStartAt: scorecard.observationPeriod.startAt,
      daysElapsed: scorecard.observationPeriod.daysElapsed,
    },
    sourceHealth,
    gaps: gapTelemetry,
    incidents,
    latency: {
      medianTimeToSignalMs: scorecard.latency.medianTimeToSignalMs,
      medianTimeToAlertMs: scorecard.latency.medianTimeToAlertMs,
      medianTimeToEditorMs: scorecard.latency.medianTimeToEditorMs,
      medianTimeToActionMs: scorecard.latency.medianTimeToActionMs,
      medianVerifiedLeadMsReference: scorecard.latency.medianVerifiedLeadMsReference,
      timeToEditorSamples: scorecard.latency.timeToEditorSamples,
      timeToActionSamples: scorecard.latency.timeToActionSamples,
    },
    notMeasured,
  };

  const target = path.join('data', SNAPSHOT_PREFIX + dateKey + '.json');
  fs.writeFileSync(target, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log('[observation] snapshot written: ' + target);
  console.log(
    '[observation] day ' +
      dateKey +
      ' — pull ran: ' +
      String(pullRan) +
      ', fetched: ' +
      String(snapshot.pull.fetched) +
      ', ingested: ' +
      String(snapshot.pull.ingested) +
      ', duplicate: ' +
      String(snapshot.pull.duplicates) +
      ', rejected: ' +
      String(snapshot.pull.skippedInvalid) +
      ', rotation gap: ' +
      String(rotationGapDetected) +
      ', errors: ' +
      String(snapshot.pull.errors.length)
  );
}

function rotationGapAfterLastIngested(gap: CoverageGap, observations: NewsroomObservationLike[]): boolean {
  const match = /current feed oldest item is (.+?)\./.exec(gap.description);
  if (!match) return false;
  const gapEndMs = Date.parse(match[1]);
  if (Number.isNaN(gapEndMs)) return false;
  let newestPub = 0;
  for (const o of observations) {
    const t = Date.parse(o.publicationTimestamp ?? o.ingestionTimestamp);
    if (Number.isFinite(t) && t > newestPub) newestPub = t;
  }
  return gapEndMs <= newestPub;
}

interface NewsroomObservationLike {
  publicationTimestamp?: string;
  ingestionTimestamp?: string;
}

// ── Command 2: report ────────────────────────────────────────────────────────

interface AggregateTotals {
  days: number;
  missingDates: string[];
  pullsRan: number;
  pullFailures: number;
  retriesAbsorbed: number;
  fetched: number;
  ingested: number;
  duplicates: number;
  rejected: number;
  retries: number;
  rotationEvents: number;
  persistentFailures: number;
  signals: number;
  alerts: number;
  acknowledgedAlerts: number;
  editorialActions: number;
  falsePositives: number;
  evaluatedSignals: number;
  coverageGaps: number;
  lifetimeEnd: {
    observations: number;
    clusters: number;
    signals: number;
    alerts: number;
    acknowledgedAlerts: number;
    coverageGapsOpen: number;
    coverageGapsResolved: number;
    triageActions: number;
    publishedFromAlert: number;
    observationStartAt: string | null;
    daysElapsed: number;
  };
  notMeasuredCounts: Record<string, number>;
  incidents: IncidentRecord[];
  gaps: GapTelemetryRecord[];
  latencyDays: {
    timeToSignal: Array<number | null>;
    timeToAlert: Array<number | null>;
    timeToEditor: Array<number | null>;
    timeToAction: Array<number | null>;
    timeToEditorSamples: number;
    timeToActionSamples: number;
  };
  anomalies: Array<{ label: string; detail: string; severity: 'info' | 'warning' | 'critical' }>;
}

function validateSnapshot(snapshot: unknown, file: string): string[] {
  const errors: string[] = [];
  if (typeof snapshot !== 'object' || snapshot === null) {
    return [file + ': snapshot is not an object'];
  }
  const s = snapshot as DailyObservationSnapshot;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date ?? '')) errors.push(file + ': invalid date "' + String(s.date) + '"');
  if (Number.isNaN(Date.parse(s.generatedAt ?? ''))) errors.push(file + ': generatedAt is not parseable');

  const counts = s.counts;
  if (!counts || typeof counts !== 'object') {
    return [file + ': missing counts'];
  }

  const mustBeNumber: Array<keyof typeof counts> = [
    'signals',
    'evaluatedSignals',
    'falsePositives',
    'alerts',
    'acknowledgedAlerts',
    'editorialActions',
    'coverageGaps',
  ];
  for (const key of mustBeNumber) {
    const v = counts[key];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
      errors.push(file + ': counts.' + key + ' must be a non-negative number');
    }
  }
  const mayBeMeasured: Array<keyof typeof counts> = [
    'eligibleObservableEvents',
    'detectedEvents',
    'missedEvents',
    'silentLosses',
    'duplicates',
    'publishedFromAlert',
  ];
  for (const key of mayBeMeasured) {
    const v = counts[key];
    const ok = typeof v === 'number' ? Number.isFinite(v) && v >= 0 : v === 'NOT_MEASURED';
    if (!ok) errors.push(file + ': counts.' + key + ' must be a non-negative number or NOT_MEASURED');
  }

  const eligible = measuredOrNull(counts.eligibleObservableEvents);
  const detected = measuredOrNull(counts.detectedEvents);
  const missed = measuredOrNull(counts.missedEvents);
  const fp = isMeasured(counts.falsePositives) ? counts.falsePositives : null;
  const evaluated = isMeasured(counts.evaluatedSignals) ? counts.evaluatedSignals : null;
  const acked = isMeasured(counts.acknowledgedAlerts) ? counts.acknowledgedAlerts : null;
  const alerts = isMeasured(counts.alerts) ? counts.alerts : null;
  const published = measuredOrNull(counts.publishedFromAlert);

  if (eligible !== null && detected !== null && detected > eligible) errors.push(file + ': detectedEvents > eligibleObservableEvents');
  if (eligible !== null && missed !== null && missed > eligible) errors.push(file + ': missedEvents > eligibleObservableEvents');
  if (eligible !== null && detected !== null && missed !== null && detected + missed > eligible) {
    errors.push(file + ': detectedEvents + missedEvents > eligibleObservableEvents');
  }
  if (fp !== null && evaluated !== null && fp > evaluated) errors.push(file + ': falsePositives > evaluatedSignals');
  if (acked !== null && alerts !== null && acked > alerts) errors.push(file + ': acknowledgedAlerts > alerts');
  if (published !== null && alerts !== null && published > alerts) errors.push(file + ': publishedFromAlert > alerts');

  const pull = s.pull;
  if (pull) {
    const inSum = pull.ingested + pull.duplicates + pull.skippedInvalid;
    if (pull.ran && pull.errors.length === 0 && inSum !== pull.fetched) {
      errors.push(file + ': pull integrity — ingested + duplicates + skippedInvalid (' + String(inSum) + ') !== fetched (' + String(pull.fetched) + ')');
    }
    if (pull.ran && pull.requests <= 0) errors.push(file + ': pull.ran but requests <= 0');
  }

  const sh = s.sourceHealth;
  if (sh && typeof sh === 'object') {
    for (const source of Object.keys(sh)) {
      const m = sh[source];
      if (!m) continue;
      if (m.requests < 0 || m.successfulFetches < 0 || m.failedFetches < 0 || m.retries < 0) {
        errors.push(file + ': sourceHealth.' + source + ' contains negative counts');
      }
      if (m.successfulFetches + m.failedFetches !== m.requests) {
        errors.push(file + ': sourceHealth.' + source + ' successfulFetches + failedFetches !== requests');
      }
    }
  }

  if (s.incidents && !Array.isArray(s.incidents)) errors.push(file + ': incidents must be an array');

  return errors;
}

function expectedDates(): string[] {
  const dates: string[] = [];
  const start = dayBounds(WINDOW_START_DATE).start;
  for (let i = 0; i <= WINDOW_EXPECTED_DAYS; i++) {
    const d = new Date(start + i * DAY_MS);
    dates.push(toDateKey(d));
  }
  return dates;
}

function aggregate(snapshots: DailyObservationSnapshot[]): AggregateTotals {
  const counts: AggregateTotals = {
    days: snapshots.length,
    missingDates: [],
    pullsRan: 0,
    pullFailures: 0,
    retriesAbsorbed: 0,
    fetched: 0,
    ingested: 0,
    duplicates: 0,
    rejected: 0,
    retries: 0,
    rotationEvents: 0,
    persistentFailures: 0,
    signals: 0,
    alerts: 0,
    acknowledgedAlerts: 0,
    editorialActions: 0,
    falsePositives: 0,
    evaluatedSignals: 0,
    coverageGaps: 0,
    lifetimeEnd: {
      observations: 0,
      clusters: 0,
      signals: 0,
      alerts: 0,
      acknowledgedAlerts: 0,
      coverageGapsOpen: 0,
      coverageGapsResolved: 0,
      triageActions: 0,
      publishedFromAlert: 0,
      observationStartAt: null,
      daysElapsed: 0,
    },
    notMeasuredCounts: {},
    incidents: [],
    gaps: [],
    latencyDays: {
      timeToSignal: [],
      timeToAlert: [],
      timeToEditor: [],
      timeToAction: [],
      timeToEditorSamples: 0,
      timeToActionSamples: 0,
    },
    anomalies: [],
  };

  const presentDates = new Set(snapshots.map((s) => s.date));
  for (const expected of expectedDates()) {
    if (!presentDates.has(expected)) counts.missingDates.push(expected);
  }
  if (snapshots.length > 0) {
    const last = snapshots[snapshots.length - 1];
    counts.lifetimeEnd = last.lifetime;
  }

  for (const s of snapshots) {
    counts.pullsRan += s.pull.ran ? 1 : 0;
    counts.pullFailures += s.pull.errors.length > 0 ? 1 : 0;
    if (s.pull.errors.length === 0 && s.pull.ran) counts.retriesAbsorbed += s.pull.retries;
    counts.fetched += s.pull.fetched;
    const detected = measuredOrNull(s.counts.detectedEvents);
    counts.ingested += detected ?? 0;
    counts.duplicates += s.pull.duplicates;
    counts.rejected += s.pull.skippedInvalid;
    counts.retries += s.pull.retries;
    counts.rotationEvents += s.pull.rotationGapDetected ? 1 : 0;
    counts.signals += isMeasured(s.counts.signals) ? s.counts.signals : 0;
    counts.alerts += isMeasured(s.counts.alerts) ? s.counts.alerts : 0;
    counts.acknowledgedAlerts += isMeasured(s.counts.acknowledgedAlerts) ? s.counts.acknowledgedAlerts : 0;
    counts.editorialActions += isMeasured(s.counts.editorialActions) ? s.counts.editorialActions : 0;
    counts.falsePositives += isMeasured(s.counts.falsePositives) ? s.counts.falsePositives : 0;
    counts.evaluatedSignals += isMeasured(s.counts.evaluatedSignals) ? s.counts.evaluatedSignals : 0;
    counts.coverageGaps += isMeasured(s.counts.coverageGaps) ? s.counts.coverageGaps : 0;

    for (const key of Object.keys(s.counts) as Array<keyof DailyObservationSnapshot['counts']>) {
      const v = s.counts[key];
      if (!isMeasured(v)) {
        counts.notMeasuredCounts[key] = (counts.notMeasuredCounts[key] ?? 0) + 1;
      }
    }

    for (const source of Object.keys(s.sourceHealth)) {
      const m = s.sourceHealth[source];
      if (!m) continue;
      counts.persistentFailures += m.persistentFailures;
    }

    counts.incidents.push(...s.incidents);
    counts.gaps.push(...s.gaps);

    counts.latencyDays.timeToSignal.push(s.latency.medianTimeToSignalMs);
    counts.latencyDays.timeToAlert.push(s.latency.medianTimeToAlertMs);
    counts.latencyDays.timeToEditor.push(s.latency.medianTimeToEditorMs);
    counts.latencyDays.timeToAction.push(s.latency.medianTimeToActionMs);
    counts.latencyDays.timeToEditorSamples += s.latency.timeToEditorSamples;
    counts.latencyDays.timeToActionSamples += s.latency.timeToActionSamples;

    if (!s.pull.ran) {
      counts.anomalies.push({
        label: 'missing_pull_execution',
        detail: s.date + ': no scheduled pull executed; no feed telemetry for this day.',
        severity: 'warning',
      });
    }
    if (s.pull.errors.length > 0) {
      counts.anomalies.push({
        label: 'pull_failure',
        detail: s.date + ': pull reported ' + String(s.pull.errors.length) + ' error(s).',
        severity: 'critical',
      });
    }
    if (s.pull.rotationGapDetected) {
      counts.anomalies.push({
        label: 'feed_rotation_gap',
        detail: s.date + ': feed window rotated past unobserved releases.',
        severity: 'warning',
      });
    }
    if (s.pull.ran && s.pull.fetched === 0 && s.pull.errors.length === 0) {
      counts.anomalies.push({
        label: 'empty_feed_window',
        detail: s.date + ': pull succeeded but feed returned zero items.',
        severity: 'info',
      });
    }
    if (s.pull.ran && s.pull.retries > 0 && s.pull.errors.length === 0) {
      counts.anomalies.push({
        label: 'retries_absorbed',
        detail: s.date + ': feed recovered after ' + String(s.pull.retries) + ' retry attempt(s); no coverage gap registered.',
        severity: 'info',
      });
    }
    if (isMeasured(s.counts.alerts) && s.counts.alerts > 0 && isMeasured(s.counts.acknowledgedAlerts) && s.counts.acknowledgedAlerts === 0) {
      counts.anomalies.push({
        label: 'alerts_unacknowledged',
        detail: s.date + ': ' + String(s.counts.alerts) + ' alert(s) generated, none acknowledged.',
        severity: 'warning',
      });
    }
    if (isMeasured(s.counts.falsePositives) && isMeasured(s.counts.evaluatedSignals) && s.counts.evaluatedSignals > 0) {
      const fpRate = s.counts.falsePositives / s.counts.evaluatedSignals;
      if (fpRate >= 0.5) {
        counts.anomalies.push({
          label: 'high_false_positive_rate',
          detail: s.date + ': false-positive rate ' + pct(s.counts.falsePositives, s.counts.evaluatedSignals) + ' on evaluated signals.',
          severity: 'warning',
        });
      }
    }
  }

  for (const s of snapshots) {
    const prev = snapshots[snapshots.indexOf(s) - 1];
    if (prev) {
      const prevSignals = isMeasured(prev.counts.signals) ? prev.counts.signals : 0;
      const curSignals = isMeasured(s.counts.signals) ? s.counts.signals : 0;
      const prevErrors = prev.pull.errors.length;
      const curErrors = s.pull.errors.length;
      if (prevSignals > 0 && curSignals === 0 && prevErrors === 0 && curErrors === 0) {
        counts.anomalies.push({
          label: 'activity_stop',
          detail: s.date + ': zero new signals after a previous active day with no pull errors — possible coverage interruption or genuinely low feed volume.',
          severity: 'warning',
        });
      }
    }
  }

  if (counts.lifetimeEnd.acknowledgedAlerts > 0 && counts.lifetimeEnd.publishedFromAlert === 0) {
    counts.anomalies.push({
      label: 'no_editorial_output_from_alerts',
      detail: 'End-of-window: ' + String(counts.lifetimeEnd.acknowledgedAlerts) + ' alert(s) acknowledged but zero published-from-alert.',
      severity: 'warning',
    });
  }

  if (counts.incidents.some((i) => i.description.includes('no parseable publication date'))) {
    counts.anomalies.push({
      label: 'publication_date_absent',
      detail:
        'Feed items expose no parseable publication date; publicationTimestamp falls back to ingestion time, which disables feed-window rotation-gap detection on this feed.',
      severity: 'warning',
    });
  }

  if (
    counts.rotationEvents > 0 &&
    counts.anomalies.some((a) => a.label === 'publication_date_absent')
  ) {
    counts.anomalies.push({
      label: 'rotation_gap_unconfirmed',
      detail:
        'Registered rotation-gap endpoints are ingestion-time fallbacks (the feed carries no publication dates), so the gap window does not by itself prove an unobserved release. Counted as a surfaced gap; coverage impact NOT_MEASURED.',
      severity: 'info',
    });
  }

  return counts;
}

interface Recommendations {
  verdict: 'OPERATIONALLY HEALTHY' | 'OPERATIONALLY DEGRADED' | 'INSUFFICIENT OBSERVATION';
  v13: 'GO TO V1.3' | 'EXTEND OBSERVATION' | 'HOLD';
  rationale: string[];
}

function recommend(a: AggregateTotals): Recommendations {
  const rationale: string[] = [];
  const anyObservation = a.ingested > 0 || a.signals > 0 || a.pullsRan > 0;

  if (a.days === 0 || a.pullsRan === 0 || !anyObservation) {
    rationale.push('Observation is insufficient: no completed pull produced telemetry within the window.');
    return { verdict: 'INSUFFICIENT OBSERVATION', v13: 'EXTEND OBSERVATION', rationale };
  }

  const fpRate = a.evaluatedSignals > 0 ? a.falsePositives / a.evaluatedSignals : 0;
  const ackRate = a.alerts > 0 ? a.acknowledgedAlerts / a.alerts : 1;
  const degraded: string[] = [];

  if (a.persistentFailures > 0) degraded.push('persistent source failures recorded (' + String(a.persistentFailures) + ')');
  if (a.rotationEvents > 0) degraded.push('feed-window rotation gaps recorded (' + String(a.rotationEvents) + ')');
  if (a.alerts >= 5 && ackRate < 0.5) degraded.push('alert acknowledgement rate below 50% on a material alert volume (' + String(a.acknowledgedAlerts) + '/' + String(a.alerts) + ')');
  if (a.evaluatedSignals >= 5 && fpRate >= 0.5) degraded.push('false-positive rate at or above 50% on evaluated signals (' + pct(a.falsePositives, a.evaluatedSignals) + ')');

  if (degraded.length > 0) {
    rationale.push('Structural weakness observed in live data: ' + degraded.join('; ') + '.');
    return { verdict: 'OPERATIONALLY DEGRADED', v13: 'GO TO V1.3', rationale };
  }

  rationale.push('No structural weakness observed: pulls succeeded, no persistent source failures, no rotation gaps, alert acknowledgement and false-positive rates within the measured band.');
  if (a.days < WINDOW_EXPECTED_DAYS + 1 || a.signals < 20) {
    rationale.push('Sample is small (days: ' + String(a.days) + ', signals: ' + String(a.signals) + ') — extend observation before drawing long-term conclusions.');
    return { verdict: 'OPERATIONALLY HEALTHY', v13: 'EXTEND OBSERVATION', rationale };
  }
  return { verdict: 'OPERATIONALLY HEALTHY', v13: 'HOLD', rationale };
}

function sourceUniverse(snapshots: DailyObservationSnapshot[]): string[] {
  const set = new Set<string>();
  for (const s of snapshots) {
    for (const key of Object.keys(s.sourceHealth)) set.add(key);
  }
  return Array.from(set).sort();
}

function renderTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length))
  );
  const line = (cells: string[]): string =>
    '| ' + cells.map((c, i) => c.padEnd(widths[i])).join(' | ') + ' |';
  const sep = '|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|';
  return [line(headers), sep, ...rows.map(line)].join('\n');
}

function buildReport(
  snapshots: DailyObservationSnapshot[],
  totals: AggregateTotals,
  recommendations: Recommendations
): string {
  const isFinal = snapshots.length === WINDOW_EXPECTED_DAYS + 1 && totals.missingDates.length === 0;
  const windowStatus = isFinal ? 'FINAL' : 'INTERIM (observation window in progress)';
  const baseline = loadNewsroomScorecardBaseline();
  const universe = sourceUniverse(snapshots);

  const ackRate = totals.alerts > 0 ? totals.acknowledgedAlerts / totals.alerts : null;
  const fpRate = totals.evaluatedSignals > 0 ? totals.falsePositives / totals.evaluatedSignals : null;
  const observedDuplicateRate =
    totals.fetched > 0 ? totals.duplicates / totals.fetched : 0;
  const observedIntelligence =
    totals.lifetimeEnd.clusters > 0
      ? Math.round((totals.lifetimeEnd.signals / totals.lifetimeEnd.clusters) * 1000) / 1000
      : null;
  const editorialConversion = totals.alerts > 0 ? totals.editorialActions / totals.alerts : null;

  const latencyRows: string[][] = snapshots.map((s) => [
    s.date,
    fmtMs(s.latency.medianTimeToSignalMs),
    fmtMs(s.latency.medianTimeToAlertMs),
    fmtMs(s.latency.medianTimeToEditorMs),
    fmtMs(s.latency.medianTimeToActionMs),
    String(s.latency.timeToEditorSamples) + ' / ' + String(s.latency.timeToActionSamples),
  ]);

  const incidentsByClass = new Map<IncidentClassification, number>();
  for (const inc of totals.incidents) {
    incidentsByClass.set(inc.classification, (incidentsByClass.get(inc.classification) ?? 0) + 1);
  }

  const gapBreakdown = new Map<GapFailureType, number>();
  for (const g of totals.gaps) gapBreakdown.set(g.failureType, (gapBreakdown.get(g.failureType) ?? 0) + 1);

  const md: string[] = [];
  md.push('# Newsroom Intelligence — Operational Observation v1.2');
  md.push('');
  md.push('**Status:** ' + windowStatus);
  md.push('');
  md.push('> **Motto:** Evidence before conclusions. Context before certainty.');
  md.push('');
  md.push('This report is generated by `scripts/run-newsroom-observation-report.ts` from daily snapshots in `data/newsroom-observation-YYYY-MM-DD.json`. It measures the live deployment during the observation window. It does not tune the system.');
  md.push('');
  md.push('## 1. Executive Verdict');
  md.push('');
  md.push('**Verdict: `' + recommendations.verdict + '`** (data-driven recommendation)');
  md.push('');
  md.push('**V1.3 decision: `' + recommendations.v13 + '`**');
  md.push('');
  md.push('Rationale:');
  md.push('');
  for (const r of recommendations.rationale) md.push('- ' + r);
  if (totals.anomalies.some((a) => a.label === 'rotation_gap_unconfirmed')) {
    md.push('- Registered rotation-gap endpoint(s) are ingestion-time fallbacks (feed carries no publication dates): the gap window is an instrument artifact of the missing-date condition, not proof of an unobserved release. Coverage impact NOT_MEASURED. This is the concrete structural weakness the V1.3 decision must weigh.');
  }
  md.push('');
  md.push('## 2. Observation Window');
  md.push('');
  md.push('| Field | Value |');
  md.push('|-------|-------|');
  md.push('| Window | ' + WINDOW_START_DATE + ' → ' + WINDOW_END_DATE + ' |');
  md.push('| Expected days | ' + String(WINDOW_EXPECTED_DAYS + 1) + ' |');
  md.push('| Snapshots recorded | ' + String(snapshots.length) + ' |');
  md.push('| Missing dates | ' + (totals.missingDates.length > 0 ? totals.missingDates.join(', ') : 'none') + ' |');
  md.push('| Pulls executed | ' + String(totals.pullsRan) + ' / ' + String(snapshots.length) + ' days |');
  md.push('| Provenance | local_observation_harness_v1 (file-persisted observation state) |');
  md.push('| Baseline commit | ' + (snapshots[0]?.baseline.commit ?? 'n/a') + ' |');
  md.push('| Baseline version | ' + baseline.version + ' (' + baseline.tag + ') |');
  md.push('');
  md.push('## 3. Baseline (frozen v1.2 reference)');
  md.push('');
  md.push('| Metric | Frozen Baseline 1.2 | Live Observation | Note |');
  md.push('|--------|----------------------|------------------|------|');
  md.push('| Coverage recall | ' + String(Math.round(baseline.coverageRecall * 100)) + '% (42/54) | NOT_MEASURED | Requires an independent ground-truth observer; live feed-only recall is not computed. |');
  md.push('| Intelligence recall | ' + String(Math.round(baseline.intelligenceRecall * 100)) + '% | ' + (observedIntelligence === null ? 'not applicable (no clusters)' : String(Math.round(observedIntelligence * 1000) / 10) + '% (signals/clusters)') + ' | Live ratio is signals ÷ clusters; baseline was holdout-derived. Not directly comparable. |');
  md.push('| Silent losses | 0 | NOT_MEASURED | Requires ground truth; detected losses surface as rotation/fetch gaps instead. |');
  md.push('| False-positive gaps | 0 | ' + String(totals.gaps.filter((g) => g.failureType === 'UNKNOWN').length) + ' | Baseline counts holdout gaps; live counts registered gaps classified UNKNOWN. |');
  md.push('| Duplicate rate | 0.0 | ' + String(Math.round(observedDuplicateRate * 1000) / 1000) + ' (' + String(totals.duplicates) + '/' + String(totals.fetched) + ' feed items) | Live duplicates are feed-level (seen more than once); baseline duplicate rate was observation-level. Not directly comparable. |');
  md.push('| Recovered by retry | 6 | ' + String(totals.retriesAbsorbed) + ' retries absorbed on error-free day(s); ' + String(totals.pullFailures) + ' day(s) with errors | Live retries absorbed without a coverage gap = retries used on error-free pulls. |');
  md.push('');
  md.push('The frozen baseline is read-only. Live values are measured baselines with no targets. Population comparability is limited: the baseline comes from a constructed 8-window holdout; the live window is one continuous calendar period from a single feed.');
  md.push('');
  md.push('## 4. Detection');
  md.push('');
  md.push('| Metric | Window total | ');
  md.push('|--------|--------------|');
  md.push('| Feed items seen (latest scheduled pull) | ' + String(totals.fetched) + ' |');
  md.push('| New observations ingested (day, from canonical state) | ' + String(totals.ingested) + ' |');
  md.push('| Duplicates (feed-level, latest scheduled pull) | ' + String(totals.duplicates) + ' |');
  md.push('| Rejected / invalid (latest scheduled pull) | ' + String(totals.rejected) + ' |');
  md.push('| Signals generated (day deltas) | ' + String(totals.signals) + ' |');
  md.push('| Signals (end-of-window, lifetime) | ' + String(totals.lifetimeEnd.signals) + ' |');
  md.push('| Eligible / detected / missed (ground truth) | NOT_MEASURED |');
  md.push('');
  md.push('Each ingested release yields one deterministic signal. The measured ingestion funnel (seen → ingested → duplicate → rejected) is the honest detection telemetry for the window.');
  md.push('');
  md.push('## 5. Coverage');
  md.push('');
  md.push('| Field | Value |');
  md.push('|-------|-------|');
  md.push('| Coverage gaps registered (window) | ' + String(totals.coverageGaps) + ' |');
  md.push('| End-of-window open gaps | ' + String(totals.lifetimeEnd.coverageGapsOpen) + ' |');
  md.push('| End-of-window resolved gaps | ' + String(totals.lifetimeEnd.coverageGapsResolved) + ' |');
  md.push('| Rotation gaps | ' + String(totals.rotationEvents) + ' |');
  md.push('| Persistent failures | ' + String(totals.persistentFailures) + ' |');
  md.push('');
  md.push('Gap classification (window):');
  md.push('');
  if (totals.gaps.length === 0) {
    md.push('_No gaps registered in the window._');
  } else {
    md.push(renderTable(
      ['Gap id', 'Type', 'Status', 'Backfill candidate', 'Detected at'],
      totals.gaps.map((g) => [g.id, g.failureType, g.status, String(g.backfillCandidate), g.detectedAt])
    ));
  }
  md.push('');
  md.push('A surfaced coverage gap is not a detection: the gap is a known coverage failure surfaced to editors. Gap recovery status records resolved gaps as manually recovered (the engine does not auto-resolve gaps).');
  md.push('');
  md.push('## 6. Signal Quality');
  md.push('');
  md.push('| Metric | Value |');
  md.push('|--------|-------|');
  md.push('| Signals evaluated (day deltas) | ' + String(totals.evaluatedSignals) + ' |');
  md.push('| False-positive judgements | ' + String(totals.falsePositives) + ' |');
  md.push('| False-positive rate | ' + (fpRate === null ? 'no evaluated signals' : pct(totals.falsePositives, totals.evaluatedSignals)) + ' |');
  md.push('| Duplicate rate (feed-level) | ' + String(Math.round(observedDuplicateRate * 1000) / 1000) + ' |');
  md.push('');
  md.push('Precision is not judged from unevaluated signals: only signals with an audit trail contribute to the false-positive rate.');
  md.push('');
  md.push('## 7. Editorial Loop');
  md.push('');
  md.push('| Metric | Value |');
  md.push('|--------|-------|');
  md.push('| Alerts generated (day deltas) | ' + String(totals.alerts) + ' |');
  md.push('| Alerts acknowledged (day deltas) | ' + String(totals.acknowledgedAlerts) + ' |');
  md.push('| Acknowledgement rate | ' + (ackRate === null ? 'no alerts' : pct(totals.acknowledgedAlerts, totals.alerts)) + ' |');
  md.push('| Editorial triage actions (end-of-window) | ' + String(totals.lifetimeEnd.triageActions) + ' |');
  md.push('| Editorial actions per alert | ' + (editorialConversion === null ? 'no alerts' : String(Math.round(editorialConversion * 1000) / 1000)) + ' |');
  md.push('| Published-from-alert (end-of-window) | ' + String(totals.lifetimeEnd.publishedFromAlert) + ' |');
  md.push('');
  md.push('Central question: _did the signal reach a human before it mattered?_ The window measures time-to-editor and time-to-action (below) as the latency evidence for that question.');
  md.push('');
  md.push('## 8. Latency');
  md.push('');
  md.push('Per-day medians (from canonical state timestamps):');
  md.push('');
  if (latencyRows.length > 0) {
    md.push(renderTable(
      ['Date', 'To signal', 'To alert', 'Time-to-editor', 'Time-to-action', 'Samples (editor/action)'],
      latencyRows
    ));
  } else {
    md.push('_No latency samples in the window._');
  }
  md.push('');
  md.push('The frozen v1.1 median verified-lead reference is **42 minutes (HISTORICAL REFERENCE, not a live measurement)**. It is not a comparator for time-to-editor/time-to-action, which measure operational signal latency, not verified-lead.');
  md.push('');
  md.push('## 9. Source Health');
  md.push('');
  if (universe.length === 0) {
    md.push('_No source telemetry recorded in the window._');
  } else {
    md.push(renderTable(
      ['Source', 'Requests', 'OK', 'Failed', 'Retries', 'Rotation events', 'Persistent failures', 'Ingested', 'Rejected', 'Duplicated'],
      universe.map((src) => {
        const agg = aggregateSource(snapshots, src);
        return [src, String(agg.requests), String(agg.successful), String(agg.failed), String(agg.retries), String(agg.rotationEvents), String(agg.persistentFailures), String(agg.ingested), String(agg.rejected), String(agg.duplicated)];
      })
    ));
    md.push('');
    md.push('Source universe (currently enabled): ' + universe.join(', ') + '. Other families in the operating standard (RBI, SEBI, ECI, Supreme Court, TRAI, ISRO, Defence, Finance) have no live adapter in this deployment and record no telemetry.');
  }
  md.push('');
  md.push('## 10. Incidents');
  md.push('');
  md.push('| Classification | Count |');
  md.push('|----------------|-------|');
  for (const c of INCIDENT_CLASSIFICATIONS) {
    md.push('| ' + c + ' | ' + String(incidentsByClass.get(c) ?? 0) + ' |');
  }
  md.push('');
  if (totals.incidents.length === 0) {
    md.push('_No incidents recorded in the window._');
  } else {
    md.push(renderTable(
      ['Id', 'Classification', 'Source', 'Detected at', 'Status', 'Description'],
      totals.incidents.map((i) => [i.id, i.classification, i.sourceId, i.detectedAt, i.status, i.description])
    ));
  }
  md.push('');
  md.push('## 11. Bottlenecks');
  md.push('');
  md.push('Identified from measured data only (no thresholds assumed):');
  md.push('');
  const bottlenecks: string[] = [];
  if (totals.pullFailures > 0) bottlenecks.push('Feed fetch failures blocked ingestion on ' + String(totals.pullFailures) + ' day(s).');
  if (totals.rotationEvents > 0) bottlenecks.push('Feed-window rotation gaps left releases unobserved on ' + String(totals.rotationEvents) + ' day(s); these are backfill candidates.');
  if (totals.anomalies.some((a) => a.label === 'publication_date_absent')) {
    bottlenecks.push('Source publication dates are absent: publicationTimestamp falls back to ingestion time, so feed-window rotation-gap detection (I2) cannot function on this feed and time-to-publication cannot be measured.');
  }
  if (totals.lifetimeEnd.coverageGapsOpen > 0) bottlenecks.push(String(totals.lifetimeEnd.coverageGapsOpen) + ' coverage gap(s) remain open at end-of-window.');
  if (ackRate !== null && ackRate < 0.5) bottlenecks.push('Alert acknowledgement rate ' + pct(totals.acknowledgedAlerts, totals.alerts) + ' indicates signal-to-human delivery is not closing reliably.');
  if (editorialConversion !== null && editorialConversion === 0 && totals.alerts > 0) bottlenecks.push('Zero editorial actions per alert: alerts are not converting into triage or publication decisions.');
  if (totals.lifetimeEnd.publishedFromAlert === 0 && totals.lifetimeEnd.acknowledgedAlerts > 0) bottlenecks.push('No alert has produced a published knowledge object (published-from-alert = 0).');
  if (bottlenecks.length === 0) bottlenecks.push('No bottleneck evident from measured data in this window.');
  for (const b of bottlenecks) md.push('- ' + b);
  md.push('');
  md.push('## 12. V1.3 Decision');
  md.push('');
  md.push('**Recommended decision: `' + recommendations.v13 + '`**');
  md.push('');
  md.push('- **GO TO V1.3** — only if live data shows a concrete structural weakness: persistent source failures, repeatable rotation gaps with coverage impact, alert overload, high signal-to-action latency, or material false-positive rate.');
  md.push('- **EXTEND OBSERVATION** — the system is healthy but the sample is too small to generalise.');
  md.push('- **HOLD** — the system is stable; keep the current architecture and continue normal observation.');
  md.push('');
  md.push('If V1.3 is justified, archive backfill is the candidate capability and must stay within the existing architecture: `COVERAGE_GAP → backfill scheduler → historical source/archive → canonical ingestion → normal event pipeline`. No parallel system.');
  md.push('');
  md.push('## 13. Anomalies Detected');
  md.push('');
  if (totals.anomalies.length === 0) {
    md.push('_No anomalies detected in the window._');
  } else {
    md.push(renderTable(
      ['Severity', 'Label', 'Detail'],
      totals.anomalies.map((a) => [a.severity, a.label, a.detail])
    ));
  }
  md.push('');
  md.push('## 14. Four Final Questions');
  md.push('');
  md.push('1. **Is the deployed system reliably detecting important events?** ' + (totals.pullsRan === 0 ? 'Not measurable — no pull executed.' : totals.persistentFailures + totals.rotationEvents > 0 ? 'Partially — ' + String(totals.persistentFailures + totals.rotationEvents) + ' coverage event(s) surfaced, but ingestion was otherwise consistent (' + String(totals.pullsRan) + '/' + String(snapshots.length) + ' days pulled).' : 'Yes — every executed pull ingested without a registered coverage gap.'));
  md.push('2. **Does the human actually receive the signal before it matters?** ' + (ackRate === null ? 'Not measurable — no alerts generated in the window.' : ackRate >= 0.5 ? 'Yes — ' + pct(totals.acknowledgedAlerts, totals.alerts) + ' of alerts acknowledged; median time-to-editor ' + fmtMs(medianOf(totals.latencyDays.timeToEditor)) + '.' : 'No — ' + pct(totals.acknowledgedAlerts, totals.alerts) + ' of alerts acknowledged, below the measured reliability band.'));
  md.push('3. **Can the editorial team act without drowning in noise?** ' + (totals.alerts === 0 ? 'Not measurable — no alert volume to assess.' : fpRate === null || fpRate < 0.5 ? 'Yes — false-positive rate ' + (fpRate === null ? 'unknown (no evaluations)' : pct(totals.falsePositives, totals.evaluatedSignals)) + ' and alert volume ' + String(totals.alerts) + ' over the window.' : 'No — false-positive rate ' + pct(totals.falsePositives, totals.evaluatedSignals) + ' risks alert fatigue.'));
  md.push('4. **What would the observation data support changing?** ' + (recommendations.v13 === 'GO TO V1.3' ? 'Concrete structural weakness identified — see V1.3 decision and bottlenecks.' : recommendations.v13 === 'EXTEND OBSERVATION' ? 'Nothing yet — the sample is too small; extend observation before changing the system.' : 'Nothing — the measured system is stable; keep architecture and continue normal operation.'));
  md.push('');
  md.push('## 15. Limitations');
  md.push('');
  md.push('- 7 days is not long-term proof. Statements in this report use only what the window measured; avoid generalising to "permanent", "durable", "systematic", or "proven long-term" claims.');
  md.push('- Live ground-truth recall (coverage recall, silent losses, missed events) requires an independent observer and is **NOT_MEASURED**. The frozen v1.2 holdout values remain the reference.');
  md.push('- This harness observes the **local deployment** (file-persisted state, local PIB pull). Production Vercel/Supabase telemetry is **NOT_MEASURED** in this window and is a different population.');
  md.push('- `medianVerifiedLeadMsReference` (42 min) is a frozen v1.1 historical reference, not a live measurement and not a comparator for time-to-editor.');
  md.push('- Published-from-alert is reported at end-of-window (lifetime) only; the day-level value is NOT_MEASURED because no linking timestamp is recorded in the canonical signal.');
  md.push('- Feed-level duplicate rate is not the same population as the baseline observation-level duplicate rate.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('Generated at ' + new Date().toISOString() + ' by `run-newsroom-observation-report.ts`. Frozen baseline ' + baseline.tag + ' untouched.');
  md.push('');

  return md.join('\n');
}

function aggregateSource(
  snapshots: DailyObservationSnapshot[],
  source: string
): { requests: number; successful: number; failed: number; retries: number; rotationEvents: number; persistentFailures: number; ingested: number; rejected: number; duplicated: number } {
  let requests = 0;
  let successful = 0;
  let failed = 0;
  let retries = 0;
  let rotationEvents = 0;
  let persistentFailures = 0;
  let ingested = 0;
  let rejected = 0;
  let duplicated = 0;
  for (const s of snapshots) {
    const m = s.sourceHealth[source];
    if (!m) continue;
    requests += m.requests;
    successful += m.successfulFetches;
    failed += m.failedFetches;
    retries += m.retries;
    rotationEvents += m.rotationEvents;
    persistentFailures += m.persistentFailures;
    ingested += m.itemsIngested;
    rejected += m.itemsRejected;
    duplicated += m.itemsDuplicated;
  }
  return { requests, successful, failed, retries, rotationEvents, persistentFailures, ingested, rejected, duplicated };
}

function runReport(): void {
  const files = fs
    .readdirSync(path.join('data'))
    .filter((f) => /^newsroom-observation-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => path.join('data', f))
    .sort();

  if (files.length === 0) {
    console.error('[observation] No daily snapshots found in ' + SNAPSHOT_GLOB);
    console.error('[observation] Run `npx tsx scripts/run-newsroom-observation-report.ts snapshot` for each observation day first.');
    process.exit(1);
  }

  const snapshots: DailyObservationSnapshot[] = [];
  let validationFailed = false;
  for (const file of files) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      console.error('[observation] Unparseable snapshot: ' + file + ' — ' + String(err));
      validationFailed = true;
      continue;
    }
    const errors = validateSnapshot(parsed, file);
    if (errors.length > 0) {
      validationFailed = true;
      for (const e of errors) console.error('[observation] VALIDATION: ' + e);
    } else {
      snapshots.push(parsed as DailyObservationSnapshot);
    }
  }

  if (validationFailed) {
    console.error('[observation] Snapshot validation failed. Fix or remove the offending snapshots before generating the report.');
    process.exit(1);
  }

  snapshots.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const totals = aggregate(snapshots);
  const recommendations = recommend(totals);

  const consolidated = {
    window: {
      start: WINDOW_START_DATE,
      end: WINDOW_END_DATE,
      expectedDays: WINDOW_EXPECTED_DAYS + 1,
    },
    baseline: {
      commit: snapshots[0]?.baseline.commit ?? 'unknown',
      version: snapshots[0]?.baseline.version ?? 'unknown',
      tag: snapshots[0]?.baseline.tag ?? 'unknown',
    },
    sourceUniverse: sourceUniverse(snapshots),
    dailySnapshots: snapshots,
    incidents: totals.incidents,
    coverageGaps: totals.gaps,
    signalMetrics: {
      signals: totals.signals,
      alerts: totals.alerts,
      acknowledgedAlerts: totals.acknowledgedAlerts,
      falsePositives: totals.falsePositives,
      evaluatedSignals: totals.evaluatedSignals,
      editorialActions: totals.editorialActions,
      publishedFromAlert: totals.lifetimeEnd.publishedFromAlert,
    },
    editorialMetrics: {
      triageActions: totals.lifetimeEnd.triageActions,
      editorialActionsPerAlert:
        totals.alerts > 0 ? Math.round((totals.editorialActions / totals.alerts) * 1000) / 1000 : null,
      publishedFromAlertRate:
        totals.alerts > 0 ? Math.round((totals.lifetimeEnd.publishedFromAlert / totals.alerts) * 1000) / 1000 : null,
    },
    latencyMetrics: {
      medianTimeToSignalMs: medianOf(totals.latencyDays.timeToSignal.filter((v): v is number => v !== null)),
      medianTimeToAlertMs: medianOf(totals.latencyDays.timeToAlert.filter((v): v is number => v !== null)),
      medianTimeToEditorMs: medianOf(totals.latencyDays.timeToEditor.filter((v): v is number => v !== null)),
      medianTimeToActionMs: medianOf(totals.latencyDays.timeToAction.filter((v): v is number => v !== null)),
      timeToEditorSamples: totals.latencyDays.timeToEditorSamples,
      timeToActionSamples: totals.latencyDays.timeToActionSamples,
    },
    verdict: recommendations,
  };

  fs.writeFileSync(CONSOLIDATED_FILE, JSON.stringify(consolidated, null, 2) + '\n', 'utf8');
  fs.writeFileSync(
    SUMMARY_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        daysRecorded: snapshots.length,
        missingDates: totals.missingDates,
        totals: {
          pullsRan: totals.pullsRan,
          pullFailures: totals.pullFailures,
          retriesAbsorbed: totals.retriesAbsorbed,
          fetched: totals.fetched,
          ingested: totals.ingested,
          duplicates: totals.duplicates,
          rejected: totals.rejected,
          signals: totals.signals,
          alerts: totals.alerts,
          acknowledgedAlerts: totals.acknowledgedAlerts,
          editorialActions: totals.editorialActions,
          falsePositives: totals.falsePositives,
          evaluatedSignals: totals.evaluatedSignals,
          coverageGaps: totals.coverageGaps,
          rotationEvents: totals.rotationEvents,
          persistentFailures: totals.persistentFailures,
        },
        notMeasured: totals.notMeasuredCounts,
        latency: consolidated.latencyMetrics,
        verdict: recommendations.verdict,
        v13: recommendations.v13,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  const report = buildReport(snapshots, totals, recommendations);
  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, report, 'utf8');

  console.log('[observation] Consolidated dataset:  ' + CONSOLIDATED_FILE);
  console.log('[observation] Machine summary:        ' + SUMMARY_FILE);
  console.log('[observation] Report:                 ' + REPORT_FILE);
  console.log('[observation] Verdict:                ' + recommendations.verdict);
  console.log('[observation] V1.3 recommendation:    ' + recommendations.v13);
}

// ── Entry ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'snapshot';
  if (command === 'snapshot') {
    await runSnapshot();
  } else if (command === 'report') {
    runReport();
  } else {
    console.error('Usage: npx tsx scripts/run-newsroom-observation-report.ts [snapshot|report]');
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('[observation] Fatal:', err);
  process.exit(1);
});
