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
 * Uses a truncated SHA-256 hash of the claim statement + source context.
 *
 * This is the LAST RESORT — prefer persistent IDs from the research layer.
 */
export function deterministicClaimId(
  statement: string,
  sourceContext: string,
  storySlug: string,
): string {
  const input = `${storySlug}::${statement}::${sourceContext}`;
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 12);
  return `claim-${storySlug}-${hash}`;
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
