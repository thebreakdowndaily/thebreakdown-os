import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import { getCanonicalTrustMetrics, type TrustMetrics } from '@/lib/knowledge/trust-metrics';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trust Dashboard — The Breakdown',
  description: 'Live transparency dashboard for The Breakdown Knowledge Platform — see our editorial standards, chapter status, claim counts, evidence sources, and verification history.',
  openGraph: { title: 'Trust Dashboard — The Breakdown', description: 'Live transparency for The Breakdown Knowledge Platform: claims, sources, evidence, review status.', url: 'https://thebreakdown.in/trust' },
  twitter: { card: 'summary', title: 'Trust Dashboard — The Breakdown', description: 'Live transparency for The Breakdown Knowledge Platform: claims, sources, evidence, review status.' },
};

export default async function TrustPage() {
  let metrics: TrustMetrics | null = null;
  try {
    metrics = await getCanonicalTrustMetrics();
  } catch (err) {
    console.error('Failed to load trust metrics:', err);
    metrics = null;
  }

  const formatVal = (val: number | undefined) => (val !== undefined && val !== null ? String(val) : '--');

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SpatialNarrativeBreadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Trust Dashboard', href: '/trust', current: true },
        ]} theme="dark" />
      </div>

    <Container>
      <div className="py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Trust Dashboard</h1>
        <p className="text-gray-400 mb-2">Live transparency for The Breakdown Knowledge Platform.</p>
        <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-300 mb-8 text-sm">
          Evidence before conclusions. Context before certainty.
        </blockquote>

        {/* Editorial Constitution */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Editorial Constitution</h2>
            <span className="text-green-400 text-sm font-medium">v1.1 — Locked</span>
          </div>
          <p className="text-gray-400 text-sm">Last ratified: July 2026. The supreme governing document for all editorial decisions. Amendments require exceptional justification.</p>
        </div>

        {/* Founding Edition Banner */}
        <div className="bg-gradient-to-r from-amber-900/30 to-gray-900 border border-amber-800/50 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-sm font-semibold">★ Founding Edition v1.0</span>
          </div>
          <p className="text-gray-300 text-sm">The Breakdown Knowledge Library — Founding Edition. <strong>Founding Chapter 001</strong> published. All metrics below reflect current state of the editorial infrastructure.</p>
        </div>

        {/* Platform Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Platform Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Published chapters</p>
              <p className="text-green-400 text-2xl font-bold">{formatVal(metrics?.publishedChapters)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chapters in review</p>
              <p className="text-amber-400 text-2xl font-bold">{formatVal(metrics?.chaptersInReview)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total claims registered</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.totalClaims)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Primary sources cited</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.primarySourcesCited)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Sources in registry</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.sourcesInRegistry)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Evidence entries</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.evidenceEntries)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Documents reproduced</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.documentsReproduced)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Thinkers profiled</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.thinkersProfiled)}</p>
            </div>
          </div>
        </div>

        {/* Knowledge Quality */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Knowledge Quality</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Open scholarly disagreements</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.openScholarlyDisagreements)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Counterarguments documented</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.counterArgumentsDocumented)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Corrections issued</p>
              <p className="text-white text-2xl font-bold">{formatVal(metrics?.correctionsIssued)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Average Trust Score</p>
              <p className="text-white text-2xl font-bold">
                {metrics?.averageTrustScore !== undefined ? `${metrics.averageTrustScore}/100` : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Gold Standard Review */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Gold Standard Review — Founding Chapter 001</h2>
          <p className="text-gray-400 text-sm mb-3">Phase 1–2 pending external reviewer network. Phases 3–7 passable with current editorial resources.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 1 — Expert Review</span>
              <span className="text-yellow-400 text-sm">Pending (external)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 2 — Reader Review</span>
              <span className="text-yellow-400 text-sm">Pending (external)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 3 — Evidence Audit</span>
              <span className="text-green-400 text-sm">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 4 — Bias Audit</span>
              <span className="text-green-400 text-sm">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 5 — Visual Audit</span>
              <span className="text-amber-400 text-sm">Partial (6 RM assets pending)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 6 — Knowledge Density Audit</span>
              <span className="text-green-400 text-sm">Passed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phase 7 — Defensibility Audit</span>
              <span className="text-green-400 text-sm">Passed</span>
            </div>
          </div>
        </div>

        {/* Institutional Memory */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Institutional Memory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Editorial decisions recorded</p>
              <p className="text-white text-2xl font-bold">15</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Evidence debt items</p>
              <p className="text-yellow-400 text-2xl font-bold">
                {metrics?.evidenceDebt !== undefined ? formatVal(metrics.evidenceDebt) : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Verification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Last platform-wide verification</p>
              <p className="text-white text-sm">
                {metrics?.lastVerifiedDate && metrics.lastVerifiedDate !== 'NOT VERIFIED' ? metrics.lastVerifiedDate : 'Not verified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Next scheduled review</p>
              <p className="text-white text-sm">January 2027</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 mt-8">
          <p className="text-gray-500 text-xs mb-3">This dashboard reflects the current state of the editorial infrastructure. Individual chapter-level transparency metadata is available within each chapter. Data sourced from the canonical editorial registries.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/methodology" className="text-amber-400 hover:underline">Methodology</Link>
            <Link href="/editorial-constitution" className="text-amber-400 hover:underline">Editorial Constitution</Link>
            <Link href="/founding-edition" className="text-amber-400 hover:underline">Founding Edition</Link>
          </div>
        </div>
      </div>
    </Container>
    </>
  );
}
