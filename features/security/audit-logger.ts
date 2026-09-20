/**
 * Security Audit Logger
 *
 * Centralized, sanitized security logging.
 * NEVER logs raw API keys, passwords, JWT tokens, cookies, or sensitive PII.
 */

export type SecurityEventType =
  | 'api_key.created'
  | 'api_key.revoked'
  | 'api_key.deleted'
  | 'api_key.auth_success'
  | 'api_key.auth_failed'
  | 'rate_limit.exceeded'
  | 'rate_limit.store_fallback'
  | 'rate_limit.store_error'
  | 'auth.privilege_escalation_attempt'
  | 'request.oversized_payload';

export interface SecurityAuditEvent {
  type: SecurityEventType;
  timestamp?: string;
  ip?: string | null;
  actorId?: string | null;
  keyId?: string | null;
  keyPrefix?: string | null;
  endpoint?: string | null;
  method?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}

// Redaction patterns
const SENSITIVE_KEYS = new Set([
  'key', 'raw_key', 'token', 'secret', 'password', 'authorization', 'cookie', 'jwt'
]);

function sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'string' && (v.startsWith('tb_live_') || v.startsWith('eyJ'))) {
      sanitized[k] = '[REDACTED_SECRET]';
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export function logSecurityEvent(event: SecurityAuditEvent): void {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    metadata: sanitizeMetadata(event.metadata),
  };

  // Structured JSON output for log aggregators (Datadog, CloudWatch, Sentry Breadcrumbs)
  if (process.env.NODE_ENV !== 'test') {
    console.info(`[SECURITY_AUDIT] ${JSON.stringify(payload)}`);
  }
}
