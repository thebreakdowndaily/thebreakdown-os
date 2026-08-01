import React from 'react';
import { EvidenceEvolutionProjectionBuilder } from '@/lib/evolution/evidence-projection';
import { ProblemExplorerService } from '@/lib/explorer/problem-explorer-service';
import EvidenceEvolutionPanel from '@/components/explorer/EvidenceEvolutionPanel';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ProblemEvolutionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProblemEvolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = ProblemExplorerService.getProblemBySlug(slug);

  if (!problem) {
    return { title: 'Problem Not Found | The Breakdown OS' };
  }

  return {
    title: `Evidence Evolution — ${problem.title} | The Breakdown OS`,
    description: `Track claim revision history and confidence trajectories for ${problem.title}.`,
  };
}

export default async function ProblemEvolutionPage({ params }: ProblemEvolutionPageProps) {
  const { slug } = await params;
  const problem = ProblemExplorerService.getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const projection = EvidenceEvolutionProjectionBuilder.buildProjection({ problemSlug: slug });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemPage',
            name: `Evidence Evolution for ${problem.title}`,
          }),
        }}
      />

      <EvidenceEvolutionPanel projection={projection} />
    </main>
  );
}
