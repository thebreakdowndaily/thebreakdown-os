/**
 * Sprint 2 — Reusable Tracker Architecture
 * Defines canonical data contracts for policy & issue trackers.
 */

export interface TrackerDataPoint {
  label: string;
  value: string;
  source: string;
  asOf: string;
}

export interface TrackerChange {
  date: string;
  title: string;
  description: string;
  impact: 'critical' | 'major' | 'minor';
  source: string;
}

export interface TrackerTimelineEvent {
  date: string;
  title: string;
  description: string;
  source: string;
  category: 'legislation' | 'policy' | 'data' | 'event' | 'industry';
}

export interface TrackerEvidenceChain {
  claim: string;
  confidence: 'established' | 'strong' | 'contested';
  source: string;
  lastVerified: string;
  counterargument?: string;
  documentTitle?: string;
  documentUrl?: string;
}

export interface TrackerDocument {
  title: string;
  type: 'act' | 'notification' | 'report' | 'audit' | 'data' | 'guideline' | 'decision';
  date: string;
  url?: string;
  summary: string;
  publisher?: string;
  pageCount?: number;
  keyClauses?: string[];
}

export interface TrackerTimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrackerTimeSeries {
  id: string;
  title: string;
  subtitle?: string;
  unit: string;
  source: string;
  frequency?: string;
  data: TrackerTimeSeriesDataPoint[];
}

export interface TrackerDefinition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  topic: string;
  topicSlug: string;
  currentStatus: string;
  lastUpdated: string;
  lastVerifiedBy: string;
  keyDataPoints: TrackerDataPoint[];
  recentChanges: TrackerChange[];
  timeline: TrackerTimelineEvent[];
  evidenceChain: TrackerEvidenceChain[];
  documents: TrackerDocument[];
  relatedStorySlugs: string[];
  relatedEntityIds: string[];
  timeSeries?: TrackerTimeSeries[];
}

export type TrackerSummary = Pick<
  TrackerDefinition,
  'id' | 'slug' | 'title' | 'subtitle' | 'topic' | 'topicSlug' | 'currentStatus' | 'lastUpdated'
>;
