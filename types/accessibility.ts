// ── Platform Accessibility & UX Certification Specification (Phase 27B) ─────
// Immutable Accessibility domain interfaces under Architecture Release AR-13A.1.

export type WCAGLevel = 'A' | 'AA' | 'AAA';

export type WCAGPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

export type ViolationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface AccessibilitySurface {
  routePath: string;
  routeVersion: string;
  headings: readonly { level: number; text: string }[];
  landmarks: readonly { role: string; label?: string }[];
  focusables: readonly { id: string; type: string; tabIndex: number }[];
  interactiveElements: readonly { id: string; ariaLabel?: string; role?: string }[];
  contrastTokens: readonly { fgColor: string; bgColor: string; ratio: number; isLargeText: boolean }[];
  motionSettings: { supportsReducedMotion: boolean };
  hasSkipLink: boolean;
}

export interface AccessibilityViolation {
  violationId: string;
  ruleId: string;
  criterion: string;
  principle: WCAGPrinciple;
  severity: ViolationSeverity;
  description: string;
  impactedElementId?: string;
  recommendation: string;
}

export interface CriterionComplianceScore {
  criterionId: string;
  criterionName: string;
  principle: WCAGPrinciple;
  level: WCAGLevel;
  isCompliant: boolean;
  violationCount: number;
}

export interface WCAGComplianceProfile {
  profileId: string;
  routePath: string;
  level: WCAGLevel;
  overallScore: number; // 0 to 100
  criteriaScores: readonly CriterionComplianceScore[];
  hasKeyboardTrap: boolean;
  hasSkipLink: boolean;
  contrastRatioPass: boolean;
  motionPass: boolean;
  auditedAt: string;
  engineVersion: string;
}

export interface AccessibilityAuditReport {
  reportId: string;
  platformVersion: string;
  auditedAt: string;
  engineVersion: string;
  wcagVersion: string;
  profiles: readonly WCAGComplianceProfile[];
  violations: readonly AccessibilityViolation[];
  warnings: readonly AccessibilityViolation[];
  overallStatus: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'NON_COMPLIANT';
  accessibilityDisclaimer: string;
}
