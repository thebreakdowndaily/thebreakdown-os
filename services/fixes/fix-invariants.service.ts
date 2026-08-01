// ── Canonical Fix Invariants Service (AR-13A.0 Invariant Engine) ───────────

import { Fix } from '../../types/canonical';

export interface InvariantViolation {
  invariantId: string;
  description: string;
  field?: string;
  severity: 'BLOCKER' | 'CRITICAL';
}

export class FixInvariantError extends Error {
  public violations: InvariantViolation[];

  constructor(violations: InvariantViolation[]) {
    const message = `Domain Invariant Violation(s):\n${violations
      .map((v) => `[${v.invariantId}] (${v.severity}): ${v.description}`)
      .join('\n')}`;
    super(message);
    this.name = 'FixInvariantError';
    this.violations = violations;
  }
}

export const PROHIBITED_CERTAINTY_WORDS = [
  'obviously',
  'clearly',
  'undoubtedly',
  'visionary',
  'disastrous',
  'indisputably',
  'unquestionably',
];

export class FixInvariantsService {
  /**
   * Evaluates all 8 AR-13A.0 domain invariants against a Fix instance.
   * Throws FixInvariantError if any blocker invariant evaluates to FALSE.
   */
  public static validate(fix: Partial<Fix>): InvariantViolation[] {
    const violations: InvariantViolation[] = [];

    // INV-FIX-001: Single Canonical Identifier
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!fix.id || !uuidRegex.test(fix.id)) {
      violations.push({
        invariantId: 'INV-FIX-001',
        description: 'Every Fix must possess a immutable, valid UUIDv4 identifier.',
        field: 'id',
        severity: 'BLOCKER',
      });
    }

    // INV-FIX-002: Single Canonical Slug
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!fix.slug || !kebabRegex.test(fix.slug)) {
      violations.push({
        invariantId: 'INV-FIX-002',
        description: 'Every Fix must possess a unique, valid kebab-case slug.',
        field: 'slug',
        severity: 'BLOCKER',
      });
    }

    // INV-FIX-003: Mandatory Source Attestation
    if (fix.publicationStatus === 'published') {
      if (!fix.sourceIds || !Array.isArray(fix.sourceIds) || fix.sourceIds.length === 0) {
        violations.push({
          invariantId: 'INV-FIX-003',
          description: 'A published Fix must reference at least one canonical Source citation.',
          field: 'sourceIds',
          severity: 'BLOCKER',
        });
      }
    }

    // INV-FIX-004: Single Parent Claim Ownership
    if (fix.claimIds && Array.isArray(fix.claimIds)) {
      for (const claimId of fix.claimIds) {
        if (!claimId || claimId.trim() === '') {
          violations.push({
            invariantId: 'INV-FIX-004',
            description: 'Single Parent Claim Ownership: Referenced claim ID linkage must be non-empty string in Claim Registry.',
            field: 'claimIds',
            severity: 'BLOCKER',
          });
        }
      }
    }

    // INV-FIX-005: Supersession Pointer Integrity
    if (fix.publicationStatus === 'superseded') {
      if (!fix.supersededByFixId || fix.supersededByFixId.trim() === '') {
        violations.push({
          invariantId: 'INV-FIX-005',
          description: 'A superseded Fix must reference a valid supersededByFixId replacement pointer.',
          field: 'supersededByFixId',
          severity: 'BLOCKER',
        });
      }
      if (fix.supersededByFixId === fix.id) {
        violations.push({
          invariantId: 'INV-FIX-005',
          description: 'A Fix cannot supersede itself (self-reference prohibited).',
          field: 'supersededByFixId',
          severity: 'BLOCKER',
        });
      }
    }

    // INV-FIX-006: Lifecycle Status Guard
    if (!fix.editorialStatus || !fix.publicationStatus || !fix.maturityStatus) {
      violations.push({
        invariantId: 'INV-FIX-006',
        description: 'No Fix may exist without assigned editorialStatus, publicationStatus, and maturityStatus.',
        field: 'editorialStatus',
        severity: 'BLOCKER',
      });
    }

    // INV-FIX-007: Actor Responsibility Mapping
    if (!fix.responsibleActorIds || !Array.isArray(fix.responsibleActorIds) || fix.responsibleActorIds.length === 0) {
      violations.push({
        invariantId: 'INV-FIX-007',
        description: 'Every Fix must reference at least one responsible actor Entity ID.',
        field: 'responsibleActorIds',
        severity: 'BLOCKER',
      });
    }

    // INV-FIX-008: Neutrality Language Guard
    const rootCausesArray = Array.isArray(fix.rootCauses)
      ? fix.rootCauses
      : fix.rootCauses
      ? [fix.rootCauses]
      : [];

    const fullTextContent = [
      fix.title || fix.headline || '',
      fix.summary || '',
      fix.problemStatement || '',
      ...rootCausesArray.map((r) => `${r.title} ${r.content}`),
      ...(fix.recommendedActions?.map((a) => `${a.title} ${a.description}`) || []),
    ]
      .join(' ')
      .toLowerCase();

    for (const word of PROHIBITED_CERTAINTY_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(fullTextContent)) {
        violations.push({
          invariantId: 'INV-FIX-008',
          description: `Neutrality Violation: Found prohibited certainty word "${word}".`,
          field: 'text',
          severity: 'BLOCKER',
        });
      }
    }

    return violations;
  }

  /**
   * Asserts that a Fix satisfies all domain invariants.
   * Throws FixInvariantError if violations exist.
   */
  public static assertValid(fix: Partial<Fix>): void {
    const violations = FixInvariantsService.validate(fix);
    if (violations.length > 0) {
      throw new FixInvariantError(violations);
    }
  }
}
