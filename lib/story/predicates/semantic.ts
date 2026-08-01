/**
 * Semantic Trust Signal Predicates
 * Governance: Editorial Constitution v1.1 — Article III (Evidence Hierarchy)
 *
 * Derives explicit, human-readable trust signals from structured story provenance.
 * NEVER uses arbitrary numeric score thresholds to synthesize fake trust labels.
 */

import type { Story, Claim, Source, PublicationStatus } from '@/types/canonical';

export interface TrustSignal {
  id: string;
  label: string;
  type: 'verified' | 'primary' | 'partial' | 'developing' | 'corrected' | 'updated';
}

/**
 * Claim-level claim conclusion classification:
 * - supported
 * - mixed
 * - unverified (or unresolved)
 * - not_supported
 */
export type ClaimConclusion = 'supported' | 'mixed' | 'unverified' | 'not_supported';

export function classifyClaimConclusion(claim: Claim): ClaimConclusion {
  const status = (claim.status as string) || '';
  const verification = (claim as any).verification as string | undefined;

  if (verification === 'false' || verification === 'not_supported' || status === 'not_supported') {
    return 'not_supported';
  }
  if (verification === 'misleading' || status === 'moderate' || status === 'mixed') {
    return 'mixed';
  }
  if (verification === 'true' || status === 'verified' || status === 'strong' || status === 'supported') {
    return 'supported';
  }
  return 'unverified';
}

/**
 * 1. Evidence Reviewed
 * Requires published status, explicit editorial review, and at least one verified/supported claim or cited source.
 */
export function canSayEvidenceReviewed(story: Story): boolean {
  if (!story) return false;
  const publicationStatus: PublicationStatus = story.publicationStatus || 'published';
  if (publicationStatus !== 'published') return false;

  const claims = story.claims || [];
  const sources = story.sources || [];
  const hasSupportedClaims = claims.some((c) => classifyClaimConclusion(c) === 'supported');
  const hasSources = sources.length > 0;

  return hasSupportedClaims || hasSources;
}

/**
 * 2. Primary Sources Available
 * Requires at least 1 source explicitly classified as primary/government/tier 1 AND has a valid URL.
 */
export function canSayPrimarySourcesAvailable(story: Story): boolean {
  if (!story || !story.sources) return false;
  return story.sources.some(
    (s: Source) => (s.tier === 1 || (s as any).type === 'primary' || (s as any).type === 'government') && Boolean(s.url)
  );
}

/**
 * 3. Partially Verified / Disputed
 * Derived from the aggregate distribution of assessed claims:
 * requires supported claims AND at least one mixed or unresolved claim, BUT NO unsupported/false claims.
 */
export function canSayPartiallyVerified(story: Story): boolean {
  if (!story || !story.claims || story.claims.length === 0) return false;
  const conclusions = story.claims.map(classifyClaimConclusion);
  const hasSupported = conclusions.includes('supported');
  const hasMixedOrUnverified = conclusions.includes('mixed') || conclusions.includes('unverified');
  const hasNotSupported = conclusions.includes('not_supported');

  return hasSupported && hasMixedOrUnverified && !hasNotSupported;
}

/**
 * 4. Developing
 * Requires explicit developing lifecycle flag or developing status.
 */
export function canSayDeveloping(story: Story): boolean {
  if (!story) return false;
  return Boolean((story as any).isDeveloping || story.publicationStatus === ('developing' as any));
}

/**
 * 5. Corrected
 * Requires explicit substantive correction record in versionHistory.
 */
export function canSayCorrected(story: Story): boolean {
  if (!story || !story.versionHistory) return false;
  return story.versionHistory.some((v: any) => v.type === 'correction' || v.description?.toLowerCase().includes('correction'));
}

/**
 * 6. Substantively Updated
 * Requires an explicit substantive update/version record in versionHistory (timestamp change alone does not qualify).
 */
export function canSayUpdated(story: Story): boolean {
  if (!story || !story.versionHistory) return false;
  return story.versionHistory.some((v: any) => v.type === 'update' || v.type === 'version' || v.description?.toLowerCase().includes('substantive update'));
}

/**
 * Derives all valid reader trust signals for a given story.
 */
export function deriveStoryTrustSignals(story: Story): TrustSignal[] {
  const signals: TrustSignal[] = [];

  if (canSayPrimarySourcesAvailable(story)) {
    signals.push({
      id: 'primary-docs',
      label: 'Primary documents available',
      type: 'primary',
    });
  }

  if (canSayEvidenceReviewed(story)) {
    signals.push({
      id: 'evidence-reviewed',
      label: 'Evidence reviewed',
      type: 'verified',
    });
  }

  if (canSayPartiallyVerified(story)) {
    signals.push({
      id: 'partially-verified',
      label: 'Partially verified',
      type: 'partial',
    });
  }

  if (canSayDeveloping(story)) {
    signals.push({
      id: 'developing',
      label: 'Developing — facts updating',
      type: 'developing',
    });
  }

  if (canSayCorrected(story)) {
    signals.push({
      id: 'corrected',
      label: 'Substantive correction applied',
      type: 'corrected',
    });
  } else if (canSayUpdated(story)) {
    signals.push({
      id: 'updated',
      label: 'Substantively updated',
      type: 'updated',
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: 'evidence-reviewed',
      label: 'Evidence reviewed',
      type: 'verified',
    });
  }

  return signals;
}
