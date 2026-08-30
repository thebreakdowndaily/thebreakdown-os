/**
 * NewsletterBand — The Breakdown Brief email capture.
 * Governance: docs/rxs/screens/homepage.md · RC-1 · TASK-24 (Newsletter Product)
 *
 * Conversion surface on the homepage. Honest delivery states:
 *   - `submitted`   : provider accepted the address (double opt-in pending)
 *   - `unavailable` : no delivery provider configured — nothing is stored, no
 *                     fake success, no `newsletter_subscribed` event.
 *   - `error`       : provider or network failure.
 *
 * 'use client' required for the form state.
 */

'use client';

import { useState } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

type BandState = 'idle' | 'loading' | 'error' | 'unavailable';

export default function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<BandState>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    captureEvent('newsletter_started', { page: 'homepage' });
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload: unknown = await res.json();
      const data = payload as { status?: string; message?: string };
      const resultStatus = data.status || 'error';

      if (resultStatus === 'submitted') {
        captureEvent('newsletter_submitted', { page: 'homepage' });
        setEmail('');
        setSubmitted(true);
        setStatus('idle');
        return;
      }

      if (resultStatus === 'confirmed') {
        captureEvent('newsletter_subscribed', { page: 'homepage' });
        setEmail('');
        setSubmitted(true);
        setStatus('idle');
        return;
      }

      if (resultStatus === 'unavailable') {
        captureEvent('newsletter_error', { page: 'homepage' });
        setStatus('unavailable');
        return;
      }

      captureEvent('newsletter_error', { page: 'homepage' });
      setStatus('error');
      setErrorMessage(data.message || 'Something went wrong.');
    } catch {
      captureEvent('newsletter_error', { page: 'homepage' });
      setStatus('error');
      setErrorMessage('Failed to connect to the server.');
    }
  }

  return (
    <section aria-labelledby="newsletter-heading" className="py-16 lg:py-20" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: '#C9A84C' }}>
            The Breakdown Brief
          </span>
          <div className="h-px w-12" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} aria-hidden="true" />
        </div>

        <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          What changed, why it matters,
          <br />
          and the evidence behind it.
        </h2>

        <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
          One email a week: the story that matters, the documents behind it,
          and the questions we&apos;re still asking.
          <br />
          No noise. No takes. Just understanding.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded border text-sm font-mono" style={{ backgroundColor: '#0F1A0F', borderColor: '#1A2E1A', color: '#4CAF50' }} role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            Check your inbox to confirm your subscription.
          </div>
        ) : status === 'unavailable' ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded border text-sm font-mono" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', color: '#A1A1AA' }} role="status" aria-live="polite">
            The Breakdown Brief isn&apos;t accepting signups yet.
          </div>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" aria-label="Newsletter subscription form">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              placeholder="your@email.com"
              required
              autoComplete="email"
              disabled={status === 'loading'}
              className="flex-1 px-4 py-3 rounded text-sm text-white placeholder-[#555] border border-[#2A2A2A] bg-[#111] focus:outline-none focus:border-[#C9A84C] transition-colors duration-150"
              aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="px-7 py-3 rounded text-sm font-semibold tracking-wide transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
              id="newsletter-subscribe-btn"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe Free'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p id="newsletter-error" className="text-xs font-mono" style={{ color: '#EF4444' }} role="alert" aria-live="assertive">
            {errorMessage || 'Something went wrong. Please try again later.'}
          </p>
        )}

        <p className="text-[11px] font-mono" style={{ color: '#A1A1AA' }}>
          Double opt-in required. One confirmation email, then the Brief. Free. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}