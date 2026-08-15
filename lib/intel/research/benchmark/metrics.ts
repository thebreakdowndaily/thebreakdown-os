/**
 * ─── RIE v1.1 — Recall Benchmark Metrics ─────────────────────────────────────
 * Governing document: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * Pure, deterministic computation of recall / precision / freshness /
 * independence / cost metrics from a topic run snapshot and match results.
 * No network, no AI, no randomness — fully testable.
 */

import { propositionKey, detectLanguage } from '@/lib/intel/research/normalization';
import { WIRE_AGENCIES } from '@/lib/intel/research/deduplication';
import { isRecalled, titleSimilarity } from './matching';
import type {
  BenchmarkTopic,
  CoverageGap,
  GoldSource,
  MissClassification,
  MissDiagnostic,
  TopicMetrics,
  TopicMatchResult,
  TopicRunSnapshot,
} from './types';

const PRIMARY_CLASSES = ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY'];
const PRIMARY_LIKE_CATEGORIES = new Set(['PRIMARY', 'COURT', 'REGULATORY', 'PARLIAMENTARY', 'DATASET']);
const LEGAL_CATEGORIES = new Set(['COURT', 'REGULATORY', 'PARLIAMENTARY']);

function percentile(sortedValues: number[], p: number): number | null {
  if (sortedValues.length === 0) return null;
  if (sortedValues.length === 1) return sortedValues[0];
  const rank = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (rank - lower);
}

function publisherKey(source: TopicRunSnapshot['sources'][number]): string {
  const p = (source.publisher ?? '').toLowerCase();
  if (p) return p;
  try {
    return new URL(source.url).hostname.replace(/^www\./, '');
  } catch {
    return source.url.toLowerCase();
  }
}

function isWire(publisher?: string): boolean {
  if (!publisher) return false;
  const upper = publisher.toUpperCase();
  return WIRE_AGENCIES.some((w) => upper.includes(w.toUpperCase()));
}

function hourDelta(discoveredAt: string, publishedAt?: string): number | null {
  if (!publishedAt) return null;
  const d = new Date(discoveredAt).getTime();
  const p = new Date(publishedAt).getTime();
  if (!Number.isFinite(d) || !Number.isFinite(p)) return null;
  return Math.max(0, (d - p) / 3_600_000);
}

function isPrimaryLike(gold: GoldSource): boolean {
  return PRIMARY_LIKE_CATEGORIES.has(gold.category) || PRIMARY_CLASSES.includes(gold.sourceClass);
}

function significantTokens(text: string): string[] {
  return propositionKey(text)
    .split(' ')
    .filter((t) => t.length > 3)
    .slice(0, 12);
}

function tokensOverlap(aText: string, bText: string): boolean {
  const a = new Set(significantTokens(aText));
  if (a.size === 0) return false;
  const b = significantTokens(bText);
  let hits = 0;
  for (const t of b) if (a.has(t)) hits += 1;
  return hits >= 2;
}

/** Relevance of a fetched source to the topic: gold-matched or strong title/keyword overlap. */
function isRelevantSource(
  title: string,
  gold: GoldSource[],
  topicTitle: string
): boolean {
  if (tokensOverlap(title, topicTitle)) return true;
  return gold.some((g) => titleSimilarity(title, g.title) >= 0.3 || tokensOverlap(title, g.title));
}

export interface MissContext {
  availableAdapters: string[];
  availableQueryCategories: string[];
  activeFeedDomains: string[];
  runTimestamp: string;
}

/** Deterministic miss classification. See standard §5. */
export function classifyMiss(gold: GoldSource, ctx: MissContext): MissDiagnostic {
  const gaps: CoverageGap[] = [];
  let classification: MissClassification;

  const language = detectLanguage(`${gold.title} ${gold.reason}`);
  const domain = new URL(gold.url).hostname.replace(/^www\./, '').toLowerCase();
  const inFeed = ctx.activeFeedDomains.some((f) => domain.includes(f) || f.includes(domain));
  const hasPrimaryAdapter = ctx.availableAdapters.includes('pib') || ctx.availableAdapters.includes('primary');
  const hasWebSearch = ctx.availableAdapters.some((a) => a !== 'rss' && a !== 'fixture');
  const hasAcademicAdapter = ctx.availableAdapters.includes('academic');
  const hasRegionalAdapter = ctx.availableAdapters.includes('regional');

  if (language !== 'en') {
    classification = 'LANGUAGE_GAP';
    gaps.push('NO_LANGUAGE_COVERAGE');
  } else if (isPrimaryLike(gold)) {
    classification = 'PRIMARY_SOURCE_GAP';
    gaps.push('NO_PRIMARY_SOURCE_COVERAGE');
    if (!hasPrimaryAdapter && LEGAL_CATEGORIES.has(gold.category)) gaps.push('NO_LEGAL_COVERAGE');
  } else if (gold.category === 'ACADEMIC' || gold.sourceClass === 'ACADEMIC') {
    classification = 'ADAPTER_GAP';
    gaps.push('NO_ACADEMIC_COVERAGE');
    if (!hasAcademicAdapter) classification = 'ADAPTER_GAP';
  } else if (gold.category === 'REGIONAL') {
    classification = 'REGIONAL_GAP';
    gaps.push('NO_REGIONAL_COVERAGE', 'NO_STATE_COVERAGE');
    if (!hasRegionalAdapter) classification = 'REGIONAL_GAP';
  } else if (inFeed) {
    const publishedAt = gold.publishedAt ? new Date(gold.publishedAt).getTime() : NaN;
    const runTime = new Date(ctx.runTimestamp).getTime();
    if (Number.isFinite(publishedAt) && runTime - publishedAt > 30 * 86_400_000) {
      classification = 'TEMPORAL_GAP';
    } else {
      classification = 'WRONG_QUERY';
    }
  } else if (!hasWebSearch) {
    classification = 'SEARCH_ENGINE_GAP';
  } else {
    classification = 'NO_SOURCE';
  }

  return {
    topicId: '',
    goldSourceId: gold.sourceId,
    goldUrl: gold.url,
    goldCategory: gold.category,
    classification,
    coverageGaps: Array.from(new Set(gaps)),
    reason: `Gold source ${gold.sourceId} (${gold.category}, ${gold.sourceClass}, lang=${language}) not recalled; classified as ${classification}.`,
    availableQueryCategories: ctx.availableQueryCategories,
    availableAdapters: ctx.availableAdapters,
  };
}

export interface ComputeMetricsInput {
  topic: BenchmarkTopic;
  match: TopicMatchResult;
  snapshot: TopicRunSnapshot;
  ctx: MissContext;
}

export function computeTopicMetrics(input: ComputeMetricsInput): {
  metrics: TopicMetrics;
  misses: MissDiagnostic[];
} {
  const { topic, match, snapshot, ctx } = input;
  const gold = topic.goldSources;
  const eligible = gold.length;
  const recalledIds = gold.filter((g) => isRecalled(match.matches[g.sourceId] ?? null));

  const recalledGold = new Set(recalledIds.map((g) => g.sourceId));
  const recalled = (predicate: (g: GoldSource) => boolean) =>
    gold.filter((g) => recalledGold.has(g.sourceId) && predicate(g)).length;
  const count = (predicate: (g: GoldSource) => boolean) => gold.filter(predicate).length;

  const sourceRecall = eligible === 0 ? 0 : recalledGold.size / eligible;
  const primaryRecall = count(isPrimaryLike) === 0 ? 0 : recalled(isPrimaryLike) / count(isPrimaryLike);
  const independentRecall =
    count((g) => g.category === 'INDEPENDENT') === 0
      ? 0
      : recalled((g) => g.category === 'INDEPENDENT') / count((g) => g.category === 'INDEPENDENT');
  const regionalRecall =
    count((g) => g.category === 'REGIONAL') === 0
      ? 0
      : recalled((g) => g.category === 'REGIONAL') / count((g) => g.category === 'REGIONAL');
  const academicRecall =
    count((g) => g.category === 'ACADEMIC' || g.sourceClass === 'ACADEMIC') === 0
      ? 0
      : recalled((g) => g.category === 'ACADEMIC' || g.sourceClass === 'ACADEMIC') /
        count((g) => g.category === 'ACADEMIC' || g.sourceClass === 'ACADEMIC');
  const legalRecall =
    count((g) => LEGAL_CATEGORIES.has(g.category)) === 0
      ? 0
      : recalled((g) => LEGAL_CATEGORIES.has(g.category)) / count((g) => LEGAL_CATEGORIES.has(g.category));
  const stateRecall =
    count((g) => g.category === 'REGIONAL') === 0
      ? 0
      : recalled((g) => g.category === 'REGIONAL') / count((g) => g.category === 'REGIONAL');

  // Claim / event recall: keywords of expected facts/events present in claims/events.
  const claimRecall = computeProbeRecall(topic.expectedFacts ?? [], snapshot.claims);
  const eventRecall = computeProbeRecall(
    (topic.expectedTimelineEvents ?? []).map((e) => e.title),
    snapshot.events
  );

  const fetched = snapshot.sources.filter((s) => s.status === 'VERIFIED' || s.status === 'FETCHED');
  const fetchedCount = fetched.length;
  const relevant = fetched.filter((s) => isRelevantSource(s.title, gold, topic.title));
  const precision = fetchedCount === 0 ? 0 : relevant.length / fetchedCount;
  const falsePositiveRate = fetchedCount === 0 ? 0 : (fetchedCount - relevant.length) / fetchedCount;

  const independentPublisherCount = new Set(fetched.map(publisherKey)).size;
  const independentRatio = fetchedCount === 0 ? 0 : independentPublisherCount / fetchedCount;
  const wireCount = fetched.filter((s) => isWire(s.publisher)).length;
  const syndicatedCount = fetched.filter((s) => Boolean(s.syndicatedFrom)).length;
  const derivativeCount = countNearDuplicates(fetched);
  const originalCount = Math.max(0, fetchedCount - wireCount - syndicatedCount - derivativeCount);

  // TTD for recalled items with a known gold publishedAt.
  const ttdHours: number[] = [];
  for (const g of recalledIds) {
    const hit = match.matches[g.sourceId];
    if (!hit) continue;
    const publishedAt = g.publishedAt;
    if (!publishedAt) continue;
    const delta = hourDelta(hit.sourceUrl ? snapshot.sources.find((s) => s.id === hit.sourceId)?.discoveredAt ?? ctx.runTimestamp : ctx.runTimestamp, publishedAt);
    if (delta !== null) ttdHours.push(delta);
  }
  ttdHours.sort((a, b) => a - b);

  const timeToFirstSourceHours: number | null = ttdHours.length > 0 ? ttdHours[0] : null;
  const recalledPrimary = recalledIds.filter((g) => isPrimaryLike(g));
  const primaryTtd: number[] = [];
  for (const g of recalledPrimary) {
    const hit = match.matches[g.sourceId];
    if (!hit) continue;
    const discoveredAt = snapshot.sources.find((s) => s.id === hit.sourceId)?.discoveredAt;
    const delta = hourDelta(discoveredAt ?? ctx.runTimestamp, g.publishedAt);
    if (delta !== null) primaryTtd.push(delta);
  }
  primaryTtd.sort((a, b) => a - b);
  const timeToFirstPrimaryHours: number | null = primaryTtd.length > 0 ? primaryTtd[0] : null;

  const corroborationReached = independentPublisherCount >= 2 && recalledIds.length >= 1;
  const corroborationTtd: number[] = [];
  if (corroborationReached) {
    const distinctPublishers = new Set<string>();
    for (const g of recalledIds) {
      const hit = match.matches[g.sourceId];
      if (!hit) continue;
      const source = snapshot.sources.find((s) => s.id === hit.sourceId);
      if (!source) continue;
      const pk = publisherKey(source);
      if (distinctPublishers.has(pk)) continue;
      distinctPublishers.add(pk);
      const delta = hourDelta(source.discoveredAt, g.publishedAt);
      if (delta !== null) corroborationTtd.push(delta);
      if (distinctPublishers.size >= 2) break;
    }
  }
  corroborationTtd.sort((a, b) => a - b);

  const freshnessHours = fetched
    .map((s) => hourDelta(s.discoveredAt, s.publishedAt))
    .filter((h): h is number => h !== null)
    .sort((a, b) => a - b);

  const costs = {
    fetches: snapshot.run.sourcesFetched,
    searchCalls: snapshot.run.queriesGenerated,
    aiCalls: 0,
    tokens: 0,
    latencyMs: Math.max(0, new Date(snapshot.run.completedAt).getTime() - new Date(snapshot.run.startedAt).getTime()),
  };

  // Regional Source Discovery Recall
  const regionalGold = gold.filter((g) => g.category === 'REGIONAL' || detectLanguage(g.title) !== 'en');
  const regionalSourceDiscoveryRecall = regionalGold.length === 0 ? 1 : regionalGold.filter((g) => recalledGold.has(g.sourceId)).length / regionalGold.length;

  // Regional Entity Recall
  const regionalEntitiesExpected = ['अयोध्या', 'वयനാട്', 'കേരളം', 'महाराष्ट्र', 'विभाग'];
  let regionalEntitiesRecalled = 0;
  let regionalEntitiesEligible = 0;
  const allEntityMentions = new Set(
    (snapshot.fullClaims ?? []).flatMap((c) => {
      const claimObj = c as { entityMentions?: string[] };
      return claimObj.entityMentions ?? [];
    })
  );
  if (topic.language !== 'English' || topic.geography === 'state' || topic.geography === 'local') {
    regionalEntitiesEligible = 1;
    for (const ent of allEntityMentions) {
      if (regionalEntitiesExpected.some(e => ent.toLowerCase().includes(e) || e.includes(ent.toLowerCase()))) {
        regionalEntitiesRecalled = 1;
        break;
      }
    }
  }
  const regionalEntityRecall = regionalEntitiesEligible === 0 ? 1 : regionalEntitiesRecalled / regionalEntitiesEligible;

  // Translation Preservation Rate
  let nonEnglishClaims = 0;
  let preservedClaims = 0;
  const nonEnglishSourceIds = new Set(snapshot.sources.filter(s => {
    return s.url.includes('jagran') || s.url.includes('mathrubhumi') || s.url.includes('bih.nic') || s.url.includes('maharashtra.gov');
  }).map(s => s.id));
  for (const c of (snapshot.fullClaims ?? [])) {
    const claim = c as { sourceId: string; originalLanguage?: string; originalClaimText?: string; translationStatus?: string };
    if (nonEnglishSourceIds.has(claim.sourceId) || claim.originalLanguage) {
      nonEnglishClaims += 1;
      if (claim.originalClaimText && claim.translationStatus === 'TRANSLATED') {
        preservedClaims += 1;
      }
    }
  }
  const translationPreservationRate = nonEnglishClaims === 0 ? 1 : preservedClaims / nonEnglishClaims;

  // First Source Discovery Latency (vs. firstAvailableAt)
  const firstSourceLatencies: number[] = [];
  for (const g of gold) {
    const hit = match.matches[g.sourceId];
    if (!hit) continue;
    const source = snapshot.sources.find(s => s.id === hit.sourceId);
    if (!source) continue;
    const delta = hourDelta(source.discoveredAt, g.firstAvailableAt);
    if (delta !== null) firstSourceLatencies.push(delta);
  }
  const firstSourceDiscoveryLatency = firstSourceLatencies.length === 0 ? null : round2(Math.min(...firstSourceLatencies));

  // Primary Source Discovery Latency (vs. firstAvailableAt)
  const primaryLatencies: number[] = [];
  for (const g of gold.filter(isPrimaryLike)) {
    const hit = match.matches[g.sourceId];
    if (!hit) continue;
    const source = snapshot.sources.find(s => s.id === hit.sourceId);
    if (!source) continue;
    const delta = hourDelta(source.discoveredAt, g.firstAvailableAt);
    if (delta !== null) primaryLatencies.push(delta);
  }
  const primarySourceDiscoveryLatency = primaryLatencies.length === 0 ? null : round2(Math.min(...primaryLatencies));

  // Independent Corroboration Latency (vs. firstAvailableAt)
  const independentLatencies: number[] = [];
  for (const g of gold.filter(x => x.goldItemType === 'INDEPENDENT_SOURCE')) {
    const hit = match.matches[g.sourceId];
    if (!hit) continue;
    const source = snapshot.sources.find(s => s.id === hit.sourceId);
    if (!source) continue;
    const delta = hourDelta(source.discoveredAt, g.firstAvailableAt);
    if (delta !== null) independentLatencies.push(delta);
  }
  const independentCorroborationLatency = independentLatencies.length === 0 ? null : round2(Math.min(...independentLatencies));

  const metrics: TopicMetrics = {
    topicId: topic.topicId,
    eligibleGold: eligible,
    recalledGold: recalledIds.length,
    sourceRecall: round3(sourceRecall),
    primaryRecall: round3(primaryRecall),
    independentRecall: round3(independentRecall),
    regionalRecall: round3(regionalRecall),
    academicRecall: round3(academicRecall),
    legalRecall: round3(legalRecall),
    stateRecall: round3(stateRecall),
    claimRecall: round3(claimRecall),
    eventRecall: round3(eventRecall),
    precision: round3(precision),
    falsePositiveRate: round3(falsePositiveRate),
    fetchedCount,
    independentPublisherCount,
    independentRatio: round3(independentRatio),
    wireCount,
    syndicatedCount,
    derivativeCount,
    originalCount,
    ttdHours,
    ttdMedianHours: percentile(ttdHours, 50),
    ttdP90Hours: percentile(ttdHours, 90),
    ttdP95Hours: percentile(ttdHours, 95),
    timeToFirstSourceHours: timeToFirstSourceHours !== null ? round2(timeToFirstSourceHours) : null,
    timeToFirstPrimaryHours: timeToFirstPrimaryHours !== null ? round2(timeToFirstPrimaryHours) : null,
    corroborationReached,
    timeToMeaningfulUpdateHours:
      corroborationReached && corroborationTtd.length >= 1 ? round2(corroborationTtd[0]) : timeToFirstSourceHours !== null ? round2(timeToFirstSourceHours) : null,
    freshnessHours,
    freshnessMedianHours: percentile(freshnessHours, 50),
    freshnessP90Hours: percentile(freshnessHours, 90),
    freshnessP95Hours: percentile(freshnessHours, 95),
    regionalSourceDiscoveryRecall: round3(regionalSourceDiscoveryRecall),
    regionalEntityRecall: round3(regionalEntityRecall),
    translationPreservationRate: round3(translationPreservationRate),
    firstSourceDiscoveryLatency,
    primarySourceDiscoveryLatency,
    independentCorroborationLatency,
    costs,
  };

  const misses = gold
    .filter((g) => !recalledGold.has(g.sourceId))
    .map((g) => {
      const d = classifyMiss(g, ctx);
      d.topicId = topic.topicId;
      return d;
    });

  return { metrics, misses };
}

function computeProbeRecall(expected: string[], actual: string[]): number {
  if (expected.length === 0) return 1; // no probes defined → not scored
  if (actual.length === 0) return 0;
  const actualText = actual.join(' ');
  let hit = 0;
  for (const e of expected) {
    const tokens = significantTokens(e);
    if (tokens.length === 0) continue;
    const all = tokens.every((t) => propositionKey(actualText).includes(t));
    if (all) hit += 1;
  }
  return hit / expected.length;
}

/** Near-duplicate copies among fetched sources (same publisher, ≥0.85 title similarity). */
function countNearDuplicates(sources: TopicRunSnapshot['sources']): number {
  let count = 0;
  for (let i = 0; i < sources.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      if (publisherKey(sources[i]) === publisherKey(sources[j])) {
        const sim = titleSimilarity(sources[i].title, sources[j].title);
        if (sim >= 0.85) {
          count += 1;
          break;
        }
      }
    }
  }
  return count;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
