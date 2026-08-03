import type { VerificationWorkspace, VerificationItem } from '@/lib/intel/toolkit/types';
import type { InvestigationCase, EditorialFactor } from '@/lib/intel/editorial/types';
import type { VerificationClaim } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Claim Register)
// The Claim Register is a projection over the certified toolkit verification workspace and
// the Editorial Investigation factors. It never invents claims — every row traces to an
// engine output (toolkit VerificationItem or Investigation factor).

function claimId(seed: string, index: number): string {
  return `claim-${seed}-${String(index)}`;
}

function claimFromItem(item: VerificationItem, index: number, constituencyId: string): VerificationClaim {
  const status = item.kind === 'conflicting_evidence' ? 'contested' : 'unverified';
  return {
    id: claimId(constituencyId, index),
    text: item.detail,
    source: item.source,
    kind: item.kind,
    confidence: 'MEDIUM',
    status,
  };
}

function claimFromFactor(factor: EditorialFactor, index: number, constituencyId: string): VerificationClaim | null {
  const evidence = factor.evidence[0];
  if (!evidence) return null;
  const kind = factor.key === 'evidence_debt' || factor.key === 'verification_pressure' ? 'weak_evidence' : 'claim';
  return {
    id: claimId(`${constituencyId}-factor`, index),
    text: evidence,
    source: `investigation:${factor.key}`,
    kind,
    confidence: factor.confidence,
    status: 'unverified',
  };
}

/**
 * Build the Claim Register for a constituency. Toolkit workspace items are primary; editorial
 * factor evidence lines are appended when they add new provenance (deduplicated by text).
 */
export function buildClaimRegister(
  constituencyId: string,
  workspace: VerificationWorkspace | null,
  investigation: InvestigationCase | null
): VerificationClaim[] {
  const claims: VerificationClaim[] = [];
  const seen = new Set<string>();

  if (workspace) {
    workspace.items.forEach((item, i) => {
      const claim = claimFromItem(item, i, constituencyId);
      if (!seen.has(claim.text)) {
        seen.add(claim.text);
        claims.push(claim);
      }
    });
  }

  if (investigation) {
    investigation.factors.forEach((factor, i) => {
      const claim = claimFromFactor(factor, i, constituencyId);
      if (claim && !seen.has(claim.text)) {
        seen.add(claim.text);
        claims.push(claim);
      }
    });
  }

  return claims;
}
