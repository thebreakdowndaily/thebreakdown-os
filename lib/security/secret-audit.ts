/**
 * ─── The Breakdown OS — Secret Management & Leakage Audit Engine (P2) ────────
 * Scans environment variables and configuration payloads for potential secret leaks,
 * missing environment variables, and production credential isolation.
 */

export interface SecretAuditResult {
  valid: boolean;
  leaksDetected: string[];
  missingSecrets: string[];
}

/**
 * Exact documented template placeholders permitted in database connection strings.
 * Only these explicit values are exempted from secret leakage detection.
 */
export const DOCUMENTED_PASSWORD_PLACEHOLDERS = [
  '[DB_PASSWORD]',
  '<password>',
  '<DB_PASSWORD>',
  'YOUR_PASSWORD',
  '[PASSWORD]',
  '[REDACTED]',
] as const;

export const POSTGRES_CREDENTIAL_URL_PATTERN =
  /postgres(?:ql)?:\/\/[^\s:]+:(?!\[DB_PASSWORD\]@|<password>@|<DB_PASSWORD>@|YOUR_PASSWORD@|\[PASSWORD\]@|\[REDACTED\]@)[^\s@]+@[^\s\/:]+/i;

export const SECRET_LEAK_PATTERNS = [
  /BEGIN .*PRIVATE KEY/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
  /sk_live_[0-9a-zA-Z]{24}/,
  POSTGRES_CREDENTIAL_URL_PATTERN,
  /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*(?:service_role|c2VydmljZV9yb2xl|InJvbGUiOiJzZXJ2aWNlX3JvbGUi|cm9sZSI6InNlcnZpY2Vfcm9sZS)[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/,
];

export function auditSecretLeakage(payload: string): { clean: boolean; detectedPatterns: number } {
  let detected = 0;
  SECRET_LEAK_PATTERNS.forEach((pattern) => {
    if (pattern.test(payload)) {
      detected++;
    }
  });

  // Also inspect candidate JWT payloads for service_role claims
  const jwtRegex = /eyJ[A-Za-z0-9_-]{10,}\.([A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g;
  let match: RegExpExecArray | null;
  let hasDecodedServiceRole = false;
  while ((match = jwtRegex.exec(payload)) !== null) {
    try {
      const decoded = Buffer.from(match[1], 'base64url').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === 'object' && parsed.role === 'service_role') {
        hasDecodedServiceRole = true;
      }
    } catch {
      // not valid JSON payload
    }
  }

  if (hasDecodedServiceRole) {
    const matchedByPattern = SECRET_LEAK_PATTERNS.some((p) => p.test(payload));
    if (!matchedByPattern) {
      detected++;
    }
  }

  return {
    clean: detected === 0,
    detectedPatterns: detected,
  };
}

export function validateSecretIsolation(requiredSecretKeys: string[] = []): SecretAuditResult {
  const missingSecrets = requiredSecretKeys.filter((key) => !process.env[key]);
  return {
    valid: missingSecrets.length === 0,
    leaksDetected: [],
    missingSecrets,
  };
}
