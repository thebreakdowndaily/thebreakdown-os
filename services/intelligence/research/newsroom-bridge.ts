/**
 * ─── Research Intelligence — News Intelligence Bridge ────────────────────────
 * Governing documents: docs/research/source-governance.md
 *                      docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Gated, evidence-oriented bridge from News Intelligence to RIE research
 * projects. Most newsroom events never cross the researchTrigger gate, so
 * research universes are not created for everything. When a meaningful event
 * passes:
 *
 *   EVENT → trigger gate → topic/entity resolution → existing project (append)
 *                                                     OR new project (create)
 *   → approved-source discovery → claims/evidence/contradictions/gaps
 *   → change-level classification → evidence-oriented RESEARCH UPDATE alert
 *
 * The bridge never fabricates content and never substitutes fixture sources
 * for failed real sources: it always discovers via the registry's approved
 * sources. Story OS handoff is preserved by core.generateStoryBrief, which the
 * bridge surfaces as a research-update item when material change occurs.
 */

import { ResearchIntelligenceCore } from './core';
import { runResearchPipeline } from './pipeline';
import { ResearchSourceRegistry, researchSourceRegistry, sourceIsPrimary } from './source-registry';
import { createEventId } from '@/lib/intel/research/ids';
import { toSlug } from '@/lib/intel/research/normalization';
import type { ResearchSourceAdapter } from './adapters/interface';
import type {
  ResearchChangeLevel,
  ResearchProject,
  ResearchRun,
  ResearchRunDelta,
  ResearchTriggerReason,
  ResearchUpdateAlert,
  ResearchUpdateAlertItem,
  TopicEntity,
  ResearchProjectStatus,
  ResearchDatePrecision,
} from '@/types/research-intelligence';
import type { NewsroomSignal } from '@/types/newsroom-intelligence';

/** News Intelligence event, normalised for the research bridge. */
export interface NewsroomEventInput {
  id: string;
  title: string;
  summary: string;
  entities: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  firstDetectedAt: string;
  lastUpdatedAt: string;
  independentSourceCount: number;
  primarySourceCount: number;
  contradictionCount?: number;
  keyClaims?: string[];
  scores?: { novelty: number; velocity: number; importance: number };
  triggerHint?: ResearchTriggerReason;
  sourceUrl?: string;
}

export interface TriggerEvaluation {
  trigger: ResearchTriggerReason | null;
  rationale: string[];
}

export interface ApplyNewsEventDeps {
  /** Source adapters used for the discovery run. Production callers must pass
   *  registry-approved adapters only — never the fixture. */
  adapters: ResearchSourceAdapter[];
  createdBy?: string;
  now?: () => Date;
  maxQueries?: number;
  maxSources?: number;
  maxDocuments?: number;
}

export type ResearchNewsApplication =
  | { filtered: true; reason: string }
  | {
      filtered: false;
      created: boolean;
      projectId: string;
      run: ResearchRun;
      delta: ResearchRunDelta;
      changeLevel: ResearchChangeLevel;
      alert: ResearchUpdateAlert;
    };

const ACTIVE_PROJECT_STATUSES: ReadonlyArray<ResearchProjectStatus> = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
];

// ── Trigger gate ─────────────────────────────────────────────────────────────

const KEYWORD_RULES: ReadonlyArray<{ reason: ResearchTriggerReason; patterns: RegExp[] }> = [
  {
    reason: 'COURT_DECISION',
    patterns: [/court/i, /ruling/i, /\bjudgment\b/i, /\bverdict\b/i, /tribunal/i],
  },
  {
    reason: 'POLICY_CHANGE',
    patterns: [/policy/i, /regulat/i, /tariff policy/i, /interest rate/i, /rate (hike|cut)/i],
  },
  {
    reason: 'GOVERNMENT_ACTION',
    patterns: [/government/i, /ministry/i, /announc/i, /notification/i, /ordinance/i, /executive action/i],
  },
];

/** Deterministic research trigger gate. Most events are filtered here. */
export function evaluateResearchTrigger(event: NewsroomEventInput): TriggerEvaluation {
  const rationale: string[] = [];

  if (event.triggerHint) {
    return { trigger: event.triggerHint, rationale: [`Explicit editor trigger: ${event.triggerHint}.`] };
  }

  if (event.priority === 'P0') {
    return { trigger: 'BREAKING_DEVELOPMENT', rationale: ['P0 priority — breaking research signal.'] };
  }

  if (event.priority === 'P1' && event.primarySourceCount >= 1 && event.independentSourceCount >= 2) {
    return {
      trigger: 'BREAKING_DEVELOPMENT',
      rationale: ['P1 with an independent primary source — breaking development signal.'],
    };
  }

  // Keyword rules apply to P1/P2 events only — a P3 event is always filtered
  // unless an explicit editor hint exists.
  if (event.priority === 'P1' || event.priority === 'P2') {
    for (const rule of KEYWORD_RULES) {
      const text = `${event.title} ${event.summary}`;
      if (rule.patterns.some((p) => p.test(text))) {
        return {
          trigger: rule.reason,
          rationale: [`Event text matches ${rule.reason} keywords.`],
        };
      }
    }
  }

  if (event.priority === 'P1') {
    return { trigger: 'HIGH_IMPORTANCE', rationale: ['P1 priority — high importance research signal.'] };
  }

  if (event.priority === 'P2') {
    if ((event.contradictionCount ?? 0) >= 1 && event.primarySourceCount >= 1) {
      return {
        trigger: 'SIGNIFICANT_CLAIM',
        rationale: ['Contradicting claims with an independent primary source.'],
      };
    }
    if ((event.scores?.velocity ?? 0) >= 60) {
      return {
        trigger: 'HIGH_SIGNAL_VELOCITY',
        rationale: [`Signal velocity ${event.scores?.velocity} ≥ 60 — accelerating event.`],
      };
    }
    if ((event.scores?.novelty ?? 0) >= 60 && event.independentSourceCount >= 2) {
      return {
        trigger: 'NOVEL_EVENT',
        rationale: [`Novelty ${event.scores?.novelty} ≥ 60 with multiple independent sources.`],
      };
    }
    return { trigger: null, rationale: ['P2 event below research thresholds.'] };
  }

  return { trigger: null, rationale: ['P3 event filtered — below research priority.'] };
}

// ── Topic / entity resolution ────────────────────────────────────────────────

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2)
  );
}

/**
 * Attempts to resolve a news event to an existing active research project so a
 * new event appends to the underlying topic rather than fragmenting into a
 * duplicate universe. Best-effort containment scoring over title tokens and
 * registered entities; below threshold returns undefined (a new project).
 */
export function resolveResearchProject(
  core: ResearchIntelligenceCore,
  event: NewsroomEventInput
): ResearchProject | undefined {
  const eventTokens = tokenize(event.title);
  const eventEntities = new Set(event.entities.map((e) => e.toLowerCase()));

  let best: ResearchProject | undefined;
  let bestScore = 0;

  for (const project of core.getProjects().filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status))) {
    const projectTokens = tokenize(project.title);
    for (const entity of project.topics?.entities ?? []) projectTokens.add(entity.name.toLowerCase());

    const overlap = new Set([...eventTokens].filter((t) => projectTokens.has(t))).size;
    const tokenScore = overlap / Math.max(1, eventTokens.size);
    const entityHits = [...eventEntities].filter((e) => projectTokens.has(e)).length;
    const entityScore = entityHits / Math.max(1, eventEntities.size);
    const score = Math.max(tokenScore, entityScore);

    if (score > bestScore) {
      bestScore = score;
      best = project;
    }
  }

  return bestScore >= 0.5 ? best : undefined;
}

// ── Change classification ────────────────────────────────────────────────────

/**
 * Deterministic research-change classification. Only MEANINGFUL_CHANGE,
 * MAJOR_CHANGE and BREAKING_DEVELOPMENT normally reach newsroom alerts.
 */
export function classifyResearchChange(delta: ResearchRunDelta): ResearchChangeLevel {
  if (delta.breakingDevelopment) return 'BREAKING_DEVELOPMENT';
  if (
    delta.newContradictions >= 2 ||
    (delta.newPrimarySources >= 1 && delta.newClaims >= 5) ||
    delta.resolvedGaps >= 1
  ) {
    return 'MAJOR_CHANGE';
  }
  if (
    delta.newPrimarySources >= 1 ||
    delta.newContradictions >= 1 ||
    delta.newClaims >= 1 ||
    delta.resolvedGaps >= 1
  ) {
    return 'MEANINGFUL_CHANGE';
  }
  if (delta.newSources >= 1 || delta.newDocuments >= 1) return 'MINOR_CHANGE';
  return 'NO_CHANGE';
}

export function shouldSurfaceResearchAlert(level: ResearchChangeLevel): boolean {
  return level === 'MEANINGFUL_CHANGE' || level === 'MAJOR_CHANGE' || level === 'BREAKING_DEVELOPMENT';
}

// ── Delta computation ────────────────────────────────────────────────────────

export function computeResearchRunDelta(
  core: ResearchIntelligenceCore,
  run: ResearchRun
): ResearchRunDelta {
  const project = core.getProject(run.projectId);
  const primarySourceCount = project
    ? project.sourceIds.filter((id) => {
        const source = core.getSource(id);
        return source && source.discoveredAt === run.startedAt && sourceIsPrimary(source.sourceClass);
      }).length
    : 0;

  const breakingDevelopment = core
    .getChangeEvents(run.projectId)
    .some((e) => e.type === 'BREAKING_DEVELOPMENT' && e.detectedAt >= run.startedAt);

  const resolvedGaps = project
    ? project.gapIds.filter((id) => {
        const gap = core.getGap(id);
        return gap && gap.status === 'RESOLVED' && !!gap.resolvedAt && gap.resolvedAt >= run.startedAt;
      }).length
    : 0;

  return {
    newSources: run.sourcesDiscovered,
    newPrimarySources: primarySourceCount,
    newDocuments: run.documentsProcessed,
    newClaims: run.claimsExtracted,
    newContradictions: run.contradictionsFound,
    resolvedGaps,
    breakingDevelopment,
  };
}

// ── Alert building ───────────────────────────────────────────────────────────

export function buildResearchUpdateAlert(
  project: { id: string; title: string },
  delta: ResearchRunDelta,
  level: ResearchChangeLevel,
  triggerReason?: ResearchTriggerReason
): ResearchUpdateAlert {
  const items: ResearchUpdateAlertItem[] = [];

  if (delta.breakingDevelopment) {
    items.push({
      kind: 'BREAKING_DEVELOPMENT',
      title: 'Breaking development on research topic',
      detail: 'A freshly published source reports a development within the topic window.',
      evidenceRefs: [],
    });
  }
  if (delta.newPrimarySources >= 1) {
    items.push({
      kind: 'NEW_PRIMARY_SOURCE',
      title: `${delta.newPrimarySources} primary ${delta.newPrimarySources === 1 ? 'source' : 'sources'} discovered`,
      detail: 'A primary-class source was discovered this run; corroboration weight improves.',
      evidenceRefs: [],
    });
  }
  if (delta.newContradictions >= 1) {
    items.push({
      kind: 'CONTRADICTION',
      title: `${delta.newContradictions} new contradiction${delta.newContradictions === 1 ? '' : 's'} detected`,
      detail: 'Independent sources disagree; adjudication required before claims are treated as settled.',
      evidenceRefs: [],
    });
  }
  if (delta.resolvedGaps >= 1) {
    items.push({
      kind: 'GAP_RESOLVED',
      title: `${delta.resolvedGaps} research ${delta.resolvedGaps === 1 ? 'gap resolved' : 'gaps resolved'}`,
      detail: 'Previously open research gaps have been closed by new evidence.',
      evidenceRefs: [],
    });
  }
  if (delta.newClaims >= 1) {
    items.push({
      kind: 'NEW_CLAIMS',
      title: `${delta.newClaims} new claims extracted`,
      detail: 'Attributed claims extracted from this run\'s documents — verify before use.',
      evidenceRefs: [],
    });
  }
  if (items.length === 0) {
    items.push({
      kind: 'RESEARCH_NOTE',
      title: 'No material research change',
      detail: 'Discovery returned no new claims, primary sources or contradictions.',
      evidenceRefs: [],
    });
  }

  return {
    id: `ral_${runSafeId(project.id)}`,
    projectId: project.id,
    topic: project.title,
    generatedAt: new Date().toISOString(),
    level,
    triggerReason,
    items,
  };
}

function runSafeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

// ── Orchestration ────────────────────────────────────────────────────────────

function entityFromName(name: string): TopicEntity {
  return { name, type: 'UNKNOWN', aliases: [] };
}

export function createResearchProjectFromEvent(
  core: ResearchIntelligenceCore,
  event: NewsroomEventInput,
  createdBy: string,
  now: () => Date = () => new Date()
): ResearchProject {
  const nowIso = now().toISOString();
  return core.createProject({
    title: event.title,
    description: event.summary,
    researchQuestion: `${event.title} — what is known, what is disputed, and what evidence supports each position?`,
    priority: event.priority,
    createdBy,
  });
}

function attachEventTopics(core: ResearchIntelligenceCore, projectId: string, event: NewsroomEventInput, now: () => Date): void {
  const project = core.getProject(projectId);
  if (!project || project.topics) return;
  project.topics = {
    canonical: project.title,
    synonyms: [],
    entities: event.entities.map(entityFromName),
    concepts: [],
    historicalReferences: [],
    geographicExpansion: [],
    temporalExpansion: [],
    expandedAt: now().toISOString(),
  };
}

function addNewsTimelineEvent(
  core: ResearchIntelligenceCore,
  projectId: string,
  event: NewsroomEventInput,
  now: () => Date
): void {
  const project = core.getProject(projectId);
  if (!project) return;
  const eventRecord = {
    id: createEventId(),
    projectId,
    title: event.title,
    description: event.summary,
    date: event.firstDetectedAt,
    datePrecision: 'EXACT' as ResearchDatePrecision,
    entityMentions: event.entities,
    claimIds: [],
    sourceIds: [],
    confidence: 0.6,
  };
  core.addEvent(eventRecord);
  project.timelineEventIds.push(eventRecord.id);
  project.updatedAt = now().toISOString();
}

/**
 * Applies a meaningful news event to research. Creates a project when no
 * existing project covers the topic; otherwise appends to the existing project
 * (no duplicate research universes). Runs approved-source discovery, classifies
 * the change, and returns an evidence-oriented update alert.
 */
export async function applyNewsEventToResearch(
  core: ResearchIntelligenceCore,
  event: NewsroomEventInput,
  deps: ApplyNewsEventDeps
): Promise<ResearchNewsApplication> {
  const now = deps.now ?? (() => new Date());
  const actor = deps.createdBy ?? 'newsroom-bridge';

  const gate = evaluateResearchTrigger(event);
  if (!gate.trigger) {
    return { filtered: true, reason: gate.rationale[0] ?? 'Below research threshold.' };
  }
  if (deps.adapters.length === 0) {
    return { filtered: true, reason: 'No approved research sources configured for discovery.' };
  }

  const existing = resolveResearchProject(core, event);
  const created = !existing;
  const project = existing ?? createResearchProjectFromEvent(core, event, actor, now);

  if (created) attachEventTopics(core, project.id, event, now);
  addNewsTimelineEvent(core, project.id, event, now);

  const run = await runResearchPipeline(core, project.id, {
    triggeredBy: actor,
    trigger: 'NEWS_INTELLIGENCE',
    adapters: deps.adapters,
    maxQueries: deps.maxQueries ?? 4,
    maxSources: deps.maxSources ?? 12,
    maxDocuments: deps.maxDocuments ?? 12,
    now,
  });

  const delta = computeResearchRunDelta(core, run);
  const changeLevel = classifyResearchChange(delta);
  const alert = buildResearchUpdateAlert(project, delta, changeLevel, gate.trigger);

  return { filtered: false, created, projectId: project.id, run, delta, changeLevel, alert };
}

// ── Newsroom signal mapping & bridge factory ─────────────────────────────────

/** Maps a NewsroomSignal to the normalised bridge input. */
export function newsroomSignalToEvent(signal: NewsroomSignal): NewsroomEventInput {
  return {
    id: signal.id,
    title: signal.title,
    summary: signal.summary,
    entities: signal.keyEntities,
    priority: signal.priority,
    firstDetectedAt: signal.firstDetectedAt,
    lastUpdatedAt: signal.lastUpdatedAt,
    independentSourceCount: signal.independentSourceCount,
    primarySourceCount: signal.primarySourceCount,
    contradictionCount: signal.contradictionIds.length,
    keyClaims: signal.keyClaims,
    scores: {
      novelty: signal.scores.novelty,
      velocity: signal.scores.velocity,
      importance: signal.scores.importance,
    },
  };
}

export interface NewsroomResearchBridgeOptions {
  core?: ResearchIntelligenceCore;
  registry?: ResearchSourceRegistry;
  createdBy?: string;
}

/**
 * Builds the newsroom → research bridge handler conforming to
 * NewsroomIntelligenceCore.setResearchBridge. Uses the registry's approved
 * sources ONLY — the fixture adapter never participates, and a registry with
 * zero approved sources refuses to run (never silently succeeds empty).
 */
export function createNewsroomResearchBridge(
  options: NewsroomResearchBridgeOptions = {}
): (signal: NewsroomSignal) => Promise<void> {
  const core = options.core ?? (ResearchIntelligenceCore.getInstance() as ResearchIntelligenceCore);
  const registry = options.registry ?? researchSourceRegistry;
  const createdBy = options.createdBy ?? 'newsroom-bridge';

  return async (signal: NewsroomSignal): Promise<void> => {
    try {
      if (registry.getEligible().length === 0) return;
      const event = newsroomSignalToEvent(signal);
      await applyNewsEventToResearch(core, event, {
        adapters: [registry.toRssAdapter()],
        createdBy,
      });
    } catch (err) {
      // The bridge must never bring down the newsroom ingestion loop.
      console.error('[NewsroomResearchBridge] failed to apply news event to research:', err);
    }
  };
}

// Re-export the slug helper for consistent project slugs in bridge-created titles.
export { toSlug };
