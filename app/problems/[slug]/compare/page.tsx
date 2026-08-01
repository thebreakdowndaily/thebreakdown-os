import React from 'react';
import { extractProblems, getProblemBySlug } from '@/lib/problem-helpers';
import SolutionComparisonView from '@/components/problems/SolutionComparisonView';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface SolutionComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SolutionComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const problems = extractProblems();
  const problem = getProblemBySlug(problems, slug);

  if (!problem) {
    return { title: 'Problem Not Found | The Breakdown OS' };
  }

  return {
    title: `Solution Comparison — ${problem.title} | The Breakdown OS`,
    description: `Compare proposed fixes side-by-side for ${problem.title}.`,
  };
}

export default async function SolutionComparePage({ params }: SolutionComparePageProps) {
  const { slug } = await params;
  const problems = extractProblems();
  const problem = getProblemBySlug(problems, slug);

  if (!problem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Table',
            about: problem.title,
            description: 'Solution comparison matrix for available fixes.',
          }),
        }}
      />

      <SolutionComparisonView problem={problem} />
    </main>
  );
}
