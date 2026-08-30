/**
 * Newsletter delivery provider contract.
 *
 * TASK-24 — The Breakdown Brief. Governed by:
 *   - TASK-09 §11 policy: `newsletter_subscribed` MUST NOT fire until a
 *     delivery provider confirms a double opt-in subscription.
 *   - TASK-24 directives: never fabricate a successful subscription; a
 *     provider that cannot confirm is reported as `unavailable`, not success.
 *
 * A provider never returns `confirmed` unless the delivery provider itself
 * confirms the subscription (double opt-in). `submitted` means the provider
 * accepted the address for a confirmation email. `unavailable` means no
 * delivery provider is configured or reachable — nothing was delivered.
 */

export type NewsletterSubscribeResult =
  | { status: 'submitted'; message: string }
  | { status: 'confirmed'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

export interface NewsletterProvider {
  /** Subscribe an email. Returns the honest delivery state — never a claimed confirmation. */
  subscribe(email: string): Promise<NewsletterSubscribeResult>;
}

/** True when a real delivery provider is configured via environment secrets. */
export function isProviderConfigured(): boolean {
  return Boolean(process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUB_ID);
}

/**
 * Stub provider — used only when no delivery provider is configured.
 * It NEVER reports success. This is intentional: a stub cannot deliver a
 * confirmation email, so every UI surface must treat it as `unavailable`.
 */
export class StubProvider implements NewsletterProvider {
  subscribe(email: string): Promise<NewsletterSubscribeResult> {
    void email; // explicitly not stored, not logged, not delivered
    return Promise.resolve({
      status: 'unavailable',
      message: 'The Breakdown Brief is not accepting signups yet.',
    });
  }
}

/**
 * Beehiiv provider — real double opt-in subscription creation.
 * A 2xx response means the provider accepted the address for its
 * confirmation email (submitted), not that the subscriber is confirmed.
 */
export class BeehiivProvider implements NewsletterProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async subscribe(email: string): Promise<NewsletterSubscribeResult> {
    const pubId = process.env.BEEHIIV_PUB_ID;
    if (!pubId) {
      return {
        status: 'unavailable',
        message: 'The Breakdown Brief is not accepting signups yet.',
      };
    }

    try {
      const response = await fetch(
        `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            email,
            reactivate_existing: false,
            send_welcome_email: true,
            utm_source: 'thebreakdown',
            utm_medium: 'organic',
            utm_campaign: 'website_subscribe',
          }),
        }
      );

      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        console.error('Beehiiv API Error:', response.status, errorData);
        return {
          status: 'error',
          message: 'We could not complete your signup right now. Please try again later.',
        };
      }

      // 2xx = Beehiiv accepted the address and will send the confirmation email.
      return {
        status: 'submitted',
        message: 'Check your inbox to confirm your subscription.',
      };
    } catch (error) {
      console.error('Beehiiv fetch error:', error);
      return {
        status: 'error',
        message: 'We could not complete your signup right now. Please try again later.',
      };
    }
  }
}

/** Resolve the active provider from environment secrets. Never fabricates success. */
export function getNewsletterProvider(): NewsletterProvider {
  const beehiivKey = process.env.BEEHIIV_API_KEY;
  if (beehiivKey) {
    return new BeehiivProvider(beehiivKey);
  }
  return new StubProvider();
}