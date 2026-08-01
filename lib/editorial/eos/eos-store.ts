/**
 * ─── The Breakdown OS — EOS Canonical Store (RELEASE-4) ───────────────────────
 * In-memory editorial repository seeded deterministically from the frozen UP403
 * dataset. Stories, dossiers, packets, claims, assignments, collections and the
 * activity timeline are projections over canonical data — the store never
 * invents facts that are not in the dataset.
 *
 * Mutations are guarded by the EOS workflow (eos-workflow.ts); publication is
 * blocked while claims are unresolved.
 */

import type { ConstituencyRecord } from '../../up403/types';
import { loadData, getDataById } from '../../up403/loader';
import { getProvenanceForField } from '../../up403/provenance';
import { s } from './eos-format';
import type {
  NewsroomStory,
  NewsroomClaim,
  NewsroomStage,
  ResearchDossier,
  CollaborationActivity,
  KnowledgeCaptureRecord,
  EditorialCollection,
  DiscoveryOpportunity,
  EditorialAssignment,
  NewsroomMetrics,
  FactCheckReport,
  VerificationStatus,
  EosTransitionResult,
} from '../../../types/editorial-newsroom';
import { buildDiscoveryReport } from './eos-discovery';
import {
  buildStoryPacket,
  buildPacketHeadline,
  captureDossierEvidence,
  createDossier,
  addDossierNote,
} from './eos-domain';
import { runFactCheck, reviewClaim } from './eos-verification';
import { buildCollections } from './eos-collections';
import { deriveAssignments } from './eos-assignments';
import {
  transitionNewsroomStory,
  publicationBlockers,
} from './eos-workflow';
import {
  addActivity,
  captureKnowledge,
  computeNewsroomMetrics,
  createActivity,
} from './eos-publishing';

const ACTORS = {
  priya: { id: 'reporter-priya', name: 'Priya Sharma', role: 'Reporter' },
  rahul: { id: 'reporter-rahul', name: 'Rahul Verma', role: 'Reporter' },
  anita: { id: 'editor-anita', name: 'Anita Desai', role: 'Editor' },
  sameer: { id: 'checker-sameer', name: 'Sameer Khan', role: 'Fact Checker' },
  meera: { id: 'researcher-meera', name: 'Meera Iyer', role: 'Researcher' },
} as const;

const BASE_TIME = '2026-07-28T08:00:00.000Z';

function isoMinutesAfter(base: string, minutes: number): string {
  return new Date(new Date(base).getTime() + minutes * 60_000).toISOString();
}

interface EosState {
  stories: NewsroomStory[];
  dossiers: ResearchDossier[];
  activities: CollaborationActivity[];
  knowledgeRecords: KnowledgeCaptureRecord[];
  collections: EditorialCollection[];
  opportunities: DiscoveryOpportunity[];
  governanceGap: boolean;
  seeded: boolean;
}

const state: EosState = {
  stories: [],
  dossiers: [],
  activities: [],
  knowledgeRecords: [],
  collections: [],
  opportunities: [],
  governanceGap: true,
  seeded: false,
};

function buildClaims(storyId: string, rec: ConstituencyRecord, status: VerificationStatus): NewsroomClaim[] {
  const at = isoMinutesAfter(BASE_TIME, 120);
  const mk = (category: NewsroomClaim['category'], canonicalField: string, text: string, assertedValue: string): NewsroomClaim => {
    const prov = getProvenanceForField(canonicalField);
    const verified = status === 'Verified';
    return {
      id: `${storyId}-${canonicalField}`,
      storyId,
      text,
      category,
      constituencyId: rec.canonical_constituency_id,
      canonicalField,
      assertedValue,
      canonicalValue: assertedValue,
      status,
      blocking: !verified,
      provenance: prov,
      checkedBy: verified ? ACTORS.sameer.id : undefined,
      checkedAt: verified ? at : undefined,
    };
  };

  return [
    mk('MLA name', 'current_mla_name', `The current MLA of ${rec.constituency_name} is ${rec.current_mla_name}.`, rec.current_mla_name),
    mk('MP name', 'current_mp_name', `The sitting MP for ${rec.pc_name} is ${rec.current_mp_name}.`, rec.current_mp_name),
    mk('Election result', 'winner_2022', `In 2022, ${rec.winner_2022} won ${rec.constituency_name}.`, rec.winner_2022),
    mk('Vote margin', 'victory_margin_pct_2022', `The 2022 victory margin in ${rec.constituency_name} was ${s(rec.victory_margin_pct_2022)} percentage points.`, s(rec.victory_margin_pct_2022)),
    mk('Party name', 'current_mla_party', `The sitting MLA party for ${rec.constituency_name} is ${rec.current_mla_party}.`, rec.current_mla_party),
    mk('Political DNA', 'dna_classification', `The political DNA of ${rec.constituency_name} is ${rec.dna_classification}.`, rec.dna_classification),
    mk('Representation status', 'current_mla_status', `The MLA seat in ${rec.constituency_name} has status ${rec.current_mla_status}.`, rec.current_mla_status),
    mk('Administrative detail', 'district', `${rec.constituency_name} is in ${rec.district} district.`, rec.district),
    mk('Development detail', 'development_coverage_status', `Development coverage for ${rec.constituency_name} is recorded as ${rec.development_coverage_status}.`, rec.development_coverage_status),
  ];
}

function stagePath(stage: NewsroomStage): NewsroomStage[] {
  const full: NewsroomStage[] = ['assigned', 'research', 'writing', 'fact_check', 'editorial_review', 'scheduled', 'published'];
  const idx = full.indexOf(stage);
  return idx >= 0 ? full.slice(0, idx + 1) : ['assigned', 'research', 'writing', 'fact_check', 'editorial_review', 'scheduled', 'published', 'archived'];
}

function buildStory(
  opp: DiscoveryOpportunity,
  rec: ConstituencyRecord,
  stage: NewsroomStage,
  actors: string[],
  tags: string[]
): NewsroomStory {
  const id = `story-${opp.id}`;
  const now = new Date().toISOString();
  const packet = buildStoryPacket(rec);
  const claims = buildClaims(id, rec, stage === 'published' || stage === 'editorial_review' ? 'Verified' : 'Needs Verification');

  const corrections =
    stage === 'published'
      ? [
          {
            id: `corr-${id}-2`,
            storyId: id,
            version: 2,
            description: 'Refined the vote-share figure following reconciliation with the ECI gazette.',
            reason: 'Verification Bureau reconciliation of aggregate vote share.',
            createdAt: isoMinutesAfter(BASE_TIME, 60),
          },
        ]
      : [];

  return {
    id,
    title: opp.title,
    slug: id,
    stage,
    constituencyId: rec.canonical_constituency_id,
    dossierId: `dos-${id}`,
    discoverySignal: opp.signal,
    packet: { ...packet, storyId: id },
    claims,
    blockingIssues: [],
    reporters: actors,
    editor: stage === 'editorial_review' || stage === 'published' || stage === 'scheduled' ? ACTORS.anita.id : undefined,
    factChecker: stage === 'published' ? ACTORS.sameer.id : undefined,
    deadline: isoMinutesAfter(BASE_TIME, 60 * 24 * 3),
    tags,
    version: corrections.length > 0 ? 2 : 1,
    corrections,
    createdAt: isoMinutesAfter(BASE_TIME, 10),
    updatedAt: now,
    publishedAt: stage === 'published' ? isoMinutesAfter(BASE_TIME, 240) : undefined,
  };
}

function seedActivities(story: NewsroomStory): CollaborationActivity[] {
  const activities: CollaborationActivity[] = [];
  let idx = 0;
  for (const step of stagePath(story.stage)) {
    const actor = step === 'fact_check' || step === 'editorial_review' ? ACTORS.anita.id : ACTORS.priya.id;
    activities.push(
      createActivity(story.id, actor, 'transition', `Advanced "${story.title}" from ${idx === 0 ? 'creation' : stagePath(story.stage)[idx - 1]} to ${step}.`)
    );
    idx++;
  }
  if (story.corrections.length > 0) {
    activities.push(createActivity(story.id, ACTORS.sameer.id, 'correction', story.corrections[0].description));
  }
  return activities;
}

function pickOpportunities(opps: DiscoveryOpportunity[]): Array<{ opp: DiscoveryOpportunity; stage: NewsroomStage }> {
  const wanted: Array<[string, NewsroomStage]> = [
    ['close-contest', 'fact_check'],
    ['party-realignment', 'editorial_review'],
    ['long-term-incumbency', 'published'],
    ['development-gap', 'writing'],
  ];
  const used = new Set<string>();
  const picked: Array<{ opp: DiscoveryOpportunity; stage: NewsroomStage }> = [];
  for (const [signal, stage] of wanted) {
    const opp = opps.find(o => o.signal === signal && !used.has(o.id));
    if (opp) {
      used.add(opp.id);
      picked.push({ opp, stage });
    }
  }
  const remaining = opps.filter(o => !used.has(o.id)).sort((a, b) => a.priority - b.priority);
  while (picked.length < 4 && remaining.length > 0) {
    picked.push({ opp: remaining.shift() as DiscoveryOpportunity, stage: 'writing' });
  }
  return picked;
}

function seedDossier(story: NewsroomStory, rec: ConstituencyRecord): ResearchDossier {
  let dossier = createDossier({
    id: story.dossierId as string,
    title: `${rec.constituency_name} — research dossier`,
    constituencyIds: [rec.canonical_constituency_id],
    researchQuestions: [
      'How did the 2022 result compare with the 2017 and 2012 outcomes?',
      'What does the political DNA classification tell us about vote blocs?',
      'What development indicators are recorded for this seat, and which are missing?',
    ],
  });
  dossier = captureDossierEvidence(dossier, rec, 'winner_2022', '2022 Assembly winner');
  dossier = captureDossierEvidence(dossier, rec, 'current_mla_name', 'Sitting MLA');
  dossier = captureDossierEvidence(dossier, rec, 'development_coverage_status', 'Development coverage classification');
  dossier = addDossierNote(
    dossier,
    story.reporters[0],
    'Initial sweep complete. Cross-check margins against the ECI gazette before the fact-check pass.',
    []
  );
  return dossier;
}

export async function ensureEosSeed(): Promise<void> {
  if (state.seeded) return;
  const records = await loadData();
  const byId = getDataById();

  const report = buildDiscoveryReport(records);
  state.governanceGap = report.governanceGap;
  state.opportunities = report.eos;
  state.collections = buildCollections(records);

  const picked = pickOpportunities(state.opportunities);
  for (const { opp, stage } of picked) {
    const rec = byId.get(opp.constituencyId);
    if (!rec) continue;
    const story = buildStory(opp, rec, stage, [ACTORS.priya.id, ACTORS.rahul.id], [opp.category, opp.signal]);
    state.stories.push(story);
    state.dossiers.push(seedDossier(story, rec));
    state.activities.push(...seedActivities(story));
    if (story.stage === 'published') {
      state.knowledgeRecords.push(captureKnowledge(story));
    }
  }
  state.seeded = true;
}

// ─── Read API ─────────────────────────────────────────────────────────────────

export function getEosStories(): NewsroomStory[] {
  return [...state.stories];
}

export function getEosStory(id: string): NewsroomStory | undefined {
  return state.stories.find(s => s.id === id);
}

export function getEosDossiers(): ResearchDossier[] {
  return [...state.dossiers];
}

export function getEosDossier(id: string): ResearchDossier | undefined {
  return state.dossiers.find(d => d.id === id);
}

export function getEosActivities(): CollaborationActivity[] {
  return [...state.activities];
}

export function getEosCollections(): EditorialCollection[] {
  return [...state.collections];
}

export function getEosOpportunities(): DiscoveryOpportunity[] {
  return [...state.opportunities];
}

export function getEosGovernanceGap(): boolean {
  return state.governanceGap;
}

export function getEosAssignments(): EditorialAssignment[] {
  return deriveAssignments(state.stories);
}

export function getEosMetrics(): NewsroomMetrics {
  return computeNewsroomMetrics(state.stories, state.activities, state.dossiers);
}

export function getEosRecord(constituencyId: string): ConstituencyRecord | undefined {
  return getDataById().get(constituencyId);
}

export function getEosBlockers(story: NewsroomStory): string[] {
  return publicationBlockers(story);
}

// ─── Write API (guarded by eos-workflow) ──────────────────────────────────────

export function eosTransition(storyId: string, to: NewsroomStage, actorId: string, notes?: string): EosTransitionResult {
  const story = getEosStory(storyId);
  if (!story) return { success: false, error: `Unknown story ${storyId}.` };
  const result = transitionNewsroomStory(story, to, actorId, notes);
  if (result.success && result.story) {
    const updated = result.story;
    state.stories = state.stories.map(s => (s.id === storyId ? updated : s));
    if (result.activity) state.activities = addActivity(state.activities, result.activity);
    if (to === 'published') {
      state.knowledgeRecords.push(captureKnowledge(updated));
    }
  }
  return result;
}

export function eosVerifyStory(storyId: string, checkerId: string): FactCheckReport | undefined {
  const story = getEosStory(storyId);
  if (!story) return undefined;
  const rec = getEosRecord(story.constituencyId);
  if (!rec) return undefined;
  const report = runFactCheck(story.claims, rec, checkerId);
  state.stories = state.stories.map(s =>
    s.id === storyId
      ? {
          ...s,
          claims: report.claims,
          factChecker: checkerId,
          updatedAt: new Date().toISOString(),
        }
      : s
  );
  return report;
}

export function eosUpdateClaims(storyId: string, claims: NewsroomClaim[]): NewsroomStory | undefined {
  const story = getEosStory(storyId);
  if (!story) return undefined;
  const updated: NewsroomStory = { ...story, claims, updatedAt: new Date().toISOString() };
  state.stories = state.stories.map(s => (s.id === storyId ? updated : s));
  return updated;
}

/** Module 4 — evidence review: an editor approves or adjusts a claim's verification status. */
export function eosReviewClaim(
  storyId: string,
  claimId: string,
  status: VerificationStatus,
  reviewerId: string,
  notes?: string
): NewsroomStory | undefined {
  const story = getEosStory(storyId);
  if (!story) return undefined;
  const claims = story.claims.map(c => {
    if (c.id !== claimId) return c;
    return reviewClaim(c, status, reviewerId, notes);
  });
  return eosUpdateClaims(storyId, claims);
}

export function eosIssueCorrection(
  storyId: string,
  description: string,
  reason: string,
  actorId: string
): NewsroomStory | undefined {
  const story = getEosStory(storyId);
  if (!story) return undefined;
  const nextVersion = story.version + 1;
  const updated: NewsroomStory = {
    ...story,
    version: nextVersion,
    corrections: [
      ...story.corrections,
      { id: `corr-${storyId}-${String(nextVersion)}`, storyId, version: nextVersion, description, reason, createdAt: new Date().toISOString() },
    ],
    updatedAt: new Date().toISOString(),
  };
  state.stories = state.stories.map(s => (s.id === storyId ? updated : s));
  state.activities = addActivity(state.activities, createActivity(storyId, actorId, 'correction', `${description} (reason: ${reason})`));
  return updated;
}

export function eosAddStoryNote(storyId: string, authorId: string, body: string, mentions: string[] = []): boolean {
  const story = getEosStory(storyId);
  const dossier = story ? getEosDossier(story.dossierId as string) : undefined;
  if (!story || !dossier) return false;
  const updated = addDossierNote(dossier, authorId, body, mentions);
  state.dossiers = state.dossiers.map(d => (d.id === dossier.id ? updated : d));
  state.activities = addActivity(state.activities, createActivity(storyId, authorId, 'note', body));
  return true;
}

/** Story creation step for the E2E workflow (Module 15 acceptance). */
export async function eosCreateStoryFromOpportunity(opportunityId: string, actors: string[], tags: string[]): Promise<NewsroomStory | undefined> {
  await ensureEosSeed();
  const opp = state.opportunities.find(o => o.id === opportunityId);
  if (!opp) return undefined;
  const rec = getEosRecord(opp.constituencyId);
  if (!rec) return undefined;
  const story = buildStory(opp, rec, 'assigned', actors, tags);
  story.packet = { ...(story.packet as NonNullable<NewsroomStory['packet']>), headline: buildPacketHeadline(rec, opp.title) };
  state.stories.push(story);
  state.dossiers.push(seedDossier(story, rec));
  state.activities.push(createActivity(story.id, actors[0], 'transition', `Created story "${story.title}" from discovery opportunity ${opp.id}.`));
  return story;
}
