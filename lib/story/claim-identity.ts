/**
 * Claim Identity — deterministic, stable ID generation for claims.
 *
 * Claim IDs must survive reordering, insertion, editing, and migration.
 * Position-based IDs (claim-${slug}-${index}) break on reorder.
 * Random IDs (Math.random()) break across builds.
 *
 * Strategy:
 *   1. Use existing canonical claim IDs from research/database layer
 *   2. Use persistent IDs created at authoring/ingestion time
 *   3. Fall back to content-derived deterministic IDs only as last resort
 */

import { createHash } from 'crypto';

/**
 * Generate a stable, deterministic claim ID from content.
 * Uses a truncated SHA-256 hash of the normalized claim statement + source context.
 * 
 * Versioning: Prepend 'v1-' to the hash component to allow future algorithm updates.
 * Canonicalization: Trims inputs and normalizes all internal whitespace sequences to a single space.
 * 
 * Collision Handling:
 *   - The hash uses 12 hex characters (48 bits of entropy), yielding a collision probability
 *     of < 10^-7 for up to 10,000 claims (well within the scale of Volume I).
 *   - In the extremely rare event of a hash collision, the ingestion/build pipeline will throw
 *     an error on duplicate IDs during registration. Editors can resolve this by slightly editing
 *     the claim description or source text (which changes the hash input).
 * 
 * This is the LAST RESORT — prefer persistent IDs from the research layer.
 */
export function deterministicClaimId(
  statement: string,
  sourceContext: string,
  storySlug: string,
): string {
  const cleanStatement = (statement || '').trim().replace(/\s+/g, ' ');
  const cleanSource = (sourceContext || '').trim().replace(/\s+/g, ' ');
  const cleanSlug = (storySlug || '').trim().toLowerCase();
  
  const input = `${cleanSlug}::${cleanStatement}::${cleanSource}`;
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 12);
  return `claim-${cleanSlug}-v1-${hash}`;
}

/**
 * Generate a stable positional claim ID (better than raw index, but still positional).
 * Use only when no persistent ID exists and content-based ID is not feasible.
 */
export function positionalClaimId(storySlug: string, index: number): string {
  return `claim-${storySlug}-${index}`;
}

/**
 * Validate that a claim ID looks like a well-formed claim identifier.
 */
export function isValidClaimId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('claim-') && id.length > 7;
}
