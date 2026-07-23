import { z } from 'zod';
import { StructuralValidation } from './validation-framework';

export const BitemporalIntervalSchema = z.object({
  validFrom: StructuralValidation.date(),
  validTo: StructuralValidation.date().nullable(),
  systemFrom: StructuralValidation.date(),
  systemTo: StructuralValidation.date().nullable(),
}).refine(data => !data.validTo || new Date(data.validFrom) <= new Date(data.validTo), {
  message: "validFrom must be before validTo"
}).refine(data => !data.systemTo || new Date(data.systemFrom) <= new Date(data.systemTo), {
  message: "systemFrom must be before systemTo"
});

export const SystemProvenanceSchema = z.object({
  createdByUserId: StructuralValidation.internalId(),
  createdAt: StructuralValidation.date(),
  updatedByUserId: StructuralValidation.internalId().optional(),
  updatedAt: StructuralValidation.date().optional(),
  ingestionMethod: z.enum(['MANUAL', 'AUTOMATED_PIPELINE', 'BULK_IMPORT']),
  aiAssisted: z.boolean().optional()
});

export const HumanReviewMetadataSchema = z.object({
  reviewedByUserId: StructuralValidation.internalId().optional(),
  reviewedAt: StructuralValidation.date().optional(),
  humanReviewStatus: z.enum(['UNREVIEWED', 'IN_REVIEW', 'APPROVED', 'REJECTED'])
});
