import { computeEditorialOverview } from '@/lib/intel/editorial/overview';
import { getConstituencyToolkit } from '@/lib/intel/toolkit/overview';
import { computeVerificationCaseDetail } from '@/lib/intel/verification';
import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type {
  StoryDraftSummary,
  StoryExecutiveSummary,
  StoryOverview,
  StoryStatus,
} from './types';
import { deriveStoryDraft, toStorySummary, STORY_CALC_VERSION } from './derive';
import { countStoryStatuses } from './status';
import { ensureStorySeed, getStoryWorkflow } from './store';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Aggregation entry for the Story Builder. Owns no engine logic — it loads the certified
// editorial overview and builds one Story Draft per top-priority constituency as a projection
// over the editorial InvestigationCase, the Journalist Toolkit, the Verification Service, and
// the editorial workflow overlay.

export { STORY_CALC_VERSION };

const DEFAULT_TOP_N = 15;

const GLOBAL_LIMITATIONS = [
  'Workflow state is in-memory for the server process (matching the EOS store precedent). It is not durable across deployments or serverless cold starts.',
  'Story drafts cover the top Investigation Priority seats only; lower-priority constituencies are planned via the Journalist Toolkit rather than a dedicated draft.',
  'The audit trail records editorial actions within the process lifetime; it cannot reconstruct actions taken before the current process started.',
  'Editorial readiness consumes the linked Verification case. Stories for seats outside the verification top-priority set surface factor-only verification state.',
  'Outlines are structured plans that reference certified intelligence; they are not finished articles and contain no drafted prose.',
];

const READY_TO_DRAFT_STATUSES: StoryStatus[] = ['verification_complete', 'drafting'];

function buildStoryOverview(stories: StoryDraftSummary[], editorial: EditorialOverview): StoryOverview {
  const statuses = stories.map((s) => s.status);
  const statusCounts = countStoryStatuses(statuses);
  const readyToDraft = stories.filter((s) => READY_TO_DRAFT_STATUSES.includes(s.status)).length;
  const blocked = stories.filter((s) => s.readinessState === 'blocked' || s.readinessState === 'needs_field_reporting').length;
  const awaitingVerification = stories.filter((s) => s.readinessState === 'needs_verification').length;
  const highImpactOpportunities = stories.filter(
    (s) => (s.priorityTier === 'critical' || s.priorityTier === 'high') && ['idea', 'planned', 'researching', 'verification_required'].includes(s.status),
  ).length;
  const publishedCount = stories.filter((s) => s.status === 'published').length;

  return {
    generatedAt: new Date().toISOString(),
    dataSource: editorial.dataSource,
    researchCutoff: editorial.researchCutoff,
    totalDrafts: stories.length,
    statusCounts,
    readyToDraft,
    blocked,
    awaitingVerification,
    highImpactOpportunities,
    publishedCount,
    stories,
    limitations: GLOBAL_LIMITATIONS,
    storeNote: 'Story workflow state is in-memory for the server process. Transitions are append-only within that lifetime.',
  };
}

/** Full dashboard overview: top-priority stories with toolkit detail, workflow overlay applied. */
export async function computeStoryOverview(topN = DEFAULT_TOP_N): Promise<StoryOverview> {
  const editorial = await computeEditorialOverview(403);
  const top = editorial.ranked.slice(0, topN);
  ensureStorySeed(top.map((i) => i.canonical_constituency_id));

  const stories: StoryDraftSummary[] = [];
  for (const inv of top) {
    const toolkit = await getConstituencyToolkit(inv.canonical_constituency_id);
    const workflow = getStoryWorkflow(inv.canonical_constituency_id) ?? null;
    const draft = deriveStoryDraft(inv, toolkit, null, workflow);
    stories.push(toStorySummary(draft));
  }

  return buildStoryOverview(stories, editorial);
}

/** Single-story detail view: full toolkit and Verification case for one constituency. */
export async function computeStoryDetail(storyId: string): Promise<import('./types').StoryDraft | null> {
  const editorial = await computeEditorialOverview(403);
  const inv = editorial.ranked.find((i) => i.canonical_constituency_id === storyId);
  if (!inv) return null;
  ensureStorySeed([storyId]);
  const [toolkit, verification] = await Promise.all([
    getConstituencyToolkit(storyId),
    computeVerificationCaseDetail(storyId),
  ]);
  const workflow = getStoryWorkflow(storyId) ?? null;
  return deriveStoryDraft(inv, toolkit, verification, workflow);
}

/** Story ids for the top-priority seats — used by server actions to seed the workflow overlay. */
export async function getStoryIds(topN = DEFAULT_TOP_N): Promise<string[]> {
  const editorial = await computeEditorialOverview(403);
  return editorial.ranked.slice(0, topN).map((i) => i.canonical_constituency_id);
}

interface ExecutiveInputs {
  editorial: EditorialOverview;
  evidence: EvidenceOverview;
}

/**
 * Mission Control projection. Pure and synchronous — derives lightweight drafts (factor-only,
 * no toolkit detail) from the already-loaded editorial/evidence overviews and the editorial
 * workflow overlay. The Executive Intelligence Service consumes this and nothing else from the
 * Story Service.
 */
export function buildStoryExecutiveSummary(inputs: ExecutiveInputs): StoryExecutiveSummary {
  const { editorial } = inputs;
  const top = editorial.ranked.slice(0, 10);

  const summaries: StoryDraftSummary[] = top.map((inv: InvestigationCase) => {
    const workflow = getStoryWorkflow(inv.canonical_constituency_id) ?? null;
    const toolkit = null as ConstituencyToolkit | null;
    const draft = deriveStoryDraft(inv, toolkit, null, workflow);
    return toStorySummary(draft);
  });

  const statusCounts = countStoryStatuses(summaries.map((s) => s.status));
  const readyToDraft = summaries.filter((s) => READY_TO_DRAFT_STATUSES.includes(s.status)).length;
  const blocked = summaries.filter((s) => s.readinessState === 'blocked' || s.readinessState === 'needs_field_reporting').length;
  const awaitingVerification = summaries.filter((s) => s.readinessState === 'needs_verification').length;
  const highImpactOpportunities = summaries.filter(
    (s) => (s.priorityTier === 'critical' || s.priorityTier === 'high') && ['idea', 'planned', 'researching', 'verification_required'].includes(s.status),
  ).length;
  const publishedCount = summaries.filter((s) => s.status === 'published').length;

  const recentActivity = summaries
    .flatMap((s) => (getStoryWorkflow(s.id)?.audit ?? []).map((entry) => ({ storyId: s.id, headline: s.headline, at: entry.at, actorName: entry.actorName, action: entry.action })))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 5);

  return {
    generatedAt: new Date().toISOString(),
    totalDrafts: summaries.length,
    readyToDraft,
    blocked,
    awaitingVerification,
    highImpactOpportunities,
    publishedCount,
    statusCounts,
    recentActivity,
    persistence: 'none',
    note: 'Mission Control projection — factor-only drafts with the editorial workflow overlay applied. Full briefs and outlines live in the Story Builder workspace.',
  };
}
