/**
 * ─── The Breakdown OS — Newsroom Intelligence Operational Domain Types ────────
 *
 * Operational layer: Velocity → Signal → Priority → Alert → Queue → Workflow.
 *
 * Fundamental principle:
 * OBSERVATION → CLAIM → STORY CLUSTER → SIGNAL → ALERT
 *
 * Multiple independent observations about one real-world event converge into one
 * explainable StoryCluster and one coherent Signal.
 */

import { IntelRole } from '@/features/auth/roles';

// ── 1. Observations & Ingestion ─────────────────────────────────────────────

export interface NewsroomObservation {
  id: string;
  sourceId: string;
  endpointUrl?: string;
  externalId?: string;
  canonicalUrl?: string;
  title: string;
  snippet: string;
  contentHash: string; // SHA-256 NFKC
  publicationTimestamp: string;
  ingestionTimestamp: string;
  sourceTier: 't1' | 't2' | 't3' | 't4' | 't5';
  isPrimarySource: boolean;
  duplicateState: 'unique' | 'exact_duplicate' | 'near_duplicate';
  duplicateOfId?: string;
  entities: string[];
  metadata?: Record<string, unknown>;
}

// ── 2. Claims in Newsroom Context ───────────────────────────────────────────

export type NewsroomClaimEpistemicStatus =
  | 'fact'
  | 'reported'
  | 'inference'
  | 'analysis'
  | 'speculation'
  | 'unknown';

export type NewsroomClaimVerificationState =
  | 'discovered'
  | 'unverified'
  | 'in_verification'
  | 'corroborated'
  | 'contested'
  | 'verified'
  | 'rejected';

export interface NewsroomExtractedClaim {
  id: string;
  observationId: string;
  statement: string;
  actor?: string;
  action?: string;
  object?: string;
  time?: string;
  place?: string;
  epistemicStatus: NewsroomClaimEpistemicStatus;
  confidence: number; // 0.0 - 1.0
  verificationState: NewsroomClaimVerificationState;
  contradictingClaimIds?: string[];
  supportingEvidenceIds?: string[];
}

// ── 3. Story Cluster (Canonical Event Grouping) ─────────────────────────────

export interface StoryCluster {
  id: string;
  title: string;
  summary: string;
  firstDetectedAt: string;
  lastUpdatedAt: string;
  observationIds: string[];
  sourceIds: string[];
  claimIds: string[];
  entities: string[];
  primarySourceCount: number;
  independentSourceCount: number;
  geographicSpread: string[];
  status: 'active' | 'merging' | 'split' | 'resolved' | 'archived';
  mergedIntoClusterId?: string;
  splitFromClusterId?: string;
}

// ── 4. Velocity Engine ──────────────────────────────────────────────────────

export type VelocityLevel = 'normal' | 'elevated' | 'high' | 'extreme';

export interface StoryVelocity {
  clusterId: string;
  calculatedAt: string;
  observationsPerHour: number;
  independentSourcesCount: number;
  platformCount: number;
  acceleration: number; // derivative of observationsPerHour
  geographicSpreadCount: number;
  primarySourceEmergence: boolean;
  velocityLevel: VelocityLevel;
  velocityScore: number; // 0 - 100
}

// ── 5. Contradiction Engine ─────────────────────────────────────────────────

export interface ClaimContradiction {
  id: string;
  clusterId: string;
  claimIdA: string;
  claimIdB: string;
  statementA: string;
  statementB: string;
  sourceIdA: string;
  sourceIdB: string;
  severity: 'critical' | 'high' | 'medium';
  incompatibleProposition: string;
  detectedAt: string;
  resolved: boolean;
  resolutionNote?: string;
}

// ── 6. Coverage Gap Engine ──────────────────────────────────────────────────

export type CoverageGapType = 'source_gap' | 'taxonomy_gap' | 'entity_gap' | 'temporal_gap';

export interface CoverageGap {
  id: string;
  gapType: CoverageGapType;
  title: string;
  description: string;
  expectedDevelopment: string;
  monitoredEntityOrTopic: string;
  lastCoveredAt?: string;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: string;
  status: 'open' | 'acknowledged' | 'assigned' | 'resolved';
}

// ── 7. Signal Engine & Scoring ──────────────────────────────────────────────

export type SignalLifecycleState =
  | 'discovered'
  | 'monitoring'
  | 'escalated'
  | 'confirmed'
  | 'contested'
  | 'resolved'
  | 'superseded'
  | 'retracted';

export type EditorialPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface SignalComponentScores {
  relevance: number;        // 0 - 100
  importance: number;       // 0 - 100
  novelty: number;          // 0 - 100
  velocity: number;         // 0 - 100
  evidenceStrength: number; // 0 - 100
  confidence: number;       // 0 - 100
  uncertainty: number;      // 0 - 100 (higher = more uncertain)
  misinformationRisk: number; // 0 - 100 (higher = riskier)
  sourceReliability: number;  // 0 - 100
}

export interface SignalPriorityExplanation {
  priority: EditorialPriority;
  compositeScore: number;
  threshold: number;
  triggeredRules: string[];
  whyItMatters: string;
  evidenceBasis: string[];
  recommendedAction: string;
}

export interface NewsroomSignal {
  id: string;
  clusterId: string;
  title: string;
  summary: string;
  firstDetectedAt: string;
  lastUpdatedAt: string;
  lifecycleState: SignalLifecycleState;
  priority: EditorialPriority;
  scores: SignalComponentScores;
  explanation: SignalPriorityExplanation;

  // Aggregated facts
  observationCount: number;
  independentSourceCount: number;
  primarySourceCount: number;
  keyEntities: string[];
  keyClaims: string[];
  contradictionIds: string[];

  // Workflow attributes
  assignedTo?: string;
  assignedAt?: string;
  editorialNotes?: string[];
  linkedStoryId?: string;
  version: number;
}

// ── 8. Alert Engine ─────────────────────────────────────────────────────────

export type AlertTriggerReason =
  | 'first_detection'
  | 'priority_escalation'
  | 'confidence_escalation'
  | 'primary_confirmation'
  | 'major_contradiction'
  | 'major_development'
  | 'resolution';

export interface Phase2Authorization {
  authorizedBy: string;
  authorizedRole: IntelRole;
  authorizationTimestamp: string;
  approvedScope: string;
  approvedRecipients: string[];
  approvedBeats: string[];
  approvedChannels: string[];
  rollbackAuthority: string;
}

export interface NewsroomBeat {
  id: string;
  name: string;
  domains: string[];
  active: boolean;
}

export interface NewsroomBeatRecipient {
  userId: string;
  role: IntelRole;
  beatIds: string[];
  active: boolean;
  notificationPreference: 'immediate' | 'digest' | 'none';
  escalationLevel: number;
}

export interface BeatDeliveryTarget {
  recipientId: string;
  recipientRole: IntelRole;
  beatId: string;
  deliveryStatus: 'delivered' | 'opened' | 'acknowledged' | 'in_review' | 'actioned' | 'escalated' | 'resolved';
  routingReason: string;
  deliveredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface NewsroomEscalationRecord {
  signalId: string;
  previousOwner?: string;
  newOwner: string;
  reason: string;
  timestamp: string;
  actor: string;
}

export interface AlertDeliveryChannel {
  channelType: 'internal_editorial_channel' | 'beat_desk_channel';
  recipientRoles?: ('managing_editor' | 'fact_checker')[];
  deliveryTimestamp: string;
  deliveredBy: string;
  beatDeliveries?: BeatDeliveryTarget[];
}

export interface IntelligenceAlert {
  id: string;
  idempotencyKey: string; // signalId:triggerReason:stateVersion
  signalId: string;
  clusterId: string;
  triggerReason: AlertTriggerReason;
  priority: EditorialPriority;
  title: string;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  shadowMode: boolean;
  delivery?: AlertDeliveryChannel;
}


// ── 9. Editorial Queue ──────────────────────────────────────────────────────

export type QueueSection =
  | 'BREAKING_P0'
  | 'P1_IMPORTANT'
  | 'DEVELOPING'
  | 'NEEDS_VERIFICATION'
  | 'CONTRADICTIONS'
  | 'COVERAGE_GAPS'
  | 'RESOLVED';

export interface EditorialQueueItem {
  id: string;
  section: QueueSection;
  signalId: string;
  priority: EditorialPriority;
  title: string;
  summary: string;
  whyItMatters: string;
  observationCount: number;
  independentSourceCount: number;
  primarySourceCount: number;
  confidence: number;
  velocityLevel: VelocityLevel;
  lastUpdatedAt: string;
  assignedTo?: string;
  status: SignalLifecycleState;
}

// ── 10. Human Editorial Actions ─────────────────────────────────────────────

export type NewsroomTriageAction =
  | 'VERIFY'
  | 'ASSIGN'
  | 'FOLLOW'
  | 'IGNORE'
  | 'MERGE'
  | 'SPLIT'
  | 'MARK_RELEVANT'
  | 'NOT_RELEVANT'
  | 'ESCALATE'
  | 'RESOLVE';

export interface NewsroomActionPayload {
  action: NewsroomTriageAction;
  actorId: string;
  actorName: string;
  signalId: string;
  targetClusterId?: string; // for merge/split
  assignedTo?: string;
  note?: string;
  escalatedPriority?: EditorialPriority;
  mutationId?: string; // for idempotency
  expectedVersion?: number;
}

// ── 11. Source Reputation Feedback ──────────────────────────────────────────

export interface SourceReputationMetrics {
  sourceId: string;
  sourceName: string;
  tier: 't1' | 't2' | 't3' | 't4' | 't5';
  reliabilityScore: number; // 0 - 100
  totalObservationsIngested: number;
  confirmedClaimsCount: number;
  contradictedClaimsCount: number;
  falseAlarmCount: number;
  correctionsIssuedCount: number;
  primarySourceCount: number;
  confirmationRate: number; // 0.0 - 1.0
  falseAlarmRate: number;    // 0.0 - 1.0
  lastEvaluatedAt: string;
}

// ── 12. Persistent Immutable Audit Trail ────────────────────────────────────

export interface NewsroomAuditLogRecord {
  id: string;
  timestamp: string;
  signalId: string;
  clusterId?: string;
  actorId: string;
  actorName: string;
  action: NewsroomTriageAction | 'ALERT_ACK' | 'SYSTEM_STATE_TRANSITION';
  previousState?: string;
  newState?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// ── 13. Newsroom Operational Metrics ────────────────────────────────────────

export interface NewsroomOperationalMetrics {
  observationsPerMinute: number;
  newClustersPerHour: number;
  signalsPerHour: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  alertVolume: number;
  unacknowledgedAlerts: number;
  medianTimeToSignalMs: number;
  medianTimeToAlertMs: number;
  primarySourceConfirmationRate: number;
  contradictionRate: number;
  falseAlertRate: number;
  queueBacklog: number;
  verificationBacklog: number;
  shadowModeActive: boolean;
  generatedAt: string;
  phase2Authorized?: boolean;
  phase2Active?: boolean;
}

// ── 14. Shadow-Mode Editorial Calibration & Benchmark Types ─────────────────

export type EditorialJudgement =
  | 'CORRECT_PRIORITY'
  | 'TOO_HIGH'
  | 'TOO_LOW'
  | 'RELEVANT'
  | 'NOT_RELEVANT'
  | 'DUPLICATE'
  | 'WRONG_ENTITY'
  | 'WRONG_TOPIC'
  | 'NEEDS_VERIFICATION'
  | 'VERIFIED'
  | 'CONTRADICTED'
  | 'FOLLOW'
  | 'IGNORE';

export interface SignalCalibrationRecord {
  id: string;
  signalId: string;
  clusterId: string;
  assignedPriority: EditorialPriority;
  editorJudgement: EditorialJudgement;
  reviewedBy: string;
  reviewedAt: string;
  sourceCount: number;
  independentSourceCount: number;
  primarySourcePresent: boolean;
  evidenceStrength: number;
  velocityScore: number;
  hasContradictions: boolean;
  domain: string;
  notes?: string;
}

export interface CalibrationBenchmarkMetrics {
  totalReviewedSignals: number;
  signalPrecision: number; // Relevant / Total Reviewed
  p0Precision: number;     // Correct P0 / Reviewed P0
  p1Precision: number;     // Correct P1 / Reviewed P1
  falseAlertRate: number;  // Incorrect Alerts / Total Shadow Alerts
  duplicateAlertRate: number; // Duplicate Alerts / Total Alerts
  primaryConfirmationRate: number;
  meanTimeToSignalMs: number;
  meanTimeToAlertMs: number;
  editorAcceptanceRate: number; // (Relevant + Verified + Follow) / Total
  editorRejectionRate: number;  // (Not Relevant + Ignore + Wrong Topic) / Total
  verificationEscalationRate: number;
  contradictionRate: number;
  coverageGapHitRate: number;
  domainPrecision: Record<string, number>;
  sourceTierPrecision: Record<string, number>;
  generatedAt: string;
}

// ── 15. Newsroom Intelligence Scorecard (Operational Observation) ───────────

/**
 * Live operational scorecard for the post-freeze observation period.
 *
 * Every value is a measured baseline computed from canonical state timestamps.
 * No targets are defined. Coverage recall and silent losses are frozen from the
 * v1.2 holdout baseline until a live ground-truth recall audit is performed.
 *
 * Governing document: docs/newsroom/NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 * (Baseline 1.2 freeze + observation-mode section).
 */
export interface NewsroomScorecardObservationPeriod {
  mode: 'live_observation';
  startAt: string | null;
  endAt: string;
  daysElapsed: number;
  /** True when the observation period has elapsed the target window. */
  observationWindowElapsed: boolean;
}

export interface NewsroomScorecardBaselineReference {
  tag: string;
  version: string;
  coverageRecall: number;
  intelligenceRecall: number;
  silentLosses: number;
  falsePositiveGaps: number;
  sourceArtifact: string;
}

export interface NewsroomScorecardMetrics {
  generatedAt: string;
  observationPeriod: NewsroomScorecardObservationPeriod;
  detection: {
    observations: number;
    clusters: number;
    signals: number;
    p0: number;
    p1: number;
    p2: number;
    p3: number;
    duplicateObservations: number;
    duplicateRate: number; // 0.0 - 1.0
  };
  coverage: {
    coverageGapsOpen: number;
    coverageGapsTotal: number;
    criticalOpen: number;
    highOpen: number;
    resolved: number;
  };
  alerts: {
    generated: number;
    acknowledged: number;
    unacknowledged: number;
    acknowledgementRate: number; // 0.0 - 1.0
    shadowMode: boolean;
  };
  editorial: {
    triageActions: number;
    assignedSignals: number;
    resolvedSignals: number;
    falsePositiveJudgements: number;
    falsePositiveRate: number; // 0.0 - 1.0
    publishedFromAlert: number;
    publishedFromAlertRate: number; // 0.0 - 1.0
  };
  latency: {
    medianTimeToSignalMs: number | null;
    medianTimeToAlertMs: number | null;
    /** Editor acknowledgement of an alert: triggeredAt → acknowledgedAt. */
    medianTimeToEditorMs: number | null;
    /** First editor triage action on an alerted signal: triggeredAt → first action. */
    medianTimeToActionMs: number | null;
    /** Frozen v1.1 verified-lead reference (42 min). Not a live measurement. */
    medianVerifiedLeadMsReference: number | null;
    timeToEditorSamples: number;
    timeToActionSamples: number;
  };
  baseline: NewsroomScorecardBaselineReference;
}
