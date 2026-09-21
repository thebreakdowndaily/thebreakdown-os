'use client';

/**
 * NewsletterBand — The Breakdown Brief Subscription
 * Governance: docs/rxs/screens/homepage.md · TASK-24 (Newsletter Product)
 *
 * Earth-inspired design: warm reading environment.
 * The newsletter section is intimate — it should feel personal and warm,
 * not like a conversion form. Left editorial copy, right form.
 *
 * Delivery states (unchanged):
 *   - submitted   : provider accepted (double opt-in pending)
 *   - unavailable : no provider — no fake success
 *   - error       : provider/network failure
 *
 * 'use client' required for form state.
 */

import { useState } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

type BandState = 'idle' | 'loading' | 'error' | 'unavailable';

export default function NewsletterBand() {
  const [email,        setEmail]        = useState('');
  const [status,       setStatus]       = useState<BandState>('idle');
  const [submitted,    setSubmitted]    = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    captureEvent('newsletter_started', { page: 'homepage' });
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const payload: unknown = await res.json();
      const data = payload as { status?: string; message?: string };
      const resultStatus = data.status || 'error';

      if (resultStatus === 'submitted' || resultStatus === 'confirmed') {
        captureEvent(
          resultStatus === 'confirmed' ? 'newsletter_subscribed' : 'newsletter_submitted',
          { page: 'homepage' }
        );
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
    <section
      aria-labelledby="newsletter-heading"
      className="py-14 lg:py-20"
      style={{
        backgroundColor: 'var(--color-bg-reading)',
        borderBottom:    '1px solid var(--color-border-reading)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 lg:gap-20 items-center">

          {/* ── Left: editorial copy ── */}
          <div className="space-y-4">
            {/* Label */}
            <div className="flex items-center gap-4">
              <div
                className="h-px w-10 shrink-0"
                style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.5 }}
                aria-hidden="true"
              />
              <span
                className="text-[11px] font-mono uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-earth-ochre)' }}
              >
                The Breakdown Brief
              </span>
            </div>

            {/* Heading */}
            <h2
              id="newsletter-heading"
              className="text-2xl sm:text-3xl font-bold leading-snug"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                color:      'var(--color-text-reading)',
                maxWidth:   '28ch',
              }}
            >
              What changed, why it matters,
              <br />
              and the evidence behind it.
            </h2>

            {/* Body */}
            <p
              className="text-sm leading-relaxed"
              style={{
                color:      'var(--color-text-reading-dim)',
                fontFamily: 'var(--font-reading), Georgia, serif',
                maxWidth:   '42ch',
              }}
            >
              One email a week: the story that matters, the documents behind it,
              and the questions we're still asking.
              No noise. No takes. Just understanding.
            </p>

            {/* Social proof / commitment */}
            <p
              className="text-xs font-mono"
              style={{ color: 'var(--color-earth-dust)' }}
            >
              Double opt-in · Free · Unsubscribe anytime
            </p>
          </div>

          {/* ── Right: form or status ── */}
          <div>
            {submitted ? (
              <div
                className="flex items-center gap-3 px-5 py-4 rounded text-sm font-mono"
                style={{
                  backgroundColor: 'var(--color-evidence-verified)',
                  border:          '1px solid var(--color-evidence-verified-border)',
                  color:           'var(--color-evidence-verified-text)',
                }}
                role="status"
                aria-live="polite"
              >
                <span aria-hidden="true">✓</span>
                Check your inbox to confirm your subscription.
              </div>
            ) : status === 'unavailable' ? (
              <div
                className="px-5 py-4 rounded text-sm font-mono"
                style={{
                  backgroundColor: 'var(--color-bg-research-card)',
                  border:          '1px solid var(--color-border-research)',
                  color:           'var(--color-text-muted)',
                }}
                role="status"
                aria-live="polite"
              >
                The Breakdown Brief isn't accepting signups yet. Check back soon.
              </div>
            ) : (
              <div className="space-y-3">
                <form
                  onSubmit={(e) => { void handleSubmit(e); }}
                  className="flex flex-col sm:flex-row gap-3"
                  aria-label="Newsletter subscription form"
                >
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
                    className="flex-1 px-4 py-3 rounded text-sm transition-colors duration-150"
                    style={{
                      backgroundColor: 'var(--color-bg-reading-card)',
                      border:          '1px solid var(--color-border-reading)',
                      color:           'var(--color-text-reading)',
                      outline:         'none',
                    }}
                    aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-earth-ochre)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border-reading)';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="px-7 py-3 rounded text-sm font-semibold tracking-wide transition-colors duration-150 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-earth-ochre)',
                      color:           'var(--color-text-inverse)',
                    }}
                    id="newsletter-subscribe-btn"
                  >
                    {status === 'loading' ? 'Subscribing…' : 'Subscribe Free'}
                  </button>
                </form>

                {status === 'error' && (
                  <p
                    id="newsletter-error"
                    className="text-xs font-mono"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                    aria-live="assertive"
                  >
                    {errorMessage || 'Something went wrong. Please try again later.'}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}