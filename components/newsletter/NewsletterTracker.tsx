'use client';

import { useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

/**
 * NewsletterTracker — measures the /newsletter landing page as a conversion
 * surface. `newsletter_viewed` fires once per page view for the financing/
 * updates page, and `newsletter_started` when the reader clicks the primary
 * CTA toward the subscribe form.
 */
export function NewsletterTracker() {
  useEffect(() => {
    captureEvent('newsletter_viewed', { page: 'newsletter' });

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const anchor = target.closest('a[data-track-newsletter-cta]');
      if (!anchor) return;
      captureEvent('newsletter_started', { page: 'newsletter' });
    };

    document.addEventListener('click', onDocumentClick);
    return () => {
      document.removeEventListener('click', onDocumentClick);
    };
  }, []);

  return null;
}