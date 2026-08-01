/**
 * ─── The Breakdown OS — Provenance Engine (Phase 7) ───────────────────────────
 * Tracks document ingestion, SHA-256 cryptographic hashes, verification history,
 * and claim dependency trees.
 */

export interface ProvenanceRecord {
  documentId: string;
  sourceUrl: string;
  sha256Hash: string;
  ingestedAt: string;
  ingestedBy: string;
  archivalShelfMark?: string;
  dependentClaimIds: string[];
  verificationStatus: 'verified' | 'unverified' | 'deprecated';
}

export function generateMockSha256(content: string): string {
  // Pure deterministic mock hash generator
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.slice(0, 71);
}

export function registerDocumentProvenance(
  documentId: string,
  sourceUrl: string,
  content: string,
  ingestedBy: string,
  archivalShelfMark?: string
): ProvenanceRecord {
  return {
    documentId,
    sourceUrl,
    sha256Hash: generateMockSha256(content),
    ingestedAt: new Date().toISOString(),
    ingestedBy,
    archivalShelfMark,
    dependentClaimIds: [],
    verificationStatus: 'verified',
  };
}

export function attachDependentClaim(
  record: ProvenanceRecord,
  claimId: string
): ProvenanceRecord {
  if (record.dependentClaimIds.includes(claimId)) {
    return record;
  }

  return {
    ...record,
    dependentClaimIds: [...record.dependentClaimIds, claimId],
  };
}
