import React from 'react';
import { RouteBudgetEngine } from '@/lib/performance/route-budget-engine';
import PerformanceControlPanel from '@/components/performance/PerformanceControlPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operational Telemetry & Performance Dashboard | The Breakdown OS',
  description: 'Internal operational telemetry monitoring projection build latency, LRU cache efficiency, and memory profiles.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PerformancePage() {
  const report = RouteBudgetEngine.generateAuditReport();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Internal Telemetry Metadata JSON-LD (Refinement 7) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Operational Performance Dashboard',
            description: 'Internal operational dashboard for The Breakdown OS performance infrastructure.',
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <PerformanceControlPanel report={report} />
      </div>
    </main>
  );
}
