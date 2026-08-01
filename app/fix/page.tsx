import type { Metadata } from 'next';
import { Suspense } from 'react';
import { bootstrapServices } from '@/lib/bootstrap';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FixHubClient from '@/components/fix/FixHubClient';

export const metadata: Metadata = {
  title: 'The Fix Hub — Evidence-Based Policy Solutions — The Breakdown',
  description: 'Search, filter, and explore evidence-backed policy solutions — statutory reforms, administrative blueprints, and institutional interventions for India\'s systemic challenges.',
  openGraph: {
    title: 'The Fix Hub — The Breakdown Knowledge Platform',
    description: 'Search and filter evidence-backed policy frameworks, global precedents, and administrative reform blueprints.',
    type: 'website',
    url: 'https://thebreakdown.gov/fix',
  },
};

interface FixPageProps {
  searchParams: Promise<{ q?: string; filters?: string; sort?: string; page?: string }>;
}

const PAGE_SIZE = 12;

const FACET_FIELDS = ['primaryCategory', 'maturityStatus', 'evidenceGrade', 'timeToImpact'] as const;

export default async function FixLandingPage({ searchParams }: FixPageProps) {
  const params = await searchParams;
  const services = bootstrapServices({ publicOnly: true });
  const fixesResponse = await services.fixes.getFixes({ pageSize: 50 });
  const fixes = fixesResponse.data;

  const facets = FACET_FIELDS.map(field => {
    const counts: Record<string, number> = {};
    fixes.forEach(f => {
      const val = (f as unknown as Record<string, unknown>)[field];
      if (Array.isArray(val)) {
        val.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      } else if (val !== undefined && val !== null) {
        counts[String(val)] = (counts[String(val)] || 0) + 1;
      }
    });
    return {
      field,
      counts: Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    };
  });

  const initialFilters = params.filters ? JSON.parse(params.filters) : {};

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'The Fix Hub', href: '/fix' },
      ]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700/60 uppercase tracking-wider">
              Knowledge Operating System · The Fix Hub
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mb-3 leading-tight tracking-tight">
            Not just what&apos;s wrong.<br />
            <span className="text-[var(--color-brand-400)]">Systemic reforms that work.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base max-w-3xl leading-relaxed">
            Search evidence-backed policy solutions, filter by intervention type and maturity, and explore global precedents for India&apos;s systemic challenges.
          </p>
        </header>

        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-gray-500">Loading fixes...</div>
          </div>
        }>
          <FixHubClient
            fixes={fixes}
            facets={facets}
            totalCount={fixes.length}
            initialFilters={initialFilters}
            initialSort={params.sort || 'relevance'}
            initialPage={parseInt(params.page || '0', 10)}
            initialQuery={params.q || ''}
            pageSize={PAGE_SIZE}
          />
        </Suspense>
      </main>
    </div>
  );
}
