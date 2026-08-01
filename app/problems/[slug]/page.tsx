import React from 'react';
import Link from 'next/link';
import { extractProblems, getProblemBySlug } from '@/lib/problem-helpers';
import ProblemDetailView from '@/components/problems/ProblemDetailView';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ProblemDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProblemDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problems = extractProblems();
  const problem = getProblemBySlug(problems, slug);

  if (!problem) {
    return { title: 'Problem Not Found | The Breakdown OS' };
  }

  return {
    title: `${problem.title} | Problem Intelligence Explorer`,
    description: `Explore root causes, evidence spine, policy evaluations, and solution fixes for ${problem.title}.`,
  };
}

export default async function ProblemDetailPage({ params }: ProblemDetailPageProps) {
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
            '@type': 'Article',
            headline: problem.title,
            articleSection: problem.category,
          }),
        }}
      />

      <ProblemDetailView problem={problem} />
    </main>
  );
}
