/**
 * ─── The Breakdown OS — Research Session Engine (Phase 7) ─────────────────────
 * Isolates exploratory research (working notes, candidate claims, unverified documents)
 * from the canonical Knowledge Registry until formal verification.
 */

import type { Claim, Evidence, Source } from '@/types/canonical';

export interface CandidateClaim {
  tempId: string;
  claimText: string;
  candidateEvidence: string;
  suggestedSourceUrl?: string;
  confidenceScore: number;
}

export interface ResearchSession {
  sessionId: string;
  researcherId: string;
  topicSlug: string;
  title: string;
  workingNotes: string[];
  candidateClaims: CandidateClaim[];
  linkedDocumentHashes: string[];
  unresolvedQuestions: string[];
  status: 'active' | 'in_review' | 'promoted' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export function createResearchSession(
  sessionId: string,
  researcherId: string,
  topicSlug: string,
  title: string
): ResearchSession {
  const now = new Date().toISOString();
  return {
    sessionId,
    researcherId,
    topicSlug,
    title,
    workingNotes: [],
    candidateClaims: [],
    linkedDocumentHashes: [],
    unresolvedQuestions: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function addCandidateClaim(
  session: ResearchSession,
  claimText: string,
  candidateEvidence: string,
  suggestedSourceUrl?: string
): ResearchSession {
  const newCandidate: CandidateClaim = {
    tempId: `cand_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    claimText,
    candidateEvidence,
    suggestedSourceUrl,
    confidenceScore: 70,
  };

  return {
    ...session,
    candidateClaims: [...session.candidateClaims, newCandidate],
    updatedAt: new Date().toISOString(),
  };
}

export function promoteCandidateClaimToCanonical(
  candidate: CandidateClaim,
  source: Source,
  verifiedBy: string
): { canonicalClaim: Claim; canonicalEvidence: Evidence } {
  const claimId = `claim_${Date.now()}`;
  const evidenceId = `ev_${Date.now()}`;
  const now = new Date().toISOString();

  const canonicalClaim: Claim = {
    id: claimId,
    claim: candidate.claimText,
    data: candidate.candidateEvidence,
    source: source.title,
    sourceUrl: source.url,
    tier: source.tier || 1,
    evidenceTier: 'tier_1_primary_archival',
    evidenceId,
    confidence: candidate.confidenceScore,
    status: 'verified',
    verificationLevel: 'primary',
    verifiedAt: now,
  };

  const canonicalEvidence: Evidence = {
    id: evidenceId,
    claimId,
    hierarchyTier: 'tier_1_primary_archival',
    summary: candidate.candidateEvidence,
    sourceId: source.id || 'src_unknown',
    sourceUrl: source.url,
    confidenceScore: candidate.confidenceScore,
    verifiedAt: now,
    verifiedBy,
  };

  return { canonicalClaim, canonicalEvidence };
}
