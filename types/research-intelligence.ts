/**
 * ─── The Breakdown OS — Research Intelligence Engine (RIE) — Domain Types ─────
 *
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * First-class research subsystem types. Follows the same convention as
 * types/newsroom-intelligence.ts: a dedicated, additive type surface for one
 * intelligence domain. The canonical knowledge registries (types/canonical.ts)
 * remain the frozen source of truth for published knowledge; RIE types model
 * the *research* universe — signal vs discovery vs source vs document vs
 * claim vs evidence — before anything is promoted to canonical form.
 *
 * Principles enforced structurally:
 *   1. Discovery ≠ evidence (SourceClass + ResearchSourceStatus)
 *   2. Source hierarchy is explicit (ResearchSourceClass)
 *   3. Attribution is preserved (ResearchClaim.attribution)
 *   4. Contradictions are never silently resolved (ResearchContradiction)
 *   5. Unavailable sources are marked, never fabricated (ACCESS_UNAVAILABLE)
 *   6. Provenance survives end to end (claim → evidence → document → source → URL)
 */

// ── 1. Source hierarchy ──────────────────────────────────────────────────────

/** Explicit source classes. Social posts must never automatically become evidence. */
export type ResearchSourceClass =
  | 'PRIMARY'
  | 'OFFICIAL'
  | 'REGULATORY'
  | 'JUDICIAL'
  | 'PARLIAMENTARY'
  | 'ACADEMIC'
  | 'HIGH_QUALITY_SECONDARY'
  | 'SPECIALIST_MEDIA'
  | 'GENERAL_MEDIA'
  | 'SOCIAL'
  | 'USER_PROVIDED'
  | 'UNKNOWN';

export type ResearchSourceType =
  | 'WEB_SEARCH'
  | 'NEWS'
  | 'RSS'
  | 'GOVERNMENT'
  | 'PARLIAMENT'
  | 'COURTS'
  | 'REGULATORS'
  | 'ACADEMIC'
  | 'BOOKS'
  | 'REPORTS'
  | 'DATASETS'
  | 'VIDEO'
  | 'PODCAST'
  | 'SOCIAL'
  | 'USER_UPLOAD'
  | 'ARCHIVE';

export type ResearchAdapterCapability = 'discover' | 'fetch' | 'search';

export type ResearchSourceStatus =
  | 'DISCOVERED'
  | 'FETCHED'
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'ACCESS_UNAVAILABLE'
  | 'FAILED'
  | 'DELETED'
  | 'CHANGED';

// ── 2. Query model ───────────────────────────────────────────────────────────

export type ResearchQueryCategory =
  | 'EXACT'
  | 'SYNONYM'
  | 'ENTITY'
  | 'EVENT'
  | 'HISTORICAL'
  | 'PRIMARY_SOURCE'
  | 'GOVERNMENT'
  | 'ACADEMIC'
  | 'NEWS'
  | 'SOCIAL'
  | 'STATISTICS'
  | 'LEGAL'
  | 'REGULATORY'
  | 'LOCAL'
  | 'LANGUAGE_SPECIFIC'
  | 'DOCUMENT_TYPE'
  | 'OFFICIAL';

export interface ResearchQuery {
  id: string;
  text: string;
  category: ResearchQueryCategory;
  sourceType: ResearchSourceType;
  generatedAt: string;
  usedInRuns: string[];
  /**
   * Why this query exists (query-family provenance, RIE v1.2). Present on
   * primary-source discovery queries so each generated query is reviewable.
   */
  reason?: string;
}

/** Topic family used to target primary-source document types (RIE v1.2). */
export type PrimarySourceFamily =
  | 'POLICY'
  | 'PARLIAMENT'
  | 'REGULATORY'
  | 'COURT'
  | 'GOVERNMENT_ACTION'
  | 'GENERIC';

/** Registry-derived source context for domain-targeted (OFFICIAL) queries. */
export interface ResearchSourceContextEntry {
  domain: string;
  authorityClass: ResearchSourceClass;
  documentTypes?: string[];
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
}

// ── 3. Topic intelligence ────────────────────────────────────────────────────

export type TopicEntityType =
  | 'COUNTRY'
  | 'GOVERNMENT'
  | 'MINISTRY'
  | 'ORGANIZATION'
  | 'COMPANY'
  | 'PERSON'
  | 'INSTITUTION'
  | 'TRADE_BODY'
  | 'REGION'
  | 'UNKNOWN';

export interface TopicEntity {
  name: string;
  type: TopicEntityType;
  aliases: string[];
}

export interface TopicExpansion {
  canonical: string;
  synonyms: string[];
  entities: TopicEntity[];
  concepts: string[];
  historicalReferences: string[];
  geographicExpansion: string[];
  temporalExpansion: string[];
  expandedAt: string;
}

// ── 4. Research project ──────────────────────────────────────────────────────

export type ResearchProjectStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type ResearchMonitoringFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY';

export interface ResearchProjectScope {
  dateRange?: { start?: string; end?: string };
  geographicScope: string[];
  languages: string[];
}

export interface ResearchProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  researchQuestion?: string;
  status: ResearchProjectStatus;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  monitoringEnabled: boolean;
  monitoringFrequency: ResearchMonitoringFrequency;
  scope: ResearchProjectScope;
  sourcePolicy: {
    allowSocial: boolean;
    sourceClasses: ResearchSourceClass[];
  };
  topics: TopicExpansion | null;
  queries: ResearchQuery[];
  sourceIds: string[];
  documentIds: string[];
  claimIds: string[];
  evidenceIds: string[];
  entityIds: string[];
  contradictionIds: string[];
  gapIds: string[];
  timelineEventIds: string[];
  questionIds: string[];
  socialSignalIds: string[];
  clusterIds: string[];
  runIds: string[];
  lastDiscoveryAt?: string;
  lastMeaningfulChangeAt?: string;
  version: number;
}

// ── 5. Source ────────────────────────────────────────────────────────────────

export interface ResearchSource {
  id: string;
  projectId: string;
  title: string;
  publisher?: string;
  author?: string;
  publishedAt?: string;
  discoveredAt: string;
  url: string;
  canonicalUrl: string;
  sourceType: ResearchSourceType;
  sourceClass: ResearchSourceClass;
  language?: string;
  snippet?: string;
  queryId?: string;
  queryText?: string;
  queryCategory?: ResearchQueryCategory;
  adapter: string;
  relevanceScore: number;
  authorityScore: number;
  freshnessScore: number;
  status: ResearchSourceStatus;
  etag?: string;
  lastModified?: string;
  contentHash?: string;
  /** When this source is a syndicated copy, the canonical id of the original. */
  syndicatedFrom?: string;
  /** Canonical ids of copies of this source. */
  syndicatedCopies: string[];
  verifiedAt?: string;
  verifiedBy?: string;
  failureReason?: string;
}

// ── 6. Document ──────────────────────────────────────────────────────────────

export type ResearchDocumentFormat =
  | 'HTML'
  | 'PDF'
  | 'DOC'
  | 'TXT'
  | 'CSV'
  | 'JSON'
  | 'XML'
  | 'UNKNOWN';

export type ResearchDocumentParseStatus = 'PARSED' | 'PARSE_FAILED' | 'OCR_REQUIRED' | 'EMPTY';

export interface ResearchDocument {
  id: string;
  projectId: string;
  sourceId: string;
  title: string;
  url: string;
  canonicalUrl: string;
  format: ResearchDocumentFormat;
  contentHash: string;
  rawText: string;
  normalizedText: string;
  language?: string;
  publishedAt?: string;
  retrievedAt: string;
  wordCount: number;
  parseStatus: ResearchDocumentParseStatus;
  parseError?: string;
  metadata: Record<string, string>;
  provenance: {
    sourceUrl: string;
    canonicalUrl: string;
    retrievedAt: string;
    contentHash: string;
    method: 'FETCH' | 'USER_UPLOAD' | 'ADAPTER';
  };
}

// ── 7. Claims ────────────────────────────────────────────────────────────────

export type ResearchClaimType =
  | 'FACT'
  | 'STATISTIC'
  | 'QUOTE'
  | 'FORECAST'
  | 'OPINION'
  | 'ALLEGATION'
  | 'DENIAL'
  | 'INTERPRETATION'
  | 'CAUSAL_CLAIM'
  | 'COMPARISON'
  | 'PREDICTION';

export type ResearchClaimVerificationState =
  | 'SIGNAL_ONLY'
  | 'UNVERIFIED'
  | 'PARTIALLY_CORROBORATED'
  | 'CORROBORATED'
  | 'PRIMARY_SOURCE_CONFIRMED'
  | 'FALSE_OR_MISLEADING'
  | 'DISPUTED';

export interface ResearchClaim {
  id: string;
  projectId: string;
  claimText: string;
  normalizedClaim: string;
  documentId: string;
  sourceId: string;
  /** The exact span (sentence/paragraph) inside the document that supports the claim. */
  evidenceSpan: string;
  speaker?: string;
  claimType: ResearchClaimType;
  temporalScope?: string;
  geographicScope?: string;
  entityMentions: string[];
  extractionConfidence: number;
  attribution: {
    isAttributed: boolean;
    attributionSource?: string;
    statement: string;
  };
  verificationState: ResearchClaimVerificationState;
  clusterId?: string;
  contradictionIds: string[];
  firstSeenAt: string;
  lastVerifiedAt?: string;
  originalClaimText?: string;
  originalLanguage?: string;
  translatedClaimText?: string;
  translationMethod?: 'STATIC_MAP' | 'NONE';
  translationStatus?: 'TRANSLATED' | 'PARTIALLY_TRANSLATED' | 'UNTRANSLATED';
}

// ── 8. Evidence ──────────────────────────────────────────────────────────────

export interface ResearchEvidenceLocator {
  page?: number;
  paragraph?: number;
  section?: string;
  timestamp?: string;
  postId?: string;
  url?: string;
}

export interface ResearchEvidence {
  id: string;
  projectId: string;
  claimId: string;
  documentId: string;
  sourceId: string;
  locator: ResearchEvidenceLocator;
  excerpt: string;
  retrievalTimestamp: string;
  qualityScore: number;
  originalEvidence?: string;
  translatedEvidence?: string;
  originalLanguage?: string;
  translationMethod?: 'STATIC_MAP' | 'NONE';
  translationStatus?: 'TRANSLATED' | 'PARTIALLY_TRANSLATED' | 'UNTRANSLATED';
}

// ── 9. Events / timeline ─────────────────────────────────────────────────────

export type ResearchDatePrecision = 'EXACT' | 'MONTH' | 'YEAR' | 'RANGE' | 'UNKNOWN';

export interface ResearchEvent {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  date?: string;
  datePrecision: ResearchDatePrecision;
  dateRange?: { start?: string; end?: string };
  entityMentions: string[];
  claimIds: string[];
  sourceIds: string[];
  confidence: number;
}

// ── 10. Research questions ───────────────────────────────────────────────────

export type ResearchQuestionStatus = 'UNANSWERED' | 'PARTIALLY_ANSWERED' | 'ANSWERED';

export interface ResearchQuestion {
  id: string;
  projectId: string;
  question: string;
  status: ResearchQuestionStatus;
  relatedClaimIds: string[];
  evidenceCount: number;
  remainingGap?: string;
  createdAt: string;
  updatedAt: string;
}

// ── 11. Contradictions ───────────────────────────────────────────────────────

export type ContradictionClassification =
  | 'TRUE_CONTRADICTION'
  | 'DEFINITION_MISMATCH'
  | 'TEMPORAL_DIFFERENCE'
  | 'SCOPE_DIFFERENCE'
  | 'UNRESOLVED';

export type ContradictionStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface ResearchContradiction {
  id: string;
  projectId: string;
  claimIdA: string;
  claimIdB: string;
  statementA: string;
  statementB: string;
  sourceIdA: string;
  sourceIdB: string;
  metric?: string;
  valueA?: string;
  valueB?: string;
  classification: ContradictionClassification;
  possibleExplanation?: string;
  status: ContradictionStatus;
  detectedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  nextAction: string;
}

// ── 12. Research gaps ────────────────────────────────────────────────────────

export type ResearchGapType =
  | 'UNKNOWN'
  | 'MISSING_PRIMARY_SOURCE'
  | 'UNVERIFIED_CLAIM'
  | 'CONTRADICTION'
  | 'STALE_DATA'
  | 'MISSING_GEOGRAPHY'
  | 'MISSING_ACTOR'
  | 'MISSING_TIMELINE'
  | 'INSUFFICIENT_CORROBORATION';

export type ResearchGapSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ResearchGapStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface ResearchGap {
  id: string;
  projectId: string;
  type: ResearchGapType;
  severity: ResearchGapSeverity;
  title: string;
  description: string;
  relatedClaimIds: string[];
  relatedEntityMentions: string[];
  evidenceCount: number;
  recommendedAction: string;
  suggestedQueries: string[];
  status: ResearchGapStatus;
  detectedAt: string;
  resolvedAt?: string;
}

// ── 13. Social signals ───────────────────────────────────────────────────────

export type SocialSignalStatus =
  | 'SIGNAL_ONLY'
  | 'UNVERIFIED'
  | 'PARTIALLY_CORROBORATED'
  | 'CORROBORATED'
  | 'PRIMARY_SOURCE_CONFIRMED'
  | 'FALSE_OR_MISLEADING'
  | 'DISPUTED';

export interface SocialSignal {
  id: string;
  projectId: string;
  platform: string;
  postId: string;
  permalink?: string;
  author: string;
  text: string;
  postedAt: string;
  discoveredAt: string;
  engagement: { likes?: number; shares?: number; comments?: number; views?: number };
  /** Drives urgency/discovery priority only — never the evidence or truth score. */
  velocityScore: number;
  topicClassified: string[];
  status: SocialSignalStatus;
  derivedClaimId?: string;
  originSourceId?: string;
}

// ── 14. Corroboration ────────────────────────────────────────────────────────

export interface CorroborationCluster {
  id: string;
  projectId: string;
  claimIds: string[];
  proposition: string;
  status: ResearchClaimVerificationState;
  sourceCount: number;
  independentSourceCount: number;
  primarySourceCount: number;
  hasPrimarySource: boolean;
  firstSeenAt: string;
}

// ── 15. Runs / observability ─────────────────────────────────────────────────

export type ResearchStageName =
  | 'topic-expand'
  | 'query-generate'
  | 'source-discover'
  | 'source-deduplicate'
  | 'document-fetch'
  | 'document-normalize'
  | 'claim-extract'
  | 'evidence-link'
  | 'corroborate'
  | 'contradiction-detect'
  | 'timeline-build'
  | 'gap-detect'
  | 'change-detect';

export interface ResearchRunStage {
  name: ResearchStageName;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  counts: Record<string, number>;
  errors: string[];
}

export type ResearchRunStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
export type ResearchRunTrigger = 'MANUAL' | 'SCHEDULED' | 'NEWS_INTELLIGENCE';

export interface ResearchRun {
  id: string;
  projectId: string;
  triggeredBy: string;
  trigger: ResearchRunTrigger;
  startedAt: string;
  completedAt?: string;
  status: ResearchRunStatus;
  stages: ResearchRunStage[];
  queriesGenerated: number;
  sourcesDiscovered: number;
  sourcesFetched: number;
  documentsProcessed: number;
  duplicatesRemoved: number;
  claimsExtracted: number;
  claimsCorroborated: number;
  contradictionsFound: number;
  gapsFound: number;
  errors: string[];
}

// ── 16. Scoring (components kept separate — never a mysterious single score) ─

export interface ResearchScoreComponents {
  relevance: number;
  authority: number;
  freshness: number;
  primarySourceProximity: number;
  independence: number;
  corroboration: number;
  specificity: number;
  uncertainty: number;
  impact: number;
  novelty: number;
}

export interface ResearchPriorityScore {
  value: number;
  components: ResearchScoreComponents;
  explanation: string[];
}

export interface SourceQuality {
  authority: number;
  primarySource: number;
  directness: number;
  transparency: number;
  methodology: number;
  freshness: number;
  independence: number;
  corroboration: number;
  overall: number;
}

// ── 17. Change detection / monitoring ────────────────────────────────────────

export type ResearchChangeType =
  | 'NEW_PRIMARY_SOURCE'
  | 'NEW_MAJOR_EVENT'
  | 'CLAIM_CHANGED'
  | 'CONTRADICTION_FOUND'
  | 'IMPORTANT_ACTOR_STATEMENT'
  | 'DATA_UPDATED'
  | 'BREAKING_DEVELOPMENT'
  | 'RESEARCH_GAP_RESOLVED';

export type ResearchChangeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ResearchChangeEvent {
  id: string;
  projectId: string;
  type: ResearchChangeType;
  title: string;
  description: string;
  severity: ResearchChangeSeverity;
  relatedIds: string[];
  detectedAt: string;
}

// ── 18. Research pack export ─────────────────────────────────────────────────

export type ResearchPackFormat = 'markdown' | 'json' | 'csv';

export interface ResearchPackExport {
  projectId: string;
  generatedAt: string;
  generatedBy: string;
  format: ResearchPackFormat;
  content: string;
}

// ── 19. Story OS integration ─────────────────────────────────────────────────

export interface ResearchStoryBrief {
  id: string;
  projectId: string;
  generatedAt: string;
  generatedBy: string;
  title: string;
  summary: string;
  researchQuestions: Array<{ question: string; status: ResearchQuestionStatus }>;
  keyClaims: Array<{
    claimId: string;
    claimText: string;
    verificationState: ResearchClaimVerificationState;
    evidenceCount: number;
    sources: Array<{
      sourceId: string;
      title: string;
      url: string;
      sourceClass: ResearchSourceClass;
    }>;
  }>;
  timeline: Array<{ date?: string; datePrecision: ResearchDatePrecision; title: string }>;
  entities: string[];
  contradictions: ResearchContradiction[];
  researchGaps: ResearchGap[];
  provenance: {
    methodologyVersion: string;
    generatedFromResearchProjectId: string;
    claimEvidenceLineage: Array<{
      claimId: string;
      evidenceId: string;
      documentId: string;
      sourceId: string;
      url: string;
    }>;
  };
}

// ── 20. Project overview (workspace projection) ──────────────────────────────

export interface ResearchProjectOverview {
  project: ResearchProject;
  sourceCount: number;
  primarySourceCount: number;
  verifiedClaims: number;
  unverifiedClaims: number;
  corroboratedClaims: number;
  contradictions: number;
  openResearchGaps: number;
  events: number;
  documents: number;
  evidence: number;
  questions: number;
  socialSignals: number;
  clusters: number;
  recentDevelopments: ResearchChangeEvent[];
  latestRun: ResearchRun | null;
}

// ── 21. Research Source Registry & governance ────────────────────────────────
//
// The source registry is the editorial-governed list of discovery surfaces for
// production research. Source activation is an editorial decision, never an
// engineering default. Only APPROVED and ACTIVE sources participate in
// production discovery.

export type ResearchSourceApprovalState =
  | 'PROPOSED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'RETIRED';

export type ResearchSourceRefreshPolicy = 'HOURLY' | 'DAILY' | 'WEEKLY';

/** Transport configured for production discovery. */
export type ResearchDiscoveryProtocol = 'RSS' | 'ATOM' | 'API' | 'HTML';

/** Validation concerns the configured transport, not the source's authority. */
export type ResearchSourceValidationStatus = 'VALIDATED' | 'UNVALIDATED';

export interface ResearchSourceDefinition {
  id: string;
  name: string;
  publisher: string;
  sourceType: ResearchSourceType;
  adapter: string;
  url: string;
  canonicalDomain: string;
  jurisdiction?: string;
  language?: string;
  authorityClass: ResearchSourceClass;
  primarySource: boolean;
  enabled: boolean;
  topics: string[];
  geographies: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  refreshPolicy: ResearchSourceRefreshPolicy;
  discoveryProtocol?: ResearchDiscoveryProtocol;
  /** Only validated RSS/Atom endpoints are sent to the RSS adapter. */
  validationStatus?: ResearchSourceValidationStatus;
  /** Primary-source document types this feed can carry (e.g. Act, Judgment). */
  documentTypes?: string[];
  notes?: string;
  /** Editorial rationale for inclusion. Required once approvalStatus is set. */
  rationale?: string;
  approvalStatus: ResearchSourceApprovalState;
  approvedBy?: string;
  approvedAt?: string;
}

export type ResearchSourceHealthStatus =
  | 'HEALTHY_WITH_ITEMS'
  | 'HEALTHY_EMPTY'
  | 'UNAVAILABLE'
  | 'INVALID_FEED'
  | 'PARSE_ERROR'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'UNVALIDATED'
  | 'DISABLED';

/** Runtime health of a registry feed. Persisted in memory in v1 (see source-governance). */
export interface ResearchSourceHealth {
  sourceId: string;
  feedUrl: string;
  lastSuccessfulFetch?: string;
  lastFailure?: string;
  lastStatusCode?: number;
  failureCount: number;
  consecutiveFailures: number;
  averageLatencyMs?: number;
  contentChanges: number;
  parserSuccessRate: number;
  status: ResearchSourceHealthStatus;
}

// ── 22. News Intelligence → Research bridge ──────────────────────────────────
//
// Gated, evidence-oriented integration: a meaningful newsroom event may create
// or update a research project. The gate is the researchTrigger — most events
// never cross it, so research universes are not created for everything.

export type ResearchTriggerReason =
  | 'BREAKING_DEVELOPMENT'
  | 'HIGH_IMPORTANCE'
  | 'NOVEL_EVENT'
  | 'EDIT_REQUESTED'
  | 'SIGNIFICANT_CLAIM'
  | 'HIGH_SIGNAL_VELOCITY'
  | 'POLICY_CHANGE'
  | 'COURT_DECISION'
  | 'GOVERNMENT_ACTION';

export type ResearchChangeLevel =
  | 'NO_CHANGE'
  | 'MINOR_CHANGE'
  | 'MEANINGFUL_CHANGE'
  | 'MAJOR_CHANGE'
  | 'BREAKING_DEVELOPMENT';

export interface ResearchUpdateAlertItem {
  kind:
    | 'NEW_PRIMARY_SOURCE'
    | 'NEW_CLAIMS'
    | 'CONTRADICTION'
    | 'GAP_RESOLVED'
    | 'BREAKING_DEVELOPMENT'
    | 'RESEARCH_NOTE';
  title: string;
  detail: string;
  evidenceRefs: string[];
}

/** Evidence-oriented research update alert for the newsroom. */
export interface ResearchUpdateAlert {
  id: string;
  projectId: string;
  topic: string;
  generatedAt: string;
  level: ResearchChangeLevel;
  triggerReason?: ResearchTriggerReason;
  items: ResearchUpdateAlertItem[];
}

/** Deterministic delta of a research run, used for change-level classification. */
export interface ResearchRunDelta {
  newSources: number;
  newPrimarySources: number;
  newDocuments: number;
  newClaims: number;
  newContradictions: number;
  resolvedGaps: number;
  breakingDevelopment: boolean;
}
