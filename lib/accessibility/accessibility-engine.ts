// ── Accessibility Engine & Decomposed Auditors (Phase 27B WP2) ───────────────

import {
  AccessibilitySurface,
  AccessibilityViolation,
  WCAGComplianceProfile,
  CriterionComplianceScore,
} from '../../types/accessibility';

export class ContrastAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    surface.contrastTokens.forEach((token, i) => {
      const minRatio = token.isLargeText ? 3.0 : 4.5;
      if (token.ratio < minRatio) {
        violations.push(
          Object.freeze({
            violationId: `viol-contrast-${i}`,
            ruleId: 'WCAG-1.4.3',
            criterion: '1.4.3 Contrast (Minimum)',
            principle: 'Perceivable',
            severity: 'ERROR',
            description: `Contrast ratio ${token.ratio}:1 is below required minimum ${minRatio}:1.`,
            recommendation: 'Increase color contrast difference between foreground and background.',
          })
        );
      }
    });
    return violations;
  }
}

export class KeyboardAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    let prevIndex = -1;
    let trapDetected = false;

    surface.focusables.forEach((f) => {
      if (f.tabIndex < 0 && f.tabIndex !== -1) {
        trapDetected = true;
      }
      if (f.tabIndex > 0 && f.tabIndex < prevIndex) {
        violations.push(
          Object.freeze({
            violationId: `viol-kbd-order-${f.id}`,
            ruleId: 'WCAG-2.4.3',
            criterion: '2.4.3 Focus Order',
            principle: 'Operable',
            severity: 'WARNING',
            description: `Non-sequential positive tabIndex ${f.tabIndex} alters focus order.`,
            recommendation: 'Use natural DOM focus order (tabIndex=0) rather than positive tabIndex.',
          })
        );
      }
      prevIndex = f.tabIndex;
    });

    if (trapDetected) {
      violations.push(
        Object.freeze({
          violationId: 'viol-kbd-trap',
          ruleId: 'WCAG-2.1.2',
          criterion: '2.1.2 No Keyboard Trap',
          principle: 'Operable',
          severity: 'ERROR',
          description: 'Potential focus trap detected in interactive element sequence.',
          recommendation: 'Ensure keyboard focus can move away from interactive elements using Tab/Shift+Tab.',
        })
      );
    }
    return violations;
  }
}

export class LandmarkAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    const roles = surface.landmarks.map((l) => l.role);

    if (!roles.includes('main')) {
      violations.push(
        Object.freeze({
          violationId: 'viol-landmark-main',
          ruleId: 'WCAG-1.3.1',
          criterion: '1.3.1 Info and Relationships',
          principle: 'Perceivable',
          severity: 'ERROR',
          description: 'Missing main landmark role on page.',
          recommendation: 'Wrap primary content in <main> landmark container.',
        })
      );
    }

    if (!roles.includes('navigation') && !roles.includes('banner')) {
      violations.push(
        Object.freeze({
          violationId: 'viol-landmark-nav',
          ruleId: 'WCAG-1.3.1',
          criterion: '1.3.1 Info and Relationships',
          principle: 'Perceivable',
          severity: 'WARNING',
          description: 'Page lacks clear navigation or banner landmarks.',
          recommendation: 'Include <nav> or header banner landmark for screen readers.',
        })
      );
    }

    return violations;
  }
}

export class HeadingAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    const h1Count = surface.headings.filter((h) => h.level === 1).length;

    if (h1Count === 0) {
      violations.push(
        Object.freeze({
          violationId: 'viol-heading-no-h1',
          ruleId: 'WCAG-1.3.1',
          criterion: '1.3.1 Heading Structure',
          principle: 'Perceivable',
          severity: 'ERROR',
          description: 'Page lacks a top-level <h1> heading.',
          recommendation: 'Provide exactly one <h1> heading summarizing page topic.',
        })
      );
    } else if (h1Count > 1) {
      violations.push(
        Object.freeze({
          violationId: 'viol-heading-multi-h1',
          ruleId: 'WCAG-1.3.1',
          criterion: '1.3.1 Heading Structure',
          principle: 'Perceivable',
          severity: 'WARNING',
          description: `Page contains ${h1Count} <h1> headings.`,
          recommendation: 'Reserve <h1> for primary page title; use <h2>..<h6> for sub-sections.',
        })
      );
    }

    return violations;
  }
}

export class MotionAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    if (!surface.motionSettings.supportsReducedMotion) {
      violations.push(
        Object.freeze({
          violationId: 'viol-motion-reduced',
          ruleId: 'WCAG-2.3.3',
          criterion: '2.3.3 Animation from Interactions',
          principle: 'Operable',
          severity: 'WARNING',
          description: 'Page motion settings do not explicitly honor prefers-reduced-motion.',
          recommendation: 'Wrap non-essential CSS animations in @media (prefers-reduced-motion: no-preference).',
        })
      );
    }
    return violations;
  }
}

export class SkipLinkAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    if (!surface.hasSkipLink) {
      violations.push(
        Object.freeze({
          violationId: 'viol-skiplink-missing',
          ruleId: 'WCAG-2.4.1',
          criterion: '2.4.1 Bypass Blocks',
          principle: 'Operable',
          severity: 'ERROR',
          description: 'Page lacks a skip to main content navigation link.',
          recommendation: 'Add a visually hidden, focusable "Skip to content" link at top of document.',
        })
      );
    }
    return violations;
  }
}

export class ARIAAuditor {
  public static audit(surface: AccessibilitySurface): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    surface.interactiveElements.forEach((el) => {
      if (!el.ariaLabel && (!el.role || el.role === 'generic')) {
        violations.push(
          Object.freeze({
            violationId: `viol-aria-label-${el.id}`,
            ruleId: 'WCAG-4.1.2',
            criterion: '4.1.2 Name, Role, Value',
            principle: 'Robust',
            severity: 'WARNING',
            description: `Interactive element #${el.id} lacks aria-label or accessible role.`,
            recommendation: 'Provide explicit aria-label or descriptive text for interactive controls.',
          })
        );
      }
    });
    return violations;
  }
}

export class AccessibilityEngine {
  /**
   * Audits an immutable AccessibilitySurface model using decomposed auditors.
   */
  public static auditSurface(surface: AccessibilitySurface): WCAGComplianceProfile {
    const contrastViolations = ContrastAuditor.audit(surface);
    const keyboardViolations = KeyboardAuditor.audit(surface);
    const landmarkViolations = LandmarkAuditor.audit(surface);
    const headingViolations = HeadingAuditor.audit(surface);
    const motionViolations = MotionAuditor.audit(surface);
    const skipLinkViolations = SkipLinkAuditor.audit(surface);
    const ariaViolations = ARIAAuditor.audit(surface);

    const allViolations = [
      ...contrastViolations,
      ...keyboardViolations,
      ...landmarkViolations,
      ...headingViolations,
      ...motionViolations,
      ...skipLinkViolations,
      ...ariaViolations,
    ];

    const errorCount = allViolations.filter((v) => v.severity === 'ERROR').length;
    const overallScore = Math.max(0, 100 - errorCount * 15 - allViolations.length * 5);

    const criteriaScores: CriterionComplianceScore[] = [
      {
        criterionId: '1.3.1',
        criterionName: 'Info and Relationships',
        principle: 'Perceivable',
        level: 'A',
        isCompliant: landmarkViolations.length === 0 && headingViolations.length === 0,
        violationCount: landmarkViolations.length + headingViolations.length,
      },
      {
        criterionId: '1.4.3',
        criterionName: 'Contrast (Minimum)',
        principle: 'Perceivable',
        level: 'AA',
        isCompliant: contrastViolations.length === 0,
        violationCount: contrastViolations.length,
      },
      {
        criterionId: '2.1.2',
        criterionName: 'No Keyboard Trap',
        principle: 'Operable',
        level: 'A',
        isCompliant: keyboardViolations.every((v) => v.ruleId !== 'WCAG-2.1.2'),
        violationCount: keyboardViolations.filter((v) => v.ruleId === 'WCAG-2.1.2').length,
      },
      {
        criterionId: '2.4.1',
        criterionName: 'Bypass Blocks',
        principle: 'Operable',
        level: 'A',
        isCompliant: skipLinkViolations.length === 0,
        violationCount: skipLinkViolations.length,
      },
      {
        criterionId: '2.4.3',
        criterionName: 'Focus Order',
        principle: 'Operable',
        level: 'A',
        isCompliant: keyboardViolations.every((v) => v.ruleId !== 'WCAG-2.4.3'),
        violationCount: keyboardViolations.filter((v) => v.ruleId === 'WCAG-2.4.3').length,
      },
      {
        criterionId: '4.1.2',
        criterionName: 'Name, Role, Value',
        principle: 'Robust',
        level: 'A',
        isCompliant: ariaViolations.length === 0,
        violationCount: ariaViolations.length,
      },
    ];

    return Object.freeze({
      profileId: `prof-a11y-${surface.routePath.replace(/\//g, '_')}`,
      routePath: surface.routePath,
      level: 'AA',
      overallScore,
      criteriaScores: Object.freeze(criteriaScores.map((c) => Object.freeze({ ...c }))),
      hasKeyboardTrap: keyboardViolations.some((v) => v.ruleId === 'WCAG-2.1.2'),
      hasSkipLink: surface.hasSkipLink,
      contrastRatioPass: contrastViolations.length === 0,
      motionPass: motionViolations.length === 0,
      auditedAt: new Date().toISOString(),
      engineVersion: 'v1.0.0-wcag2.2',
    });
  }
}
