export type FlagState = 'OFF' | 'ON' | 'CANARY';

export type CanonicalEligibilityStatus = 'ELIGIBLE' | 'BLOCKED' | 'NEEDS_REVIEW';

export interface FeatureFlags {
  CANONICAL_READ_PATH: FlagState;
}

/**
 * Precomputed eligibility registry for Canonical Knowledge Layer migration.
 * Eligibility is computed ahead of time via published schema validation & evidence verification,
 * preventing expensive runtime schema validation on every read request.
 */
export const CANONICAL_ELIGIBILITY_REGISTRY: Record<string, CanonicalEligibilityStatus> = {
  'indias-inheritance': 'ELIGIBLE',
  'mgnrega-reform': 'ELIGIBLE',
  'rbi-repo-rate': 'ELIGIBLE',
  // Non-migrated / audit targets
  'digital-payments-boom': 'NEEDS_REVIEW',
  'pm-fasal-bima-claims': 'NEEDS_REVIEW',
  'cyber-resilience-act': 'BLOCKED',
  'semiconductor-mission': 'NEEDS_REVIEW',
  'space-economy-2026': 'NEEDS_REVIEW',
  'green-hydrogen-mission': 'NEEDS_REVIEW',
};

export function getStoryEligibility(slug: string): CanonicalEligibilityStatus {
  return CANONICAL_ELIGIBILITY_REGISTRY[slug] || 'BLOCKED';
}

export function getFeatureFlags(): FeatureFlags {
  // Server-only environment variable CANONICAL_READ_PATH takes precedence
  const rawFlag = process.env.CANONICAL_READ_PATH || process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;
  
  let parsedFlag: FlagState = 'OFF';
  if (rawFlag === 'ON') parsedFlag = 'ON';
  else if (rawFlag === 'CANARY') parsedFlag = 'CANARY';
  
  return {
    CANONICAL_READ_PATH: parsedFlag,
  };
}

export const CANARY_SLUGS = ['mgnrega-reform', 'rbi-repo-rate'] as const;

export function isCanonicalReadPathEnabled(slug: string): boolean {
  const flags = getFeatureFlags();
  
  if (flags.CANONICAL_READ_PATH === 'ON') {
    // Under ON: only route stories whose precomputed status is ELIGIBLE
    return getStoryEligibility(slug) === 'ELIGIBLE';
  }
  
  if (flags.CANONICAL_READ_PATH === 'CANARY') {
    // Under CANARY: only route approved canary stories that are ELIGIBLE
    return CANARY_SLUGS.includes(slug as typeof CANARY_SLUGS[number]) && getStoryEligibility(slug) === 'ELIGIBLE';
  }
  
  return false;
}
