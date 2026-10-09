/**
 * ─── The Breakdown OS — Publication Capability Token Registry ───────────────
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII)
 *   - AGENTS.md (Platform Beta v1.0 — Fail-Closed Publication Authority)
 *   - .planning/PHASE-4B-2J-PRODUCTION-BOUNDARY-BUILD-AUTHORITY-DESIGN.md
 *
 * Pure Node/TypeScript capability token registry with ZERO next/* dependencies.
 * Provides ephemeral single-use capability tokens for atomic publication
 * state transitions across repository and service layers.
 */

// Ephemeral single-use capability token registry
const validPublicationTokens = new Map<string, { storyId: string; expiresAt: number }>();

/**
 * Issues a single-use capability token for a specific story ID.
 * Valid for 60 seconds.
 */
export function issuePublicationToken(storyId: string): string {
  const token = `pub_auth_${crypto.randomUUID()}_${Date.now()}`;
  validPublicationTokens.set(token, {
    storyId,
    expiresAt: Date.now() + 60000, // 60-second validity window
  });
  return token;
}

/**
 * Validates and consumes a single-use capability token for a specific story ID.
 * Returns true if valid and consumed; false otherwise.
 */
export function consumePublicationToken(token: string, storyId: string): boolean {
  const entry = validPublicationTokens.get(token);
  if (!entry) return false;
  validPublicationTokens.delete(token); // Single-use consumption
  if (entry.storyId !== storyId) return false;
  if (Date.now() > entry.expiresAt) return false;
  return true;
}
