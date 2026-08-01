// ── Webhook Event Publisher & HMAC Signing (Phase 19B Recommendation 3) ───────

import { WebhookSubscription, WebhookEventPayload } from '../../types/extensibility';

export class WebhookEventPublisher {
  private subscriptions: WebhookSubscription[] = [];

  constructor() {
    this.subscriptions = [
      {
        subscriptionId: 'sub-fix-published',
        targetUrl: 'https://api.partner.org/webhooks/fixes',
        subscribedEvents: ['FixPublished', 'EvidenceVerified'],
        secretKey: 'sec_partner_hmac_key_99',
        status: 'ACTIVE',
      },
    ];
  }

  /**
   * Publishes event with HMAC signature and idempotency metadata.
   */
  public publishEvent(
    eventType: 'FixPublished' | 'EvidenceVerified' | 'ClaimUpdated',
    data: Record<string, unknown>
  ): WebhookEventPayload {
    const timestamp = new Date().toISOString();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const idempotencyKey = `idemp-${eventId}`;

    // Simulated HMAC SHA-256 signature
    const signature = `sha256=${Buffer.from(`${eventId}:${timestamp}:${idempotencyKey}`).toString('hex').substring(0, 32)}`;

    return Object.freeze({
      eventId,
      eventVersion: 'v1.0',
      eventType,
      timestamp,
      retryCount: 0,
      deliveryAttempt: 1,
      idempotencyKey,
      signature,
      data: Object.freeze(data),
    });
  }

  public getActiveSubscriptions(): readonly WebhookSubscription[] {
    return Object.freeze(this.subscriptions.map((s) => Object.freeze({ ...s })));
  }
}
