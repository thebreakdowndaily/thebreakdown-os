// ── Platform Governance Projection Builder (Phase 20B WP6) ─────────────────────

import { PlatformGovernanceProjection } from '../../types/governance';
import { GovernancePolicyEngine } from './policy-engine';
import { CrossSubsystemAuditCorrelator } from './audit-correlator';
import { ComplianceFrameworkAuditor } from './compliance-auditor';
import { OperationalRiskRegister } from './risk-engine';

export class PlatformGovernanceProjectionBuilder {
  /**
   * Builds an immutable PlatformGovernanceProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): PlatformGovernanceProjection {
    const timestamp = options?.currentTime || new Date();
    const policies = GovernancePolicyEngine.listPolicies();
    const recentCorrelatedAudits = CrossSubsystemAuditCorrelator.correlateAuditStream();
    const complianceChecks = ComplianceFrameworkAuditor.runComplianceAudit();
    const riskEntries = OperationalRiskRegister.listRiskEntries();
    const activeWaivers = OperationalRiskRegister.getActiveWaivers();

    const isCompliant = complianceChecks.every((c) => c.status === 'COMPLIANT');

    return Object.freeze({
      projectionId: options?.projectionId || `proj-gov-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      overallPosture: isCompliant ? 'COMPLIANT' : 'WARNING',
      policies,
      recentCorrelatedAudits,
      complianceChecks,
      riskEntries,
      activeWaivers,
    });
  }
}
