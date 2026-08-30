'use client';

import { useEffect, useRef } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

interface PaywallOverlayProps {
  placement: string;
  storySlug: string;
}

export function PaywallOverlay({ placement, storySlug }: PaywallOverlayProps) {
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      captureEvent('paywall_viewed', { placement, story_slug: storySlug });
    }
  }, [placement, storySlug]);

  const handleSubscribe = () => {
    captureEvent('paywall_action_clicked', { placement, action_type: 'subscribe_click' });
    window.location.href = '/membership';
  };

  const handleStandardMode = () => {
    captureEvent('paywall_action_clicked', { placement, action_type: 'back_to_standard' });
    window.location.href = `/story/${storySlug}?mode=standard`;
  };

  return (
    <div className="relative mt-4 w-full p-8 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 text-center shadow-2xl flex flex-col items-center gap-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">Complete Research Appendix is Locked</h3>
        <p className="text-neutral-400">Supporter Exclusive Content</p>
      </div>

      <div className="text-sm text-neutral-300 bg-neutral-950/50 p-4 rounded-xl border border-neutral-800 w-full max-w-md text-left">
        <p className="font-bold text-emerald-400 mb-2">Unlock Premium Benefits:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Full academic citations</li>
          <li>Raw dataset exports</li>
          <li>Interactive mapping utilities</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <button
          onClick={handleSubscribe}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg"
        >
          Unlock with Supporting Reader (₹499/mo)
        </button>
        <button
          onClick={handleStandardMode}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg transition-colors"
        >
          Return to Standard Mode
        </button>
      </div>
    </div>
  );
}
