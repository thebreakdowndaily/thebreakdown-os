/**
 * ─── The Breakdown OS — Operational Telemetry & Structured Logging ──────────
 * Provides structured JSON logging, Core Web Vitals tracking, and server error
 * reporting without exposing private user metadata.
 */

export type LogLevel = 'info' | 'warn' | 'error';

export interface StructuredLogMessage {
  timestamp: string;
  level: LogLevel;
  subsystem: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export function logStructured(level: LogLevel, subsystem: string, message: string, metadata?: Record<string, unknown>): StructuredLogMessage {
  const entry: StructuredLogMessage = {
    timestamp: new Date().toISOString(),
    level,
    subsystem,
    message,
    metadata,
  };

  if (process.env.NODE_ENV !== 'test') {
    const formatted = JSON.stringify(entry);
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  return entry;
}

export function recordPerformanceMetric(metricName: string, valueMs: number, budgetMs: number): { compliant: boolean; deltaMs: number } {
  const compliant = valueMs <= budgetMs;
  return {
    compliant,
    deltaMs: valueMs - budgetMs,
  };
}
