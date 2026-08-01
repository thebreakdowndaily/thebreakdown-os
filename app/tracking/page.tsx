import React from 'react';
import { OutcomeTrackingProjectionBuilder } from '../../lib/tracking/outcome-projection';
import OutcomeTrackingPanel from '../../components/explorer/OutcomeTrackingPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Outcome Tracking & Implementation Metrics | The Breakdown OS',
  description: 'Observe baseline vs current policy implementation metrics over time with explicit evidence provenance and revision markers.',
  openGraph: {
    title: 'Outcome Tracking & Implementation Metrics | The Breakdown OS',
    description: 'Observe baseline vs current policy implementation metrics over time with explicit evidence provenance and revision markers.',
    type: 'website',
  },
};

export default function TrackingPage() {
  const projection = OutcomeTrackingProjectionBuilder.buildProjection();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataFeed',
            name: 'The Breakdown Outcome Tracking Metrics',
            description: 'Longitudinal policy implementation metrics and revision history database.',
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <OutcomeTrackingPanel projection={projection} />
      </div>
    </main>
  );
}
