// ── Production Infrastructure Projection Builder (Phase 18C Recommendation 6) ─

import { ProductionInfrastructureProjection, EnvironmentProfile } from '../../types/infrastructure';
import { HealthProbeService } from './health-probes';
import { DependencyRegistry } from './dependency-registry';
import { EnvironmentValidator } from './environment';
import { BuildProvenanceService } from './provenance';
import { OperationalResilienceEngine } from './resilience';

export class InfrastructureProjectionBuilder {
  /**
   * Builds an immutable ProductionInfrastructureProjection from diagnostic probes and registries.
   */
  public static buildProjection(
    resilienceEngine?: OperationalResilienceEngine,
    options?: {
      profile?: EnvironmentProfile;
      projectionId?: string;
      platformVersion?: string;
      currentTime?: Date;
    }
  ): ProductionInfrastructureProjection {
    const timestamp = options?.currentTime || new Date();
    const profile = options?.profile || 'production';

    const liveness = HealthProbeService.checkLiveness(timestamp);
    const readiness = HealthProbeService.checkReadiness(timestamp);
    const health = HealthProbeService.checkHealth(timestamp);

    const provenance = BuildProvenanceService.getProvenance();
    const environmentValidation = EnvironmentValidator.validate(profile);
    const dependencies = DependencyRegistry.listAll();

    const engine = resilienceEngine || new OperationalResilienceEngine();
    const recoveryState = engine.deriveRecoveryState();
    const activeIncidents = engine.getActiveIncidents();
    const resiliencePolicies = engine.getPolicies();

    return Object.freeze({
      projectionId: options?.projectionId || `proj-infra-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || provenance.platformVersion || 'AR-13A.0',
      generatedAt: timestamp.toISOString(),
      recoveryState,
      provenance,
      environmentValidation,
      liveness,
      readiness,
      health,
      dependencies: Object.freeze([...dependencies]),
      activeIncidents: Object.freeze([...activeIncidents]),
      resiliencePolicies: Object.freeze([...resiliencePolicies]),
    });
  }
}
