// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Public surface of the Story Builder & Editorial Production System. This is the ONLY entry
// point other services and surfaces import from — same discipline as the Verification Operating
// System and the Executive Intelligence Service.

export type {
  StoryStatus,
  StoryStatusCounts,
  StoryType,
  StoryAuditAction,
  StoryAuditEntry,
  StoryActor,
  StoryEditorialPriorityTier,
  StoryReadinessState,
  StoryEditorialBlocker,
  StoryEditorialReadiness,
  StorySourceDomain,
  StorySourcePanelEntry,
  StoryImpactDimensionKey,
  StoryImpactDimension,
  StoryImpact,
  StoryOutlineItem,
  StoryOutlineBlock,
  StoryBriefSection,
  StoryBrief,
  StoryReference,
  StoryReferenceSet,
  StoryLinkedConstituency,
  StoryDraft,
  StoryDraftSummary,
  StoryOverview,
  StoryExecutiveSummary,
  StoryTransitionResult,
  StoryPackage,
  StoryPackageMetadata,
} from './types';

export { STORY_STATUSES } from './types';

export {
  STORY_TRANSITION_MAP,
  VERIFICATION_GATED_STATES,
  canTransitionStory,
  nextStoryTransitions,
  isTerminalStory,
  isStoryOpen,
  isVerificationGated,
  storyStatusLabel,
  emptyStoryStatusCounts,
  countStoryStatuses,
} from './status';

export { computeStoryReadiness } from './readiness';
export { buildStoryImpact, STORY_IMPACT_WEIGHTS, STORY_IMPACT_CALC_VERSION, validateStoryImpactWeights, CONFIDENCE_SCORE } from './impact';
export { buildSourcePanel } from './sources';
export { buildStoryBrief } from './brief';
export { buildStoryOutline } from './outline';

export {
  ensureStorySeed,
  getStoryWorkflow,
  getStoryStatus,
  getStoryVersion,
  getStoryAudit,
  transitionStory,
  assignStoryEditor,
  addStoryNote,
  resetStoryStore,
} from './store';
export type { StoryWorkflowView, StoryTransitionOptions } from './store';

export {
  deriveStoryDraft,
  toStorySummary,
  priorityTierForStory,
  classifyStoryType,
  slugify,
  headlineOptionsFor,
  STORY_CALC_VERSION,
} from './derive';

export {
  computeStoryOverview,
  computeStoryDetail,
  getStoryIds,
  buildStoryExecutiveSummary,
} from './overview';

export {
  exportStoryPackage,
  exportStoryJson,
  exportStoryMarkdown,
  exportPrintBrief,
  exportEditorialSummary,
} from './export';
