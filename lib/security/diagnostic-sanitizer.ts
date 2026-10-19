/**
 * Central Diagnostic Error Sanitizer
 *
 * Provides a single, centrally tested diagnostic sanitizer for error messages across
 * all sinks: console/telemetry logs, database columns (e.g. publication_outbox.last_error),
 * public/internal API summary payloads, and rethrown/propagated exceptions.
 *
 * Supported Patterns:
 * 1. Connection strings and protocol URIs: postgres://, postgresql://, mysql://, mongodb://,
 *    redis://, amqp://, http://, https:// containing user credentials, hosts, ports, paths,
 *    or query tokens (e.g. ?token=..., &apikey=...). Replaced with [REDACTED_URI].
 * 2. Database and infrastructure hostnames outside URIs: e.g. project-ref.supabase.co,
 *    host.internal, service.cluster.local (with optional port numbers).
 *    Replaced with [REDACTED_HOST].
 * 3. JWT-shaped tokens (3-segment base64url strings starting with ey...): bare tokens
 *    and Bearer-prefixed tokens. Replaced with [REDACTED_TOKEN].
 * 4. Sensitive key-value pairs: password=..., passwd=..., pwd=..., token=..., secret=...,
 *    api_key=..., apiKey=..., credential=..., whsec_..., service_role...
 *    Replaced with [REDACTED_SECRET].
 * 5. Length bounding: Enforces a maximum length of 256 characters to prevent buffer bloat
 *    or log-injection attacks. Truncated strings are appended with '...'.
 *
 * Limitations & Non-Goals:
 * - Does not claim universal detection of arbitrarily obfuscated or unstructured high-entropy strings
 *   (e.g. random 64-character hexadecimal hashes with no contextual key prefix or hostname).
 * - Multi-line raw PEM certificate blocks must be scrubbed at source.
 * - Developers must never construct real secrets in tests or runtime error messages.
 */

const MAX_ERROR_LENGTH = 256;

// 1. Connection strings with potential credentials/tokens
const CONNECTION_URI_REGEX = /(?:postgres|postgresql|mysql|mongodb|redis|amqp|https?):\/\/[^\s"'`]+/gi;

// 2. Database and internal infrastructure hostnames outside URIs
const SUPABASE_HOST_REGEX = /[a-zA-Z0-9_.-]+\.supabase\.co(?::\d+)?/gi;
const INTERNAL_HOST_REGEX = /[a-zA-Z0-9_.-]+\.internal(?::\d+)?/gi;
const CLUSTER_HOST_REGEX = /[a-zA-Z0-9_.-]+\.cluster\.local(?::\d+)?/gi;

// 3. JWT-shaped tokens (bare, Bearer-prefixed, or token-prefixed)
// Standard JWT: eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+ or general 3-part base64url
const JWT_TOKEN_REGEX = /(?:(?:bearer|token)[=:\s]+)?\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\b/gi;

// 4. Sensitive keyword-value pairs (passwords, tokens, api keys, webhook secrets)
const SENSITIVE_KV_REGEX = /(?:bearer|token|secret|password|passwd|pwd|api[_-]?key|access[_-]?key|credential|whsec|service[_-]?role)[=:\s]+[^\s,;&"'`]+/gi;
const WHSEC_PREFIX_REGEX = /\bwhsec_[a-zA-Z0-9_]+\b/gi;

/**
 * Sanitizes and redacts an error or unknown value into a bounded, safe string.
 */
export function sanitizeDiagnosticError(error: unknown): string {
  if (!error) return 'UNKNOWN_ERROR';

  let message: string;
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message || error.name || 'Error';
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    message = (error as { message: string }).message;
  } else {
    message = String(error);
  }

  // Stage 1: Connection URIs (replaces entire URI including embedded credentials/queries)
  message = message.replace(CONNECTION_URI_REGEX, '[REDACTED_URI]');

  // Stage 2: Database and internal hostnames
  message = message.replace(SUPABASE_HOST_REGEX, '[REDACTED_HOST]');
  message = message.replace(INTERNAL_HOST_REGEX, '[REDACTED_HOST]');
  message = message.replace(CLUSTER_HOST_REGEX, '[REDACTED_HOST]');

  // Stage 3: JWT tokens (bare or Bearer)
  message = message.replace(JWT_TOKEN_REGEX, '[REDACTED_TOKEN]');

  // Stage 4: Key-value credentials and webhook secrets
  message = message.replace(SENSITIVE_KV_REGEX, '[REDACTED_SECRET]');
  message = message.replace(WHSEC_PREFIX_REGEX, '[REDACTED_SECRET]');

  // Stage 5: Length bounding
  if (message.length > MAX_ERROR_LENGTH) {
    message = message.slice(0, MAX_ERROR_LENGTH - 3) + '...';
  }

  return message;
}

/**
 * Creates an Error instance whose message is guaranteed to be sanitized.
 */
export function createSanitizedError(error: unknown, fallbackName = 'Error'): Error {
  const safeMessage = sanitizeDiagnosticError(error);
  const err = new Error(safeMessage);
  if (error instanceof Error && error.name) {
    err.name = error.name;
  } else {
    err.name = fallbackName;
  }
  return err;
}
