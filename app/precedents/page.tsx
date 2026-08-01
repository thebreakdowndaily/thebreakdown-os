import React from 'react';
import { GlobalPrecedentProjectionBuilder } from '@/lib/precedent/precedent-projection';
import GlobalPrecedentsPanel from '@/components/explorer/GlobalPrecedentsPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Implementation Precedents | The Breakdown OS',
  description: 'Examine international, historical, and regional policy implementations with contextual applicability constraints.',
  openGraph: {
    title: 'Global Implementation Precedents | The Breakdown OS',
    description: 'Examine international, historical, and regional policy implementations with contextual applicability constraints.',
    type: 'website',
  },
};

export default function PrecedentsPage() {
  const projection = GlobalPrecedentProjectionBuilder.buildProjection();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'The Breakdown Global Implementation Precedents',
            description: 'Contextual precedent database for international policy implementations.',
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <GlobalPrecedentsPanel projection={projection} />
      </div>
    </main>
  );
}
