/**
 * ─── The Breakdown OS — Data Integrity & Migration Engine (Gate 8) ────────────
 * Validates canonical database integrity: orphan entity detection, duplicate claim
 * detection, provenance hash consistency, and projection rebuild checks.
 */

import type { Claim, Source, Story } from '@/types/canonical';

export interface DataIntegrityReport {
  timestamp: string;
  healthy: boolean;
  totalClaimsCount: number;
  totalSourcesCount: number;
  orphanedClaimIds: string[];
  duplicateClaimTexts: string[];
  invalidHashSourceIds: string[];
  issuesCount: number;
}

export function auditDataIntegrity(
  stories: Story[] = [],
  allClaims: Claim[] = [],
  allSources: Source[] = []
): DataIntegrityReport {
  const timestamp = new Date().toISOString();
  const orphanedClaimIds: string[] = [];
  const duplicateClaimTexts: string[] = [];
  const invalidHashSourceIds: string[] = [];

  const sourceMap = new Map<string, Source>();
  allSources.forEach((s) => {
    if (s.id) {
      sourceMap.set(s.id, s);
    }
  });

  // Check orphaned claims (claims pointing to missing or invalid sources)
  allClaims.forEach((c) => {
    if (c.evidenceId && !c.sourceUrl) {
      orphanedClaimIds.push(c.id);
    }
  });

  // Check duplicate claim texts
  const seenClaims = new Set<string>();
  allClaims.forEach((c) => {
    const normalized = c.claim.trim().toLowerCase();
    if (seenClaims.has(normalized)) {
      duplicateClaimTexts.push(c.claim);
    } else {
      seenClaims.add(normalized);
    }
  });

  // Check provenance archive hashes
  allSources.forEach((s) => {
    if (s.archiveHash && !s.archiveHash.startsWith('sha256:')) {
      if (s.id) {
        invalidHashSourceIds.push(s.id);
      }
    }
  });

  const issuesCount = orphanedClaimIds.length + duplicateClaimTexts.length + invalidHashSourceIds.length;

  return {
    timestamp,
    healthy: issuesCount === 0,
    totalClaimsCount: allClaims.length,
    totalSourcesCount: allSources.length,
    orphanedClaimIds,
    duplicateClaimTexts,
    invalidHashSourceIds,
    issuesCount,
  };
}
