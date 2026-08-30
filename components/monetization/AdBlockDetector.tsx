'use client';

import { useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

export function AdBlockDetector() {
  useEffect(() => {
    if (sessionStorage.getItem('tb_adblock_fired') === 'true') {
      return;
    }

    const checkAdBlock = async () => {
      let isBlocked = false;
      
      const adElement = document.createElement('div');
      adElement.className = 'pub_300x250';
      adElement.style.position = 'absolute';
      adElement.style.left = '-9999px';
      document.body.appendChild(adElement);
      
      if (adElement.offsetHeight === 0) {
        isBlocked = true;
      }
      
      document.body.removeChild(adElement);

      if (!isBlocked) {
        try {
          await fetch('/api/ads/mock-ad.js', { method: 'HEAD', mode: 'no-cors' });
        } catch (e) {
          isBlocked = true;
        }
      }

      if (isBlocked) {
        captureEvent('ad_blocker_detected', { active: 1 });
        sessionStorage.setItem('tb_adblock_fired', 'true');
      }
    };

    // Small delay to allow ad blockers to run their cosmetic filters
    const timer = setTimeout(checkAdBlock, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
