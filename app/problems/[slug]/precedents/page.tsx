import React from 'react';
import { GlobalPrecedentProjectionBuilder } from '@/lib/precedent/precedent-projection';
import { ProblemExplorerService } from '@/lib/explorer/problem-explorer-service';
import GlobalPrecedentsPanel from '@/components/explorer/GlobalPrecedentsPanel';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ProblemPrecedentsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProblemPrecedentsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = ProblemExplorerService.getProblemBySlug(slug);

  if (!problem) {
    return { title: 'Problem Not Found | The Breakdown OS' };
  }

  return {
    title: `Global Precedents — ${problem.title} | The Breakdown OS`,
    description: `Examine global and historical policy precedents for ${problem.title}.`,
  };
}

export default async function ProblemPrecedentsPage({ params }: ProblemPrecedentsPageProps) {
  const { slug } = await params;
  const problem = ProblemExplorerService.getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const projection = GlobalPrecedentProjectionBuilder.buildProjection({ problemSlug: slug });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemPage',
            name: `Global Precedents for ${problem.title}`,
          }),
        }}
      />

      <GlobalPrecedentsPanel projection={projection} />
    </main>
  );
}
