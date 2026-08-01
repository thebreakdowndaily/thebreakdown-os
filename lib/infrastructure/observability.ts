/**
 * ─── The Breakdown OS — Production Observability & Traceability (P1) ─────────
 * Tracks request IDs (X-Request-Id), latency, availability, circuit breaker telemetry,
 * and deployment metadata.
 */

export interface RequestTraceContext {
  requestId: string;
  pathname: string;
  method: string;
  startTime: number;
}

export function createRequestTraceContext(pathname: string, method: string = 'GET'): RequestTraceContext {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  return {
    requestId,
    pathname,
    method,
    startTime: Date.now(),
  };
}

export function finalizeRequestTrace(
  context: RequestTraceContext,
  statusCode: number
): { requestId: string; durationMs: number; statusCode: number; traceLog: string } {
  const durationMs = Date.now() - context.startTime;
  const traceLog = JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    pathname: context.pathname,
    method: context.method,
    statusCode,
    durationMs,
  });

  return {
    requestId: context.requestId,
    durationMs,
    statusCode,
    traceLog,
  };
}
