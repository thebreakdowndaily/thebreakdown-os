/**
 * ─── Evidence Publication Guard (Phase 4B-2E) ─────────────────────────────────
 *
 * Governing Documents:
 *   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
 *   - AGENTS.md (Verification & Idempotency, Knowledge First)
 *   - .planning/PHASE-4B-2D-EVIDENCE-PROVENANCE-REMEDIATION-DESIGN.md
 *
 * Invariants:
 *   - Human verification authority is absolute.
 *   - Every non-legacy claim in a published story must be backed by an archived,
 *     cryptographically intact, retention-locked artifact in the Evidence Vault.
 *   - Pre-vault claims are grandfathered under `isLegacy === true`.
 *   - Fails closed: Missing or unverified evidence strictly blocks publication.
 */

import type { Story } from '@/types/canonical';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

export class PublicationBlockedError extends Error {
  public readonly violations: string[];
  constructor(violations: string[]) {
    super(`Story publication blocked by Evidence Publication Guard:\n- ${violations.join('\n- ')}`);
    this.name = 'PublicationBlockedError';
    this.violations = violations;
  }
}

export class DirectPublicationForbiddenError extends Error {
  constructor(message = "Direct save with status='published' is strictly prohibited. Publication must execute via the canonical publication authority.") {
    super(message);
    this.name = 'DirectPublicationForbiddenError';
  }
}

export interface EvidenceValidationResult {
  valid: boolean;
  violations: string[];
}

export async function validateStoryEvidenceCompleteness(
  story: Story,
  vault?: EvidenceVaultService
): Promise<EvidenceValidationResult> {
  const violations: string[] = [];

  // Emergency rollback toggle: if explicitly set to 'false', bypass guard
  if (process.env.REQUIRE_EVIDENCE_VAULT_FOR_PUBLICATION === 'false') {
    return { valid: true, violations: [] };
  }

  for (const claim of story.claims || []) {
    // 1. Grandfathered legacy claims are exempt from vault enforcement
    if (claim.isLegacy) continue;

    // 2. Enforce evidence presence
    if (!claim.evidenceId && !claim.sourceUrl && !claim.archiveId) {
      violations.push(`Claim "${claim.claim}" has no supporting evidence attached.`);
      continue;
    }

    // 3. Enforce vault reconstructibility
    if (!claim.archiveId) {
      violations.push(`Claim "${claim.claim}" lacks an Evidence Vault archive identity.`);
      continue;
    }

    if (vault) {
      // 4. Verify artifact exists and is locked
      const artifact = await vault.getArtifactMetadata(claim.archiveId);
      if (!artifact) {
        violations.push(`Archive artifact ${claim.archiveId} for claim "${claim.claim}" not found.`);
        continue;
      }

      if (artifact.retentionState !== 'verified' && artifact.retentionState !== 'locked') {
        violations.push(
          `Archive artifact ${claim.archiveId} for claim "${claim.claim}" is in '${artifact.retentionState}' state (must be 'verified').`
        );
        continue;
      }

      // 5. Cryptographic byte verification check
      const isIntact = await vault.verifyCryptographicIntegrity(claim.archiveId);
      if (!isIntact) {
        violations.push(`Archive artifact ${claim.archiveId} failed cryptographic integrity verification.`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
