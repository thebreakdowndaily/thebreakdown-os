import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import { CompareView } from '@/components/compare/CompareView';

export const metadata: Metadata = {
  title: 'Compare Solutions — The Fix Hub — The Breakdown',
  description: 'Compare evidence-backed policy solutions side by side. Analyse evidence quality, implementation cost, time horizon, trade-offs, and global precedents.',
  openGraph: {
    title: 'Compare Solutions — The Breakdown Knowledge Platform',
    description: 'Side-by-side comparison of evidence-backed policy solutions.',
    type: 'website',
    url: 'https://thebreakdown.gov/compare',
  },
};

interface ComparePageProps {
  searchParams: Promise<{ fixes?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const services = bootstrapServices({ publicOnly: true });
  const fixesResponse = await services.fixes.getFixes({ pageSize: 50 });
  const allFixes = fixesResponse.data;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SpatialNarrativeBreadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'The Fix Hub', href: '/fix' },
          { label: 'Compare Solutions', href: '/compare', current: true },
        ]} theme="dark" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        {/* Structured SEO Metadata JSON-LD (Refinement 9) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Table',
              name: 'Compare Policy Solutions',
              description: 'Side-by-side comparison of evidence-backed policy solutions.',
            }),
          }}
        />

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700/60 uppercase tracking-wider">
              Knowledge Operating System · Comparative Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mb-3 leading-tight tracking-tight">
            Compare <span className="text-[var(--color-brand-400)]">Solutions</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base max-w-3xl leading-relaxed">
            Select 2–5 evidence-backed policy solutions for structured side-by-side analysis.
          </p>
        </header>

        <CompareView allFixes={allFixes} initialFixes={params.fixes || null} />
      </main>
    </div>
  );
}
