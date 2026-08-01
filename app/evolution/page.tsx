import React from 'react';
import { EvidenceEvolutionProjectionBuilder } from '../../lib/evolution/evidence-projection';
import EvidenceEvolutionPanel from '../../components/explorer/EvidenceEvolutionPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evidence Evolution & Historical Snapshots | The Breakdown OS',
  description: 'Track claim revision history, confidence trajectories, and historical snapshot diffs over time.',
  openGraph: {
    title: 'Evidence Evolution & Historical Snapshots | The Breakdown OS',
    description: 'Track claim revision history, confidence trajectories, and historical snapshot diffs over time.',
    type: 'website',
  },
};

export default function EvolutionPage() {
  const projection = EvidenceEvolutionProjectionBuilder.buildProjection();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataFeed',
            name: 'The Breakdown Evidence Evolution Database',
            description: 'Historical knowledge snapshot diffs and claim revision trajectory database.',
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <EvidenceEvolutionPanel projection={projection} />
      </div>
    </main>
  );
}
