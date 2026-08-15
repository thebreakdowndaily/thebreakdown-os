/**
 * ─── Newsroom Intelligence Scorecard Service ─────────────────────────────────
 *
 * Computes the live operational scorecard for the post-freeze observation
 * period. All values are measured baselines derived from canonical state
 * timestamps — no targets are defined. Coverage recall / intelligence recall /
 * silent losses are frozen from the v1.2 holdout baseline until a live
 * ground-truth recall audit is performed.
 *
 * Governing document: docs/newsroom/NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 * (Baseline 1.2 freeze + observation-mode section).
 *
 * This service is a pure projection. It mutates nothing and depends only on the
 * canonical arrays passed in, which keeps it deterministic and testable.
 */

import {
  NewsroomObservation,
  StoryCluster,
  NewsroomSignal,
  IntelligenceAlert,
  CoverageGap,
  NewsroomAuditLogRecord,
  NewsroomScorecardMetrics,
  NewsroomScorecardBaselineReference,
} from '@/types/newsroom-intelligence';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const OBSERVATION_WINDOW_DAYS = 7;

/** Frozen v1.1 verified-lead reference (42 min), from newsroom-advantage-v1.1-summary.json. */
const V1_1_MEDIAN_VERIFIED_LEAD_MS = 42 * 60 * 1000;

/** Triage actions that constitute an editorial action on an alerted signal. */
export const TRIAGE_ACTIONS: ReadonlySet<string> = new Set([
  'VERIFY',
  'ASSIGN',
  'FOLLOW',
  'IGNORE',
  'MERGE',
  'SPLIT',
  'MARK_RELEVANT',
  'NOT_RELEVANT',
  'ESCALATE',
  'RESOLVE',
]);

/** Actions that classify an alerted signal as a false positive. */
export const FALSE_POSITIVE_ACTIONS: ReadonlySet<string> = new Set([
  'NOT_RELEVANT',
  'IGNORE',
  'WRONG_TOPIC',
  'WRONG_ENTITY',
  'DUPLICATE',
]);

function medianOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function ts(value: string): number {
  return Date.parse(value);
}

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

export interface NewsroomScorecardInput {
  observations: NewsroomObservation[];
  clusters: StoryCluster[];
  signals: NewsroomSignal[];
  alerts: IntelligenceAlert[];
  gaps: CoverageGap[];
  audit: readonly NewsroomAuditLogRecord[];
  baseline: NewsroomScorecardBaselineReference;
  now?: Date;
}

export function computeNewsroomScorecard(input: NewsroomScorecardInput): NewsroomScorecardMetrics {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const { observations, clusters, signals, alerts, gaps, audit, baseline } = input;

  // ── Observation period ──────────────────────────────────────────────────────
  const timestamps: number[] = [
    ...observations.map((o) => ts(o.ingestionTimestamp)),
    ...clusters.map((c) => ts(c.firstDetectedAt)),
    ...signals.map((s) => ts(s.firstDetectedAt)),
    ...alerts.map((a) => ts(a.triggeredAt)),
    ...gaps.map((g) => ts(g.detectedAt)),
  ].filter((t) => !Number.isNaN(t));

  const startAt = timestamps.length > 0 ? Math.min(...timestamps) : null;
  const daysElapsed = startAt !== null ? Math.max(0, (nowMs - startAt) / DAY_MS) : 0;

  // ── Detection ──────────────────────────────────────────────────────────────
  const duplicateObservations = observations.filter((o) => o.duplicateState !== 'unique').length;
  const p0 = signals.filter((s) => s.priority === 'P0').length;
  const p1 = signals.filter((s) => s.priority === 'P1').length;
  const p2 = signals.filter((s) => s.priority === 'P2').length;
  const p3 = signals.filter((s) => s.priority === 'P3').length;

  // ── Coverage ───────────────────────────────────────────────────────────────
  const gapsOpen = gaps.filter((g) => g.status !== 'resolved');
  const coverageGapsOpen = gapsOpen.length;
  const criticalOpen = gapsOpen.filter((g) => g.severity === 'critical').length;
  const highOpen = gapsOpen.filter((g) => g.severity === 'high').length;
  const resolved = gaps.filter((g) => g.status === 'resolved').length;

  // ── Alerts ─────────────────────────────────────────────────────────────────
  const generated = alerts.length;
  const acknowledged = alerts.filter((a) => a.acknowledged).length;
  const unacknowledged = generated - acknowledged;

  // ── Editorial actions ──────────────────────────────────────────────────────
  const triageActions = audit.filter((r) => TRIAGE_ACTIONS.has(r.action)).length;
  const falsePositiveJudgements = audit.filter((r) => FALSE_POSITIVE_ACTIONS.has(r.action)).length;
  const assignedSignals = signals.filter((s) => s.assignedTo).length;
  const resolvedSignals = signals.filter((s) => s.lifecycleState === 'resolved').length;

  const signalById = new Map(signals.map((s) => [s.id, s] as const));
  const signalIdsWithAlert = new Set(alerts.map((a) => a.signalId));
  const publishedFromAlert = signals.filter((s) => !!s.linkedStoryId && signalIdsWithAlert.has(s.id)).length;

  // ── Latency ────────────────────────────────────────────────────────────────
  const clusterById = new Map(clusters.map((c) => [c.id, c] as const));

  const timeToSignalValues = signals
    .map((s) => {
      const cluster = clusterById.get(s.clusterId);
      if (!cluster) return null;
      return ts(s.firstDetectedAt) - ts(cluster.firstDetectedAt);
    })
    .filter((v): v is number => v !== null && v >= 0);

  const timeToAlertValues = alerts
    .map((a) => {
      const sig = signalById.get(a.signalId);
      if (!sig) return null;
      return ts(a.triggeredAt) - ts(sig.firstDetectedAt);
    })
    .filter((v): v is number => v !== null && v >= 0);

  // Time-to-editor: alert triggered → acknowledged.
  const timeToEditorValues = alerts
    .filter((a): a is IntelligenceAlert & { acknowledgedAt: string } => a.acknowledged && typeof a.acknowledgedAt === 'string')
    .map((a) => ts(a.acknowledgedAt) - ts(a.triggeredAt))
    .filter((v) => v >= 0);

  // Time-to-action: alert triggered → first editor triage action on the signal.
  const auditBySignal = new Map<string, NewsroomAuditLogRecord[]>();
  for (const record of audit) {
    if (!TRIAGE_ACTIONS.has(record.action)) continue;
    const list = auditBySignal.get(record.signalId) ?? [];
    list.push(record);
    auditBySignal.set(record.signalId, list);
  }
  const timeToActionValues = alerts
    .map((a) => {
      const actions = auditBySignal.get(a.signalId);
      if (!actions || actions.length === 0) return null;
      const earliest = Math.min(...actions.map((r) => ts(r.timestamp)));
      return earliest - ts(a.triggeredAt);
    })
    .filter((v): v is number => v !== null && v >= 0);

  return {
    generatedAt: now.toISOString(),
    observationPeriod: {
      mode: 'live_observation',
      startAt: startAt !== null ? new Date(startAt).toISOString() : null,
      endAt: now.toISOString(),
      daysElapsed: Math.round(daysElapsed * 10) / 10,
      observationWindowElapsed: daysElapsed >= OBSERVATION_WINDOW_DAYS,
    },
    detection: {
      observations: observations.length,
      clusters: clusters.length,
      signals: signals.length,
      p0,
      p1,
      p2,
      p3,
      duplicateObservations,
      duplicateRate: rate(duplicateObservations, observations.length),
    },
    coverage: {
      coverageGapsOpen,
      coverageGapsTotal: gaps.length,
      criticalOpen,
      highOpen,
      resolved,
    },
    alerts: {
      generated,
      acknowledged,
      unacknowledged,
      acknowledgementRate: rate(acknowledged, generated),
      shadowMode: alerts.length > 0 ? alerts.some((a) => a.shadowMode) : true,
    },
    editorial: {
      triageActions,
      assignedSignals,
      resolvedSignals,
      falsePositiveJudgements,
      falsePositiveRate: rate(falsePositiveJudgements, triageActions),
      publishedFromAlert,
      publishedFromAlertRate: rate(publishedFromAlert, generated),
    },
    latency: {
      medianTimeToSignalMs: medianOf(timeToSignalValues),
      medianTimeToAlertMs: medianOf(timeToAlertValues),
      medianTimeToEditorMs: medianOf(timeToEditorValues),
      medianTimeToActionMs: medianOf(timeToActionValues),
      medianVerifiedLeadMsReference: V1_1_MEDIAN_VERIFIED_LEAD_MS,
      timeToEditorSamples: timeToEditorValues.length,
      timeToActionSamples: timeToActionValues.length,
    },
    baseline,
  };
}
