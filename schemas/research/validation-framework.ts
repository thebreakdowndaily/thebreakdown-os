/**
 * Research Validation Framework
 * 
 * Defines the boundaries of validation across the Step 3A architecture.
 * Zod is used STRICTLY for Structural Validation.
 * 
 * 1. STRUCTURAL_VALIDATION (Zod schemas)
 *    - Schema-level constraints (e.g. identifier format, enums, date syntax).
 *    - Monetary values > 0.
 *    - Required fields.
 * 
 * 2. RELATIONAL_VALIDATION (Domain Services)
 *    - Requires database lookup.
 *    - e.g., "Does this evidence item actually exist?"
 * 
 * 3. METHODOLOGICAL_VALIDATION (Domain Services)
 *    - Requires methodology/evidence evaluation.
 *    - e.g., "Is this evidence sufficient to establish a fact?"
 *    - e.g., "Can these two financial records be safely aggregated?"
 * 
 * 4. HUMAN_REVIEW_REQUIRED (Workflow)
 *    - Cannot safely be automated.
 *    - e.g., Bias checks, linguistic neutrality.
 */

import { z } from 'zod';

export const ZodIdentifierPattern = z.string().uuid();
export const ZodCanonicalIdPattern = z.string().regex(/^UP-AC-(00[1-9]|0[1-9][0-9]|[1-3][0-9]{2}|40[0-3])$/, "Invalid Constituency ID");
export const ZodDatePattern = z.string().datetime({ offset: true });

export const StructuralValidation = {
  internalId: () => ZodIdentifierPattern,
  canonicalId: () => ZodCanonicalIdPattern,
  date: () => ZodDatePattern,
};
