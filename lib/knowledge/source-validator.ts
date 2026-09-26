/**
 * ─── The Breakdown OS — Canonical Source Integrity Validator ────────────────
 *
 * Enforces the canonical source reference contract (F-12):
 *
 *   "Every source ID referenced by a published/content claim must resolve
 *    to a canonical source definition in the source registry."
 *
 * Features:
 *   - Pure, fail-closed validation logic
 *   - Detects missing, unknown, and malformed source IDs
 *   - Distinguishes publication boundaries (published, draft, fixture, unreferenced)
 *   - De-duplicates references per claim to prevent error inflation
 *   - Exposes actual integrity debt (F-04) accurately without fabricating data
 *
 * Governing documents:
 *   - AGENTS.md (Registry System / Canonical Source of Truth)
 *   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
 */

import type { CanonicalClaim, CanonicalSource } from '@/types/canonical';
import { getAllClaims } from '@/lib/knowledge/claim-registry';
import { getAllSources } from '@/lib/knowledge/source-registry';
import { getStory, LEGACY_PUBLIC_SLUGS } from '@/utils/data-layer/store';
import { isPubliclyPublished } from '@/lib/story/publication';

export type SourceIssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type SourceIssueReason =
  | 'SOURCE_NOT_FOUND'
  | 'MALFORMED_SOURCE_ID'
  | 'MISSING_SOURCE_ID'
  | 'SOURCE_IN_UNRELATED_REGISTRY'
  | 'DUPLICATE_SOURCE_IN_CLAIM'
  | 'SOURCE_CLAIM_MISMATCH';

export type PublicationBoundary = 'published' | 'draft' | 'fixture' | 'unreferenced';

export interface SourceIntegrityIssue {
  severity: SourceIssueSeverity;
  reason: SourceIssueReason;
  claimId: string;
  sourceId: string;
  field: 'sourceIds' | 'evidence.sourceId' | 'both';
  publicationBoundary: PublicationBoundary;
  message: string;
  contentTarget?: {
    contentType: string;
    contentId: string;
    contentTitle?: string;
  };
}

export interface SourceIntegrityInventory {
  totalClaimsInspected: number;
  totalSourceReferences: number;
  uniqueReferencedSourceIds: number;
  resolvedSourceIds: number;
  unresolvedSourceIds: number;
  malformedReferences: number;
  registeredSourcesCount: number;
  unreferencedSourcesCount: number;
  claimsByBoundary: Record<PublicationBoundary, number>;
  unresolvedByBoundary: Record<PublicationBoundary, number>;
}

export interface SourceIntegrityReport {
  timestamp: string;
  valid: boolean;
  inventory: SourceIntegrityInventory;
  errors: SourceIntegrityIssue[];
  warnings: SourceIntegrityIssue[];
  info: SourceIntegrityIssue[];
}

export interface ValidateSourceIntegrityOptions {
  claims?: CanonicalClaim[];
  sources?: CanonicalSource[];
  unrelatedSourceIds?: Set<string>;
  boundaryResolver?: (claim: CanonicalClaim) => PublicationBoundary;
  strictAllBoundaries?: boolean;
  checkBidirectional?: boolean;
}

/**
 * Resolves the publication boundary for a given claim by inspecting its appearances.
 */
export function resolveClaimPublicationBoundary(claim: CanonicalClaim): PublicationBoundary {
  if (
    claim.id.startsWith('test-') ||
    claim.id.startsWith('fixture-') ||
    claim.id.startsWith('mock-')
  ) {
    return 'fixture';
  }

  const appearances = claim.appearsIn || [];
  if (appearances.length === 0) {
    return 'unreferenced';
  }

  let hasPublished = false;
  let hasDraft = false;
  let hasFixture = false;

  for (const app of appearances) {
    if (app.contentId.startsWith('test-') || app.contentId.startsWith('fixture-')) {
      hasFixture = true;
      continue;
    }

    if (app.contentType === 'chapter') {
      // Canonical knowledge library chapters (kl-ch-1, kl-ch-mgnrega, kl-ch-rbi-repo-rate)
      hasPublished = true;
    } else if (app.contentType === 'story') {
      const story = getStory(app.contentId);
      if (!story) {
        continue;
      }
      const isPublic =
        isPubliclyPublished({
          publicationStatus: story.publicationStatus,
          publishedAt: story.publishedAt,
        }) ||
        (LEGACY_PUBLIC_SLUGS.has(story.slug) &&
          !!story.publishedAt &&
          new Date(story.publishedAt).getTime() <= Date.now());

      if (isPublic) {
        hasPublished = true;
      } else {
        hasDraft = true;
      }
    }
  }

  if (hasPublished) return 'published';
  if (hasDraft) return 'draft';
  if (hasFixture) return 'fixture';
  return 'unreferenced';
}

/**
 * Validates the referential integrity between claims and canonical sources.
 */
export function validateSourceIntegrity(
  options: ValidateSourceIntegrityOptions = {}
): SourceIntegrityReport {
  const timestamp = new Date().toISOString();
  const claims = options.claims ?? getAllClaims();
  const sources = options.sources ?? getAllSources();
  const unrelatedSourceIds = options.unrelatedSourceIds ?? new Set<string>();
  const resolveBoundary = options.boundaryResolver ?? resolveClaimPublicationBoundary;
  const strict = options.strictAllBoundaries ?? false;
  const checkBidirectional = options.checkBidirectional ?? false;

  const sourceMap = new Map<string, CanonicalSource>();
  for (const s of sources) {
    if (s && typeof s.id === 'string') {
      sourceMap.set(s.id, s);
    }
  }

  const errors: SourceIntegrityIssue[] = [];
  const warnings: SourceIntegrityIssue[] = [];
  const info: SourceIntegrityIssue[] = [];

  const referencedSourceIds = new Set<string>();
  let totalReferences = 0;
  let malformedCount = 0;

  const claimsByBoundary: Record<PublicationBoundary, number> = {
    published: 0,
    draft: 0,
    fixture: 0,
    unreferenced: 0,
  };

  const unresolvedByBoundary: Record<PublicationBoundary, Set<string>> = {
    published: new Set(),
    draft: new Set(),
    fixture: new Set(),
    unreferenced: new Set(),
  };

  for (const claim of claims) {
    const boundary = resolveBoundary(claim);
    claimsByBoundary[boundary]++;

    const primaryTarget = claim.appearsIn && claim.appearsIn.length > 0
      ? claim.appearsIn[0]
      : undefined;

    // Track references found in this specific claim to prevent duplicate findings
    const claimRefs = new Map<string, { inSourceIds: boolean; inEvidence: boolean }>();
    const seenInSourceIds = new Set<string>();

    // 1. Inspect claim.sourceIds
    if (Array.isArray(claim.sourceIds)) {
      for (const sid of claim.sourceIds) {
        totalReferences++;
        if (typeof sid !== 'string' || sid.trim() === '') {
          malformedCount++;
          errors.push({
            severity: 'ERROR',
            reason: 'MALFORMED_SOURCE_ID',
            claimId: claim.id,
            sourceId: String(sid),
            field: 'sourceIds',
            publicationBoundary: boundary,
            message: `Claim "${claim.id}" contains a non-string or empty source ID in sourceIds.`,
            contentTarget: primaryTarget,
          });
          continue;
        }

        const trimmed = sid.trim();
        if (seenInSourceIds.has(trimmed)) {
          warnings.push({
            severity: 'WARNING',
            reason: 'DUPLICATE_SOURCE_IN_CLAIM',
            claimId: claim.id,
            sourceId: trimmed,
            field: 'sourceIds',
            publicationBoundary: boundary,
            message: `Claim "${claim.id}" contains duplicate reference to source "${trimmed}" in sourceIds.`,
            contentTarget: primaryTarget,
          });
        }
        seenInSourceIds.add(trimmed);

        const current = claimRefs.get(trimmed) || { inSourceIds: false, inEvidence: false };
        current.inSourceIds = true;
        claimRefs.set(trimmed, current);
        referencedSourceIds.add(trimmed);
      }
    }

    // 2. Inspect claim.evidence
    if (Array.isArray(claim.evidence)) {
      for (const ev of claim.evidence) {
        totalReferences++;
        if (!ev || typeof ev.sourceId !== 'string' || ev.sourceId.trim() === '') {
          malformedCount++;
          errors.push({
            severity: 'ERROR',
            reason: 'MALFORMED_SOURCE_ID',
            claimId: claim.id,
            sourceId: String(ev?.sourceId),
            field: 'evidence.sourceId',
            publicationBoundary: boundary,
            message: `Claim "${claim.id}" contains a malformed sourceId in evidence array.`,
            contentTarget: primaryTarget,
          });
          continue;
        }

        const trimmed = ev.sourceId.trim();
        const current = claimRefs.get(trimmed) || { inSourceIds: false, inEvidence: false };
        current.inEvidence = true;
        claimRefs.set(trimmed, current);
        referencedSourceIds.add(trimmed);
      }
    }

    // 3. Validate existence & bidirectional consistency for unique source IDs in this claim
    for (const [sourceId, loc] of claimRefs.entries()) {
      const field: 'sourceIds' | 'evidence.sourceId' | 'both' =
        loc.inSourceIds && loc.inEvidence
          ? 'both'
          : loc.inSourceIds
          ? 'sourceIds'
          : 'evidence.sourceId';

      if (sourceMap.has(sourceId)) {
        // Source exists in canonical registry
        if (checkBidirectional) {
          const sourceObj = sourceMap.get(sourceId)!;
          if (Array.isArray(sourceObj.claimIds) && !sourceObj.claimIds.includes(claim.id)) {
            warnings.push({
              severity: 'WARNING',
              reason: 'SOURCE_CLAIM_MISMATCH',
              claimId: claim.id,
              sourceId,
              field,
              publicationBoundary: boundary,
              message: `Source "${sourceId}" exists but its claimIds does not reference claim "${claim.id}".`,
              contentTarget: primaryTarget,
            });
          }
        }
      } else {
        // Source NOT found in canonical source registry
        unresolvedByBoundary[boundary].add(sourceId);

        if (unrelatedSourceIds.has(sourceId)) {
          warnings.push({
            severity: 'WARNING',
            reason: 'SOURCE_IN_UNRELATED_REGISTRY',
            claimId: claim.id,
            sourceId,
            field,
            publicationBoundary: boundary,
            message: `Claim "${claim.id}" references source "${sourceId}" which exists only in an unrelated registry.`,
            contentTarget: primaryTarget,
          });
        } else if (boundary === 'published' || strict) {
          errors.push({
            severity: 'ERROR',
            reason: 'SOURCE_NOT_FOUND',
            claimId: claim.id,
            sourceId,
            field,
            publicationBoundary: boundary,
            message: `Claim "${claim.id}" references source "${sourceId}" which is missing from canonical source registry.`,
            contentTarget: primaryTarget,
          });
        } else {
          warnings.push({
            severity: 'WARNING',
            reason: 'SOURCE_NOT_FOUND',
            claimId: claim.id,
            sourceId,
            field,
            publicationBoundary: boundary,
            message: `Claim "${claim.id}" (${boundary}) references unseeded source "${sourceId}".`,
            contentTarget: primaryTarget,
          });
        }
      }
    }
  }

  // Count unreferenced registered sources
  let unreferencedSourcesCount = 0;
  for (const sId of sourceMap.keys()) {
    if (!referencedSourceIds.has(sId)) {
      unreferencedSourcesCount++;
      info.push({
        severity: 'INFO',
        reason: 'SOURCE_NOT_FOUND',
        claimId: 'N/A',
        sourceId: sId,
        field: 'sourceIds',
        publicationBoundary: 'unreferenced',
        message: `Registered source "${sId}" is not referenced by any canonical claim.`,
      });
    }
  }

  let resolvedCount = 0;
  for (const sId of referencedSourceIds) {
    if (sourceMap.has(sId)) {
      resolvedCount++;
    }
  }

  const inventory: SourceIntegrityInventory = {
    totalClaimsInspected: claims.length,
    totalSourceReferences: totalReferences,
    uniqueReferencedSourceIds: referencedSourceIds.size,
    resolvedSourceIds: resolvedCount,
    unresolvedSourceIds: referencedSourceIds.size - resolvedCount,
    malformedReferences: malformedCount,
    registeredSourcesCount: sourceMap.size,
    unreferencedSourcesCount,
    claimsByBoundary,
    unresolvedByBoundary: {
      published: unresolvedByBoundary.published.size,
      draft: unresolvedByBoundary.draft.size,
      fixture: unresolvedByBoundary.fixture.size,
      unreferenced: unresolvedByBoundary.unreferenced.size,
    },
  };

  return {
    timestamp,
    valid: errors.length === 0,
    inventory,
    errors,
    warnings,
    info,
  };
}

/**
 * Formats a SourceIntegrityReport into human-readable ASCII output for CLI / test logs.
 */
export function formatSourceIntegrityReport(report: SourceIntegrityReport): string {
  const inv = report.inventory;
  const lines: string[] = [];

  lines.push('======================================================================');
  lines.push('          THE BREAKDOWN OS — SOURCE INTEGRITY REPORT (F-12)           ');
  lines.push('======================================================================');
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`Status:    ${report.valid ? '✅ PASSED (100% Resolved)' : '❌ FAILED (Integrity Debt Detected)'}`);
  lines.push('');
  lines.push('--- INVENTORY SUMMARY ---');
  lines.push(`  Total Claims Inspected:         ${inv.totalClaimsInspected}`);
  lines.push(`  Total Source References:        ${inv.totalSourceReferences}`);
  lines.push(`  Unique Referenced Source IDs:   ${inv.uniqueReferencedSourceIds}`);
  lines.push(`  Resolved Source IDs:            ${inv.resolvedSourceIds} (${inv.uniqueReferencedSourceIds > 0 ? ((inv.resolvedSourceIds / inv.uniqueReferencedSourceIds) * 100).toFixed(1) : 0}%)`);
  lines.push(`  Unresolved Source IDs (F-04):   ${inv.unresolvedSourceIds}`);
  lines.push(`  Malformed References:           ${inv.malformedReferences}`);
  lines.push(`  Registered Canonical Sources:   ${inv.registeredSourcesCount}`);
  lines.push(`  Unreferenced Sources:           ${inv.unreferencedSourcesCount}`);
  lines.push('');
  lines.push('--- BY PUBLICATION BOUNDARY ---');
  lines.push(`  Published Content:   ${inv.claimsByBoundary.published} claims | ${inv.unresolvedByBoundary.published} unresolved sources`);
  lines.push(`  Draft Content:       ${inv.claimsByBoundary.draft} claims | ${inv.unresolvedByBoundary.draft} unresolved sources`);
  lines.push(`  Fixture Content:     ${inv.claimsByBoundary.fixture} claims | ${inv.unresolvedByBoundary.fixture} unresolved sources`);
  lines.push(`  Unreferenced/Legacy: ${inv.claimsByBoundary.unreferenced} claims | ${inv.unresolvedByBoundary.unreferenced} unresolved sources`);
  lines.push('');
  lines.push(`--- FINDINGS COUNT ---`);
  lines.push(`  Errors:   ${report.errors.length}`);
  lines.push(`  Warnings: ${report.warnings.length}`);
  lines.push(`  Info:     ${report.info.length}`);

  if (report.errors.length > 0) {
    lines.push('');
    lines.push('--- SAMPLE ERRORS (First 10) ---');
    for (const err of report.errors.slice(0, 10)) {
      const targetStr = err.contentTarget
        ? `[${err.contentTarget.contentType}:${err.contentTarget.contentId}] `
        : '';
      lines.push(`  • [${err.reason}] ${targetStr}${err.claimId} -> missing source "${err.sourceId}" (${err.field})`);
    }
    if (report.errors.length > 10) {
      lines.push(`  ... and ${report.errors.length - 10} more errors.`);
    }
  }

  if (report.warnings.length > 0) {
    lines.push('');
    lines.push('--- SAMPLE WARNINGS (First 5) ---');
    for (const w of report.warnings.slice(0, 5)) {
      lines.push(`  • [${w.reason}] ${w.claimId} -> ${w.message}`);
    }
  }

  lines.push('======================================================================');
  return lines.join('\n');
}
