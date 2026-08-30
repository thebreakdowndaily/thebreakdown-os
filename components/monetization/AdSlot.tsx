'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { captureEvent } from '@/lib/analytics/capture';

type AdPlacement = 'leaderboard' | 'mpu' | 'halfpage';

interface AdSlotProps {
  placement: AdPlacement;
  storySlug?: string;
}

export function AdSlot({ placement, storySlug }: AdSlotProps) {
  const [isSupporter, setIsSupporter] = useState<boolean>(true); // default true to avoid hydration mismatch
  const initialized = useRef(false);

  useEffect(() => {
    const supporterStatus = localStorage.getItem('tb_supporter') === 'true';
    setIsSupporter(supporterStatus);
  }, []);

  useEffect(() => {
    if (!isSupporter && !initialized.current) {
      initialized.current = true;
      captureEvent('ad_slot_rendered', { placement });
      
      if (process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error('AdSense error', e);
        }
      }
    }
  }, [isSupporter, placement]);

  if (isSupporter) {
    return null;
  }

  const dimensions = {
    leaderboard: { width: 728, height: 90 },
    mpu: { width: 300, height: 250 },
    halfpage: { width: 300, height: 600 }
  };

  const { width, height } = dimensions[placement];
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (clientId) {
    return (
      <div className="mx-auto my-4 overflow-hidden flex justify-center" style={{ width: '100%', maxWidth: width, height, minHeight: height }} data-testid={`ad-slot-${placement}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={clientId}
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <Script
          id={`adsense-${placement}`}
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        captureEvent('ad_clicked', { placement });
        window.open('https://thebreakdown.in/membership', '_blank');
      }}
      className="flex items-center justify-center border border-dashed border-neutral-800 bg-emerald-900/10 hover:bg-emerald-900/20 cursor-pointer text-neutral-500 text-sm mx-auto my-4 transition-colors"
      style={{ width: '100%', maxWidth: width, height }}
      data-testid={`ad-slot-${placement}`}
    >
      Sponsor Ad Slot - {placement} {storySlug ? `(${storySlug})` : ''}
    </div>
  );
}
