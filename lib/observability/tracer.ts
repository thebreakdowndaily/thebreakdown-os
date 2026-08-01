// ── Unified Observability & Distributed Tracer (Phase 21A WP2) ──────────────────

import { DistributedTraceSpan } from '../../types/observability';

export class UnifiedObservabilityTracer {
  /**
   * Generates a DAG of distributed trace spans representing a cross-subsystem request flow.
   */
  public static generateTrace(traceId = 'trace-master-001'): readonly DistributedTraceSpan[] {
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + 45).toISOString();

    const rootSpanId = `span-root-${Date.now()}`;

    const spans: DistributedTraceSpan[] = [
      {
        traceId,
        spanId: rootSpanId,
        subsystem: 'APIGateway',
        operation: 'GET /api/v1/public/fixes',
        startTime,
        endTime,
        durationMs: 45,
        status: 'OK',
        attributes: Object.freeze({ clientIp: '127.0.0.1', httpStatus: 200 }),
      },
      {
        traceId,
        spanId: `span-sec-${Date.now()}`,
        parentSpanId: rootSpanId,
        subsystem: 'SecuritySubsystem',
        operation: 'EvaluatePublicRoleAccess',
        startTime,
        endTime: new Date(now.getTime() + 10).toISOString(),
        durationMs: 10,
        status: 'OK',
        attributes: Object.freeze({ role: 'PUBLIC', authenticated: false }),
      },
      {
        traceId,
        spanId: `span-proj-${Date.now()}`,
        parentSpanId: rootSpanId,
        subsystem: 'ProjectionService',
        operation: 'GetFixesPublicProjection',
        startTime: new Date(now.getTime() + 10).toISOString(),
        endTime: new Date(now.getTime() + 35).toISOString(),
        durationMs: 25,
        status: 'OK',
        attributes: Object.freeze({ fixCount: 1, cacheHit: true }),
      },
    ];

    return Object.freeze(spans.map((s) => Object.freeze({ ...s })));
  }
}
