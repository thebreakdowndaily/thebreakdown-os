/**
 * ─── Research Intelligence Engine — Normalization ─────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic text + URL normalization and content hashing. These primitives
 * underpin deduplication (contentHash, canonical URLs), claim normalization
 * (matching corroborating/contradicting propositions), and provenance integrity.
 * All functions are pure and idempotent.
 */

import { createHash } from 'node:crypto';

/** Remove whitespace, control characters, normalize unicode punctuation. */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u00a0/g, ' ')
    .trim();
}

/** Lowercase + strip leading articles + collapse spaces for fuzzy matching. */
export function propositionKey(text: string): string {
  return normalizeText(text)
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** sha256 hex digest of arbitrary content. */
export function contentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** sha256 hex digest of an object's stable JSON serialization. */
export function objectHash(value: unknown): string {
  return contentHash(JSON.stringify(value));
}

/** Strip tracking params, fragments, trailing slash, default ports; lowercase host. */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());
    url.hash = '';
    const TRACKING_PARAMS = new Set([
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'igshid', 'mc_cid', 'mc_eid', 'ref', 'source',
    ]);
    const params = url.searchParams;
    for (const key of Array.from(params.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) params.delete(key);
    }
    url.search = params.toString();
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return rawUrl.trim().replace(/\/+$/, '');
  }
}

/** Key for URL-level dedup — canonical URL, stripping protocol + www. */
export function urlKey(rawUrl: string): string {
  const c = canonicalizeUrl(rawUrl);
  return c
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

/** Lowercase normalized key used for claim matching / corroboration. */
export function normalizedClaimKey(claim: string): string {
  return propositionKey(claim);
}

/** Estimate language from script. Devanagari → 'hi', CJK → 'zh', else 'en'. */
export function detectLanguage(text: string): string {
  const sample = normalizeText(text).slice(0, 500);
  if (/[\u0900-\u097f]/.test(sample)) return 'hi';
  if (/[\u4e00-\u9fff]/.test(sample)) return 'zh';
  if (/[\u0600-\u06ff]/.test(sample)) return 'ar';
  return 'en';
}

/** Split a document into sentences on standard sentence boundaries. */
export function sentenceSplit(text: string): string[] {
  return normalizeText(text)
    /* eslint-disable-next-line no-misleading-character-class, no-useless-escape */
    .replace(/([.!?])\s+(?=[A-Z\u0900-\u097f"'(\[])/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Basic slugification for project URLs. */
export function toSlug(input: string): string {
  return normalizeText(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
