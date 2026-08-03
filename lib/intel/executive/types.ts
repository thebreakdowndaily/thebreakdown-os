import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { TrustIndex, TrustComponentKey } from '@/lib/intel/trust/types';
import type { PredictionsOverview } from '@/lib/intel/predictions/overview';
import type { ScenariosOverview } from '@/lib/intel/scenarios/overview';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { ToolkitOverview } from '@/lib/intel/toolkit/overview';
import type { ScenarioType } from '@/lib/intel/scenarios/types';
import type { VerificationKind } from '@/lib/intel/toolkit/types';
import type { VerificationExecutiveSummary } from '@/lib/intel/verification/types';
import type { StoryExecutiveSummary } from '@/lib/intel/story/types';

export type { TrustComponentKey, VerificationKind, VerificationExecutiveSummary, StoryExecutiveSummary };

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// + Phase IV sprint brief (Executive Intelligence Surface)
// Canonical types for the Executive Intelligence Service. Mission Control consumes ONLY
// this service. The service owns no engine logic — it aggregates the certified engine
// overviews into presentation-ready summaries and adds no computed intelligence of its own
// beyond formatting and aggregation.

export type ExecutiveMetricKey =
  | 'investigation_priority'
  | 'editorial_pressure'
  | 'prediction_stability'
  | 'evidence_coverage'
  | 'verification_readiness'
  | 'scenario_exposure'
  | 'institutional_trust';

export interface ExecutiveMetricTrend {
  direction: 'up' | 'down' | 'flat' | 'na';
  label: string;
  note: string;
}

export interface ExecutiveMetric {
  key: ExecutiveMetricKey;
  label: string;
  value: number;
  unit: string;
  display: string;
  trend: ExecutiveMetricTrend;
  confidence: ConfidenceTier;
  primaryDriver: string;
  lastUpdated: string;
  calculationVersion: string;
  source: string;
  evidenceSummary: string[];
  limitations: string[];
}

export interface WatchlistFactorContribution {
  key: string;
  label: string;
  contribution: number;
}

export interface WatchlistItem {
  rank: number;
  canonical_constituency_id: string;
  constituency_name: string;
  region: string;
  district: string;
  current_mla_party: string;
  predicted_winner: string;
  winner_probability: number;
  ipi: number;
  confidence: ConfidenceTier;
  reason: string;
  requiredAction: string;
  evidenceCount: number;
  recommendedReporterAction: string;
  suggestedNextStep: string;
  factorContributions: WatchlistFactorContribution[];
}

export type EditorialAlertCategory =
  | 'investigation_priority'
  | 'prediction_fragility'
  | 'scenario_exposure'
  | 'evidence_debt'
  | 'verification_blocker'
  | 'research_gap';

export type EditorialAlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export interface EditorialAlert {
  id: string;
  category: EditorialAlertCategory;
  severity: EditorialAlertSeverity;
  title: string;
  detail: string;
  confidence: ConfidenceTier;
  action: string;
  basis: string;
  relatedConstituency?: string;
  source: string;
}

export interface VerificationQueueItem {
  id: string;
  kind: VerificationKind;
  title: string;
  detail: string;
  confidence: ConfidenceTier;
  recommendedAction: string;
  source: string;
  relatedConstituency?: string;
}

export interface VerificationQueue {
  overallConfidence: ConfidenceTier;
  items: VerificationQueueItem[];
  counts: Record<VerificationKind, number>;
  requiredDocuments: string[];
}

export interface ScenarioFlipRow {
  constituency: string;
  from: string;
  to: string;
  winnerProbability: number;
}

export interface ScenarioMonitorItem {
  scenarioId: string;
  label: string;
  type: ScenarioType;
  flipCount: number;
  totalSeats: number;
  seatShareTop: Array<{ party: string; seats: number }>;
  majority: number;
  editorialImpact: 'high' | 'medium' | 'low';
  flips: ScenarioFlipRow[];
  note: string;
}

export interface ScenarioMonitor {
  items: ScenarioMonitorItem[];
  totalFlips: number;
}

export interface EvidenceCategoryRow {
  category: string;
  label: string;
  pct: number;
}

export interface EvidenceHealth {
  count: number;
  avgCoverage: number;
  totalDebt: number;
  confidenceDistribution: Record<ConfidenceTier, number>;
  categoryCoverage: EvidenceCategoryRow[];
  missingDatasets: string[];
  researchCompleteness: number;
  highestDebt: Array<{ constituency: string; debt: number; coverage: number }>;
  limitations: string[];
}

export interface ResearchFinding {
  constituency: string;
  title: string;
  detail: string;
  confidence: ConfidenceTier;
  source: string;
}

export interface ResearchGap {
  category: string;
  label: string;
  detail: string;
}

export interface ResearchWatch {
  researchCutoff: string;
  dataSource: string;
  findings: ResearchFinding[];
  gaps: ResearchGap[];
  predictionGapCount: number;
  limitations: string[];
}

export interface EditorialReadinessRow {
  key: string;
  label: string;
  avg: number;
  weight: number;
}

export interface NewsroomProductivity {
  briefsAvailable: number;
  openInvestigations: number;
  pendingVerification: number;
  editorialReadiness: EditorialReadinessRow[];
  persistence: 'none';
  note: string;
}

export interface ExecutiveBriefingInputs {
  predictions: PredictionsOverview;
  scenarios: ScenariosOverview;
  evidence: EvidenceOverview;
  editorial: EditorialOverview;
  toolkit: ToolkitOverview;
}

export interface ExecutiveBriefing {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  metrics: ExecutiveMetric[];
  trustIndex: TrustIndex;
  watchlist: WatchlistItem[];
  alerts: EditorialAlert[];
  verification: VerificationQueue;
  verificationOS: VerificationExecutiveSummary;
  storyOS: StoryExecutiveSummary;
  scenarioMonitor: ScenarioMonitor;
  evidenceHealth: EvidenceHealth;
  researchWatch: ResearchWatch;
  newsroom: NewsroomProductivity;
}
