/**
 * ─── Research Intelligence — Pipeline Orchestrator ───────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Runs a bounded research pipeline for a project. The pipeline is synchronous
 * and deliberately bounded (maxQueries / maxSources / per-fetch timeouts) so a
 * single HTTP request can complete a run. Every stage records counts and
 * errors into the ResearchRun; failures degrade gracefully (PARTIAL/FAILED
 * status) and are NEVER silently hidden — inaccessible sources surface as
 * ACCESS_UNAVAILABLE, and the run carries every error string.
 *
 * Pipeline stages:
 *   topic-expand → query-generate → source-discover → source-deduplicate →
 *   document-fetch → document-normalize → claim-extract → evidence-link →
 *   corroborate → contradiction-detect → timeline-build → gap-detect →
 *   change-detect
 */

import type {
  AdapterContext,
  DiscoveredSourceItem,
  ResearchSourceAdapter,
} from './adapters/interface';
import type { ResearchIntelligenceCore } from './core';
import type {
  ResearchClaim as ResearchClaimType,
  ResearchContradiction,
  ResearchDocument,
  ResearchEvent,
  ResearchGap,
  ResearchRun,
  ResearchRunStage,
  ResearchSource,
  ResearchSourceType,
  ResearchStageName,
} from '@/types/research-intelligence';
import {
  expandTopic,
  generateQueries,
  isSyndicated,
  contentHash,
  normalizeText,
  canonicalizeUrl,
  urlKey,
  extractClaims,
  linkEvidence,
  corroborateAll,
  detectContradictions,
  buildTimeline,
  detectGaps,
  createSignalId,
} from '@/lib/intel/research';
import {
  createClaimId,
  createContradictionId,
  createDocumentId,
  createRunId,
  createSourceId,
} from '@/lib/intel/research/ids';
import { classifySource, computeSourceQuality } from '@/lib/intel/research/source-quality';

export interface PipelineOptions {
  trigger?: ResearchRun['trigger'];
  triggeredBy: string;
  adapters?: ResearchSourceAdapter[];
  maxQueries?: number;
  maxSources?: number;
  maxDocuments?: number;
  /** Results requested from each adapter per query (bounded discovery). */
  maxDiscoveryResultsPerQuery?: number;
  now?: () => Date;
}

interface StageBuilder {
  name: ResearchStageName;
  fn: () => Promise<void>;
}

const STAGE_NAMES: ResearchStageName[] = [
  'topic-expand',
  'query-generate',
  'source-discover',
  'source-deduplicate',
  'document-fetch',
  'document-normalize',
  'claim-extract',
  'evidence-link',
  'corroborate',
  'contradiction-detect',
  'timeline-build',
  'gap-detect',
  'change-detect',
];

/**
 * Reject outbound URLs that point at the local machine or internal network.
 * Covers loopback, private ranges, link-local, IPv6 loopback/link-local/ULA
 * and common metadata endpoints. DNS-rebinding remains a residual risk (the
 * fetch resolves the host itself); the guard blocks the most direct vectors.
 * IPv6 patterns apply only to IPv6 literals (hosts containing ':') so real
 * hostnames like `feeds.example` are never caught by prefix heuristics.
 */
export function assertSafeOutboundUrl(rawUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Unsafe outbound URL: unparseable ${rawUrl.slice(0, 80)}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsafe outbound URL: scheme ${parsed.protocol} is not http/https`);
  }
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const BLOCKED_HOSTS = new Set(['localhost', 'metadata', 'metadata.google.internal', '0.0.0.0']);
  if (BLOCKED_HOSTS.has(host)) {
    throw new Error(`Unsafe outbound URL: blocked host ${host}`);
  }
  if (host.includes(':')) {
    // IPv6 literal: loopback, IPv4-mapped loopback, link-local (fe80::/10),
    // unique-local (fc00::/7).
    if (/^(::1|::ffff:|fe[89a-b]|f[cd])/i.test(host)) {
      throw new Error(`Unsafe outbound URL: private/loopback/link-local IPv6 ${host}`);
    }
    return;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) && isPrivateIpv4(host)) {
    throw new Error(`Unsafe outbound URL: private/loopback/link-local address ${host}`);
  }
}

function isPrivateIpv4(host: string): boolean {
  const [a, b, c] = host.split('.').map((x) => Number(x));
  if (a > 255 || b > 255 || c > 255) return false;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function adaptersForQuery(
  _queryType: ResearchSourceType,
  adapters: ResearchSourceAdapter[]
): ResearchSourceAdapter[] {
  // Every adapter answers every query; each adapter filters internally (the
  // fixture adapter serves the acceptance corpus, the RSS adapter serves its
  // configured feeds). Routing by query type previously hardcoded 'fixture'
  // and made the RSS adapter unreachable in production.
  return adapters;
}

function adapterContext(now: () => Date, maxResults: number): AdapterContext {
  return {
    entities: [],
    fetcher: async (url) => {
      assertSafeOutboundUrl(url);
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      return {
        ok: res.ok,
        status: res.status,
        text: () => res.text(),
        headers: Object.fromEntries(res.headers.entries()),
      };
    },
    now,
    maxResults,
  };
}

/**
 * Execute one full research pipeline run against the core's state.
 * Mutates the project's collections and returns the run report.
 */
export async function runResearchPipeline(
  core: ResearchIntelligenceCore,
  projectId: string,
  options: PipelineOptions
): Promise<ResearchRun> {
  const now = options.now ?? (() => new Date());
  const nowIso = now().toISOString();
  const run: ResearchRun = {
    id: createRunId(),
    projectId,
    triggeredBy: options.triggeredBy,
    trigger: options.trigger ?? 'MANUAL',
    startedAt: nowIso,
    status: 'RUNNING',
    stages: STAGE_NAMES.map((name) => ({
      name,
      status: 'PENDING',
      counts: {},
      errors: [],
    })),
    queriesGenerated: 0,
    sourcesDiscovered: 0,
    sourcesFetched: 0,
    documentsProcessed: 0,
    duplicatesRemoved: 0,
    claimsExtracted: 0,
    claimsCorroborated: 0,
    contradictionsFound: 0,
    gapsFound: 0,
    errors: [],
  };

  const adapters = options.adapters ?? core.getAdapters();
  if (adapters.length === 0) {
    run.status = 'FAILED';
    run.completedAt = nowIso;
    run.errors.push('No source adapters registered.');
    core.recordRun(run);
    return run;
  }

  const maxQueries = options.maxQueries ?? 24;
  const maxSources = options.maxSources ?? 40;
  const maxDocuments = options.maxDocuments ?? 40;

  const project = core.getProject(projectId);
  if (!project) {
    run.status = 'FAILED';
    run.completedAt = nowIso;
    run.errors.push(`Project ${projectId} not found.`);
    core.recordRun(run);
    return run;
  }

  const stage = (name: ResearchStageName) => run.stages.find((s) => s.name === name)!;

  const runStage = async (name: ResearchStageName, fn: () => Promise<void>) => {
    const s = stage(name);
    s.status = 'RUNNING';
    s.startedAt = nowIso;
    try {
      await fn();
      s.status = 'COMPLETED';
    } catch (err) {
      s.status = 'FAILED';
      const msg = err instanceof Error ? err.message : String(err);
      s.errors.push(msg);
      run.errors.push(`${name}: ${msg}`);
    }
    s.completedAt = nowIso;
  };

  // ── 1. Topic expansion ────────────────────────────────────────────────────
  await runStage('topic-expand', async () => {
    if (!project.topics) {
      project.topics = expandTopic(project.title);
    }
    stage('topic-expand').counts.entities = project.topics.entities.length;
    stage('topic-expand').counts.concepts = project.topics.concepts.length;
  });

  const expansion = project.topics!;
  if (!expansion) {
    run.status = 'FAILED';
    run.completedAt = nowIso;
    run.errors.push('Topic expansion failed.');
    core.recordRun(run);
    return run;
  }

  // ── 2. Query generation ───────────────────────────────────────────────────
  await runStage('query-generate', async () => {
    const newQueries = generateQueries(expansion, { maxQueries, seedTopic: project.title });
    const existingTexts = new Set(project.queries.map((q) => q.text.toLowerCase()));
    for (const q of newQueries) {
      if (!existingTexts.has(q.text.toLowerCase())) {
        project.queries.push(q);
        existingTexts.add(q.text.toLowerCase());
      } else {
        const existing = project.queries.find((eq) => eq.text.toLowerCase() === q.text.toLowerCase());
        if (existing) existing.usedInRuns.push(run.id);
      }
    }
    run.queriesGenerated = project.queries.length;
    stage('query-generate').counts.queries = project.queries.length;
  });

  // ── 3. Source discovery ───────────────────────────────────────────────────
  const discoveredItems: DiscoveredSourceItem[] = [];
  await runStage('source-discover', async () => {
    for (const query of project.queries.slice(0, maxQueries)) {
      for (const adapter of adaptersForQuery(query.sourceType, adapters)) {
        const result = await adapter.discover(query, adapterContext(now, options.maxDiscoveryResultsPerQuery ?? 10));
        stage('source-discover').errors.push(...result.errors);
        run.errors.push(...result.errors.map((e) => `discover:${e}`));
        discoveredItems.push(...result.items);
      }
    }
    run.sourcesDiscovered = discoveredItems.length;
    stage('source-discover').counts.items = discoveredItems.length;
  });

  // ── 4. Source deduplication ───────────────────────────────────────────────
  const acceptedItems: DiscoveredSourceItem[] = [];
  await runStage('source-deduplicate', async () => {
    const seenKeys = new Set<string>();
    for (const item of discoveredItems) {
      const key = urlKey(item.url);
      if (seenKeys.has(key)) {
        run.duplicatesRemoved += 1;
        continue;
      }
      seenKeys.add(key);
      acceptedItems.push(item);
    }
    stage('source-deduplicate').counts.unique = acceptedItems.length;
    stage('source-deduplicate').counts.duplicates = run.duplicatesRemoved;
  });

  // ── 5. Document fetch ─────────────────────────────────────────────────────
  await runStage('document-fetch', async () => {
    const existingKeys = new Set(project.sourceIds.map((sid) => {
      const s = core.getSource(sid);
      return s ? urlKey(s.url) : '';
    }).filter((k) => k.length > 0));

    for (const item of acceptedItems.slice(0, maxSources)) {
      const key = urlKey(item.url);
      if (existingKeys.has(key)) {
        run.duplicatesRemoved += 1;
        stage('document-fetch').counts.skippedExisting = (stage('document-fetch').counts.skippedExisting ?? 0) + 1;
        continue;
      }
      if (item.sourceClass === 'SOCIAL' && !project.sourcePolicy.allowSocial) {
        // Social is outside the source policy: record nothing, count as skipped.
        stage('document-fetch').counts.socialSkipped = (stage('document-fetch').counts.socialSkipped ?? 0) + 1;
        continue;
      }

      const adapter = adapters.find((a) => a.id === item.adapter);
      if (!adapter) continue;

      const sourceId = createSourceId();
      const source: ResearchSource = {
        id: sourceId,
        projectId,
        title: item.title,
        publisher: item.publisher,
        publishedAt: item.publishedAt,
        discoveredAt: nowIso,
        url: item.url,
        canonicalUrl: canonicalizeUrl(item.url),
        sourceType: item.sourceType,
        sourceClass: item.sourceClass,
        snippet: item.snippet,
        queryId: undefined,
        queryText: undefined,
        adapter: adapter.id,
        relevanceScore: item.relevanceScore,
        authorityScore: 0,
        freshnessScore: 0,
        status: 'DISCOVERED',
        syndicatedCopies: [],
      };

      let fetched = false;
      try {
        const fetchResult = await adapter.fetch(item.url, adapterContext(now, 8));
        fetched = true;
        run.sourcesFetched += 1;
        stage('document-fetch').counts.fetched = (stage('document-fetch').counts.fetched ?? 0) + 1;

        const rawText = normalizeText(fetchResult.text);
        const hash = contentHash(rawText);

        // Content-level dedup across the project's documents.
        const existingDoc = project.documentIds
          .map((did) => core.getDocument(did))
          .find((d) => d?.contentHash === hash);
        if (existingDoc) {
          run.duplicatesRemoved += 1;
          stage('document-fetch').counts.contentDup = (stage('document-fetch').counts.contentDup ?? 0) + 1;
          source.status = 'VERIFIED';
          source.contentHash = hash;
          source.syndicatedFrom = isSyndicated(rawText, item.publisher) ? existingDoc.sourceId : undefined;
          core.addSource(source);
          existingKeys.add(key);
          project.sourceIds.push(sourceId);
          // The shared document is already in project.documentIds; adding it
          // again would surface the same document twice via getDocuments.
          continue;
        }

        // Near-dup / syndication detection against existing docs.
        const syndicatedFrom = findSyndicatedSource(core, projectId, rawText, item.publisher);

        const document: ResearchDocument = {
          id: createDocumentId(),
          projectId,
          sourceId,
          title: fetchResult.title ?? item.title,
          url: item.url,
          canonicalUrl: source.canonicalUrl,
          format: fetchResult.format,
          contentHash: hash,
          rawText,
          normalizedText: rawText,
          language: undefined,
          publishedAt: fetchResult.publishedAt ?? item.publishedAt,
          retrievedAt: nowIso,
          wordCount: rawText.split(/\s+/).length,
          parseStatus: rawText.trim().length === 0 ? 'EMPTY' : 'PARSED',
          metadata: { adapter: adapter.id },
          provenance: {
            sourceUrl: item.url,
            canonicalUrl: source.canonicalUrl,
            retrievedAt: nowIso,
            contentHash: hash,
            method: 'FETCH',
          },
        };

        source.status = document.parseStatus === 'PARSED' ? 'VERIFIED' : 'FAILED';
        source.contentHash = hash;
        source.syndicatedFrom = syndicatedFrom?.id;
        if (syndicatedFrom) {
          syndicatedFrom.syndicatedCopies.push(sourceId);
        }
        source.authorityScore = computeSourceQuality(source).authority;

        core.addSource(source);
        core.addDocument(document);
        existingKeys.add(key);
        project.sourceIds.push(sourceId);
        project.documentIds.push(document.id);
        stage('document-fetch').counts.documents = (stage('document-fetch').counts.documents ?? 0) + 1;
      } catch (err) {
        source.status = 'ACCESS_UNAVAILABLE';
        source.failureReason = err instanceof Error ? err.message : String(err);
        run.errors.push(`fetch:${item.url}: ${source.failureReason}`);
        stage('document-fetch').errors.push(`${item.url}: ${source.failureReason}`);
        if (!fetched) {
          core.addSource(source);
          project.sourceIds.push(sourceId);
        }
      }
    }
    run.documentsProcessed = stage('document-fetch').counts.documents ?? 0;
  });

  // ── 6. Normalize (already applied during fetch; record shape) ─────────────
  await runStage('document-normalize', async () => {
    const docs = project.documentIds
      .map((did) => core.getDocument(did))
      .filter((d): d is ResearchDocument => Boolean(d));
    stage('document-normalize').counts.normalized = docs.length;
    stage('document-normalize').counts.languages = new Set(
      docs.map((d) => d.language ?? 'unknown')
    ).size;
  });

  // ── 7. Claim extraction ───────────────────────────────────────────────────
  await runStage('claim-extract', async () => {
    const existingClaimKeys = new Set(
      project.claimIds
        .map((cid) => core.getClaim(cid))
        .filter((c): c is ResearchClaimType => Boolean(c))
        .map((c) => `${c.normalizedClaim}:${c.sourceId}`)
    );

    for (const documentId of project.documentIds) {
      const document = core.getDocument(documentId);
      if (!document || document.parseStatus !== 'PARSED') continue;

      const claims = extractClaims(document.normalizedText, expansion, {
        maxClaimsPerDocument: 30,
        // Fixed clock: every artifact created by this run must carry the run's
        // startedAt so change detection (firstSeenAt === run.startedAt) works
        // in production, not just when tests inject a fixed `now`.
        now: () => new Date(nowIso),
      });

      for (const claim of claims) {
        const key = `${claim.normalizedClaim}:${document.sourceId}`;
        if (existingClaimKeys.has(key)) continue;
        existingClaimKeys.add(key);
        claim.id = createClaimId();
        claim.projectId = projectId;
        claim.documentId = document.id;
        claim.sourceId = document.sourceId;
        core.addClaim(claim);
        project.claimIds.push(claim.id);
        run.claimsExtracted += 1;
        stage('claim-extract').counts.claims = (stage('claim-extract').counts.claims ?? 0) + 1;
      }
    }

    // Social signals → provisional claims only when the policy allows.
    if (project.sourcePolicy.allowSocial) {
      const existingPermalinks = new Set(
        project.socialSignalIds
          .map((sid) => core.getSocialSignal(sid)?.permalink)
          .filter((p): p is string => Boolean(p))
      );
      for (const item of acceptedItems.slice(0, maxSources)) {
        if (item.sourceClass !== 'SOCIAL') continue;
        // Idempotency: a signal already recorded for this post must not be
        // duplicated by a re-run.
        if (existingPermalinks.has(item.url)) continue;
        existingPermalinks.add(item.url);
        const signalId = createSignalId();
        const signal = {
          id: signalId,
          projectId,
          platform: item.publisher ?? 'X',
          postId: signalId,
          permalink: item.url,
          author: item.publisher ?? 'unknown',
          text: item.snippet ?? item.title,
          postedAt: item.publishedAt ?? nowIso,
          discoveredAt: nowIso,
          engagement: {},
          velocityScore: 0,
          topicClassified: [],
          status: 'SIGNAL_ONLY' as const,
        };
        core.addSocialSignal(signal);
        project.socialSignalIds.push(signal.id);
      }
    }
  });

  // ── 8. Evidence linking ───────────────────────────────────────────────────
  await runStage('evidence-link', async () => {
    for (const claimId of project.claimIds) {
      const claim = core.getClaim(claimId);
      if (!claim) continue;
      const document = core.getDocument(claim.documentId);
      if (!document) continue;
      const evidence = linkEvidence({
        claimId: claim.id,
        projectId,
        documentId: document.id,
        sourceId: claim.sourceId,
        supportingSpan: claim.evidenceSpan,
        normalizedDocumentText: document.normalizedText,
      });
      core.addEvidence(evidence);
      project.evidenceIds.push(evidence.id);
      stage('evidence-link').counts.evidence = (stage('evidence-link').counts.evidence ?? 0) + 1;
    }
  });

  // ── 9. Corroboration ──────────────────────────────────────────────────────
  await runStage('corroborate', async () => {
    const claims = project.claimIds
      .map((cid) => core.getClaim(cid))
      .filter((c): c is ResearchClaimType => Boolean(c));
    const sourcesById = new Map(project.sourceIds.map((sid) => {
      const s = core.getSource(sid);
      return s ? [s.id, s] as const : null;
    }).filter((e): e is readonly [string, ResearchSource] => e !== null));

    const { states, clusters, independentCounts, primarySourceCounts } = corroborateAll(claims, sourcesById);
    for (const claim of claims) {
      const state = states.get(claim.id);
      if (state) {
        claim.verificationState = state;
        claim.lastVerifiedAt = nowIso;
      }
    }
    run.claimsCorroborated = Array.from(states.values()).filter(
      (s) => s === 'CORROBORATED' || s === 'PRIMARY_SOURCE_CONFIRMED'
    ).length;
    stage('corroborate').counts.corroborated = run.claimsCorroborated;
    stage('corroborate').counts.primaryConfirmed = Array.from(states.values()).filter(
      (s) => s === 'PRIMARY_SOURCE_CONFIRMED'
    ).length;

    const existingClusters = new Set(project.clusterIds);
    for (const cluster of clusters) {
      if (existingClusters.has(cluster.id)) continue;
      core.addCluster(cluster);
      project.clusterIds.push(cluster.id);
    }
    void independentCounts;
    void primarySourceCounts;
  });

  // ── 10. Contradiction detection ───────────────────────────────────────────
  await runStage('contradiction-detect', async () => {
    const claims = project.claimIds
      .map((cid) => core.getClaim(cid))
      .filter((c): c is ResearchClaimType => Boolean(c));
    const sourcesById = new Map(project.sourceIds.map((sid) => {
      const s = core.getSource(sid);
      return s ? [s.id, s] as const : null;
    }).filter((e): e is readonly [string, ResearchSource] => e !== null));

    const existingPairs = new Set(
      project.contradictionIds
        .map((cid) => core.getContradiction(cid))
        .filter((c): c is ResearchContradiction => Boolean(c))
        .map((c) => `${c.claimIdA}:${c.claimIdB}`)
    );

    const results = detectContradictions(claims, sourcesById, 200);
    for (const result of results) {
      const pairKey = `${result.claimA.id}:${result.claimB.id}`;
      if (existingPairs.has(pairKey)) continue;
      const contradiction = {
        id: createContradictionId(),
        projectId,
        claimIdA: result.claimA.id,
        claimIdB: result.claimB.id,
        statementA: result.claimA.claimText,
        statementB: result.claimB.claimText,
        sourceIdA: result.claimA.sourceId,
        sourceIdB: result.claimB.sourceId,
        metric: result.metric,
        valueA: result.valueA,
        valueB: result.valueB,
        classification: result.classification,
        possibleExplanation: result.possibleExplanation,
        status: 'OPEN' as const,
        detectedAt: nowIso,
        nextAction: result.nextAction,
      };
      core.addContradiction(contradiction);
      project.contradictionIds.push(contradiction.id);
      existingPairs.add(pairKey);
      run.contradictionsFound += 1;
      stage('contradiction-detect').counts.contradictions = run.contradictionsFound;
    }
  });

  // ── 11. Timeline build ────────────────────────────────────────────────────
  await runStage('timeline-build', async () => {
    const claims = project.claimIds
      .map((cid) => core.getClaim(cid))
      .filter((c): c is ResearchClaimType => Boolean(c))
      .map((c) => ({
        claimId: c.id,
        text: c.claimText,
        sourceId: c.sourceId,
        entityMentions: c.entityMentions,
      }));
    const events = buildTimeline(claims);
    const existingKeys = new Set(
      project.timelineEventIds
        .map((eid) => core.getEvent(eid))
        .filter((e): e is ResearchEvent => Boolean(e))
        .map((e) => `${e.date ?? ''}:${e.title.slice(0, 60)}`)
    );
    for (const event of events) {
      const key = `${event.date ?? ''}:${event.title.slice(0, 60)}`;
      if (existingKeys.has(key)) continue;
      event.projectId = projectId;
      core.addEvent(event);
      project.timelineEventIds.push(event.id);
      existingKeys.add(key);
      stage('timeline-build').counts.events = (stage('timeline-build').counts.events ?? 0) + 1;
    }
  });

  // ── 12. Gap detection ─────────────────────────────────────────────────────
  await runStage('gap-detect', async () => {
    const claims = project.claimIds
      .map((cid) => core.getClaim(cid))
      .filter((c): c is ResearchClaimType => Boolean(c));
    const sources = project.sourceIds
      .map((sid) => core.getSource(sid))
      .filter((s): s is ResearchSource => Boolean(s));
    const contradictions = project.contradictionIds
      .map((cid) => core.getContradiction(cid))
      .filter((c): c is ResearchContradiction => Boolean(c));
    const events = project.timelineEventIds
      .map((eid) => core.getEvent(eid))
      .filter((e): e is ResearchEvent => Boolean(e));

    const gaps = detectGaps({
      projectId,
      claims: claims.map((c) => ({
        id: c.id,
        verificationState: c.verificationState,
        entityMentions: c.entityMentions,
        firstSeenAt: c.firstSeenAt,
      })),
      sources: sources.map((s) => ({ id: s.id, sourceClass: s.sourceClass })),
      contradictions: contradictions.map((c) => ({ id: c.id })),
      events: events.map((e) => ({ datePrecision: e.datePrecision })),
    });

    // Close previously OPEN gaps that are no longer present, keep resolved history.
    for (const existingId of project.gapIds) {
      const existing = core.getGap(existingId);
      if (!existing || existing.status !== 'OPEN') continue;
      const stillOpen = gaps.some((g) => g.title === existing.title);
      if (!stillOpen) {
        existing.status = 'RESOLVED';
        existing.resolvedAt = nowIso;
      }
    }
    const existingTitles = new Set(
      project.gapIds
        .map((gid) => core.getGap(gid))
        .filter((g): g is ResearchGap => Boolean(g))
        .map((g) => g.title)
    );
    for (const gap of gaps) {
      if (existingTitles.has(gap.title)) continue;
      core.addGap(gap);
      project.gapIds.push(gap.id);
      existingTitles.add(gap.title);
      run.gapsFound += 1;
      stage('gap-detect').counts.gaps = run.gapsFound;
    }
  });

  // ── 13. Change detection ──────────────────────────────────────────────────
  await runStage('change-detect', async () => {
    const changeEvents = core.detectChangeEvents(projectId, run);
    stage('change-detect').counts.events = changeEvents.length;
  });

  // ── Finalize ──────────────────────────────────────────────────────────────
  const failedStages = run.stages.filter((s) => s.status === 'FAILED').length;
  run.status = failedStages > 0 ? (run.errors.length > 0 ? 'PARTIAL' : 'COMPLETED') : 'COMPLETED';
  run.completedAt = nowIso;
  project.lastDiscoveryAt = nowIso;
  if (run.errors.length > 0) run.status = 'PARTIAL';
  if (failedStages === run.stages.length) run.status = 'FAILED';

  core.recordRun(run);
  project.runIds.push(run.id);
  project.updatedAt = nowIso;
  project.version += 1;
  core.persist();

  return run;
}

function findSyndicatedSource(
  core: ResearchIntelligenceCore,
  projectId: string,
  rawText: string,
  publisher?: string
): ResearchSource | null {
  if (!isSyndicated(rawText, publisher)) return null;
  const project = core.getProject(projectId);
  if (!project) return null;
  for (const sourceId of project.sourceIds) {
    const source = core.getSource(sourceId);
    if (source?.contentHash && core.getDocumentForSource(source.id)?.contentHash === contentHash(rawText)) {
      return source;
    }
  }
  return null;
}
