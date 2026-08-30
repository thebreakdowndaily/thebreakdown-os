'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MembershipPage() {
  const [email, setEmail] = useState('');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (planId: string) => {
    if (!email) {
      setError('Please enter your email address to proceed.');
      return;
    }
    
    setError(null);
    setLoadingPlan(planId);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      if (data.success && data.checkoutUrl) {
        router.push(data.checkoutUrl);
      }
    } catch (err: any) {
      setError(err.message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Support The Breakdown</h1>
          <p className="text-neutral-400 text-lg">Choose a plan to support evidence-first knowledge.</p>
        </header>

        <div className="mb-10 max-w-md mx-auto">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Your Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="reader@example.com"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            required
          />
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="border border-neutral-800 rounded-2xl p-8 bg-neutral-900/50 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">Free Supporter</h3>
            <p className="text-3xl font-bold mb-6">₹0<span className="text-sm font-normal text-neutral-400">/month</span></p>
            <ul className="text-neutral-400 text-sm space-y-3 mb-8 flex-grow">
              <li>✓ Access to core articles</li>
              <li>✓ Ad-supported experience</li>
              <li>✓ Weekly newsletter</li>
            </ul>
            <button
              onClick={() => handleCheckout('free')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-lg font-medium border border-neutral-700 hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {loadingPlan === 'free' ? 'Processing...' : 'Continue Free'}
            </button>
          </div>

          {/* Supporting Reader */}
          <div className="border border-emerald-900 rounded-2xl p-8 bg-emerald-950/20 flex flex-col relative">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-semibold mb-2">Supporting Reader</h3>
            <p className="text-3xl font-bold mb-6">₹499<span className="text-sm font-normal text-neutral-400">/month</span></p>
            <ul className="text-neutral-400 text-sm space-y-3 mb-8 flex-grow">
              <li>✓ Ad-free experience</li>
              <li>✓ Primary source highlights</li>
              <li>✓ PDF downloads</li>
            </ul>
            <button
              onClick={() => handleCheckout('supporter')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {loadingPlan === 'supporter' ? 'Processing...' : 'Subscribe'}
            </button>
          </div>

          {/* Institutional Supporter */}
          <div className="border border-neutral-800 rounded-2xl p-8 bg-neutral-900/50 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">Institutional</h3>
            <p className="text-3xl font-bold mb-6">₹4,999<span className="text-sm font-normal text-neutral-400">/month</span></p>
            <ul className="text-neutral-400 text-sm space-y-3 mb-8 flex-grow">
              <li>✓ 5 User licenses</li>
              <li>✓ CSV data exports</li>
              <li>✓ Citation manager access</li>
            </ul>
            <button
              onClick={() => handleCheckout('institutional')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-lg font-medium border border-neutral-700 hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {loadingPlan === 'institutional' ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
