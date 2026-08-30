'use client';

import { useState, useRef } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

/**
 * SubscribeForm — The Breakdown Brief conversion funnel (measurement layer).
 *
 * Funnel stages (honest delivery states only):
 *   newsletter_viewed   — page impression (mounted on /subscribe)
 *   newsletter_started  — first form interaction (focus / input / submit)
 *   newsletter_submitted — provider ACCEPTED the address (double opt-in pending)
 *   newsletter_subscribed — provider CONFIRMED (double opt-in complete) — only
 *                           ever fired when the API reports `confirmed`.
 *
 * `newsletter_subscribed` is NEVER fired for a form submission alone. A stub
 * or unavailable provider reports `unavailable` and the reader sees a clear
 * "not accepting signups yet" state — not a fake success.
 */
type SubmitStatus = 'idle' | 'loading' | 'error' | 'unavailable';

export function SubscribeForm() {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [success, setSuccess] = useState<null | { confirmed: boolean; message: string }>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const startedRef = useRef(false);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    captureEvent('newsletter_started', { page: 'subscribe' });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    markStarted();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

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
        captureEvent('newsletter_submitted', { page: 'subscribe' });
        setStatus('idle');
        setSuccess({ confirmed: false, message: data.message || 'Check your inbox to confirm your subscription.' });
        return;
      }

      if (resultStatus === 'confirmed') {
        // Double opt-in confirmed by the provider — the only legitimate
        // path for `newsletter_subscribed`.
        captureEvent('newsletter_subscribed', { page: 'subscribe' });
        setStatus('idle');
        setSuccess({ confirmed: true, message: data.message || "You're subscribed." });
        return;
      }

      if (resultStatus === 'unavailable') {
        captureEvent('newsletter_error', { page: 'subscribe' });
        setStatus('unavailable');
        return;
      }

      captureEvent('newsletter_error', { page: 'subscribe' });
      setStatus('error');
      setErrorMessage(data.message || 'Something went wrong.');
    } catch {
      captureEvent('newsletter_error', { page: 'subscribe' });
      setStatus('error');
      setErrorMessage('Failed to connect to the server.');
    }
  };

  if (success) {
    return (
      <div
        className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
        role="status"
        aria-live="polite"
      >
        {success.message}
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div
        className="p-4 rounded-lg bg-neutral-800/60 border border-neutral-700 text-neutral-300 text-sm"
        role="status"
        aria-live="polite"
      >
        <p className="font-medium mb-1">The Breakdown Brief isn&apos;t accepting signups yet.</p>
        <p className="text-neutral-400">We&apos;re wiring up delivery. Your email will not be stored or used until we do.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { void handleSubmit(e); }} onFocus={markStarted} aria-describedby={status === 'error' ? 'newsletter-error-note' : undefined}>
      <div className="text-left">
        <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          disabled={status === 'loading'}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-amber-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
      </button>
      <p className="text-xs text-gray-500 mt-4">No spam. Unsubscribe anytime. Double opt-in: we&apos;ll email you to confirm.</p>
      {status === 'error' && (
        <p id="newsletter-error-note" className="text-xs text-amber-400" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}