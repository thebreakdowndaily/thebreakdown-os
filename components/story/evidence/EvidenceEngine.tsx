'use client';

import type { EvidencePanelData, StoryClaim } from './types';
import ClaimCard from './ClaimCard';

export default function EvidenceEngine({ overallScore, verifiedClaims, claims }: EvidencePanelData) {
  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <ClaimCard key={claim.id} claim={claim} />
      ))}
    </div>
  );
}

export { default as EvidencePanel } from './EvidencePanel';
export { default as VerificationTimeline } from './VerificationTimeline';
export * from './types';
