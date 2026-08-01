import React from 'react';
import { extractProblems } from '@/lib/problem-helpers';
import ProblemExplorerPanel from '@/components/problems/ProblemExplorerPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Problem Intelligence Explorer | The Breakdown OS',
  description: 'Explore public policy and historical challenges mapped to root causes, evidence spines, policies, and solution fixes.',
  openGraph: {
    title: 'Problem Intelligence Explorer | The Breakdown OS',
    description: 'Explore public policy and historical challenges mapped to root causes, evidence spines, policies, and solution fixes.',
    type: 'website',
  },
};

export default function ProblemsPage() {
  const problems = extractProblems();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            name: 'The Breakdown Problem Intelligence Explorer',
            description: 'Public policy and historical challenge navigation trees with evidence spines and solution fixes.',
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <ProblemExplorerPanel problems={problems} />
      </div>
    </main>
  );
}
