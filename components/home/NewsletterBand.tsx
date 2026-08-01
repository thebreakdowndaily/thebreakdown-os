/**
 * NewsletterBand — Email Capture
 * Governance: docs/rxs/screens/homepage.md · RC-1
 *
 * Primary conversion surface on the homepage.
 * Note: form submission is currently a UI shell.
 *       Wire `handleSubmit` to an email backend (Beehiiv / Resend)
 *       to activate. See product_strategy_memo.md P0 item 1.
 *
 * 'use client' required for the form state.
 */

'use client';

import { useState } from 'react';

export default function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    try {
      // TODO: Replace with real email backend call.
      // Example: await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      // For now: simulate a 600ms response so the UI is exercisable.
      await new Promise((r) => setTimeout(r, 600));
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="py-16 lg:py-20"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">

        {/* Overline */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: '#C9A84C' }}>
            Newsletter
          </span>
          <div className="h-px w-12" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} aria-hidden="true" />
        </div>

        {/* Headline */}
        <h2
          id="newsletter-heading"
          className="text-2xl sm:text-3xl font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Evidence-first analysis,
          <br />
          delivered to your inbox.
        </h2>

        {/* Subtext */}
        <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
          New chapters, policy explainers, and primary source discoveries.
          No noise. No takes. Just understanding.
          <br />
          Free. Unsubscribe any time.
        </p>

        {/* Form */}
        {status === 'success' ? (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded border text-sm font-mono"
            style={{ backgroundColor: '#0F1A0F', borderColor: '#1A2E1A', color: '#4CAF50' }}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true">✓</span>
            You&apos;re subscribed. First chapter drops soon.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            aria-label="Newsletter subscription form"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* Error state */}
        {status === 'error' && (
          <p
            id="newsletter-error"
            className="text-xs font-mono"
            style={{ color: '#EF4444' }}
            role="alert"
            aria-live="assertive"
          >
            Something went wrong. Please try again or email us directly.
          </p>
        )}

        {/* Trust micro-copy */}
        <p className="text-[11px] font-mono" style={{ color: '#A1A1AA' }}>
          No spam. No marketing. Every email is a new chapter or an evidence summary.
        </p>
      </div>
    </section>
  );
}
