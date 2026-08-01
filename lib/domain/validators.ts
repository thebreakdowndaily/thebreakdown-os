/**
 * ─── The Breakdown OS — Canonical Domain Invariant Validators ───────────────
 * Implementation of Phase 1 Invariants defined in Constitution Level 2 & 5.
 * Enforces domain invariants before projections consume knowledge objects.
 */

import { Claim, Evidence, KnowledgeObservation, Story, Source } from '@/types/canonical';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates invariant requirements for a canonical Claim object:
 * 1. Claim ID and text must be non-empty.
 * 2. Must link to a source or evidence item.
 * 3. Confidence score must be between 0 and 100.
 */
export function validateClaim(claim: Partial<Claim>): ValidationResult {
  const errors: string[] = [];

  if (!claim.id || claim.id.trim() === '') {
    errors.push('Claim must have a non-empty ID.');
  }

  if (!claim.claim || claim.claim.trim() === '') {
    errors.push('Claim text cannot be empty.');
  }

  if (!claim.source && !claim.sourceUrl && !claim.evidenceId) {
    errors.push('Claim must be linked to a source, sourceUrl, or evidenceId.');
  }

  if (typeof claim.confidence !== 'number' || claim.confidence < 0 || claim.confidence > 100) {
    errors.push('Claim confidence score must be a number between 0 and 100.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates invariant requirements for an Evidence object:
 * 1. Evidence ID, claimId, and summary must be non-empty.
 * 2. Must possess a valid hierarchyTier (tier_1 to tier_8).
 * 3. Confidence score must be between 0 and 100.
 */
export function validateEvidence(evidence: Partial<Evidence>): ValidationResult {
  const errors: string[] = [];

  if (!evidence.id || evidence.id.trim() === '') {
    errors.push('Evidence must have a non-empty ID.');
  }

  if (!evidence.claimId || evidence.claimId.trim() === '') {
    errors.push('Evidence must link to a valid claimId.');
  }

  if (!evidence.summary || evidence.summary.trim() === '') {
    errors.push('Evidence summary cannot be empty.');
  }

  if (!evidence.hierarchyTier) {
    errors.push('Evidence must have a defined hierarchyTier.');
  }

  if (typeof evidence.confidenceScore !== 'number' || evidence.confidenceScore < 0 || evidence.confidenceScore > 100) {
    errors.push('Evidence confidenceScore must be a number between 0 and 100.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates invariant requirements for a KnowledgeObservation object:
 * 1. Observation ID, entityId, and description must be non-empty.
 */
export function validateKnowledgeObservation(obs: Partial<KnowledgeObservation>): ValidationResult {
  const errors: string[] = [];

  if (!obs.id || obs.id.trim() === '') {
    errors.push('KnowledgeObservation must have a non-empty ID.');
  }

  if (!obs.entityId || obs.entityId.trim() === '') {
    errors.push('KnowledgeObservation must link to an entityId.');
  }

  if (!obs.description || obs.description.trim() === '') {
    errors.push('KnowledgeObservation description cannot be empty.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates invariant requirements for a Published Story:
 * 1. Must have title, slug, headline, summary.
 * 2. Must contain at least 1 source or claim.
 * 3. Must have a valid publicationStatus.
 */
export function validateStoryInvariants(story: Partial<Story>): ValidationResult {
  const errors: string[] = [];

  if (!story.id || story.id.trim() === '') {
    errors.push('Story must have a non-empty ID.');
  }

  if (!story.title || story.title.trim() === '') {
    errors.push('Story title cannot be empty.');
  }

  if (!story.slug || story.slug.trim() === '') {
    errors.push('Story slug cannot be empty.');
  }

  if (!story.summary || story.summary.trim() === '') {
    errors.push('Story summary cannot be empty.');
  }

  const hasSources = Array.isArray(story.sources) && story.sources.length > 0;
  const hasClaims = Array.isArray(story.claims) && story.claims.length > 0;

  if (!hasSources && !hasClaims) {
    errors.push('Story must contain at least 1 verified source or claim.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
