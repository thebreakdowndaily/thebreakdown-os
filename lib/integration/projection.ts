// ── Platform Readiness Projection Builder (Phase 19A Recommendation 6) ────────

import { PlatformReadinessProjection } from '../../types/integration';
import { SubsystemContractRegistry } from './contracts';
import { PlatformIntegrationSuite } from './platform-suite';
import { OperationalRunbooksService } from '../infrastructure/runbooks';
import { ProductionReadinessAuditor } from './readiness-auditor';
import { CertificationEngine } from './certification-engine';
import { ReleaseGovernanceEngine } from './release-governance';

export class PlatformReadinessProjectionBuilder {
  /**
   * Builds an immutable PlatformReadinessProjection from readiness audit, workflows, and governance.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): PlatformReadinessProjection {
    const timestamp = options?.currentTime || new Date();
    const governance = ReleaseGovernanceEngine.getContract();
    const subsystemContracts = SubsystemContractRegistry.listContracts();
    const workflowResults = PlatformIntegrationSuite.executeAllScenarios();
    const runbooks = OperationalRunbooksService.listRunbooks();
    const auditChecks = ProductionReadinessAuditor.runAudit();

    const certification = CertificationEngine.evaluateCertification(auditChecks);

    return Object.freeze({
      projectionId: options?.projectionId || `proj-readiness-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || governance.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      readinessStatus: certification.status,
      certification,
      governance,
      subsystemContracts,
      workflowResults,
      runbooks,
      auditChecks,
    });
  }
}
