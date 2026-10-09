/**
 * ─── Webhook Notification Transport ──────────────────────────────────────────
 *
 * Governing Document: .planning/PHASE-4B-1-OUTBOUND-NOTIFICATION-DISPATCH.md
 * Operating Doctrine: AGENTS.md (Operational Observability & Durability)
 *
 * Generic, authenticated, HMAC-SHA256 signed HTTP webhook transport.
 * Enforces strict SSRF defense, bounded retry with exponential backoff,
 * safe dry-run execution, and zero credential leakage.
 */

import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import type {
  NotificationTransport,
  AlertCandidate,
  NotificationDeliveryResult,
  WebhookTransportConfig,
} from '../types';
import { isSafeExternalUrl } from '@/services/radar/collectors/security';

export class WebhookTransport implements NotificationTransport {
  public readonly name = 'webhook';
  private config: Required<Omit<WebhookTransportConfig, 'fetchFn'>> & { fetchFn?: typeof fetch };

  public get destination(): string {
    return this.config.webhookUrl || 'unconfigured';
  }

  constructor(config?: WebhookTransportConfig) {
    this.config = {
      webhookUrl: config?.webhookUrl || process.env.RADAR_ALERT_WEBHOOK_URL || '',
      signingSecret: config?.signingSecret || process.env.RADAR_ALERT_WEBHOOK_SECRET || '',
      enabled: config?.enabled ?? (process.env.RADAR_ALERT_NOTIFICATIONS_ENABLED === 'true'),
      dryRun: config?.dryRun ?? (process.env.RADAR_ALERT_DRY_RUN !== 'false'), // Defaults to dry-run true for safety
      maxRetries: config?.maxRetries ?? 3,
      initialBackoffMs: config?.initialBackoffMs ?? 100,
      maxBackoffMs: config?.maxBackoffMs ?? 1000,
      timeoutMs: config?.timeoutMs ?? 5000,
      fetchFn: config?.fetchFn,
    };
  }

  /**
   * Dispatches an alert candidate to the configured webhook endpoint.
   */
  public async dispatch(candidate: AlertCandidate): Promise<NotificationDeliveryResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const deliveryId = `del-${randomUUID().substring(0, 18)}`;

    // 1. Check if notifications are globally enabled
    if (!this.config.enabled) {
      return {
        success: false,
        destination: this.config.webhookUrl || 'unconfigured',
        deliveryId,
        error: 'Outbound notifications disabled by configuration',
        durationMs: Date.now() - startTime,
        retryCount: 0,
        dryRun: false,
        timestamp,
      };
    }

    // 2. Validate URL presence
    if (!this.config.webhookUrl) {
      return {
        success: false,
        destination: 'unconfigured',
        deliveryId,
        error: 'Missing destination webhook URL',
        durationMs: Date.now() - startTime,
        retryCount: 0,
        dryRun: false,
        timestamp,
      };
    }

    // 3. Strict SSRF Defense Validation
    const ssrfCheck = isSafeExternalUrl(this.config.webhookUrl);
    if (!ssrfCheck.safe) {
      return {
        success: false,
        destination: this.config.webhookUrl,
        deliveryId,
        error: `SSRF rejected destination URL: ${ssrfCheck.reason}`,
        durationMs: Date.now() - startTime,
        retryCount: 0,
        dryRun: false,
        timestamp,
      };
    }

    // 4. Construct sanitized payload
    const payloadString = JSON.stringify({
      version: '1.0',
      deliveryId,
      timestamp,
      event: candidate.eventType,
      alert: {
        id: candidate.alertId,
        severity: candidate.severity,
        currentState: candidate.currentState,
        sourceId: candidate.sourceId,
        sourceName: candidate.sourceName,
        failureClass: candidate.failureClass,
        detectedAt: candidate.detectedAt,
        message: candidate.message,
        recommendedAction: candidate.recommendedAction,
        metrics: candidate.metrics,
      },
    });

    // 5. Handle Dry-Run Mode (Simulation only, zero external network traffic)
    if (this.config.dryRun) {
      return {
        success: true,
        destination: this.config.webhookUrl,
        deliveryId,
        durationMs: Date.now() - startTime,
        retryCount: 0,
        dryRun: true,
        timestamp,
      };
    }

    // 6. Sign payload with HMAC-SHA256
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'TheBreakdown-NewsroomAlert/1.0',
      'X-Breakdown-Event': candidate.eventType,
      'X-Breakdown-Delivery': deliveryId,
      'X-Breakdown-Timestamp': String(unixTimestamp),
    };

    if (this.config.signingSecret) {
      const signature = signWebhookPayload(payloadString, this.config.signingSecret, unixTimestamp);
      headers['X-Breakdown-Signature'] = `t=${unixTimestamp},v1=${signature}`;
    }

    // 7. Bounded Retry with Exponential Backoff
    let attempt = 0;
    let lastError: Error | null = null;
    let lastStatusCode: number | undefined;
    const fetchToUse = this.config.fetchFn || globalThis.fetch;
    const maxAttempts = Math.max(1, this.config.maxRetries);

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const res = await fetchToUse(this.config.webhookUrl, {
          method: 'POST',
          headers,
          body: payloadString,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        lastStatusCode = res.status;

        if (res.ok) {
          return {
            success: true,
            destination: this.config.webhookUrl,
            statusCode: res.status,
            deliveryId,
            durationMs: Date.now() - startTime,
            retryCount: attempt - 1,
            dryRun: false,
            timestamp,
          };
        }

        // Terminal non-retryable client errors (400, 401, 403, 404)
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          return {
            success: false,
            destination: this.config.webhookUrl,
            statusCode: res.status,
            deliveryId,
            error: `Terminal client error HTTP ${res.status}`,
            durationMs: Date.now() - startTime,
            retryCount: attempt - 1,
            dryRun: false,
            timestamp,
          };
        }

        // Retryable server error (5xx or 429 rate limit)
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }

      // If more attempts remain, apply bounded exponential backoff with jitter
      if (attempt < this.config.maxRetries) {
        const baseDelay = Math.min(
          this.config.initialBackoffMs * Math.pow(2, attempt - 1),
          this.config.maxBackoffMs
        );
        const jitter = Math.floor(Math.random() * 20);
        await new Promise((r) => setTimeout(r, baseDelay + jitter));
      }
    }

    return {
      success: false,
      destination: this.config.webhookUrl,
      statusCode: lastStatusCode,
      deliveryId,
      error: `Retry exhaustion after ${attempt} attempts: ${lastError?.message || 'Unknown network failure'}`,
      durationMs: Date.now() - startTime,
      retryCount: attempt - 1,
      dryRun: false,
      timestamp,
    };
  }
}

/**
 * Signs a webhook payload using HMAC-SHA256 and unix epoch timestamp.
 */
export function signWebhookPayload(payload: string, secret: string, timestamp: number): string {
  const signaturePayload = `${timestamp}.${payload}`;
  return createHmac('sha256', secret).update(signaturePayload).digest('hex');
}

/**
 * Validates an incoming webhook signature against timestamp tolerance and HMAC secret.
 * Uses constant-time comparison to prevent timing side-channel attacks.
 */
export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds: number = 300,
  nowTimestamp?: number
): { valid: boolean; reason?: string } {
  if (!signatureHeader || !secret) {
    return { valid: false, reason: 'Missing signature header or signing secret' };
  }

  const parts = signatureHeader.split(',');
  let tStr: string | undefined;
  let v1Str: string | undefined;

  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k?.trim() === 't') tStr = v?.trim();
    if (k?.trim() === 'v1') v1Str = v?.trim();
  }

  if (!tStr || !v1Str) {
    return { valid: false, reason: 'Malformed signature header format (expected t=...,v1=...)' };
  }

  const timestamp = parseInt(tStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: 'Invalid non-numeric timestamp in signature header' };
  }

  const now = nowTimestamp ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { valid: false, reason: `Timestamp outside tolerance window (${toleranceSeconds}s)` };
  }

  const expectedSignature = signWebhookPayload(payload, secret, timestamp);
  try {
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const actualBuf = Buffer.from(v1Str, 'hex');

    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      return { valid: false, reason: 'Cryptographic signature mismatch' };
    }
  } catch {
    return { valid: false, reason: 'Cryptographic comparison failure' };
  }

  return { valid: true };
}
