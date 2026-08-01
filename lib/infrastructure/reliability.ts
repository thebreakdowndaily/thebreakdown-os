/**
 * ─── The Breakdown OS — Reliability & Circuit Breaker Engine (Phase 8) ───────
 * Provides graceful degradation, fallback execution, and circuit breaker mechanisms
 * across network and database queries.
 */

export interface CircuitBreakerState {
  failureThreshold: number;
  failureCount: number;
  state: 'closed' | 'open' | 'half_open';
  lastStateChange: string;
}

export function createCircuitBreaker(failureThreshold: number = 3): CircuitBreakerState {
  return {
    failureThreshold,
    failureCount: 0,
    state: 'closed',
    lastStateChange: new Date().toISOString(),
  };
}

export async function executeWithCircuitBreaker<T>(
  breaker: CircuitBreakerState,
  primaryFn: () => Promise<T>,
  fallbackValue: T
): Promise<{ result: T; breaker: CircuitBreakerState; degraded: boolean }> {
  if (breaker.state === 'open') {
    return { result: fallbackValue, breaker, degraded: true };
  }

  try {
    const result = await primaryFn();
    return {
      result,
      breaker: { ...breaker, failureCount: 0, state: 'closed' },
      degraded: false,
    };
  } catch (err) {
    const newCount = breaker.failureCount + 1;
    const shouldOpen = newCount >= breaker.failureThreshold;
    const updatedBreaker: CircuitBreakerState = {
      ...breaker,
      failureCount: newCount,
      state: shouldOpen ? 'open' : 'closed',
      lastStateChange: new Date().toISOString(),
    };

    return {
      result: fallbackValue,
      breaker: updatedBreaker,
      degraded: true,
    };
  }
}
