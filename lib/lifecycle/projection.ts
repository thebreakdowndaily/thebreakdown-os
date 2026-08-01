// ── Platform Operations Projection Builder (Phase 20A Recommendation 6) ───────

import { PlatformOperationsProjection, ReleaseTrain } from '../../types/lifecycle';
import { DeploymentLifecycleManager } from './deployment-manager';
import { RuntimeConfigurationEngine } from './configuration-engine';
import { SLORegistryService } from './slo-registry';
import { DisasterRecoveryEngine } from './disaster-recovery';

export class PlatformOperationsProjectionBuilder {
  /**
   * Builds an immutable PlatformOperationsProjection for UI visualization.
   */
  public static buildProjection(
    manager?: DeploymentLifecycleManager,
    options?: {
      projectionId?: string;
      platformVersion?: string;
      currentTime?: Date;
    }
  ): PlatformOperationsProjection {
    const timestamp = options?.currentTime || new Date();
    const mgr = manager || new DeploymentLifecycleManager();

    const activeRollouts = mgr.getActiveRollouts();
    const configurationDrifts = RuntimeConfigurationEngine.calculateDrifts();
    const sloBudgets = SLORegistryService.listSLOBudgets();
    const disasterRecoveryChecks = DisasterRecoveryEngine.runDRValidation();

    const releaseTrains: ReleaseTrain[] = [
      {
        trainId: 'train-rel-1.0',
        releaseVersion: 'v1.0.0',
        plannedWindow: '2026-07-25 20:00 UTC',
        participatingComponents: Object.freeze(['Telemetry', 'ControlPlane', 'Security', 'Infrastructure']),
        requiredApprovals: Object.freeze(['CTO', 'LeadEditor', 'SecurityOfficer']),
        outcome: 'SUCCESSFUL',
      },
    ];

    return Object.freeze({
      projectionId: options?.projectionId || `proj-ops-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      activeRollouts,
      configurationDrifts,
      sloBudgets,
      disasterRecoveryChecks,
      releaseTrains: Object.freeze(releaseTrains.map((rt) => Object.freeze({ ...rt }))),
    });
  }
}
