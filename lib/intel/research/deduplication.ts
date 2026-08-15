/**
 * ─── Research Intelligence Engine — Deduplication ────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic source/document deduplication:
 *   1. URL-level dedup (canonical URL / urlKey)
 *   2. Content-level dedup (exact content hash)
 *   3. Near-duplicate detection (character-trigram shingle overlap)
 *   4. Syndication detection (wire agencies: PTI, ANI, IANS, Reuters, AP)
 *
 * Near-duplicates and syndicated copies are kept but tagged (syndicatedFrom /
 * syndicatedCopies) so corroboration logic can count independent publishers
 * rather than inflated copies. Nothing is silently dropped from evidence.
 */

import { canonicalizeUrl, contentHash, normalizeText, urlKey } from './normalization';

export type DedupOutcome =
  | { decision: 'UNIQUE' }
  | { decision: 'EXACT_DUPLICATE'; ofId: string }
  | { decision: 'URL_DUPLICATE'; ofId: string }
  | { decision: 'NEAR_DUPLICATE'; ofId: string; similarity: number };

export interface DedupCandidate {
  id: string;
  url: string;
  title: string;
  content: string;
  publisher?: string;
}

export const WIRE_AGENCIES = ['PTI', 'ANI', 'IANS', 'Reuters', 'AP', 'Press Trust of India', 'Asian News International', 'Indo-Asian News Service'];

/** Whether the candidate looks like a syndicated wire copy. */
export function isSyndicated(content: string, publisher?: string): boolean {
  if (publisher && WIRE_AGENCIES.some((w) => publisher.toUpperCase().includes(w.toUpperCase()))) return true;
  const sample = normalizeText(content).slice(0, 1200);
  return WIRE_AGENCIES.some((w) => sample.toUpperCase().includes(w.toUpperCase()));
}

function shingles(text: string, size = 3): Set<string> {
  const t = text.replace(/[^a-z0-9 ]+/g, ' ').toLowerCase();
  const words = t.split(/\s+/).filter((w) => w.length > 0);
  const set = new Set<string>();
  for (let i = 0; i <= words.length - size; i += 1) {
    set.add(words.slice(i, i + size).join(' '));
  }
  return set;
}

/** Jaccard similarity of character-trigram shingle sets. */
export function contentSimilarity(a: string, b: string): number {
  const sa = shingles(normalizeText(a));
  const sb = shingles(normalizeText(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let intersection = 0;
  for (const s of sa) if (sb.has(s)) intersection += 1;
  return intersection / Math.min(sa.size, sb.size);
}

const NEAR_DUP_THRESHOLD = 0.85;
const EXACT_NEAR_THRESHOLD = 0.98;

/**
 * Deduplicate a candidate against existing candidates.
 * Returns UNIQUE when no match, otherwise the id of the surviving candidate.
 * Existing candidates with matching urlKey are treated as URL_DUPLICATE.
 */
export function dedupCandidate(candidate: DedupCandidate, existing: DedupCandidate[]): DedupOutcome {
  const key = urlKey(candidate.url);
  const hash = contentHash(normalizeText(candidate.content));

  const urlMatch = existing.find((e) => urlKey(e.url) === key);
  if (urlMatch) return { decision: 'URL_DUPLICATE', ofId: urlMatch.id };

  const exactMatch = existing.find((e) => contentHash(normalizeText(e.content)) === hash);
  if (exactMatch) return { decision: 'EXACT_DUPLICATE', ofId: exactMatch.id };

  let best: { id: string; similarity: number } | null = null;
  for (const e of existing) {
    if (normalizeText(e.content).length < 80 || normalizeText(candidate.content).length < 80) continue;
    const similarity = contentSimilarity(e.content, candidate.content);
    if (similarity >= NEAR_DUP_THRESHOLD && (!best || similarity > best.similarity)) {
      best = { id: e.id, similarity };
    }
  }
  if (best && best.similarity >= EXACT_NEAR_THRESHOLD) {
    return { decision: 'NEAR_DUPLICATE', ofId: best.id, similarity: best.similarity };
  }
  return { decision: 'UNIQUE' };
}

/** Deduplicate a full list of candidates (stable, keeps first occurrence). */
export function deduplicateCandidates(candidates: DedupCandidate[]): {
  unique: DedupCandidate[];
  outcomes: Array<{ candidate: DedupCandidate; outcome: DedupOutcome }>;
} {
  const unique: DedupCandidate[] = [];
  const outcomes: Array<{ candidate: DedupCandidate; outcome: DedupOutcome }> = [];
  for (const candidate of candidates) {
    const outcome = dedupCandidate(candidate, unique);
    outcomes.push({ candidate, outcome });
    if (outcome.decision === 'UNIQUE') unique.push(candidate);
  }
  return { unique, outcomes };
}

export { canonicalizeUrl };
