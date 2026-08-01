import { describe, it, expect, beforeEach } from 'vitest';
import { HealthProbeService } from '../lib/infrastructure/health-probes';
import { DependencyRegistry } from '../lib/infrastructure/dependency-registry';
import { EnvironmentValidator } from '../lib/infrastructure/environment';
import { BuildProvenanceService } from '../lib/infrastructure/provenance';
import { OperationalResilienceEngine } from '../lib/infrastructure/resilience';
import { InfrastructureProjectionBuilder } from '../lib/infrastructure/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-INFRASTRUCTURE: Production Infrastructure & Reliability Subsystem (Phase 18C)', () => {
  beforeEach(() => {
    DependencyRegistry.clear();
  });

  it('TEST-INFRA-01: Liveness Probe (/api/live) Execution', () => {
    const live = HealthProbeService.checkLiveness();
    expect(live.probeType).toBe('LIVENESS');
    expect(live.status).toBe('UP');
    expect(live.details.processAlive).toBe(true);
  });

  it('TEST-INFRA-02: Readiness Probe (/api/ready) Critical Dependency Check', () => {
    DependencyRegistry.listAll();
    const ready = HealthProbeService.checkReadiness();
    expect(ready.probeType).toBe('READINESS');
    expect(ready.status).toBe('UP');
  });

  it('TEST-INFRA-03: Health Probe (/api/health) Platform Health Check', () => {
    DependencyRegistry.listAll();
    const health = HealthProbeService.checkHealth();
    expect(health.probeType).toBe('HEALTH');
    expect(health.status).toBe('UP');
  });

  it('TEST-INFRA-04: Infrastructure Dependency Registry Discovery', () => {
    const deps = DependencyRegistry.listAll();
    expect(deps.length).toBe(5);
    expect(deps.some((d) => d.id === 'dep-repo')).toBe(true);
  });

  it('TEST-INFRA-05: Environment Profile Schema Validation', () => {
    const devRes = EnvironmentValidator.validate('development', { NODE_ENV: 'development' });
    expect(devRes.valid).toBe(true);

    const prodRes = EnvironmentValidator.validate('production', { NODE_ENV: 'production', PORT: '3000', PUBLIC_HOST: 'thebreakdown.org' });
    expect(prodRes.valid).toBe(true);
  });

  it('TEST-INFRA-06: Environment Missing Variable & Warning Detection', () => {
    const prodRes = EnvironmentValidator.validate('production', { DEBUG: 'true' });
    expect(prodRes.warnings.length).toBeGreaterThan(0);
    expect(prodRes.warnings[0]).toContain('DEBUG flag is set to true');
  });

  it('TEST-INFRA-07: Build Provenance Metadata Tracking', () => {
    const prov = BuildProvenanceService.getProvenance();
    expect(prov.platformVersion).toBe('AR-13A.0');
    expect(prov.gitCommit).toBe('a1b2c3d4e5f6');
    expect(Object.isFrozen(prov)).toBe(true);
  });

  it('TEST-INFRA-08: Declarative Resilience Policy Evaluation', () => {
    const engine = new OperationalResilienceEngine();
    const policies = engine.getPolicies();

    expect(policies.length).toBe(2);
    expect(policies[0].recoveryStrategy).toBe('CIRCUIT_BREAKER');
  });

  it('TEST-INFRA-09: Incident Model Reporting & Resolution Lifecycle', () => {
    const engine = new OperationalResilienceEngine();
    const inc = engine.reportIncident('Fix Repository', 'HIGH');

    expect(inc.status).toBe('OPEN');
    expect(engine.getActiveIncidents().length).toBe(1);

    engine.resolveIncident(inc.id, 'Repository restored.');
    expect(engine.getActiveIncidents().length).toBe(0);
  });

  it('TEST-INFRA-10: Recovery State Machine Transitions', () => {
    const engine = new OperationalResilienceEngine();
    expect(engine.deriveRecoveryState()).toBe('NORMAL');

    DependencyRegistry.updateStatus('dep-search', 'UNHEALTHY');
    expect(engine.deriveRecoveryState()).toBe('DEGRADED');

    DependencyRegistry.updateStatus('dep-repo', 'UNHEALTHY');
    expect(engine.deriveRecoveryState()).toBe('FAILED');
  });

  it('TEST-INFRA-11: ProductionInfrastructureProjection Building & Immutability', () => {
    const proj = InfrastructureProjectionBuilder.buildProjection();
    expect(proj.platformVersion).toBe('AR-13A.0');
    expect(proj.liveness.status).toBe('UP');
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.provenance)).toBe(true);
  });

  it('TEST-INFRA-12: Readiness Failure Isolation When Critical Dependency Down', () => {
    DependencyRegistry.listAll();
    DependencyRegistry.updateStatus('dep-repo', 'UNHEALTHY');

    const ready = HealthProbeService.checkReadiness();
    expect(ready.status).toBe('DOWN');
  });

  it('TEST-INFRA-13: Dependency Timeout Setting Verification', () => {
    const deps = DependencyRegistry.listAll();
    const repoDep = deps.find((d) => d.id === 'dep-repo');
    expect(repoDep?.timeoutMs).toBe(1000);
  });

  it('TEST-INFRA-14: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    InfrastructureProjectionBuilder.buildProjection();
    HealthProbeService.checkHealth();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-INFRA-15: High Volume Probe Execution Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      HealthProbeService.checkLiveness();
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // 1,000 probes under 100ms
  });

  it('TEST-INFRA-16: Deterministic Projection Serialization Stability', () => {
    const proj = InfrastructureProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"platformVersion":"AR-13A.0"');
  });
});
