'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

function GATrackerContent({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', gaId, { page_path: url });
    }
  }, [pathname, searchParams, gaId]);

  return null;
}

export function GATracker({ gaId }: { gaId: string }) {
  return (
    <Suspense fallback={null}>
      <GATrackerContent gaId={gaId} />
    </Suspense>
  );
}
