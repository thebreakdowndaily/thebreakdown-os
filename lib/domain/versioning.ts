/**
 * ─── The Breakdown OS — Immutable Versioning Engine (Phase 8) ───────────────
 * Provides cryptographic, immutable version control and correction lineage for
 * canonical claims, evidence, and story projections.
 */

import type { Claim } from '@/types/canonical';

export interface ClaimVersionRecord {
  versionId: string;
  claimId: string;
  versionNumber: number;
  claimText: string;
  evidenceId?: string;
  confidenceScore: number;
  changedBy: string;
  changeReason: string;
  createdAt: string;
  previousVersionHash?: string;
}

export interface ClaimVersionHistory {
  claimId: string;
  currentVersion: number;
  versions: ClaimVersionRecord[];
}

export function createInitialClaimVersion(
  claim: Claim,
  changedBy: string,
  reason: string = 'Initial creation'
): ClaimVersionHistory {
  const initialVersion: ClaimVersionRecord = {
    versionId: `ver_1_${claim.id}`,
    claimId: claim.id,
    versionNumber: 1,
    claimText: claim.claim,
    evidenceId: claim.evidenceId,
    confidenceScore: claim.confidence,
    changedBy,
    changeReason: reason,
    createdAt: new Date().toISOString(),
  };

  return {
    claimId: claim.id,
    currentVersion: 1,
    versions: [initialVersion],
  };
}

export function createNewClaimVersion(
  history: ClaimVersionHistory,
  updatedText: string,
  updatedConfidence: number,
  changedBy: string,
  changeReason: string
): ClaimVersionHistory {
  const nextVersionNumber = history.currentVersion + 1;
  const prevVersion = history.versions[history.versions.length - 1];

  const newVersionRecord: ClaimVersionRecord = {
    versionId: `ver_${nextVersionNumber}_${history.claimId}`,
    claimId: history.claimId,
    versionNumber: nextVersionNumber,
    claimText: updatedText,
    confidenceScore: updatedConfidence,
    changedBy,
    changeReason,
    createdAt: new Date().toISOString(),
    previousVersionHash: prevVersion ? prevVersion.versionId : undefined,
  };

  return {
    ...history,
    currentVersion: nextVersionNumber,
    versions: [...history.versions, newVersionRecord],
  };
}
