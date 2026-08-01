import type { Metadata } from 'next';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import ResearchWorkspaceView from '@/components/workspace/ResearchWorkspaceView';
import { CHAPTER_1_FIX } from '@/lib/editorial/chapter-1-data';

export const metadata: Metadata = {
  title: 'Research Workspace — The Breakdown Knowledge Platform',
  description: 'Non-mutating research environment for saved collections, side-by-side claim comparison, local notes, and dossier exports.',
};

export default function ResearchWorkspacePage() {
  const fixes = [CHAPTER_1_FIX];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-amber-500/30 pb-24">
      {/* Top Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-100">
              Research <span className="text-amber-400">Workspace</span>
            </h1>
            <span className="bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded font-bold border border-amber-500/30">
              Phase 16B Active Research Environment
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Canonical Immutability Preserved
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8" id="main-content">
        <SpatialNarrativeBreadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Knowledge Base', href: '/series' },
          { label: 'Research Workspace', href: '/workspace', current: true },
        ]} theme="dark" />

        <div className="mt-6">

          <ResearchWorkspaceView fixes={fixes} />
        </div>
      </main>
    </div>
  );
}
