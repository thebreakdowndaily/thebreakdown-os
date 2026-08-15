/**
 * ─── Newsroom Intelligence Persistence — Canonical Durable State ─────────────
 *
 * Governing document: NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §21
 * (Persistence & Durability) and §20 (Append-Only Audit Ledger).
 *
 * TBIOS forbids process-local variables as the authoritative source of truth.
 * This module defines the serializable, versioned snapshot that every provider
 * (memory / file / future supabase) must persist and restore. The snapshot is
 * written after every authoritative state mutation and reloaded on bootstrap so
 * worker restarts yield zero state loss.
 */

import {
  StoryCluster,
  NewsroomObservation,
  NewsroomExtractedClaim,
  NewsroomSignal,
  CoverageGap,
  IntelligenceAlert,
  NewsroomAuditLogRecord,
  NewsroomBeat,
  NewsroomBeatRecipient,
  Phase2Authorization,
  NewsroomEscalationRecord,
  SourceReputationMetrics,
} from '@/types/newsroom-intelligence';

export const NEWSROOM_STATE_VERSION = 1 as const;

/**
 * Per-recipient alert fatigue telemetry (rolling windows enforced via deliveredAt).
 */
export interface UserFatigueSnapshot {
  alertsToday: number;
  alertsPerHour: number;
  p0Count: number;
  p1Count: number;
  acknowledgements: number;
  actions: number;
  ignores: number;
  duplicatesSkipped: number;
  /** Alerts suppressed because the recipient breached the fatigue policy caps. */
  fatigueSuppressed: number;
  /** Rolling delivery timestamps used to enforce the 3/hr and 15/day caps. */
  deliveredAt: string[];
}

export interface BeatFatigueSnapshot {
  alertVolume: number;
  signalVolume: number;
  queueVolume: number;
  falseAlerts: number;
  missedImportantEvents: number;
  /** Alerts suppressed because the beat breached the 5/day cap. */
  suppressedAlerts: number;
  /** Rolling delivery timestamps used to enforce the 5/day beat cap. */
  deliveredAt: string[];
}

export interface NewsroomFatigueTelemetry {
  userFatigue: Record<string, UserFatigueSnapshot>;
  beatFatigue: Record<string, BeatFatigueSnapshot>;
}

export interface NewsroomEngineSnapshot {
  shadowMode: boolean;
  phase1InternalAlertingActive: boolean;
  killSwitchEngaged: boolean;
}

export interface NewsroomPersistedState {
  version: typeof NEWSROOM_STATE_VERSION;
  savedAt: string;
  observations: NewsroomObservation[];
  claims: NewsroomExtractedClaim[];
  clusters: StoryCluster[];
  signals: NewsroomSignal[];
  gaps: CoverageGap[];
  alerts: IntelligenceAlert[];
  audit: NewsroomAuditLogRecord[];
  beats: NewsroomBeat[];
  recipients: NewsroomBeatRecipient[];
  authorization: Phase2Authorization | null;
  escalations: NewsroomEscalationRecord[];
  fatigue: NewsroomFatigueTelemetry;
  sourceReputations: SourceReputationMetrics[];
  engine: NewsroomEngineSnapshot;
}

export function emptyPersistedState(): NewsroomPersistedState {
  return {
    version: NEWSROOM_STATE_VERSION,
    savedAt: new Date().toISOString(),
    observations: [],
    claims: [],
    clusters: [],
    signals: [],
    gaps: [],
    alerts: [],
    audit: [],
    beats: [],
    recipients: [],
    authorization: null,
    escalations: [],
    fatigue: { userFatigue: {}, beatFatigue: {} },
    sourceReputations: [],
    engine: {
      shadowMode: true,
      phase1InternalAlertingActive: false,
      killSwitchEngaged: false,
    },
  };
}

export function emptyUserFatigue(): UserFatigueSnapshot {
  return {
    alertsToday: 0,
    alertsPerHour: 0,
    p0Count: 0,
    p1Count: 0,
    acknowledgements: 0,
    actions: 0,
    ignores: 0,
    duplicatesSkipped: 0,
    fatigueSuppressed: 0,
    deliveredAt: [],
  };
}

export function emptyBeatFatigue(): BeatFatigueSnapshot {
  return {
    alertVolume: 0,
    signalVolume: 0,
    queueVolume: 0,
    falseAlerts: 0,
    missedImportantEvents: 0,
    suppressedAlerts: 0,
    deliveredAt: [],
  };
}

export interface NewsroomStateRepository {
  readonly kind: 'memory' | 'file' | 'supabase';
  load(): NewsroomPersistedState | null | Promise<NewsroomPersistedState | null>;
  save(state: NewsroomPersistedState): void | Promise<void>;
}
