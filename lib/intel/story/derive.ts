import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type { VerificationCase } from '@/lib/intel/verification';
import { getVerificationStatus } from '@/lib/intel/verification';
import type {
  StoryDraft,
  StoryDraftSummary,
  StoryEditorialPriorityTier,
  StoryType,
} from './types';
import type { StoryWorkflowView } from './store';
import { computeStoryReadiness } from './readiness';
import { buildStoryBrief } from './brief';
import { buildStoryOutline } from './outline';
import { buildStoryImpact } from './impact';
import { buildSourcePanel } from './sources';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Assembles a Story Draft for one constituency. The draft is a projection over the editorial
// InvestigationCase, the certified Journalist Toolkit, the Verification Service's case, and the
// editorial workflow overlay. It owns metadata only — every derived section references engine
// outputs and is recomputed on every read.

export const STORY_CALC_VERSION = '1.0.0';

export interface StoryDeriveOptions {
  trustValue?: number | null;
}

export function priorityTierForStory(ipi: number): StoryEditorialPriorityTier {
  if (ipi >= 70) return 'critical';
  if (ipi >= 55) return 'high';
  if (ipi >= 40) return 'medium';
  return 'low';
}

/** Deterministic story-type classifier. Precedence: investigation → explainer → analysis → news. */
export function classifyStoryType(ipi: number, evidenceCoverage: number, scenarioFlips: number | null): StoryType {
  if (ipi >= 70) return 'investigation';
  if (evidenceCoverage < 60) return 'explainer';
  if ((scenarioFlips ?? 0) > 0) return 'analysis';
  return 'news_story';
}

export function slugify(constituencyName: string, acNumber: number): string {
  const base = constituencyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `ac-${String(acNumber)}-${base}`;
}

export function headlineOptionsFor(investigation: InvestigationCase, toolkit: ConstituencyToolkit | null): string[] {
  const angles = toolkit?.angles.slice(0, 3).map((a) => a.title) ?? [];
  const derived = [
    `${investigation.constituency_name}: ${investigation.predicted_winner} leads on investigation priority ${String(Math.round(investigation.ipi))}`,
    `${investigation.constituency_name}: the ${investigation.topReasons[0]?.label ?? 'key contest'} question`,
  ];
  return [...angles, ...derived].slice(0, 5);
}

function evidenceCoverageFor(investigation: InvestigationCase, toolkit: ConstituencyToolkit | null, verification: VerificationCase | null): number {
  if (verification) return Math.round(verification.evidenceReview.coveragePct);
  if (toolkit) return Math.round(toolkit.evidence.coverage);
  return 0;
}

function dataGapsFor(toolkit: ConstituencyToolkit | null, verification: VerificationCase | null): string[] {
  if (verification) {
    return verification.evidenceReview.missingCategories.map((m) => `${m.label}: ${String(m.missing)}/${String(m.total)} missing`);
  }
  if (toolkit) {
    return toolkit.evidence.gaps.slice(0, 6).map((g) => g.label);
  }
  return [];
}

/**
 * Assemble a Story Draft for one constituency. When verification and toolkit detail are
 * unavailable (factor-only projection — overview and Mission Control surfaces), the draft is
 * derived from the investigation and workflow overlay alone, and each section states its proxy.
 */
export function deriveStoryDraft(
  investigation: InvestigationCase,
  toolkit: ConstituencyToolkit | null,
  verification: VerificationCase | null,
  workflow: StoryWorkflowView | null,
  options?: StoryDeriveOptions
): StoryDraft {
  const id = investigation.canonical_constituency_id;
  const status = workflow?.status ?? 'idea';
  const headline = toolkit?.angles[0]?.title ?? `${investigation.constituency_name}: the ${investigation.topReasons[0]?.label ?? 'key contest'} story`;
  const slug = slugify(investigation.constituency_name, investigation.ac_number);

  const verificationStatus = verification?.status ?? getVerificationStatus(id);
  const verificationScore = verification?.readiness.score ?? null;
  const verificationCanPublish = verification ? verification.readiness.canPublish : null;
  const openConflicts = verification ? verification.conflicts.length : null;
  const openFieldTasks = verification ? verification.readiness.openFieldTasks : null;
  const openBlockers = verification ? verification.readiness.blockers : [];
  const verifiedClaims = verification?.readiness.verifiedClaims ?? 0;
  const totalClaims = verification?.readiness.totalClaims ?? 0;
  const evidenceCoverage = evidenceCoverageFor(investigation, toolkit, verification);
  const researchFindings = toolkit?.research.findings.length ?? 0;
  const scenarioFlips = toolkit ? toolkit.scenarios.flips.length : null;
  const evidenceCount = verification ? verification.evidenceReview.availableFields : (toolkit?.evidence.items.length ?? 0);
  const dataGaps = dataGapsFor(toolkit, verification);

  const storyType = classifyStoryType(investigation.ipi, evidenceCoverage, scenarioFlips);
  const readiness = computeStoryReadiness({
    status,
    verificationStatus,
    verificationScore,
    verificationCanPublish,
    openConflicts,
    openFieldTasks,
    openBlockers,
  });

  const brief = buildStoryBrief({
    investigation,
    toolkit,
    evidenceCoverage,
    dataGaps,
    verificationStatus,
    confidence: investigation.confidence,
  });

  const outline = buildStoryOutline({
    investigation,
    toolkit,
    storyType,
    evidenceCoverage,
    verificationStatus,
    headlineOptions: headlineOptionsFor(investigation, toolkit),
  });

  const impact = buildStoryImpact({
    ipi: investigation.ipi,
    confidence: investigation.confidence,
    evidenceCoverage,
    verifiedRatio: totalClaims > 0 ? verifiedClaims / totalClaims : 0,
    verificationScore,
    researchFindings,
    scenarioFlips,
    trustValue: options?.trustValue ?? null,
    verificationConfidence: verification?.evidenceReview.confidence ?? null,
  });

  const sourcePanel = buildSourcePanel({
    investigation,
    toolkit,
    evidenceCoverage,
    evidenceCount,
    researchFindings,
    verificationStatus,
    verificationScore,
    verifiedClaims,
    totalClaims,
    generatedAt: new Date().toISOString(),
  });

  return {
    id,
    constituencyId: id,
    constituencyName: investigation.constituency_name,
    acNumber: investigation.ac_number,
    district: investigation.district,
    region: investigation.region,
    headline,
    slug,
    storyType,
    status,
    linkedConstituency: {
      id,
      name: investigation.constituency_name,
      acNumber: investigation.ac_number,
      district: investigation.district,
      region: investigation.region,
      currentMlaParty: investigation.current_mla_party,
      predictedWinner: investigation.predicted_winner,
      winnerProbability: investigation.winner_probability,
    },
    references: {
      evidence: [{ id: 'evidence-graph', label: 'Evidence Graph', count: evidenceCount, source: 'lib/intel/evidence' }],
      verification: [{ id: verification?.id ?? id, label: 'Verification case', count: verifiedClaims, source: 'lib/intel/verification' }],
      research: [{ id: 'research-kb', label: 'Research Knowledge Base', count: researchFindings, source: 'lib/intel/toolkit' }],
      prediction: [{ id: 'prediction-engine', label: 'Prediction Engine', count: 1, source: 'lib/intel/predictions' }],
      scenario: [{ id: 'scenario-engine', label: 'Scenario Engine', count: scenarioFlips ?? 0, source: 'lib/intel/scenarios' }],
      toolkit: [{ id: 'journalist-toolkit', label: 'Journalist Toolkit', count: toolkit ? toolkit.angles.length + toolkit.interviews.length : 0, source: 'lib/intel/toolkit' }],
    },
    editorialPriority: Math.round(investigation.ipi),
    priorityTier: priorityTierForStory(investigation.ipi),
    ipi: investigation.ipi,
    confidence: investigation.confidence,
    readiness,
    brief,
    outline,
    impact,
    sourcePanel,
    editor: workflow?.editor,
    assignedAt: workflow?.assignedAt,
    notes: [...(workflow?.notes ?? [])],
    version: workflow?.version ?? 1,
    lastTransition: workflow?.lastTransition,
    audit: [...(workflow?.audit ?? [])],
    created: workflow?.created ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: `story-builder@${STORY_CALC_VERSION}`,
  };
}

export function toStorySummary(story: StoryDraft): StoryDraftSummary {
  return {
    id: story.id,
    constituencyId: story.constituencyId,
    constituencyName: story.constituencyName,
    headline: story.headline,
    storyType: story.storyType,
    status: story.status,
    readinessState: story.readiness.state,
    editorialPriority: story.editorialPriority,
    priorityTier: story.priorityTier,
    ipi: story.ipi,
    confidence: story.confidence,
    updatedAt: story.updatedAt,
  };
}
