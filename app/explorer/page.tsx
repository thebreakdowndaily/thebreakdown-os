// app/explorer/page.tsx
// Sprint 5C — Knowledge Explorer Page Wrapper with Suspense and Error Boundary

import type { Metadata } from 'next';
import { Suspense } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import KnowledgeExplorerView from '@/components/explorer/KnowledgeExplorerView';
import { ExplorerErrorBoundary } from '@/components/explorer/ExplorerErrorBoundary';
import { CHAPTER_1_FIX } from '@/lib/editorial/chapter-1-data';
import Skeleton from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Knowledge Explorer — The Breakdown Knowledge Platform',
  description: 'Interactive discovery surface across canonical Fixes, Claims, Sources, Laws, and Datasets.',
};

interface ExplorerPageProps {
  searchParams: Promise<{
    search?: string;
    node?: string;
    type?: string;
  }>;
}

function ExplorerLoaderFallback() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
      <div className="h-28 bg-[#151515] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-5 w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-800/40 border border-gray-700/60 rounded-xl p-4 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-8 h-96 bg-[#151515] border border-gray-850 rounded-2xl p-6 space-y-4 shadow-xl">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

export default async function KnowledgeExplorerPage({ searchParams }: ExplorerPageProps) {
  const rawParams = (await (searchParams as Promise<Record<string, unknown>>));
  const params = {
    search: typeof rawParams.search === 'string' ? rawParams.search : '',
    node: typeof rawParams.node === 'string' ? rawParams.node : '',
    type: typeof rawParams.type === 'string' ? rawParams.type : '',
  };
  const fixes = [CHAPTER_1_FIX];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-amber-500/30 pb-24">
      {/* Top Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-100">
              Knowledge <span className="text-amber-400">Explorer</span>
            </h1>
            <span className="bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded font-bold border border-amber-500/30">
              Phase 16A Discovery Engine Live
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Canonical Graph Synced
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8" id="main-content">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Knowledge Base', href: '/series' },
          { label: 'Explorer', href: '/explorer' },
        ]} />

        <div className="mt-6">
          <ExplorerErrorBoundary>
            <Suspense fallback={<ExplorerLoaderFallback />}>
              <KnowledgeExplorerView
                fixes={fixes}
                initialSearch={params.search || ''}
                initialNodeId={params.node || ''}
                initialType={params.type || 'ALL'}
              />
            </Suspense>
          </ExplorerErrorBoundary>
        </div>
      </main>
    </div>
  );
}
