/**
 * ─── RIE v1.1 — Recall Benchmark Matching ────────────────────────────────────
 * Governing document: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * Deterministic matching of discovered/fetched sources against gold items.
 * Pure and testable. Matching levels:
 *
 *   EXACT_URL   — canonical URL equality (query strings preserved, so distinct
 *                 PIB PRIDs or similar query-keyed pages never collapse).
 *   TITLE_MATCH — strong key-term overlap between the discovered title and the
 *                 gold title (near-hit; counts as recalled).
 *   DOMAIN_HIT  — same registrable domain as a gold item (weak, informational,
 *                 never counts as recalled on its own).
 *
 * The gold corpus is never an input to any adapter — matching happens strictly
 * after discovery, in the scoring layer.
 */

import { propositionKey } from '@/lib/intel/research/normalization';
import type { GoldSource, MatchLevel, SourceHit, TopicMatchResult } from './types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with',
  'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'it',
  'its', 'this', 'that', 'these', 'those', 'his', 'her', 'their', 'our',
  'your', 'my', 'not', 'no', 'india', 'indian', 'news', 'new', 'report',
  'reports', 'update', 'updates', 'today', 'latest', 'minister', 'ministry',
]);

const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'igshid', 'mc_cid', 'mc_eid', 'ref', 'source',
]);

/**
 * Canonical URL for benchmark matching: lowercase host, drop fragment, drop
 * default ports and trailing slashes, keep the query string, and drop common
 * tracking parameters. Query strings are preserved because pages like PIB
 * releases differ only by their PRID parameter.
 */
export function benchmarkUrlKey(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    url.protocol = url.protocol.toLowerCase();
    const params = url.searchParams;
    for (const key of Array.from(params.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) params.delete(key);
    }
    url.search = params.toString();
    let pathname = url.pathname.replace(/\/+$/, '');
    if (!pathname) pathname = '/';
    url.pathname = pathname;
    return url.toString();
  } catch {
    return rawUrl.trim().toLowerCase().replace(/\/+$/, '');
  }
}

const MULTI_LABEL_TLDS = new Set([
  'gov.in', 'co.in', 'ac.in', 'org.in', 'net.in', 'com.in', 'res.in', 'edu.in',
  'nic.in', 'gov.uk', 'co.uk', 'org.uk', 'ac.uk', 'gov.au', 'com.au', 'org.au',
  'co.jp', 'or.jp', 'go.jp', 'ac.jp', 'co.nz', 'govt.nz', 'gov.sg', 'com.sg',
  'gov.cn', 'com.cn', 'ac.cn', 'gov.za', 'co.za', 'org.za', 'gov.bd', 'com.bd',
  'gov.pk', 'com.pk', 'gov.np', 'com.np', 'org.np', 'gov.lk', 'com.lk', 'ac.lk',
  'gov.mv', 'com.mv',
]);

/** Best-effort registrable domain (eTLD+1) without a PSL dependency. */
export function registrableDomain(hostname: string): string {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  const labels = host.split('.');
  if (labels.length <= 2) return host;
  const lastTwo = labels.slice(-2).join('.');
  if (MULTI_LABEL_TLDS.has(lastTwo) && labels.length >= 3) {
    return labels.slice(-3).join('.');
  }
  return lastTwo;
}

function significantTokens(text: string): string[] {
  return propositionKey(text)
    .split(' ')
    .filter((t) => t.length > 3 && !STOP_WORDS.has(t));
}

/** Jaccard overlap of significant title tokens between two titles. */
export function titleSimilarity(a: string, b: string): number {
  const sa = new Set(significantTokens(a));
  const sb = new Set(significantTokens(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter += 1;
  return inter / Math.min(sa.size, sb.size);
}

export const TITLE_MATCH_THRESHOLD = 0.5;

export interface MatchCandidate {
  id: string;
  url: string;
  title: string;
  queryCategory?: string;
  adapter?: string;
}

function getDiscoveryPath(candidate: MatchCandidate): 'QUERY' | 'DOMAIN' | 'ENTITY' | 'RSS' | 'OFFICIAL_INDEX' | 'LANGUAGE_ALIAS' | 'NEWS_INTELLIGENCE' {
  if (candidate.adapter === 'rss') return 'RSS';
  if (candidate.queryCategory === 'ENTITY') return 'ENTITY';
  if (candidate.queryCategory === 'LANGUAGE_SPECIFIC') return 'LANGUAGE_ALIAS';
  if (candidate.queryCategory === 'GOVERNMENT' || candidate.queryCategory === 'LEGAL' || candidate.queryCategory === 'REGULATORY') return 'OFFICIAL_INDEX';
  return 'QUERY';
}

/**
 * Match one discovered/fetched source against a set of gold sources.
 * Returns the strongest hit (or null). EXACT_URL beats TITLE_MATCH beats
 * DOMAIN_HIT. DOMAIN_HIT is reported but does not count as recall.
 */
export function matchCandidateToGold(
  candidate: MatchCandidate,
  goldSources: GoldSource[]
): SourceHit | null {
  const candKey = benchmarkUrlKey(candidate.url);
  const candDomain = registrableDomain(candidate.url);

  const exact = goldSources.find((g) => benchmarkUrlKey(g.url) === candKey);
  if (exact) {
    return {
      goldSourceId: exact.sourceId,
      goldUrl: exact.url,
      sourceId: candidate.id,
      sourceUrl: candidate.url,
      level: 'EXACT_URL',
      discoveryPath: getDiscoveryPath(candidate),
      queryCategory: candidate.queryCategory,
      sourceAdapter: candidate.adapter,
    };
  }

  let bestTitle: { gold: GoldSource; similarity: number } | null = null;
  for (const gold of goldSources) {
    const similarity = titleSimilarity(candidate.title || '', gold.title || '');
    if (similarity >= TITLE_MATCH_THRESHOLD && (!bestTitle || similarity > bestTitle.similarity)) {
      bestTitle = { gold, similarity };
    }
  }
  if (bestTitle) {
    return {
      goldSourceId: bestTitle.gold.sourceId,
      goldUrl: bestTitle.gold.url,
      sourceId: candidate.id,
      sourceUrl: candidate.url,
      level: 'TITLE_MATCH',
      titleSimilarity: bestTitle.similarity,
      discoveryPath: getDiscoveryPath(candidate),
      queryCategory: candidate.queryCategory,
      sourceAdapter: candidate.adapter,
    };
  }

  const domain = goldSources.find((g) => registrableDomain(g.url) === candDomain);
  if (domain) {
    return {
      goldSourceId: domain.sourceId,
      goldUrl: domain.url,
      sourceId: candidate.id,
      sourceUrl: candidate.url,
      level: 'DOMAIN_HIT',
      discoveryPath: 'DOMAIN',
      queryCategory: candidate.queryCategory,
      sourceAdapter: candidate.adapter,
    };
  }

  return null;
}

/**
 * Match every discovered source for a topic against its gold sources.
 * One gold source may be hit by multiple candidates; the strongest hit wins.
 * A gold item is "recalled" when its best hit is EXACT_URL or TITLE_MATCH.
 */
export function matchDiscoveredToGold(
  candidates: MatchCandidate[],
  goldSources: GoldSource[],
  topicId: string
): TopicMatchResult {
  const matches: Record<string, SourceHit | null> = {};
  const best: Record<string, SourceHit> = {};
  const levelRank: Record<MatchLevel, number> = { EXACT_URL: 3, TITLE_MATCH: 2, DOMAIN_HIT: 1, NO_MATCH: 0 };

  for (const candidate of candidates) {
    const hit = matchCandidateToGold(candidate, goldSources);
    if (!hit) continue;
    const existing = best[hit.goldSourceId];
    if (!existing || levelRank[hit.level] > levelRank[existing.level]) {
      best[hit.goldSourceId] = hit;
    }
  }

  for (const gold of goldSources) {
    matches[gold.sourceId] = best[gold.sourceId] ?? null;
  }

  return {
    topicId,
    matches,
    discoveredUrls: candidates.map((c) => c.url),
  };
}

/** A gold item counts as recalled at EXACT_URL or TITLE_MATCH. */
export function isRecalled(hit: SourceHit | null): boolean {
  return hit !== null && (hit.level === 'EXACT_URL' || hit.level === 'TITLE_MATCH');
}
