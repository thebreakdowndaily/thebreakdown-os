import { computePredictionsOverview } from '@/lib/intel/predictions/overview';
import { computeScenariosOverview } from '@/lib/intel/scenarios/overview';
import { computeEvidenceOverview } from '@/lib/intel/evidence/overview';
import { computeEditorialOverview } from '@/lib/intel/editorial/overview';
import { computeToolkitOverview } from '@/lib/intel/toolkit/overview';
import { buildTrustIndexForEngines } from './trust';
import { buildExecutiveMetrics } from './metrics';
import { buildEditorialWatchlist } from './watchlist';
import { buildEditorialAlerts } from './alerts';
import { buildVerificationQueue } from './verification';
import { buildScenarioMonitor } from './scenarios';
import { buildEvidenceHealth } from './evidence';
import { buildResearchWatch } from './research';
import { buildNewsroomProductivity } from './newsroom';
import { buildVerificationExecutiveSummary } from '@/lib/intel/verification';
import { buildStoryExecutiveSummary } from '@/lib/intel/story';
import type { ExecutiveBriefing, ExecutiveBriefingInputs } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// + Phase IV sprint brief (Executive Intelligence Service)
// The Executive Intelligence Service is the ONLY service Mission Control consumes. It
// aggregates the certified engine overviews exactly once per briefing and reshapes them
// into presentation-ready summaries. It owns no engine logic, no prediction logic, no
// evidence logic, no scenario logic, and no scoring logic. It introduces no new
// intelligence — it orchestrates existing intelligence.

export type {
  ExecutiveBriefing,
  ExecutiveBriefingInputs,
  ExecutiveMetric,
  ExecutiveMetricKey,
  ExecutiveMetricTrend,
  WatchlistItem,
  WatchlistFactorContribution,
  EditorialAlert,
  EditorialAlertCategory,
  EditorialAlertSeverity,
  VerificationQueue,
  VerificationQueueItem,
  VerificationKind,
  ScenarioMonitor,
  ScenarioMonitorItem,
  EvidenceHealth,
  EvidenceCategoryRow,
  ResearchWatch,
  ResearchFinding,
  ResearchGap,
  NewsroomProductivity,
  EditorialReadinessRow,
  VerificationExecutiveSummary,
  StoryExecutiveSummary,
} from './types';

export const EXECUTIVE_CALC_VERSION = '1.0.0';

/** Aggregate all certified engine overviews exactly once. */
export async function computeExecutiveBriefing(): Promise<ExecutiveBriefing> {
  const [predictions, scenarios, evidence, editorial, toolkit] = await Promise.all([
    computePredictionsOverview(403),
    computeScenariosOverview(),
    computeEvidenceOverview(403),
    computeEditorialOverview(403),
    computeToolkitOverview(),
  ]);

  return buildExecutiveBriefingFrom({ predictions, scenarios, evidence, editorial, toolkit });
}

/**
 * Pure, synchronous reshaping of engine overviews into the briefing. Unit-testable without
 * loading the dataset. Each section builder is a pure consumer of the overviews — no engine
 * is invoked inside this function.
 */
export function buildExecutiveBriefingFrom(inputs: ExecutiveBriefingInputs): ExecutiveBriefing {
  const { predictions, scenarios, evidence, editorial, toolkit } = inputs;

  const trustIndex = buildTrustIndexForEngines({ predictions, scenarios, evidence, editorial });
  const generatedAt = new Date().toISOString();

  return {
    generatedAt,
    dataSource: editorial.dataSource,
    researchCutoff: editorial.researchCutoff,
    metrics: buildExecutiveMetrics({ predictions, scenarios, evidence, editorial, trustIndex }),
    trustIndex,
    watchlist: buildEditorialWatchlist(editorial, evidence),
    alerts: buildEditorialAlerts(editorial, evidence, predictions),
    verification: buildVerificationQueue(editorial, evidence, predictions),
    verificationOS: buildVerificationExecutiveSummary({ editorial, evidence }),
    storyOS: buildStoryExecutiveSummary({ editorial, evidence }),
    scenarioMonitor: buildScenarioMonitor(scenarios),
    evidenceHealth: buildEvidenceHealth(evidence),
    researchWatch: buildResearchWatch(editorial, evidence, predictions),
    newsroom: buildNewsroomProductivity(editorial, toolkit),
  };
}
