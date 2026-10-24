/**
 * ─── The Breakdown OS — Editorial Content Fingerprint ────────────────────────
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII)
 *   - AGENTS.md (Gold Standard Review Integrity & Fail-Closed Publication)
 *   - Gap Matrix CR-01, CR-02, CR-03
 *
 * Computes a deterministic, cryptographic (SHA-256) fingerprint of the
 * editorially relevant content of a story.
 *
 * INVARIANTS:
 * 1. Fingerprint is strictly bound to editorial content: headline, title, summary,
 *    author, category, blocks (sequence and content), claims (sequence and evidence
 *    linkage), sources, timeline, FAQ, charts, tags, hero image, and disclosures.
 * 2. Non-editorial and transient operational fields are EXCLUDED:
 *    updatedAt, createdAt, publishedAt, scheduledAt, scheduledBy, status,
 *    publicationStatus, updatedBy, version, versionHistory, goldStandardAudit,
 *    _publicationToken, isTestArtifact, blockReason, blockedAt, fallbackStoryId,
 *    evidenceScore, readingTime, relatedStoryIds, relatedEntityIds, relatedTopicIds.
 * 3. Preserves array ordering for layout-sensitive sequences (blocks, claims,
 *    sources, timeline, faq, charts).
 * 4. Object keys are recursively canonicalized (alphabetically sorted) to ensure
 *    independent serialization stability.
 */

import crypto from 'crypto';
import type { Story, StoryBlock, Claim, Source, TimelineEvent, FAQItem, ChartDef } from '@/types/canonical';

/**
 * Recursively sorts object keys to guarantee canonical JSON serialization.
 */
function canonicalizeValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(canonicalizeValue);
  }
  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    if (obj[key] !== undefined) {
      sortedObj[key] = canonicalizeValue(obj[key]);
    }
  }
  return sortedObj;
}

/**
 * Normalizes a block to only its editorially meaningful payload.
 */
function normalizeBlock(b: StoryBlock | Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {
    id: b.id || '',
    type: b.type || '',
  };

  // Capture content / data payloads common across block implementations
  if ('content' in b && b.content !== undefined) {
    normalized.content = b.content;
  }
  if ('data' in b && b.data !== undefined) {
    normalized.data = b.data;
  }
  if ('headline' in b && b.headline !== undefined) {
    normalized.headline = b.headline;
  }
  if ('caption' in b && b.caption !== undefined) {
    normalized.caption = b.caption;
  }
  if ('url' in b && b.url !== undefined) {
    normalized.url = b.url;
  }
  if ('altText' in b && b.altText !== undefined) {
    normalized.altText = b.altText;
  }

  return normalized;
}

/**
 * Normalizes a claim to its editorially verifiable attributes.
 */
function normalizeClaim(c: Claim | Record<string, unknown>): Record<string, unknown> {
  const item = c as any;
  return {
    id: item.id || '',
    claim: typeof item.claim === 'string' ? item.claim.trim() : '',
    quote: typeof item.quote === 'string' ? item.quote.trim() : undefined,
    data: typeof item.data === 'string' ? item.data.trim() : undefined,
    source: typeof item.source === 'string' ? item.source.trim() : undefined,
    sourceUrl: typeof item.sourceUrl === 'string' ? item.sourceUrl.trim() : undefined,
    archiveId: typeof item.archiveId === 'string' ? item.archiveId.trim() : undefined,
    sources: Array.isArray(item.sources) ? [...item.sources].map(String).sort() : [],
    status: item.status || undefined,
    confidenceTier: item.confidenceTier || undefined,
    tier: item.tier || undefined,
    confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
    isLegacy: Boolean(item.isLegacy),
  };
}

/**
 * Normalizes a source to its identity and evidentiary attributes.
 */
function normalizeSource(s: Source | Record<string, unknown>): Record<string, unknown> {
  return {
    id: s.id || '',
    title: typeof s.title === 'string' ? s.title.trim() : (typeof (s as any).name === 'string' ? (s as any).name.trim() : ''),
    url: typeof s.url === 'string' ? s.url.trim() : '',
    tier: s.tier || undefined,
    verificationStatus: (s as any).verificationStatus || undefined,
    publisher: typeof (s as any).publisher === 'string' ? (s as any).publisher.trim() : undefined,
  };
}

/**
 * Normalizes a timeline event.
 */
function normalizeTimelineEvent(t: TimelineEvent | Record<string, unknown>): Record<string, unknown> {
  return {
    id: t.id || '',
    date: (t as any).date || '',
    title: typeof (t as any).title === 'string' ? (t as any).title.trim() : '',
    description: typeof (t as any).description === 'string' ? (t as any).description.trim() : '',
    significance: typeof (t as any).significance === 'string' ? (t as any).significance.trim() : undefined,
  };
}

/**
 * Normalizes an FAQ item.
 */
function normalizeFaqItem(f: FAQItem | Record<string, unknown>): Record<string, unknown> {
  const item = f as any;
  return {
    id: item.id || '',
    question: typeof item.question === 'string' ? item.question.trim() : '',
    answer: typeof item.answer === 'string' ? item.answer.trim() : '',
  };
}

/**
 * Normalizes a chart definition.
 */
function normalizeChart(c: ChartDef | Record<string, unknown>): Record<string, unknown> {
  const item = c as any;
  return {
    id: item.id || '',
    type: item.type || '',
    title: typeof item.title === 'string' ? item.title.trim() : '',
    data: item.data || undefined,
  };
}

/**
 * Computes a deterministic canonical SHA-256 content fingerprint for a story.
 */
export function computeStoryContentFingerprint(story: Partial<Story> | Record<string, unknown>): string {
  const editorialCore = {
    id: typeof story.id === 'string' ? story.id.trim() : '',
    title: typeof story.title === 'string' ? story.title.trim() : '',
    headline: typeof story.headline === 'string' ? story.headline.trim() : (typeof story.title === 'string' ? story.title.trim() : ''),
    slug: typeof story.slug === 'string' ? story.slug.trim() : '',
    summary: typeof story.summary === 'string' ? story.summary.trim() : '',
    author: typeof story.author === 'string' ? story.author.trim() : '',
    category: typeof story.category === 'string' ? story.category.trim() : '',
    heroImage: typeof story.heroImage === 'string' ? story.heroImage.trim() : '',
    heroImageAlt: typeof story.heroImageAlt === 'string' ? story.heroImageAlt.trim() : undefined,
    answerSummary: typeof (story as any).answerSummary === 'string' ? (story as any).answerSummary.trim() : undefined,
    whatIsUnknown: typeof (story as any).whatIsUnknown === 'string' ? (story as any).whatIsUnknown.trim() : undefined,
    reportingType: typeof (story as any).reportingType === 'string' ? (story as any).reportingType.trim() : undefined,
    tags: Array.isArray(story.tags) ? [...story.tags].map(t => String(t).trim()).sort() : [],
    blocks: Array.isArray(story.blocks) ? story.blocks.map(normalizeBlock) : [],
    claims: Array.isArray(story.claims) ? story.claims.map(normalizeClaim) : [],
    sources: Array.isArray(story.sources) ? story.sources.map(normalizeSource) : [],
    timeline: Array.isArray(story.timeline) ? story.timeline.map(normalizeTimelineEvent) : [],
    faq: Array.isArray(story.faq) ? story.faq.map(normalizeFaqItem) : [],
    charts: Array.isArray(story.charts) ? story.charts.map(normalizeChart) : [],
  };

  const canonicalized = canonicalizeValue(editorialCore);
  const serialized = JSON.stringify(canonicalized);
  const hashHex = crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
  return `sha256:${hashHex}`;
}

/**
 * Validates whether a story matches an expected content fingerprint.
 */
export function verifyStoryContentFingerprint(
  story: Partial<Story> | Record<string, unknown>,
  expectedFingerprint: string
): boolean {
  if (!expectedFingerprint || typeof expectedFingerprint !== 'string') {
    return false;
  }
  const actualFingerprint = computeStoryContentFingerprint(story);
  return actualFingerprint === expectedFingerprint.trim();
}
