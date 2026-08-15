/**
 * ─── Research Intelligence — Core Facade ─────────────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * The Research Intelligence Engine's authoritative state + operations facade.
 * Mirrors the newsroom core convention: a singleton that owns the persisted
 * state, exposes registry-style accessors/mutators, and never lets process-local
 * state diverge from the durable snapshot (persist after every authoritative
 * mutation; reload on bootstrap).
 */

import type {
  ResearchClaim,
  ResearchChangeEvent,
  ResearchChangeSeverity,
  ResearchChangeType,
  ResearchContradiction,
  ResearchDocument,
  ResearchEvent,
  ResearchEvidence,
  ResearchGap,
  ResearchPackExport,
  ResearchProject,
  ResearchProjectOverview,
  ResearchProjectStatus,
  ResearchQuery,
  ResearchQuestion,
  ResearchRun,
  ResearchSource,
  ResearchStoryBrief,
  SocialSignal,
  CorroborationCluster,
} from '@/types/research-intelligence';
import type { ResearchSourceAdapter } from './adapters/interface';
import type { ResearchPersistedState, ResearchStateRepository } from './persistence/state';
import { emptyPersistedState, RESEARCH_STATE_VERSION } from './persistence/state';
import { createResearchStateRepository } from './persistence';
import { ResearchAdapterRegistry } from './adapters/registry';
import { createProjectId, createQuestionId, createStoryBriefId } from '@/lib/intel/research/ids';
import { toSlug } from '@/lib/intel/research/normalization';
import { runResearchPipeline, PipelineOptions } from './pipeline';

export interface CreateResearchProjectInput {
  title: string;
  description: string;
  researchQuestion?: string;
  priority?: ResearchProject['priority'];
  createdBy: string;
  scope?: ResearchProject['scope'];
  sourcePolicy?: ResearchProject['sourcePolicy'];
  monitoringEnabled?: boolean;
  monitoringFrequency?: ResearchProject['monitoringFrequency'];
}

const PRIMARY_CLASSES = ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY'];

export class ResearchIntelligenceCore {
  private repository: ResearchStateRepository;
  private state: ResearchPersistedState;
  private loaded = false;
  private readonly adapterRegistry = new ResearchAdapterRegistry();

  private constructor(repository?: ResearchStateRepository, adapters?: ResearchSourceAdapter[]) {
    this.repository = repository ?? createResearchStateRepository();
    this.state = emptyPersistedState();
    if (adapters) {
      for (const adapter of adapters) this.adapterRegistry.register(adapter);
    }
  }

  private static instance: ResearchIntelligenceCore | null = null;

  public static getInstance(
    repository?: ResearchStateRepository,
    adapters?: ResearchSourceAdapter[]
  ): ResearchIntelligenceCore {
    if (!ResearchIntelligenceCore.instance) {
      ResearchIntelligenceCore.instance = new ResearchIntelligenceCore(repository, adapters);
    }
    return ResearchIntelligenceCore.instance;
  }

  public static resetInstance(): void {
    ResearchIntelligenceCore.instance = null;
  }

  public async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const persisted = await this.repository.load();
    if (persisted && persisted.version === RESEARCH_STATE_VERSION) {
      this.state = { ...emptyPersistedState(), ...persisted };
    }
    this.loaded = true;
  }

  /** Current authoritative state (read-only view for exports/audits). */
  public snapshot(): ResearchPersistedState {
    return this.state;
  }

  /** Persist the current authoritative state to the durable repository. */
  public persist(): void {
    this.state.savedAt = new Date().toISOString();
    void Promise.resolve(this.repository.save(this.state)).catch((err) => {
      console.error('[ResearchIntelligenceCore] persist failed:', err);
    });
  }

  // ── Adapters ───────────────────────────────────────────────────────────────

  public registerAdapter(adapter: ResearchSourceAdapter): void {
    this.adapterRegistry.register(adapter);
  }

  public getAdapters(): ResearchSourceAdapter[] {
    return this.adapterRegistry.list();
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  public createProject(input: CreateResearchProjectInput): ResearchProject {
    const now = new Date().toISOString();
    const project: ResearchProject = {
      id: createProjectId(),
      title: input.title.trim(),
      slug: toSlug(input.title),
      description: input.description.trim(),
      researchQuestion: input.researchQuestion,
      status: 'DRAFT',
      priority: input.priority ?? 'P2',
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      monitoringEnabled: input.monitoringEnabled ?? false,
      monitoringFrequency: input.monitoringFrequency ?? 'DAILY',
      scope: input.scope ?? { geographicScope: [], languages: ['en'] },
      sourcePolicy: input.sourcePolicy ?? {
        allowSocial: true,
        sourceClasses: ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY', 'ACADEMIC', 'HIGH_QUALITY_SECONDARY', 'SPECIALIST_MEDIA', 'GENERAL_MEDIA'],
      },
      topics: null,
      queries: [],
      sourceIds: [],
      documentIds: [],
      claimIds: [],
      evidenceIds: [],
      entityIds: [],
      contradictionIds: [],
      gapIds: [],
      timelineEventIds: [],
      questionIds: [],
      socialSignalIds: [],
      clusterIds: [],
      runIds: [],
      version: 1,
    };
    this.state.projects.push(project);
    this.persist();
    return project;
  }

  public getProjects(): ResearchProject[] {
    return [...this.state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public getProject(id: string): ResearchProject | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public getProjectBySlug(slug: string): ResearchProject | undefined {
    return this.state.projects.find((p) => p.slug === slug);
  }

  public updateProject(
    id: string,
    patch: Partial<Pick<ResearchProject, 'title' | 'description' | 'researchQuestion' | 'priority' | 'status' | 'monitoringEnabled' | 'monitoringFrequency' | 'scope' | 'sourcePolicy'>>
  ): ResearchProject | undefined {
    const project = this.getProject(id);
    if (!project) return undefined;
    Object.assign(project, patch);
    project.updatedAt = new Date().toISOString();
    project.version += 1;
    if (patch.status === 'ACTIVE' && !project.startedAt) project.startedAt = project.updatedAt;
    if (patch.status === 'COMPLETED') project.completedAt = project.updatedAt;
    this.persist();
    return project;
  }

  public setProjectStatus(id: string, status: ResearchProjectStatus): ResearchProject | undefined {
    return this.updateProject(id, { status });
  }

  public getProjectOverview(id: string): ResearchProjectOverview | null {
    const project = this.getProject(id);
    if (!project) return null;
    const sources = this.getSources(id);
    const claims = this.getClaims(id);
    const contradictions = this.getContradictions(id);
    const gaps = this.getGaps(id);
    const runs = this.getRuns(id);

    return {
      project,
      sourceCount: sources.length,
      primarySourceCount: sources.filter((s) => PRIMARY_CLASSES.includes(s.sourceClass)).length,
      verifiedClaims: claims.filter((c) => ['CORROBORATED', 'PRIMARY_SOURCE_CONFIRMED'].includes(c.verificationState)).length,
      unverifiedClaims: claims.filter((c) => ['SIGNAL_ONLY', 'UNVERIFIED'].includes(c.verificationState)).length,
      corroboratedClaims: claims.filter((c) => c.verificationState === 'CORROBORATED').length,
      contradictions: contradictions.length,
      openResearchGaps: gaps.filter((g) => g.status === 'OPEN').length,
      events: this.getEvents(id).length,
      documents: project.documentIds.length,
      evidence: project.evidenceIds.length,
      questions: this.getQuestions(id).length,
      socialSignals: this.getSocialSignals(id).length,
      clusters: project.clusterIds.length,
      recentDevelopments: this.getChangeEvents(id).slice(0, 5),
      latestRun: runs[runs.length - 1] ?? null,
    };
  }

  // ── Pipeline ───────────────────────────────────────────────────────────────

  public runPipeline(projectId: string, options: Omit<PipelineOptions, 'adapters'>): Promise<ResearchRun> {
    return runResearchPipeline(this, projectId, { ...options, adapters: this.getAdapters() });
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  public getQueries(projectId: string): ResearchQuery[] {
    return this.getProject(projectId)?.queries ?? [];
  }

  // ── Sources ────────────────────────────────────────────────────────────────

  public getSources(projectId: string): ResearchSource[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.sourceIds
      .map((id) => this.getSource(id))
      .filter((s): s is ResearchSource => Boolean(s));
  }

  public getSource(id: string): ResearchSource | undefined {
    return this.state.sources.find((s) => s.id === id);
  }

  public addSource(source: ResearchSource): void {
    this.state.sources.push(source);
  }

  // ── Documents ──────────────────────────────────────────────────────────────

  public getDocuments(projectId: string): ResearchDocument[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.documentIds
      .map((id) => this.getDocument(id))
      .filter((d): d is ResearchDocument => Boolean(d));
  }

  public getDocument(id: string): ResearchDocument | undefined {
    return this.state.documents.find((d) => d.id === id);
  }

  public getDocumentForSource(sourceId: string): ResearchDocument | undefined {
    return this.state.documents.find((d) => d.sourceId === sourceId);
  }

  public addDocument(document: ResearchDocument): void {
    this.state.documents.push(document);
  }

  // ── Claims ─────────────────────────────────────────────────────────────────

  public getClaims(projectId: string): ResearchClaim[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.claimIds
      .map((id) => this.getClaim(id))
      .filter((c): c is ResearchClaim => Boolean(c));
  }

  public getClaim(id: string): ResearchClaim | undefined {
    return this.state.claims.find((c) => c.id === id);
  }

  public addClaim(claim: ResearchClaim): void {
    this.state.claims.push(claim);
  }

  // ── Evidence ───────────────────────────────────────────────────────────────

  public getEvidence(projectId: string): ResearchEvidence[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.evidenceIds
      .map((id) => this.getEvidenceById(id))
      .filter((e): e is ResearchEvidence => Boolean(e));
  }

  public getEvidenceById(id: string): ResearchEvidence | undefined {
    return this.state.evidence.find((e) => e.id === id);
  }

  public getEvidenceByClaim(claimId: string): ResearchEvidence[] {
    return this.state.evidence.filter((e) => e.claimId === claimId);
  }

  public addEvidence(evidence: ResearchEvidence): void {
    this.state.evidence.push(evidence);
  }

  // ── Events / timeline ──────────────────────────────────────────────────────

  public getEvents(projectId: string): ResearchEvent[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.timelineEventIds
      .map((id) => this.getEvent(id))
      .filter((e): e is ResearchEvent => Boolean(e));
  }

  public getEvent(id: string): ResearchEvent | undefined {
    return this.state.events.find((e) => e.id === id);
  }

  public addEvent(event: ResearchEvent): void {
    this.state.events.push(event);
  }

  // ── Questions ──────────────────────────────────────────────────────────────

  public getQuestions(projectId: string): ResearchQuestion[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.questionIds
      .map((id) => this.getQuestion(id))
      .filter((q): q is ResearchQuestion => Boolean(q));
  }

  public getQuestion(id: string): ResearchQuestion | undefined {
    return this.state.questions.find((q) => q.id === id);
  }

  public addQuestion(projectId: string, question: string): ResearchQuestion | undefined {
    const project = this.getProject(projectId);
    if (!project) return undefined;
    const q: ResearchQuestion = {
      id: createQuestionId(),
      projectId,
      question: question.trim(),
      status: 'UNANSWERED',
      relatedClaimIds: [],
      evidenceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.questions.push(q);
    project.questionIds.push(q.id);
    project.updatedAt = q.createdAt;
    this.persist();
    return q;
  }

  public updateQuestion(
    id: string,
    patch: Partial<Pick<ResearchQuestion, 'status' | 'relatedClaimIds' | 'evidenceCount' | 'remainingGap'>>
  ): ResearchQuestion | undefined {
    const q = this.getQuestion(id);
    if (!q) return undefined;
    Object.assign(q, patch);
    q.updatedAt = new Date().toISOString();
    this.persist();
    return q;
  }

  // ── Contradictions ─────────────────────────────────────────────────────────

  public getContradictions(projectId: string): ResearchContradiction[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.contradictionIds
      .map((id) => this.getContradiction(id))
      .filter((c): c is ResearchContradiction => Boolean(c));
  }

  public getContradiction(id: string): ResearchContradiction | undefined {
    return this.state.contradictions.find((c) => c.id === id);
  }

  public addContradiction(contradiction: ResearchContradiction): void {
    this.state.contradictions.push(contradiction);
  }

  public acknowledgeContradiction(id: string, note?: string): ResearchContradiction | undefined {
    const c = this.getContradiction(id);
    if (!c) return undefined;
    c.status = 'ACKNOWLEDGED';
    c.resolutionNote = note;
    this.persist();
    return c;
  }

  public resolveContradiction(id: string, note: string): ResearchContradiction | undefined {
    const c = this.getContradiction(id);
    if (!c) return undefined;
    c.status = 'RESOLVED';
    c.resolutionNote = note;
    c.resolvedAt = new Date().toISOString();
    this.persist();
    return c;
  }

  // ── Gaps ───────────────────────────────────────────────────────────────────

  public getGaps(projectId: string): ResearchGap[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.gapIds
      .map((id) => this.getGap(id))
      .filter((g): g is ResearchGap => Boolean(g));
  }

  public getGap(id: string): ResearchGap | undefined {
    return this.state.gaps.find((g) => g.id === id);
  }

  public addGap(gap: ResearchGap): void {
    this.state.gaps.push(gap);
  }

  public updateGapStatus(id: string, status: ResearchGap['status']): ResearchGap | undefined {
    const gap = this.getGap(id);
    if (!gap) return undefined;
    gap.status = status;
    if (status === 'RESOLVED' && !gap.resolvedAt) gap.resolvedAt = new Date().toISOString();
    this.persist();
    return gap;
  }

  // ── Social signals ─────────────────────────────────────────────────────────

  public getSocialSignals(projectId: string): SocialSignal[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.socialSignalIds
      .map((id) => this.getSocialSignal(id))
      .filter((s): s is SocialSignal => Boolean(s));
  }

  public getSocialSignal(id: string): SocialSignal | undefined {
    return this.state.socialSignals.find((s) => s.id === id);
  }

  public addSocialSignal(signal: SocialSignal): void {
    this.state.socialSignals.push(signal);
  }

  // ── Clusters ───────────────────────────────────────────────────────────────

  public getClusters(projectId: string): CorroborationCluster[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.clusterIds
      .map((id) => this.getCluster(id))
      .filter((c): c is CorroborationCluster => Boolean(c));
  }

  public getCluster(id: string): CorroborationCluster | undefined {
    return this.state.clusters.find((c) => c.id === id);
  }

  public addCluster(cluster: CorroborationCluster): void {
    this.state.clusters.push(cluster);
  }

  // ── Runs ───────────────────────────────────────────────────────────────────

  public getRuns(projectId: string): ResearchRun[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    return project.runIds
      .map((id) => this.getRun(id))
      .filter((r): r is ResearchRun => Boolean(r));
  }

  public getRun(id: string): ResearchRun | undefined {
    return this.state.runs.find((r) => r.id === id);
  }

  public recordRun(run: ResearchRun): void {
    this.state.runs.push(run);
  }

  // ── Change events ──────────────────────────────────────────────────────────

  public getChangeEvents(projectId: string): ResearchChangeEvent[] {
    return this.state.changeEvents
      .filter((e) => e.projectId === projectId)
      .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
  }

  public addChangeEvent(event: ResearchChangeEvent): void {
    this.state.changeEvents.push(event);
  }

  /**
   * Deterministic change detection for a completed run. New artifacts are
   * identified by their run-scoped timestamps (every artifact created by the
   * run carries run.startedAt as its timestamp); the run's counters drive the
   * event set. Emits and records change events; returns them.
   */
  public detectChangeEvents(projectId: string, run: ResearchRun): ResearchChangeEvent[] {
    const project = this.getProject(projectId);
    if (!project) return [];
    const now = new Date().toISOString();
    const windowStart = run.startedAt;
    const events: ResearchChangeEvent[] = [];
    const push = (
      type: ResearchChangeType,
      severity: ResearchChangeSeverity,
      title: string,
      description: string,
      relatedIds: string[] = []
    ) => {
      const event: ResearchChangeEvent = {
        id: `chg_${run.id}_${events.length}`,
        projectId,
        type,
        severity,
        title,
        description,
        relatedIds,
        detectedAt: now,
      };
      this.state.changeEvents.push(event);
      events.push(event);
    };

    // New primary sources discovered this run.
    for (const sid of project.sourceIds) {
      const source = this.getSource(sid);
      if (!source || source.discoveredAt !== windowStart || !PRIMARY_CLASSES.includes(source.sourceClass)) continue;
      push('NEW_PRIMARY_SOURCE', 'HIGH', `New primary source: ${source.title}`, `Discovered ${source.sourceClass.toLowerCase()} source: ${source.url}`, [source.id]);
    }

    // New attributed claims from important actors this run.
    const newClaims = project.claimIds
      .filter((cid) => this.getClaim(cid)?.firstSeenAt === windowStart)
      .map((cid) => this.getClaim(cid))
      .filter((c): c is ResearchClaim => Boolean(c));

    for (const claim of newClaims.filter((c) => c.attribution.isAttributed && c.attribution.attributionSource).slice(0, 3)) {
      push('IMPORTANT_ACTOR_STATEMENT', 'MEDIUM', `Statement by ${claim.attribution.attributionSource}`, claim.claimText, [claim.id]);
    }

    // Breaking developments: fresh claims (source published within 3 days).
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    for (const claim of newClaims.slice(0, 60)) {
      const source = this.getSource(claim.sourceId);
      if (!source?.publishedAt) continue;
      if (Date.now() - new Date(source.publishedAt).getTime() > threeDaysMs) continue;
      push('BREAKING_DEVELOPMENT', 'HIGH', 'Breaking development on research topic', claim.claimText, [claim.id]);
      break;
    }

    // New contradictions.
    if (run.contradictionsFound > 0) {
      const newContradictions = project.contradictionIds
        .filter((cid) => this.getContradiction(cid)?.detectedAt === windowStart)
        .map((cid) => this.getContradiction(cid))
        .filter((c): c is ResearchContradiction => Boolean(c));
      for (const c of newContradictions) {
        push('CONTRADICTION_FOUND', 'HIGH', `Contradiction: ${c.valueA ?? '?'} vs ${c.valueB ?? '?'}`, `${c.statementA.slice(0, 120)} — ${c.statementB.slice(0, 120)}`, [c.id]);
      }
    }

    if (events.length > 0) {
      project.lastMeaningfulChangeAt = now;
    }
    return events;
  }

  // ── Research pack export ───────────────────────────────────────────────────

  public exportResearchPack(projectId: string, format: ResearchPackExport['format'], generatedBy: string): ResearchPackExport | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    const now = new Date().toISOString();
    const overview = this.getProjectOverview(projectId);
    const claims = this.getClaims(projectId);
    const sources = this.getSources(projectId);
    const evidence = this.getEvidence(projectId);
    const events = this.getEvents(projectId);
    const contradictions = this.getContradictions(projectId);
    const gaps = this.getGaps(projectId);
    const questions = this.getQuestions(projectId);

    const content = buildPackContent(format, {
      project, overview, claims, sources, evidence, events, contradictions, gaps, questions,
      now, generatedBy,
      evidenceByClaim: (claimId: string) => this.getEvidenceByClaim(claimId),
      sourceById: (id: string) => this.getSource(id),
    });

    return { projectId, generatedAt: now, generatedBy, format, content };
  }

  // ── Story brief (Story OS integration) ─────────────────────────────────────

  public generateStoryBrief(projectId: string, generatedBy: string): ResearchStoryBrief | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    const now = new Date().toISOString();
    const claims = this.getClaims(projectId);
    const events = this.getEvents(projectId);
    const contradictions = this.getContradictions(projectId);
    const gaps = this.getGaps(projectId);
    const questions = this.getQuestions(projectId);

    const stateRank: Record<string, number> = {
      PRIMARY_SOURCE_CONFIRMED: 0,
      CORROBORATED: 1,
      PARTIALLY_CORROBORATED: 2,
      DISPUTED: 3,
      UNVERIFIED: 4,
      SIGNAL_ONLY: 5,
      FALSE_OR_MISLEADING: 6,
    };
    const keyClaims = claims
      .filter((c) => c.verificationState !== 'SIGNAL_ONLY')
      .sort((a, b) => (stateRank[a.verificationState] ?? 9) - (stateRank[b.verificationState] ?? 9))
      .slice(0, 12);

    const entitySet = new Set<string>(project.topics?.entities.map((e) => e.name) ?? []);
    for (const c of claims) c.entityMentions.forEach((m) => entitySet.add(m));

    const lineage = keyClaims.map((claim) => {
      const ev = this.getEvidenceByClaim(claim.id)[0];
      const doc = ev ? this.getDocument(ev.documentId) : undefined;
      const source = this.getSource(claim.sourceId);
      return {
        claimId: claim.id,
        evidenceId: ev?.id ?? 'none',
        documentId: doc?.id ?? 'none',
        sourceId: source?.id ?? 'none',
        url: source?.url ?? '',
      };
    });

    const brief: ResearchStoryBrief = {
      id: createStoryBriefId(),
      projectId,
      generatedAt: now,
      generatedBy,
      title: project.title,
      summary: buildSummary(this, projectId),
      researchQuestions: [
        ...questions.map((q) => ({ question: q.question, status: q.status })),
        ...gaps
          .filter((g) => g.status === 'OPEN')
          .slice(0, 3)
          .map((g) => ({ question: g.title, status: 'UNANSWERED' as const })),
      ],
      keyClaims: keyClaims.map((c) => ({
        claimId: c.id,
        claimText: c.claimText,
        verificationState: c.verificationState,
        evidenceCount: this.getEvidenceByClaim(c.id).length,
        sources: this.getClaimSources(c),
      })),
      timeline: events.map((e) => ({ date: e.date, datePrecision: e.datePrecision, title: e.title })),
      entities: Array.from(entitySet).slice(0, 40),
      contradictions,
      researchGaps: gaps.filter((g) => g.status === 'OPEN'),
      provenance: {
        methodologyVersion: 'RIE v1.0 (docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md)',
        generatedFromResearchProjectId: projectId,
        claimEvidenceLineage: lineage,
      },
    };

    this.state.storyBriefs.push(brief);
    this.persist();
    return brief;
  }

  public getStoryBriefs(projectId: string): ResearchStoryBrief[] {
    return this.state.storyBriefs.filter((b) => b.projectId === projectId);
  }

  private getClaimSources(claim: ResearchClaim): Array<{ sourceId: string; title: string; url: string; sourceClass: ResearchSource['sourceClass'] }> {
    const sources: Array<{ sourceId: string; title: string; url: string; sourceClass: ResearchSource['sourceClass'] }> = [];
    const seen = new Set<string>();
    for (const other of this.state.claims) {
      if (other.normalizedClaim !== claim.normalizedClaim) continue;
      const source = this.getSource(other.sourceId);
      if (!source || seen.has(source.id)) continue;
      seen.add(source.id);
      sources.push({
        sourceId: source.id,
        title: source.title,
        url: source.url,
        sourceClass: source.sourceClass,
      });
    }
    return sources;
  }

  public clear(): void {
    this.state = emptyPersistedState();
    this.loaded = false;
  }
}

function buildSummary(core: ResearchIntelligenceCore, projectId: string): string {
  const project = core.getProject(projectId);
  if (!project) return '';
  const overview = core.getProjectOverview(projectId);
  const claims = core.getClaims(projectId);
  const corroborated = claims.filter((c) => ['CORROBORATED', 'PRIMARY_SOURCE_CONFIRMED'].includes(c.verificationState));
  const top = corroborated.slice(0, 3);
  const parts: string[] = [
    `Research project on ${project.title}. ${claims.length} claims extracted from ${overview?.sourceCount ?? 0} sources (${overview?.primarySourceCount ?? 0} primary); ${overview?.verifiedClaims ?? 0} verified or corroborated.`,
  ];
  if (top.length > 0) {
    parts.push(`Most-established findings: ${top.map((c) => c.claimText).join(' ')}`);
  }
  const contradictions = core.getContradictions(projectId);
  if (contradictions.length > 0) {
    parts.push(`${contradictions.length} open contradiction(s) require adjudication before these findings are treated as settled.`);
  }
  return parts.join(' ');
}

interface PackBuildContext {
  project: ResearchProject;
  overview: ResearchProjectOverview | null;
  claims: ResearchClaim[];
  sources: ResearchSource[];
  evidence: ResearchEvidence[];
  events: ResearchEvent[];
  contradictions: ResearchContradiction[];
  gaps: ResearchGap[];
  questions: ResearchQuestion[];
  now: string;
  generatedBy: string;
  evidenceByClaim: (claimId: string) => ResearchEvidence[];
  sourceById: (id: string) => ResearchSource | undefined;
}

function buildPackContent(
  format: ResearchPackExport['format'],
  ctx: PackBuildContext
): string {
  const { project, overview, claims, sources, evidence, events, contradictions, gaps, questions, now, generatedBy, evidenceByClaim, sourceById } = ctx;

  if (format === 'json') {
    return JSON.stringify(
      {
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          researchQuestion: project.researchQuestion,
          status: project.status,
          priority: project.priority,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        overview,
        questions: questions.map((q) => ({ question: q.question, status: q.status })),
        claims: claims.map((c) => ({
          id: c.id,
          text: c.claimText,
          type: c.claimType,
          verificationState: c.verificationState,
          confidence: c.extractionConfidence,
          sourceId: c.sourceId,
          documentId: c.documentId,
          evidenceCount: evidenceByClaim(c.id).length,
        })),
        sources: sources.map((s) => ({
          id: s.id,
          title: s.title,
          url: s.url,
          sourceClass: s.sourceClass,
          sourceType: s.sourceType,
          status: s.status,
          publisher: s.publisher,
          publishedAt: s.publishedAt,
        })),
        evidence: evidence.map((e) => ({
          id: e.id,
          claimId: e.claimId,
          sourceId: e.sourceId,
          locator: e.locator,
          excerpt: e.excerpt,
        })),
        timeline: events.map((e) => ({ date: e.date, precision: e.datePrecision, title: e.title })),
        contradictions: contradictions.map((c) => ({
          classification: c.classification,
          statementA: c.statementA,
          statementB: c.statementB,
          valueA: c.valueA,
          valueB: c.valueB,
          status: c.status,
          nextAction: c.nextAction,
        })),
        researchGaps: gaps.map((g) => ({
          type: g.type,
          severity: g.severity,
          title: g.title,
          recommendedAction: g.recommendedAction,
          status: g.status,
        })),
        methodologyVersion: 'RIE v1.0 (research-intelligence-operating-standard)',
      },
      null,
      2
    );
  }

  if (format === 'csv') {
    const rows: string[] = ['claim_id,verification_state,claim_type,claim_text,source_url,evidence_count'];
    for (const c of claims) {
      const url = (sourceById(c.sourceId)?.url ?? '').replace(/"/g, '""');
      const text = c.claimText.replace(/"/g, '""');
      rows.push(`"${c.id}","${c.verificationState}","${c.claimType}","${text}","${url}","${evidenceByClaim(c.id).length}"`);
    }
    return rows.join('\n');
  }

  // markdown (default)
  const lines: string[] = [];
  lines.push(`# Research Pack — ${project.title}`);
  lines.push('');
  lines.push(`- Status: ${project.status} · Priority: ${project.priority}`);
  lines.push(`- Generated: ${now} · By: ${generatedBy}`);
  lines.push('- Methodology: RIE v1.0 (docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md)');
  if (project.researchQuestion) {
    lines.push('');
    lines.push('## Research question');
    lines.push('');
    lines.push(project.researchQuestion);
  }
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(`- Sources: ${overview?.sourceCount ?? sources.length} (${overview?.primarySourceCount ?? 0} primary)`);
  lines.push(`- Claims: ${claims.length} · Verified/corroborated: ${overview?.verifiedClaims ?? 0}`);
  lines.push(`- Contradictions: ${contradictions.length} · Open research gaps: ${overview?.openResearchGaps ?? 0}`);
  lines.push('');
  lines.push('## Key claims');
  lines.push('');
  const orderedClaims = [...claims].sort((a, b) => b.extractionConfidence - a.extractionConfidence);
  for (const c of orderedClaims.slice(0, 25)) {
    const source = sourceById(c.sourceId);
    lines.push(`- **[${c.verificationState}]** ${c.claimText}`);
    if (source) lines.push(`  - Source: [${source.title}](${source.url}) · ${source.sourceClass}`);
    const ev = evidenceByClaim(c.id);
    if (ev[0]) lines.push(`  - Evidence: §${ev[0].locator.paragraph ?? '?'} — "${ev[0].excerpt.slice(0, 120)}"`);
  }
  lines.push('');
  lines.push('## Timeline');
  lines.push('');
  for (const e of events) {
    lines.push(`- ${e.date ?? e.datePrecision}: ${e.title}`);
  }
  lines.push('');
  lines.push('## Contradictions');
  lines.push('');
  if (contradictions.length === 0) lines.push('- None detected.');
  for (const c of contradictions) {
    lines.push(`- **[${c.classification}]** ${c.valueA ?? '?'} vs ${c.valueB ?? '?'} — ${c.nextAction}`);
  }
  lines.push('');
  lines.push('## Research gaps');
  lines.push('');
  for (const g of gaps) {
    if (g.status !== 'OPEN') continue;
    lines.push(`- **[${g.severity}]** ${g.title} — ${g.recommendedAction}`);
  }
  return lines.join('\n');
}

export const researchIntelligenceCore = ResearchIntelligenceCore.getInstance();
