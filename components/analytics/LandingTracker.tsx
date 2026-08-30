'use client';

import { useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';
import { classifyReferrer, classifyDiscoveryChannel } from '@/lib/analytics/channels';

const LANDING_KEY = 'tbd_landing_captured';

/**
 * LandingTracker — UTM-aware landing visit measurement.
 *
 * Fires one `landing` event per browser session on first page load.
 * UTM parameters are read explicitly from the URL; the full query string is
 * never forwarded. Without UTM, the channel is derived from document.referrer.
 */
export function LandingTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(LANDING_KEY)) return;
      sessionStorage.setItem(LANDING_KEY, '1');
    } catch {
      // storage unavailable — continue with a single in-tab capture
    }

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';
    const utmContent = params.get('utm_content') || '';
    const referrerType = classifyReferrer(document.referrer || '');
    const channel = classifyDiscoveryChannel(utmSource, document.referrer || '');

    captureEvent('landing', {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      distribution_channel: channel,
      referrer_type: referrerType,
      landing_page: window.location.pathname,
    });
  }, []);

  return null;
}