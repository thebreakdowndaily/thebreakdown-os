/**
 * ─── Research Intelligence Engine — Corroboration ────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic corroboration of extracted claims. The engine:
 *   - Groups claims by normalized proposition key (normalizedClaim)
 *   - Counts supporting sources, INDEPENDENT sources (distinct publisher after
 *     syndication is accounted for), and primary sources
 *   - Assigns a verification state:
 *       PRIMARY_SOURCE_CONFIRMED (≥1 primary source)
 *       CORROBORATED (≥2 independent supporting sources)
 *       PARTIALLY_CORROBORATED (≥1 supporting source, not independent)
 *       SIGNAL_ONLY / UNVERIFIED otherwise
 *   - Never treats syndicated copies as independent corroboration
 */

import type {
  CorroborationCluster,
  ResearchClaim,
  ResearchClaimVerificationState,
  ResearchSource,
  ResearchSourceClass,
} from '@/types/research-intelligence';

export interface CorroborationInput {
  claim: ResearchClaim;
  otherClaims: ResearchClaim[];
  sourcesById: Map<string, ResearchSource>;
}

const PRIMARY_CLASSES: ResearchSourceClass[] = ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY'];

/** Publisher of a source, lowercased; falls back to the domain host. */
function publisherKey(source: ResearchSource): string {
  const p = (source.publisher ?? '').toLowerCase();
  if (p) return p;
  try {
    const host = new URL(source.url).hostname.replace(/^www\./, '');
    return host;
  } catch {
    return source.url.toLowerCase();
  }
}

/** True when both sources come from the same publisher OR one syndicates the other. */
export function isIndependent(a: ResearchSource, b: ResearchSource): boolean {
  if (a.id === b.id) return false;
  if (a.syndicatedFrom === b.id || b.syndicatedFrom === a.id) return false;
  return publisherKey(a) !== publisherKey(b);
}

/**
 * Assess a claim's corroboration state given other claims sharing the same
 * proposition key and the source registry. Pure and deterministic.
 */
export function corroborateClaim(input: CorroborationInput): {
  state: ResearchClaimVerificationState;
  supportingClaims: ResearchClaim[];
  independentCount: number;
  primarySourceCount: number;
} {
  const { claim, otherClaims, sourcesById } = input;
  const supporting = [claim, ...otherClaims].filter(
    (c) => c.normalizedClaim === claim.normalizedClaim
  );

  const sources = supporting
    .map((c) => sourcesById.get(c.sourceId))
    .filter((s): s is ResearchSource => Boolean(s));

  // Independence is publisher-key uniqueness AFTER syndication is accounted
  // for: a wire copy contributes no corroborative weight when its parent is
  // present, and sibling copies of the same absent parent count once
  // (governing doc: "never treats syndicated copies as independent
  // corroboration"). `isIndependent` is exposed for pairwise use.
  const independentKeys = new Set<string>();
  const syndicatedParents = new Set<string>();
  for (const source of sources) {
    if (source.syndicatedFrom) {
      const parent = sources.find((o) => o.id === source.syndicatedFrom);
      if (parent) continue;
      if (syndicatedParents.has(source.syndicatedFrom)) continue;
      syndicatedParents.add(source.syndicatedFrom);
    }
    independentKeys.add(publisherKey(source));
  }
  const independentCount = independentKeys.size;
  const primarySourceCount = sources.filter((s) => PRIMARY_CLASSES.includes(s.sourceClass)).length;

  let state: ResearchClaimVerificationState = 'SIGNAL_ONLY';
  if (primarySourceCount >= 1) {
    state = 'PRIMARY_SOURCE_CONFIRMED';
  } else if (independentCount >= 2) {
    state = 'CORROBORATED';
  } else if (independentCount === 1 && sources.length >= 1) {
    state = 'PARTIALLY_CORROBORATED';
  } else if (sources.length === 0) {
    state = 'UNVERIFIED';
  }

  return { state, supportingClaims: supporting, independentCount, primarySourceCount };
}

/** Corroborate all claims and return update mappings + clusters. */
export function corroborateAll(
  claims: ResearchClaim[],
  sourcesById: Map<string, ResearchSource>
): {
  states: Map<string, ResearchClaimVerificationState>;
  independentCounts: Map<string, number>;
  primarySourceCounts: Map<string, number>;
  clusters: CorroborationCluster[];
} {
  const states = new Map<string, ResearchClaimVerificationState>();
  const independentCounts = new Map<string, number>();
  const primarySourceCounts = new Map<string, number>();

  const grouped = new Map<string, ResearchClaim[]>();
  for (const claim of claims) {
    const list = grouped.get(claim.normalizedClaim) ?? [];
    list.push(claim);
    grouped.set(claim.normalizedClaim, list);
  }

  const clusters: CorroborationCluster[] = [];
  for (const [, groupClaims] of grouped) {
    const primary = groupClaims[0];
    const result = corroborateClaim({ claim: primary, otherClaims: groupClaims.slice(1), sourcesById });
    for (const c of groupClaims) {
      states.set(c.id, result.state);
      independentCounts.set(c.id, result.independentCount);
      primarySourceCounts.set(c.id, result.primarySourceCount);
    }
    clusters.push({
      id: `clu_${groupClaims[0].normalizedClaim.slice(0, 16)}`,
      projectId: primary.projectId,
      claimIds: groupClaims.map((c) => c.id),
      proposition: primary.normalizedClaim,
      status: result.state,
      sourceCount: groupClaims.length,
      independentSourceCount: result.independentCount,
      primarySourceCount: result.primarySourceCount,
      hasPrimarySource: result.primarySourceCount >= 1,
      firstSeenAt: primary.firstSeenAt,
    });
  }

  return { states, independentCounts, primarySourceCounts, clusters };
}
