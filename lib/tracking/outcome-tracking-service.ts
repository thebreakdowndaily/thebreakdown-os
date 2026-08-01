// ── Outcome Tracking Service (Phase 26A WP2) ───────────────────────────────────

import { LongitudinalMetricNode, MetricDataPoint, ImplementationRevisionMarker } from '../../types/outcome-tracking';

export class OutcomeTrackingService {
  /**
   * Composes canonical Knowledge Objects into pure, non-mutating LongitudinalMetricNode structures.
   */
  public static getCanonicalMetrics(): readonly LongitudinalMetricNode[] {
    const points1: MetricDataPoint[] = [
      {
        pointId: 'pt-1949',
        timestamp: '1949-01-01',
        label: '1949 Baseline',
        value: 100,
        unit: 'Index Baseline',
        evidenceSourceTitle: 'Karachi Ceasefire Agreement Document & Observer Logs',
      },
      {
        pointId: 'pt-1972',
        timestamp: '1972-07-02',
        label: '1972 Simla Milestone',
        value: 75,
        unit: 'Index Baseline',
        evidenceSourceTitle: 'Simla Agreement Bilateral Treaty Text',
      },
      {
        pointId: 'pt-2003',
        timestamp: '2003-11-25',
        label: '2003 Renewal',
        value: 40,
        unit: 'Index Baseline',
        evidenceSourceTitle: 'Ministry of Defence Ceasefire Renewal Statements',
      },
      {
        pointId: 'pt-2026',
        timestamp: '2026-07-01',
        label: 'Current Status',
        value: 35,
        unit: 'Index Baseline',
        evidenceSourceTitle: 'Official Diplomatic Briefings & UNMOGIP Reports',
      },
    ];

    const revisions1: ImplementationRevisionMarker[] = [
      {
        revisionId: 'rev-1972',
        revisionDate: '1972-07-02',
        title: 'Simla Accord Re-classification',
        description: 'Transitioned Ceasefire Line (CFL) into Line of Control (LoC) with bilateral dispute resolution priority.',
        officialNotificationTitle: 'Government of India Treaty Series No. 12 (1972)',
        observedPostChangeNote: 'Stabilized border management procedures for three decades.',
      },
      {
        revisionId: 'rev-2003',
        revisionDate: '2003-11-25',
        title: 'LoC Ceasefire Understanding Renewal',
        description: 'Bilateral agreement to halt cross-border artillery firing along the Line of Control.',
        officialNotificationTitle: 'Joint India-Pakistan Press Statement (Nov 2003)',
        observedPostChangeNote: 'Observed reduction in civilian casualties along border sectors.',
      },
    ];

    const borderMetric: LongitudinalMetricNode = {
      metricId: 'met-border-stability-index',
      metricTitle: 'Line of Control Incident Index',
      resolution: 'ANNUAL',
      baselineValue: 100,
      currentValue: 35,
      unit: 'Index Points',
      trend: 'IMPROVING',
      trendReason: 'Sustained decline in reported ceasefire violations relative to 1949 baseline.',
      attributionLimitation:
        'Multiple concurrent political and diplomatic initiatives prevent attributing metric decline solely to bilateral ceasefire agreements.',
      timeSeries: Object.freeze(points1.map((p) => Object.freeze({ ...p }))),
      revisions: Object.freeze(revisions1.map((r) => Object.freeze({ ...r }))),
      relatedProblemSlugs: Object.freeze(['kashmir-1947-un-reference']),
      relatedFixIds: Object.freeze(['FIX-DOM-001']),
    };

    return Object.freeze([Object.freeze(borderMetric)]);
  }

  public static getMetricById(metricId: string): LongitudinalMetricNode | undefined {
    return this.getCanonicalMetrics().find((m) => m.metricId === metricId);
  }
}
