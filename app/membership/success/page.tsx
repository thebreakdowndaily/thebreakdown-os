'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { captureEvent } from '@/lib/analytics/capture';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const planId = searchParams?.get('planId') || 'unknown';
  const email = searchParams?.get('email') || 'unknown';

  useEffect(() => {
    setMounted(true);
    
    // Activate ad-free experience for non-free tiers
    if (planId === 'supporter' || planId === 'institutional') {
      localStorage.setItem('tb_supporter', 'true');
    }

    // Fire telemetry event
    captureEvent('membership_purchased', { plan_id: planId });
    
  }, [planId]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-24 px-4 flex flex-col items-center">
      <div className="max-w-md w-full bg-neutral-900 border border-emerald-900/50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        
        <p className="text-neutral-400 mb-6">
          Your membership (<span className="text-white font-medium">{planId}</span>) has been activated for <span className="text-white">{email}</span>.
        </p>

        {planId !== 'free' && (
          <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-4 mb-8 text-sm text-emerald-200">
            Your ad-free experience and premium features are now active.
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <Link href="/" className="w-full py-3 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
