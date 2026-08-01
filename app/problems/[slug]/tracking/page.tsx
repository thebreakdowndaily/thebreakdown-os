import React from 'react';
import { OutcomeTrackingProjectionBuilder } from '@/lib/tracking/outcome-projection';
import { ProblemExplorerService } from '@/lib/explorer/problem-explorer-service';
import OutcomeTrackingPanel from '@/components/explorer/OutcomeTrackingPanel';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ProblemTrackingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProblemTrackingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = ProblemExplorerService.getProblemBySlug(slug);

  if (!problem) {
    return { title: 'Problem Not Found | The Breakdown OS' };
  }

  return {
    title: `Outcome Tracking — ${problem.title} | The Breakdown OS`,
    description: `Track longitudinal outcome metrics and revision markers for ${problem.title}.`,
  };
}

export default async function ProblemTrackingPage({ params }: ProblemTrackingPageProps) {
  const { slug } = await params;
  const problem = ProblemExplorerService.getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const projection = OutcomeTrackingProjectionBuilder.buildProjection({ problemSlug: slug });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemPage',
            name: `Outcome Tracking for ${problem.title}`,
          }),
        }}
      />

      <OutcomeTrackingPanel projection={projection} />
    </main>
  );
}
