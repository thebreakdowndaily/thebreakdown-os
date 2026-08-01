import Link from 'next/link';
import type { KnowledgeCollection } from '@/types/canonical';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import Badge from '@/components/ui/Badge';

function collectionTrustScore(col: KnowledgeCollection): { score: number; grade: string } {
  const chapters = col.volumes.flatMap(v => v.chapters);
  const totalClaims = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
  const totalEvidence = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'evidence-summary').length, 0);
  const verifiedChapters = chapters.filter(ch => ch.status === 'verified').length;
  const reviewScore = chapters.length > 0 ? (verifiedChapters / chapters.length) * 40 : 0;
  const evidenceScore = totalClaims > 0 ? Math.min((totalEvidence / totalClaims) * 30, 30) : 0;
  const score = Math.round(reviewScore + evidenceScore + 30);
  return { score, grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D' };
}

export function CollectionLanding({ collection }: { collection: KnowledgeCollection }) {
  const trust = collectionTrustScore(collection);
  const chapters = collection.volumes.flatMap(v => v.chapters);
  const totalClaims = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
  const totalEvidence = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'evidence-summary').length, 0);
  const totalSources = chapters.flatMap(ch => ch.content.filter((b: { type?: string }) => b.type === 'document')).length;

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500/30 pb-24">
      {/* Top Orientation Rail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SpatialNarrativeBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Library', href: '/series' },
            { label: collection.title, href: `/series/${collection.slug}`, current: true },
          ]}
          theme="dark"
        />
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-neutral-800 pb-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="category">Story World Ecosystem</Badge>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Macro Domain Projection
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {collection.title}
            </h1>
            {collection.subtitle && (
              <p className="text-lg font-medium text-emerald-400/90">
                {collection.subtitle}
              </p>
            )}
            <p className="text-base text-neutral-300 leading-relaxed">
              {collection.summary}
            </p>
          </div>

          {/* Trust & Epistemic Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                Epistemic Trust Rating
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                trust.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                trust.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                Score {trust.score}/100 (Grade {trust.grade})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-neutral-800 text-xs">
              <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800">
                <span className="block font-bold text-white font-mono">{totalClaims}</span>
                <span className="text-[10px] text-neutral-400">Claims</span>
              </div>
              <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800">
                <span className="block font-bold text-emerald-400 font-mono">{totalEvidence}</span>
                <span className="text-[10px] text-neutral-400">Evidence</span>
              </div>
              <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800">
                <span className="block font-bold text-blue-400 font-mono">{totalSources}</span>
                <span className="text-[10px] text-neutral-400">Sources</span>
              </div>
            </div>

            <div className="flex gap-4 text-[11px] font-mono text-neutral-400 pt-1 justify-center">
              <Link href="/methodology" className="hover:text-emerald-400 transition-colors underline">Methodology</Link>
              <Link href="/editorial-constitution" className="hover:text-emerald-400 transition-colors underline">Constitution</Link>
            </div>
          </div>
        </div>

        {/* Volume Nodes List */}
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Volume Chapters & Investigation Cycles</span>
          </h2>

          <div className="grid gap-6">
            {collection.volumes.map((v) => (
              <Link
                key={v.id}
                href={`/series/${collection.slug}/volume/${v.slug}`}
                className="group block p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/50 transition-all hover:shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {v.title}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    Era: {v.dateRange.start}–{v.dateRange.end || 'Present'}
                  </span>
                </div>
                {v.subtitle && <p className="text-sm font-medium text-emerald-400/80 mb-2">{v.subtitle}</p>}
                <p className="text-sm text-neutral-300 leading-relaxed mb-4">{v.summary}</p>
                
                <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 pt-3 border-t border-neutral-800/80">
                  <span>{v.chapters.length} {v.chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
                  <span>•</span>
                  <span>{v.chapters.filter(ch => ch.status === 'verified').length} Verified Monograph(s)</span>
                  <span className="ml-auto text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                    Explore Volume →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
