/**
 * ─── Research Intelligence Engine — Evidence Linking ─────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic linking of extracted claims to precise evidence locators inside
 * a document (paragraph index, section, timestamp). A claim is only as strong
 * as the evidence pinned to it — evidence locators must let a human jump
 * straight to the supporting span.
 */

import type { ResearchEvidence, ResearchEvidenceLocator } from '@/types/research-intelligence';
import { normalizeText } from './normalization';
import { createEvidenceId } from './ids';

/** Paragraphs = blocks split by blank lines; returns { index, text }. */
export function paragraphIndex(normalizedText: string): Array<{ index: number; text: string }> {
  return normalizedText
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .map((text, index) => ({ index, text }));
}

/**
 * Build a ResearchEvidence record pinning a claim's supporting span to a
 * locator inside a document. The excerpt is the evidence span itself; the
 * locator allows a reader to jump to the exact paragraph/section.
 */
export function linkEvidence(
  args: {
    claimId: string;
    projectId: string;
    documentId: string;
    sourceId: string;
    supportingSpan: string;
    normalizedDocumentText: string;
    locator?: Partial<ResearchEvidenceLocator>;
  }
): ResearchEvidence {
  const normalized = normalizeText(args.supportingSpan);
  const paragraphs = paragraphIndex(args.normalizedDocumentText);
  const paragraph = paragraphs.find((p) => normalizeText(p.text).includes(normalized.slice(0, 80)));

  const locator: ResearchEvidenceLocator = {
    ...(paragraph ? { paragraph: paragraph.index + 1 } : {}),
    ...(args.locator ?? {}),
  };

  return {
    id: createEvidenceId(),
    projectId: args.projectId,
    claimId: args.claimId,
    documentId: args.documentId,
    sourceId: args.sourceId,
    locator,
    excerpt: normalized,
    retrievalTimestamp: new Date().toISOString(),
    qualityScore: paragraph ? 0.9 : 0.5,
  };
}

/** Verify that a locator actually resolves to content in the document. */
export function locatorResolves(locator: ResearchEvidenceLocator, normalizedDocumentText: string): boolean {
  if (locator.paragraph === undefined) return false;
  const paragraphs = paragraphIndex(normalizedDocumentText);
  return locator.paragraph >= 1 && locator.paragraph <= paragraphs.length;
}
