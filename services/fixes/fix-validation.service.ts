// ── Fix Validation Engine (AR-13A.0 Specification) ──────────────────────────

import { Fix, Source } from '../../types/canonical';
import { PROHIBITED_CERTAINTY_WORDS } from './fix-invariants.service';

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  validatorId: string;
  suite: 'VAL-ID' | 'VAL-EVD' | 'VAL-MCH' | 'VAL-LC';
  severity: ValidationSeverity;
  isBlocker: boolean;
  message: string;
  field?: string;
}

export interface FixValidationReport {
  isValid: boolean; // true if zero ERROR issues
  canPublish: boolean; // true if zero ERROR issues
  errorsCount: number;
  warningsCount: number;
  infosCount: number;
  issues: ValidationIssue[];
}

export class FixValidationEngine {
  /**
   * Runs the complete AR-13A.0 validation suite across a Fix object.
   */
  public static validate(
    fix: Partial<Fix>,
    context?: { existingSlugs?: string[]; sourcesMap?: Map<string, Source>; goldStandardAudited?: boolean }
  ): FixValidationReport {
    const issues: ValidationIssue[] = [];

    // ── 2.1 Identity & Schema Validators (VAL-ID) ───────────────────
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!fix.id || !uuidRegex.test(fix.id)) {
      issues.push({
        validatorId: 'VAL-ID-01',
        suite: 'VAL-ID',
        severity: 'ERROR',
        isBlocker: true,
        message: 'UUID Format: Fix id must be a valid RFC 4122 UUIDv4 string.',
        field: 'id',
      });
    }

    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!fix.slug || !kebabRegex.test(fix.slug)) {
      issues.push({
        validatorId: 'VAL-ID-02',
        suite: 'VAL-ID',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Kebab Slug: Fix slug must be a valid lowercase kebab-case string.',
        field: 'slug',
      });
    }

    if (context?.existingSlugs && fix.slug && context.existingSlugs.includes(fix.slug)) {
      issues.push({
        validatorId: 'VAL-ID-03',
        suite: 'VAL-ID',
        severity: 'ERROR',
        isBlocker: true,
        message: `Unique Slug: Fix slug "${fix.slug}" collides with an existing object.`,
        field: 'slug',
      });
    }

    const validCategories = ['statutory', 'administrative', 'institutional', 'fiscal', 'technological', 'behavioral', 'judicial'];
    if (!fix.primaryCategory || !validCategories.includes(fix.primaryCategory)) {
      issues.push({
        validatorId: 'VAL-ID-04',
        suite: 'VAL-ID',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Category Valid: primaryCategory must belong to valid InterventionType enum.',
        field: 'primaryCategory',
      });
    }

    // ── 2.2 Evidence & Neutrality Validators (VAL-EVD) ──────────────
    if (fix.publicationStatus === 'published') {
      if (!fix.sourceIds || !Array.isArray(fix.sourceIds) || fix.sourceIds.length === 0) {
        issues.push({
          validatorId: 'VAL-EVD-01',
          suite: 'VAL-EVD',
          severity: 'ERROR',
          isBlocker: true,
          message: 'Min Source Count: Published Fix must reference at least 1 source citation.',
          field: 'sourceIds',
        });
      }
    }

    if (fix.evidenceGrade === 'High') {
      const hasLevel1Source = (fix.sources && fix.sources.some((s) => s.tier === 1 || s.tier === 2)) ||
        (fix.sourceIds && fix.sourceIds.length > 0);
      if (!hasLevel1Source) {
        issues.push({
          validatorId: 'VAL-EVD-02',
          suite: 'VAL-EVD',
          severity: 'ERROR',
          isBlocker: true,
          message: 'High Confidence Primary: High evidence grade requires at least 1 primary source citation.',
          field: 'evidenceGrade',
        });
      }
    }

    const rootCausesArray = Array.isArray(fix.rootCauses)
      ? fix.rootCauses
      : fix.rootCauses
      ? [fix.rootCauses]
      : [];
    const fullText = [
      fix.title || fix.headline || '',
      fix.summary || '',
      fix.problemStatement || '',
      ...rootCausesArray.map((r) => `${r.title} ${r.content}`),
      ...(fix.recommendedActions?.map((a) => `${a.title} ${a.description}`) || []),
    ].join(' ').toLowerCase();

    for (const word of PROHIBITED_CERTAINTY_WORDS) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(fullText)) {
        issues.push({
          validatorId: 'VAL-EVD-03',
          suite: 'VAL-EVD',
          severity: 'ERROR',
          isBlocker: true,
          message: `Neutral Language: Prohibited certainty word "${word}" found in text.`,
          field: 'text',
        });
      }
    }

    if (!fix.unknownsAndGaps || !Array.isArray(fix.unknownsAndGaps) || fix.unknownsAndGaps.length === 0) {
      issues.push({
        validatorId: 'VAL-EVD-04',
        suite: 'VAL-EVD',
        severity: 'WARNING',
        isBlocker: false,
        message: 'Uncertainty Callouts: Explicit callouts of missing data or unmeasured variables should be populated.',
        field: 'unknownsAndGaps',
      });
    }

    // ── 2.3 Structural Mechanics Validators (VAL-MCH) ───────────────
    if (!fix.responsibleActorIds || !Array.isArray(fix.responsibleActorIds) || fix.responsibleActorIds.length === 0) {
      issues.push({
        validatorId: 'VAL-MCH-01',
        suite: 'VAL-MCH',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Responsible Actor: Must reference at least 1 responsible actor Entity ID.',
        field: 'responsibleActorIds',
      });
    }

    if (!fix.disadvantagedGroups || !Array.isArray(fix.disadvantagedGroups) || fix.disadvantagedGroups.length === 0) {
      issues.push({
        validatorId: 'VAL-MCH-02',
        suite: 'VAL-MCH',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Distributional Impact: Disadvantaged groups bearing disruption must be declared.',
        field: 'disadvantagedGroups',
      });
    }

    if (!fix.fiscalCost || !fix.fiscalCost.amount || !fix.fiscalCost.currency || !fix.fiscalCost.fundingMechanism) {
      issues.push({
        validatorId: 'VAL-MCH-03',
        suite: 'VAL-MCH',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Cost Estimate: Must specify currency, amount/range, and funding source.',
        field: 'fiscalCost',
      });
    }

    if (!fix.successMetrics || !Array.isArray(fix.successMetrics) || fix.successMetrics.length === 0) {
      issues.push({
        validatorId: 'VAL-MCH-04',
        suite: 'VAL-MCH',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Metric Indicator: Must reference at least 1 success metric with target value.',
        field: 'successMetrics',
      });
    }

    // ── 2.4 Lifecycle & Governance Validators (VAL-LC) ───────────────
    if (fix.publicationStatus === 'published' && context?.goldStandardAudited === false) {
      issues.push({
        validatorId: 'VAL-LC-01',
        suite: 'VAL-LC',
        severity: 'ERROR',
        isBlocker: true,
        message: 'Gold Standard Audit: Published Fix requires a completed Gold Standard Audit record.',
        field: 'publicationStatus',
      });
    }

    if (fix.publicationStatus === 'superseded') {
      if (!fix.supersededByFixId || fix.supersededByFixId.trim() === '') {
        issues.push({
          validatorId: 'VAL-LC-02',
          suite: 'VAL-LC',
          severity: 'ERROR',
          isBlocker: true,
          message: 'Superseded Pointer: Superseded Fix requires a valid supersededByFixId replacement pointer.',
          field: 'supersededByFixId',
        });
      }
    }

    if (fix.lastVerified && fix.evidenceGrade === 'High') {
      const verifiedTime = new Date(fix.lastVerified).getTime();
      const nowTime = new Date().getTime();
      const ageInDays = (nowTime - verifiedTime) / (1000 * 60 * 60 * 24);
      if (ageInDays > 180) {
        issues.push({
          validatorId: 'VAL-LC-03',
          suite: 'VAL-LC',
          severity: 'WARNING',
          isBlocker: false,
          message: `Freshness Expiry: Last verified ${Math.floor(ageInDays)} days ago (exceeds 180-day audit threshold for High evidence grade).`,
          field: 'lastVerified',
        });
      }
    }

    const errors = issues.filter((i) => i.severity === 'ERROR');
    const warnings = issues.filter((i) => i.severity === 'WARNING');
    const infos = issues.filter((i) => i.severity === 'INFO');

    return {
      isValid: errors.length === 0,
      canPublish: errors.length === 0,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      infosCount: infos.length,
      issues,
    };
  }

  /**
   * Centralized publication clearance check.
   */
  public static canPublish(fix: Partial<Fix>, context?: Parameters<typeof FixValidationEngine.validate>[1]): boolean {
    return this.validate(fix, context).canPublish;
  }
}
