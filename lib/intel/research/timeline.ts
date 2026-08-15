/**
 * ─── Research Intelligence Engine — Timeline Building ────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic event extraction: sentences containing date patterns become
 * candidate timeline events. Date precision is tracked (EXACT / MONTH / YEAR /
 * RANGE / UNKNOWN) so the timeline never implies false precision. Events are
 * linked back to claims + sources for full provenance.
 */

import type { ResearchDatePrecision, ResearchEvent } from '@/types/research-intelligence';
import { normalizeText, propositionKey } from './normalization';
import { createEventId } from './ids';

const DATE_PATTERNS = [
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}\b/i,
  /\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*,?\s*\d{4}\b/i,
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i,
  /\b(?:q[1-4]|first quarter|second quarter|third quarter|fourth quarter|h1|h2)\s*(?:of)?\s*\d{4}\b/i,
  /\b(?:19|20)\d{2}\b/,
];

export interface DateMatch {
  raw: string;
  precision: ResearchDatePrecision;
  date?: string;
  range?: { start?: string; end?: string };
}

/** Extract a date (and precision) from a sentence. Deterministic. */
export function extractDate(sentence: string): DateMatch | null {
  const full = sentence.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}\b/i);
  if (full) {
    const parsed = new Date(full[0].replace(/(st|nd|rd|th)/, ''));
    if (!Number.isNaN(parsed.getTime())) {
      return { raw: full[0], precision: 'EXACT', date: parsed.toISOString() };
    }
  }
  const monthYear = sentence.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i);
  if (monthYear) {
    const parsed = new Date(`${monthYear[0]} 01`);
    if (!Number.isNaN(parsed.getTime())) {
      return { raw: monthYear[0], precision: 'MONTH', date: parsed.toISOString() };
    }
  }
  const quarter = sentence.match(/(?:q[1-4]|first quarter|second quarter|third quarter|fourth quarter|h1|h2)\s*(?:of)?\s*\d{4}\b/i);
  if (quarter) {
    const yearMatch = quarter[0].match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '';
    return { raw: quarter[0], precision: 'YEAR', date: year ? `${year}-01-01T00:00:00.000Z` : undefined };
  }
  const year = sentence.match(/\b(?:19|20)\d{2}\b/);
  if (year) {
    return { raw: year[0], precision: 'YEAR', date: `${year[0]}-01-01T00:00:00.000Z` };
  }
  return null;
}

/**
 * Build timeline events from claims (which carry their source sentences).
 * Returns events sorted by date. Events without dates are still surfaced with
 * precision UNKNOWN so no occurrence is silently dropped.
 */
export function buildTimeline(
  claims: Array<{ claimId: string; text: string; sourceId: string; entityMentions: string[] }>
): ResearchEvent[] {
  const events: ResearchEvent[] = [];
  for (const claim of claims) {
    const dateMatch = extractDate(claim.text);
    events.push({
      id: createEventId(),
      projectId: '',
      title: claim.text.slice(0, 120) + (claim.text.length > 120 ? '…' : ''),
      description: claim.text,
      ...(dateMatch?.date ? { date: dateMatch.date } : {}),
      ...(dateMatch?.range ? { dateRange: dateMatch.range } : {}),
      datePrecision: dateMatch ? dateMatch.precision : 'UNKNOWN',
      entityMentions: claim.entityMentions,
      claimIds: [claim.claimId],
      sourceIds: [claim.sourceId],
      confidence: dateMatch ? 0.85 : 0.4,
    });
  }

  return events.sort((a, b) => {
    const da = a.date ?? '';
    const db = b.date ?? '';
    if (da && db) return da.localeCompare(db);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
}

/** Extract a date and its precision (thin wrapper for adapter/timeline reuse). */
export function detectDatePrecision(text: string): ResearchDatePrecision {
  const match = extractDate(text);
  return match ? match.precision : 'UNKNOWN';
}

export { normalizeText, propositionKey };
