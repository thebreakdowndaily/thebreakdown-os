/**
 * ─── The Breakdown OS — Knowledge Graph Exploration Engine (Phase 7) ─────────
 * Internal research query engine mapping claim-source dependencies and connected
 * entity nodes. Never exposed directly to public reader viewports.
 */

import type { Claim, Source } from '@/types/canonical';
import type { ProvenanceRecord } from './provenance';

export interface GraphQueryResult {
  queryTerm: string;
  matchedClaims: Claim[];
  matchedSources: Source[];
  connectedProvenanceRecords: ProvenanceRecord[];
  totalNodeDegree: number;
}

export function queryResearchGraph(
  queryTerm: string,
  claims: Claim[] = [],
  sources: Source[] = [],
  provenanceRecords: ProvenanceRecord[] = []
): GraphQueryResult {
  const normalized = queryTerm.toLowerCase();

  const matchedClaims = claims.filter(
    (c) => c.claim.toLowerCase().includes(normalized) || c.data.toLowerCase().includes(normalized)
  );

  const matchedSources = sources.filter(
    (s) => s.title.toLowerCase().includes(normalized) || s.url.toLowerCase().includes(normalized)
  );

  const matchedClaimIds = new Set(matchedClaims.map((c) => c.id));
  const connectedProvenanceRecords = provenanceRecords.filter((p) =>
    p.dependentClaimIds.some((id) => matchedClaimIds.has(id))
  );

  return {
    queryTerm,
    matchedClaims,
    matchedSources,
    connectedProvenanceRecords,
    totalNodeDegree: matchedClaims.length + matchedSources.length + connectedProvenanceRecords.length,
  };
}
