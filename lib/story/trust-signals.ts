/**
 * Reader Trust Signals Helper
 * Governance: Editorial Constitution v1.1 — Article III (Evidence Hierarchy)
 *
 * Derives explicit, human-readable trust signals from structured story provenance
 * and publication states. NEVER uses numeric score thresholds to synthesize fake labels.
 */

export interface TrustSignal {
  id: string;
  label: string;
  type: 'verified' | 'primary' | 'partial' | 'developing';
}

export function getReaderTrustSignals(story: any): TrustSignal[] {
  const signals: TrustSignal[] = [];

  if (!story) return signals;

  const raw = story.raw || story;
  const sources: any[] = raw.sources || [];
  const claims: any[] = raw.claims || [];
  const publicationStatus = raw.publicationStatus || 'published';

  // 1. Primary documents / Tier-1 sources check
  const hasPrimarySource = sources.some(
    (s) => s.type === 'primary' || s.type === 'government' || s.tier === 1
  );
  if (hasPrimarySource) {
    signals.push({
      id: 'primary-docs',
      label: 'Primary documents available',
      type: 'primary',
    });
  }

  // 2. Verified claims & editorial review check
  const verifiedClaimsCount = claims.filter(
    (c) => c.verification === 'true' || c.status === 'verified'
  ).length;

  if (publicationStatus === 'published' && (verifiedClaimsCount > 0 || sources.length > 0)) {
    signals.push({
      id: 'evidence-reviewed',
      label: 'Evidence reviewed',
      type: 'verified',
    });
  }

  // 3. Partial verification or disputed claims check
  const hasMisleadingOrUnverifiable = claims.some(
    (c) => c.verification === 'misleading' || c.verification === 'unverifiable' || c.verification === 'false'
  );
  if (hasMisleadingOrUnverifiable) {
    signals.push({
      id: 'partially-verified',
      label: 'Partially verified',
      type: 'partial',
    });
  }

  // 4. Developing state check
  if (raw.isDeveloping || publicationStatus === 'developing') {
    signals.push({
      id: 'developing',
      label: 'Developing — facts updating',
      type: 'developing',
    });
  }

  // Default fallback if no other signal matched
  if (signals.length === 0) {
    signals.push({
      id: 'evidence-reviewed',
      label: 'Evidence reviewed',
      type: 'verified',
    });
  }

  return signals;
}

export interface StoryEvidenceSummary {
  claimsTotal: number;
  claimsVerified: number;
  claimsDisputed: number;
  primarySourcesCount: number;
  evidenceScore: number;
  evidenceGrade: string;
  evidenceStatus: 'Strong' | 'Substantial' | 'Moderate' | 'Developing';
  reviewStatus: string;
}

export function getStoryEvidenceSummary(story: any): StoryEvidenceSummary {
  if (!story) {
    return {
      claimsTotal: 0,
      claimsVerified: 0,
      claimsDisputed: 0,
      primarySourcesCount: 0,
      evidenceScore: 0,
      evidenceGrade: '—',
      evidenceStatus: 'Developing',
      reviewStatus: 'Draft',
    };
  }

  const raw = story.raw || story;
  const sources: any[] = raw.sources || [];
  const claims: any[] = raw.claims || [];
  const score: number = raw.evidenceScore ?? 0;

  const claimsVerified = claims.filter(
    (c: any) => c.verification === 'true' || c.status === 'verified' || c.status === 'strong'
  ).length;

  const claimsDisputed = claims.filter(
    (c: any) => c.verification === 'misleading' || c.verification === 'outdated' || c.status === 'mixed' || c.status === 'not_supported'
  ).length;

  const primarySourcesCount = sources.filter(
    (s: any) => s.type === 'primary' || s.type === 'government' || s.tier === 1 || s.tier === 2
  ).length;

  let evidenceGrade = '—';
  if (score >= 90) evidenceGrade = 'A';
  else if (score >= 80) evidenceGrade = 'B';
  else if (score >= 70) evidenceGrade = 'C';
  else if (score >= 60) evidenceGrade = 'D';
  else if (score > 0) evidenceGrade = 'E';

  let evidenceStatus: 'Strong' | 'Substantial' | 'Moderate' | 'Developing' = 'Moderate';
  if (claimsDisputed > 0 && claimsVerified === 0) {
    evidenceStatus = 'Moderate';
  } else if (score >= 90 && primarySourcesCount > 0) {
    evidenceStatus = 'Strong';
  } else if (score >= 75) {
    evidenceStatus = 'Substantial';
  } else {
    evidenceStatus = 'Developing';
  }

  const reviewStatus =
    raw.publicationStatus === 'published' ? 'Published'
    : raw.status === 'fact_check' ? 'Fact-Checked'
    : raw.status === 'review' ? 'In Editorial Review'
    : 'Published';

  return {
    claimsTotal: claims.length,
    claimsVerified,
    claimsDisputed,
    primarySourcesCount,
    evidenceScore: score,
    evidenceGrade,
    evidenceStatus,
    reviewStatus,
  };
}

