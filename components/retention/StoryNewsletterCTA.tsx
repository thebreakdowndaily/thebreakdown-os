'use client';

import { useState, useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

const DISMISS_KEY = 'tb_newsletter_cta_dismissed';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

type CtaState = 'idle' | 'loading' | 'error' | 'unavailable';

export interface StoryNewsletterCTAProps {
  headline?: string;
  subtext?: string;
  topic?: string;
}

export default function StoryNewsletterCTA({
  headline = 'Get the evidence behind the story',
  subtext = 'The Breakdown Brief — what changed, why it matters, and the documents behind it. Weekly. Free.',
}: StoryNewsletterCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<CtaState>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkDismissed = () => {
      try {
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
          const time = parseInt(dismissedAt, 10);
          if (!isNaN(time) && Date.now() - time < SEVEN_DAYS) {
            return;
          }
        }
        setIsVisible(true);
      } catch {
        setIsVisible(true); // default to visible if localStorage fails
      }
    };
    checkDismissed();
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    captureEvent('newsletter_started', { page: 'story_end_cta' });

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
        captureEvent('newsletter_submitted', { page: 'story_end_cta' });
        setSubmitted(true);
        setStatus('idle');
        return;
      }

      if (resultStatus === 'confirmed') {
        captureEvent('newsletter_subscribed', { page: 'story_end_cta' });
        setSubmitted(true);
        setStatus('idle');
        return;
      }

      if (resultStatus === 'unavailable') {
        captureEvent('newsletter_error', { page: 'story_end_cta' });
        setStatus('unavailable');
        return;
      }

      captureEvent('newsletter_error', { page: 'story_end_cta' });
      setStatus('error');
      setErrorMessage(data.message || 'Something went wrong.');
    } catch {
      captureEvent('newsletter_error', { page: 'story_end_cta' });
      setStatus('error');
      setErrorMessage('Failed to connect to the server.');
    }
  };

  if (!isVisible) return null;

  return (
    <section className="my-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800 relative shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
      <button
        onClick={handleDismiss}
        aria-label="Dismiss newsletter signup"
        className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-300 transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="max-w-xl">
        <h3 className="text-2xl font-bold text-white mb-2">
          {headline}
        </h3>
        <p className="text-neutral-400 mb-6">
          {subtext}
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium" role="status" aria-live="polite">
            Check your inbox to confirm your subscription.
          </div>
        ) : status === 'unavailable' ? (
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700 text-neutral-300 text-sm" role="status" aria-live="polite">
            The Breakdown Brief isn&apos;t accepting signups yet.
          </div>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="cta-email" className="sr-only">Email address</label>
              <input
                id="cta-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                disabled={status === 'loading'}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 shrink-0 disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-400" role="alert">{errorMessage}</p>
            )}
            <p className="text-xs text-neutral-500">Double opt-in required. Free. Unsubscribe anytime.</p>
          </form>
        )}
      </div>
    </section>
  );
}