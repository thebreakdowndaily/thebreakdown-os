/**
 * ─── PIB (Press Information Bureau) — Production Ingestion Adapter ───────────
 *
 * Bridges a real, official government source into the Newsroom Intelligence
 * engine. PIB press releases are primary-source, t1, deterministic observations
 * that exercise the full 16-beat taxonomy.
 *
 * Governing documents:
 *   - NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §4 (frozen taxonomy) — the
 *     entity lexicon is imported from beat-routing-service, never duplicated.
 *   - NEWSROOM_INTELLIGENCE_FINAL_OPERATIONALIZATION_REPORT.md §0 (LIVE
 *     PRODUCTION CONVERGENCE — production ingestion adapter).
 *
 * Feed: PIB press releases RSS (default) or any PIB-compatible feed.
 *   https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3
 *
 * The orchestrator (`pullPibObservations`) is idempotent: re-running it with
 * the same feed yields zero new observations (dedup on canonicalUrl).
 */

import { createHash } from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { NewsroomObservation } from '@/types/newsroom-intelligence';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { getCanonicalEntityLexicon } from '@/services/intelligence/newsroom/beat-routing-service';

export const PIB_SOURCE_ID = 'pib';
export const DEFAULT_PIB_FEED_URL = 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3';

/** Minimal fetch surface so tests can inject fixtures without network. */
export interface FeedFetcherResponse {
  ok: boolean;
  text(): Promise<string>;
}

export type FeedFetcher = (url: string) => Promise<FeedFetcherResponse>;

export interface PibRelease {
  externalId: string;
  canonicalUrl: string;
  title: string;
  snippet: string;
  publicationDate: string;
}

export interface PibAdapterOptions {
  feedUrl?: string;
  fetcher?: FeedFetcher;
  now?: () => Date;
  /** Bounded retry attempts for transient feed failures. Default 2. */
  retries?: number;
  /** Backoff between retries, in ms. Default 1000. */
  retryDelayMs?: number;
  /**
   * Detect feed-window rotation discontinuities and register source gaps.
   * Enabled by default. Disable only in deterministic harness replay where
   * the feed is a fixed fixture.
   */
  detectRotationGap?: boolean;
}

export interface PibCoverageWindow {
  oldestPublicationDate: string | null;
  newestPublicationDate: string | null;
  itemCount: number;
  /** True when the feed's oldest item is newer than the previously ingested newest. */
  rotationGapDetected: boolean;
  /** Unobserved window between previously ingested newest and current feed oldest. */
  gapStart?: string;
  gapEnd?: string;
}

export interface PullPibResult {
  fetched: number;
  ingested: number;
  duplicates: number;
  skippedInvalid: number;
  errors: string[];
  observations: NewsroomObservation[];
  /** Collection-side coverage telemetry (v1.2 recall recovery). */
  coverage?: PibCoverageWindow;
  /** Ids of source gaps registered during this pull (retries exhausted / rotation). */
  registeredGapIds: string[];
}

export class PibFeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PibFeedError';
  }
}

const HASH_ALGO = 'sha256';

function sha256Nfkc(input: string): string {
  return createHash(HASH_ALGO).update(input.normalize('NFKC'), 'utf8').digest('hex');
}

/**
 * Word-boundary, case-insensitive lexicon matching. Prevents short entity
 * tokens (e.g. 'pm') matching inside unrelated words ('company').
 */
function matchesLexicon(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(text);
}

const MULTILINGUAL_ALIASES: Record<string, string[]> = {
  'rbi': ['आरबीआई', 'भारतीय रिजर्व बैंक', 'रिजर्व बैंक', 'रिज़र्व बैंक'],
  'ministry of finance': ['वित्त मंत्रालय', 'वित्त मन्त्रालय', 'वित्त मंत्री', 'वित्त मन्त्री'],
  'finance ministry': ['वित्त मंत्रालय', 'वित्त मन्त्रालय', 'वित्त मंत्री', 'वित्त मन्त्री'],
  'supreme court': ['सुप्रीम कोर्ट', 'उच्चतम न्यायालय', 'सर्वोच्च न्यायालय'],
  'election commission': ['चुनाव आयोग', 'निर्वाचन आयोग', 'चुनाव आयुक्त'],
  'eci': ['ईसीआई', 'चुनाव आयोग', 'निर्वाचन आयोग'],
  'pm': ['प्रधानमंत्री', 'पीएम', 'प्रधान मंत्री'],
  'mod': ['रक्षा मंत्रालय', 'रक्षा मन्त्रालय', 'रक्षा मंत्री', 'रक्षा मन्त्री'],
  'ministry of defence': ['रक्षा मंत्रालय', 'रक्षा मन्त्रालय', 'रक्षा मंत्री', 'रक्षा मन्त्री'],
  'navy': ['नौसेना', 'भारतीय नौसेना'],
  'army': ['सेना', 'थल सेना', 'भारतीय सेना'],
  'air force': ['वायु सेना', 'वायुसेना', 'भारतीय वायु सेना'],
  'meity': ['इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय', 'आईटी मंत्रालय', 'आईटी मंत्री'],
  'mohfw': ['स्वास्थ्य और परिवार कल्याण मंत्रालय', 'स्वास्थ्य मंत्रालय', 'स्वास्थ्य मन्त्रालय', 'स्वास्थ्य मंत्री', 'स्वास्थ्य मन्त्री'],
  'icmr': ['आईसीएमआर', 'भारतीय आयुर्विज्ञान अनुसंधान परिषद'],
  'ugc': ['यूजीसी', 'विश्वविद्यालय अनुदान आयोग'],
  'mea': ['विदेश मंत्रालय', 'विदेश मन्त्रालय', 'विदेश मंत्री', 'विदेश मन्त्री'],
  'ministry of external affairs': ['विदेश मंत्रालय', 'विदेश मन्त्रालय', 'विदेश मंत्री', 'विदेश मन्त्री'],
  'imd': ['मौसम विभाग', 'आईएमडी', 'भारतीय मौसम विज्ञान विभाग'],
  'trai': ['ट्राई', 'भारतीय दूरसंचार विनियामक प्राधिकरण'],
  'dot': ['दूरसंचार विभाग'],
  'epfo': ['ईपीएफओ', 'कर्मचारी भविष्य निधि संगठन'],
  'isro': ['इसरो', 'भारतीय अंतरिक्ष अनुसंधान संगठन'],
  'sebi': ['सेबी', 'भारतीय प्रतिभूति और विनिमय बोर्ड'],
  'nclt': ['राष्ट्रीय कंपनी विधि न्यायाधिकरण'],
  'dgca': ['डीजीसीए', 'नागरिक उड्डयन महानिदेशालय'],
  'railway board': ['रेलवे बोर्ड'],
  'morth': ['सड़क परिवहन और राजमार्ग मंत्रालय'],
  'fci': ['भारतीय खाद्य निगम', 'एफसीआई'],
  'cacp': ['कृषि लागत और मूल्य आयोग', 'सीएसीपी'],
  'mgnrega': ['मनरेगा', 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी'],
  'fasal bima': ['फसल बीमा', 'प्रधानमंत्री फसल बीमा योजना'],
};

function normalizeText(text: string): string {
  return text.normalize('NFKC').toLowerCase();
}

function matchesHindiAlias(haystack: string, alias: string): boolean {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|[^\\u0900-\\u097F\\w])${escaped}(?:$|[^\\u0900-\\u097F\\w])`);
  return pattern.test(haystack);
}

function extractEntities(text: string, lexicon: string[]): string[] {
  const normalizedText = normalizeText(text);
  const haystack = ` ${normalizedText} `;
  const found = new Set<string>();

  for (const term of lexicon) {
    if (matchesLexicon(haystack, term.toLowerCase())) {
      found.add(term);
    }
  }

  for (const [canonical, aliases] of Object.entries(MULTILINGUAL_ALIASES)) {
    if (lexicon.includes(canonical) && !found.has(canonical)) {
      for (const alias of aliases) {
        const normalizedAlias = normalizeText(alias);
        if (matchesHindiAlias(haystack, normalizedAlias)) {
          found.add(canonical);
          break;
        }
      }
    }
  }

  return Array.from(found);
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'pib-release';
}

/** Extract the canonical PIB release id from guid/link (e.g. trailing PRID). */
function externalIdFrom(item: Record<string, unknown>): string | null {
  const guid = item.guid;
  if (typeof guid === 'string') return guid;
  if (guid && typeof guid === 'object' && typeof (guid as { '#text'?: string })['#text'] === 'string') {
    return (guid as { '#text': string })['#text'];
  }
  if (typeof item.link === 'string') return item.link;
  return null;
}

function normalizeItem(
  item: Record<string, unknown>,
  now: Date
): PibRelease | null {
  const externalId = externalIdFrom(item);
  const link = typeof item.link === 'string' ? item.link : '';
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!externalId || !link || !title) return null;

  const rawPub = typeof item.pubDate === 'string' ? item.pubDate : '';
  const parsed = rawPub ? Date.parse(rawPub) : NaN;
  const publicationDate = Number.isNaN(parsed) ? now.toISOString() : new Date(parsed).toISOString();

  const rawSnippet = typeof item.description === 'string' ? item.description : '';
  const snippet = stripHtml(rawSnippet).slice(0, 300);

  return { externalId, canonicalUrl: link, title, snippet, publicationDate };
}

function parseRss(xml: string, now: Date): PibRelease[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    trimValues: true,
  });
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: unknown } };
  };
  const itemNode = parsed.rss?.channel?.item;
  const items = Array.isArray(itemNode)
    ? itemNode
    : itemNode
      ? [itemNode]
      : [];

  const releases: PibRelease[] = [];
  for (const raw of items) {
    const normalized = normalizeItem(raw as Record<string, unknown>, now);
    if (normalized) releases.push(normalized);
  }
  return releases;
}

const defaultFetcher: FeedFetcher = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  return { ok: res.ok, text: () => res.text() };
};

export async function fetchPibReleases(opts: PibAdapterOptions = {}): Promise<PibRelease[]> {
  const feedUrl = opts.feedUrl ?? DEFAULT_PIB_FEED_URL;
  const fetcher = opts.fetcher ?? defaultFetcher;
  const now = opts.now ?? (() => new Date());
  const retries = opts.retries ?? 2;
  const retryDelayMs = opts.retryDelayMs ?? 1000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let response: FeedFetcherResponse;
      try {
        response = await fetcher(feedUrl);
      } catch (err) {
        throw new PibFeedError(
          `Failed to fetch PIB feed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      if (!response.ok) {
        throw new PibFeedError(`PIB feed returned non-OK status`);
      }

      let xml: string;
      try {
        xml = await response.text();
      } catch (err) {
        throw new PibFeedError(
          `Failed to read PIB feed body: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      try {
        return parseRss(xml, now());
      } catch (err) {
        throw new PibFeedError(
          `Failed to parse PIB feed XML: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } catch (err) {
      lastError = err as Error;
      const isRetryable = err instanceof PibFeedError;
      if (!isRetryable || attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw lastError ?? new PibFeedError(`Failed to fetch PIB feed`);
}

export function pibReleaseToObservation(
  release: PibRelease,
  opts: { lexicon: string[]; now: Date; feedUrl: string }
): NewsroomObservation {
  const slug = slugify(release.externalId);
  const contentHash = sha256Nfkc(`${release.title}\n${release.canonicalUrl}`);
  return {
    id: `obs-pib-${slug}`,
    sourceId: PIB_SOURCE_ID,
    endpointUrl: opts.feedUrl,
    externalId: release.externalId,
    canonicalUrl: release.canonicalUrl,
    title: release.title,
    snippet: release.snippet,
    contentHash,
    publicationTimestamp: release.publicationDate,
    ingestionTimestamp: opts.now.toISOString(),
    sourceTier: 't1',
    isPrimarySource: true,
    duplicateState: 'unique',
    entities: extractEntities(`${release.title} ${release.snippet}`, opts.lexicon),
    metadata: { pibFeed: true },
  };
}

/**
 * Fetch → normalize → dedup → ingest → cluster. Idempotent against the
 * authoritative persisted state (dedup on canonicalUrl / externalId).
 *
 * Each newly ingested observation yields one StoryCluster and one deterministic
 * Signal (and, in shadow mode or after Phase 2 authorization, an Alert).
 */
export async function pullPibObservations(
  core: NewsroomIntelligenceCore,
  opts: PibAdapterOptions = {}
): Promise<PullPibResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();
  const jobId = `job-pib-${startTime}-${Math.random().toString(36).slice(2, 6)}`;

  console.log(JSON.stringify({
    event: 'newsroom_ingestion_job_started',
    job_id: jobId,
    source: 'pib',
    started_at: startedAt,
  }));

  const result: PullPibResult = {
    fetched: 0,
    ingested: 0,
    duplicates: 0,
    skippedInvalid: 0,
    errors: [],
    observations: [],
    registeredGapIds: [],
  };

  try {
    const feedUrl = opts.feedUrl ?? DEFAULT_PIB_FEED_URL;
    const now = opts.now ?? (() => new Date());
    const currentNow = now();
    const ingestionTimestamp = currentNow.toISOString();
    const lexicon = getCanonicalEntityLexicon();

    const releases = await fetchPibReleases({ ...opts, feedUrl });
    result.fetched = releases.length;

    // ── Collection-side coverage telemetry (v1.2 recall recovery) ────────────
    const pubTimes = releases
      .map((r) => new Date(r.publicationDate).getTime())
      .filter((t) => !Number.isNaN(t));
    const newest = pubTimes.length > 0 ? Math.max(...pubTimes) : null;
    const oldest = pubTimes.length > 0 ? Math.min(...pubTimes) : null;

    const pibObs = core.getObservations().filter((o) => o.sourceId === PIB_SOURCE_ID);
    const prevNewestMs = pibObs.reduce<number | null>((acc, o) => {
      const t = new Date(o.publicationTimestamp || o.ingestionTimestamp).getTime();
      return Number.isNaN(t) ? acc : acc === null ? t : Math.max(acc, t);
    }, null);

    let rotationGapDetected = false;
    let gapStart: string | undefined;
    let gapEnd: string | undefined;

    const detectRotationGap = opts.detectRotationGap ?? true;
    if (
      detectRotationGap &&
      prevNewestMs !== null &&
      oldest !== null &&
      newest !== null &&
      prevNewestMs > 0 &&
      oldest > prevNewestMs + 5 * 60 * 1000
    ) {
      // The feed's oldest item is newer than the previously ingested newest.
      // Releases published between those timestamps were never observed —
      // a rolling-window rotation discontinuity (the dominant v1.1 miss cause).
      rotationGapDetected = true;
      gapStart = new Date(prevNewestMs).toISOString();
      gapEnd = new Date(oldest).toISOString();
      const gapId = `gap-source-pib-rotation-${new Date(prevNewestMs).getTime()}`;
      core.registerCoverageGap({
        id: gapId,
        gapType: 'source_gap',
        title: 'PIB feed window rotation gap',
        description: `Feed window rotated past unobserved releases: newest previously ingested was ${gapStart}, current feed oldest item is ${gapEnd}. Releases in between were never ingested.`,
        expectedDevelopment: 'Continuous PIB feed window coverage with no unobserved rotation.',
        monitoredEntityOrTopic: 'pib',
        lastCoveredAt: gapStart,
        recommendation: 'Verify scheduled pulls are running; if the feed window rotated while the cron was down, backfill from the PIB archive.',
        severity: 'high',
        detectedAt: ingestionTimestamp,
        status: 'open',
      });
      result.registeredGapIds.push(gapId);
    }

    result.coverage = {
      oldestPublicationDate: oldest !== null ? new Date(oldest).toISOString() : null,
      newestPublicationDate: newest !== null ? new Date(newest).toISOString() : null,
      itemCount: releases.length,
      rotationGapDetected,
      ...(gapStart ? { gapStart } : {}),
      ...(gapEnd ? { gapEnd } : {}),
    };

    const existingKeys = new Set<string>();
    for (const obs of core.getObservations()) {
      existingKeys.add(obs.canonicalUrl ?? '');
      if (obs.externalId) existingKeys.add(obs.externalId);
    }

    for (const release of releases) {
      const key = release.canonicalUrl || release.externalId;
      if (!key || existingKeys.has(key)) {
        result.duplicates += 1;
        continue;
      }

      let obs: NewsroomObservation;
      try {
        obs = pibReleaseToObservation(release, { lexicon, now: currentNow, feedUrl });
      } catch (err) {
        result.skippedInvalid += 1;
        result.errors.push(
          `release ${release.externalId}: ${err instanceof Error ? err.message : String(err)}`
        );
        continue;
      }

      core.ingestObservation(obs);
      existingKeys.add(key);

      const cluster = {
        id: `cl-${obs.id}`,
        title: obs.title,
        summary: obs.snippet,
        firstDetectedAt: ingestionTimestamp,
        lastUpdatedAt: ingestionTimestamp,
        observationIds: [obs.id],
        sourceIds: [obs.sourceId],
        claimIds: [],
        entities: obs.entities,
        primarySourceCount: 1,
        independentSourceCount: 1,
        geographicSpread: ['National'],
        status: 'active' as const,
      };
      core.upsertCluster(cluster);

      result.ingested += 1;
      result.observations.push(obs);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(`fatal_error: ${errMsg}`);

    // Surface the failed pull as a source gap + audit record instead of a
    // silent 502 (the pipeline could not observe this feed window at all).
    if (err instanceof PibFeedError) {
      const gapId = `gap-source-pib-fetch-failed-${Date.now()}`;
      core.registerCoverageGap({
        id: gapId,
        gapType: 'source_gap',
        title: 'PIB feed fetch failed',
        description: `Scheduled PIB pull failed: ${errMsg}. Releases published during this window were not ingested.`,
        expectedDevelopment: 'Every scheduled PIB pull completes successfully.',
        monitoredEntityOrTopic: 'pib',
        recommendation: 'Check PIB endpoint availability and the scheduled pull cron; re-run the pull to backfill once the feed is reachable.',
        severity: 'critical',
        detectedAt: new Date().toISOString(),
        status: 'open',
      });
      result.registeredGapIds.push(gapId);
    }

    throw err;
  } finally {
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;
    console.log(JSON.stringify({
      event: 'newsroom_ingestion_job_completed',
      job_id: jobId,
      source: 'pib',
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: durationMs,
      items_seen: result.fetched,
      items_new: result.ingested,
      items_duplicate: result.duplicates,
      items_rejected: result.skippedInvalid,
      rotation_gap_detected: result.coverage?.rotationGapDetected ?? false,
      registered_gap_ids: result.registeredGapIds,
      entities_matched: Array.from(new Set(result.observations.flatMap(o => o.entities))),
      errors: result.errors,
    }));
  }

  return result;
}
