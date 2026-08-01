// ── Production Infrastructure & Reliability Domain Specification (Phase 18C) ─
// Immutable Infrastructure domain interfaces.

export type ProbeType = 'LIVENESS' | 'READINESS' | 'HEALTH';
export type DependencyCriticality = 'CRITICAL' | 'NON_CRITICAL';
export type RecoveryState = 'NORMAL' | 'DEGRADED' | 'RECOVERING' | 'FAILED';
export type EnvironmentProfile = 'development' | 'staging' | 'production';

export interface HealthCheckResult {
  probeType: ProbeType;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  checkedAt: string;
  durationMs: number;
  details: Record<string, unknown>;
}

export interface InfrastructureDependency {
  id: string;
  name: string;
  criticality: DependencyCriticality;
  status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED';
  timeoutMs: number;
  lastCheckedAt: string;
}

export interface BuildProvenance {
  platformVersion: string; // e.g. "AR-13A.0"
  gitCommit: string;
  buildNumber: string;
  buildTimestamp: string;
  deploymentTarget: EnvironmentProfile;
  configurationVersion: string;
}

export interface InfrastructureIncident {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  component: string;
  status: 'OPEN' | 'RECOVERING' | 'RESOLVED';
  startedAt: string;
  recoveredAt?: string;
  resolution?: string;
}

export interface ResiliencePolicy {
  policyId: string;
  dependencyId: string;
  failureThreshold: number;
  recoveryStrategy: 'RETRY' | 'CIRCUIT_BREAKER' | 'FALLBACK_PROJECTION';
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export interface EnvironmentValidationResult {
  profile: EnvironmentProfile;
  valid: boolean;
  missingVariables: readonly string[];
  warnings: readonly string[];
  validatedAt: string;
}

export interface ProductionInfrastructureProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  recoveryState: RecoveryState;
  provenance: BuildProvenance;
  environmentValidation: EnvironmentValidationResult;
  liveness: HealthCheckResult;
  readiness: HealthCheckResult;
  health: HealthCheckResult;
  dependencies: readonly InfrastructureDependency[];
  activeIncidents: readonly InfrastructureIncident[];
  resiliencePolicies: readonly ResiliencePolicy[];
}
