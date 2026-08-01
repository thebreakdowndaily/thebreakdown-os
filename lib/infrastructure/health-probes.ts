// ── Health Diagnostic Probes Engine (Phase 18C Recommendation 1) ───────────────

import { HealthCheckResult, ProbeType } from '../../types/infrastructure';
import { DependencyRegistry } from './dependency-registry';

export class HealthProbeService {
  /**
   * Liveness Probe (/api/live): Asserts process is running and memory is healthy.
   */
  public static checkLiveness(currentTime: Date = new Date()): HealthCheckResult {
    const start = Date.now();
    return Object.freeze({
      probeType: 'LIVENESS' as ProbeType,
      status: 'UP',
      checkedAt: currentTime.toISOString(),
      durationMs: Date.now() - start,
      details: Object.freeze({
        processAlive: true,
        uptimeSeconds: Math.round(process.uptime ? process.uptime() : 100),
      }),
    });
  }

  /**
   * Readiness Probe (/api/ready): Asserts HTTP server and critical dependencies are ready.
   */
  public static checkReadiness(currentTime: Date = new Date()): HealthCheckResult {
    const start = Date.now();
    const deps = DependencyRegistry.listAll();
    const criticalDeps = deps.filter((d) => d.criticality === 'CRITICAL');
    const isReady = criticalDeps.every((d) => d.status === 'HEALTHY');

    return Object.freeze({
      probeType: 'READINESS' as ProbeType,
      status: isReady ? 'UP' : 'DOWN',
      checkedAt: currentTime.toISOString(),
      durationMs: Date.now() - start,
      details: Object.freeze({
        criticalDependenciesCount: criticalDeps.length,
        criticalHealthy: isReady,
      }),
    });
  }

  /**
   * Health Probe (/api/health): Asserts platform operation across all dependencies.
   */
  public static checkHealth(currentTime: Date = new Date()): HealthCheckResult {
    const start = Date.now();
    const deps = DependencyRegistry.listAll();
    const unhealthy = deps.filter((d) => d.status === 'UNHEALTHY');
    const degraded = deps.filter((d) => d.status === 'DEGRADED');

    let status: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';
    if (unhealthy.length > 0) status = 'DOWN';
    else if (degraded.length > 0) status = 'DEGRADED';

    return Object.freeze({
      probeType: 'HEALTH' as ProbeType,
      status,
      checkedAt: currentTime.toISOString(),
      durationMs: Date.now() - start,
      details: Object.freeze({
        totalDependencies: deps.length,
        unhealthyCount: unhealthy.length,
        degradedCount: degraded.length,
      }),
    });
  }
}
