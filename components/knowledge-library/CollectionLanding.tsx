import Link from 'next/link';
import type { KnowledgeCollection } from '@/types/canonical';

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
  const totalSources = chapters.flatMap(ch => ch.content.filter((b: any) => b.type === 'document')).length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/series" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to Library</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">{collection.title}</h1>
          {collection.subtitle && <p className="text-lg text-gray-500 mb-2">{collection.subtitle}</p>}
          <p className="text-gray-700">{collection.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            trust.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
            trust.grade === 'B' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            Trust {trust.score}/100 ({trust.grade})
          </span>
          <div className="flex gap-3 text-xs mt-2">
            <Link href="/methodology" className="text-blue-600 hover:underline">Methodology</Link>
            <Link href="/editorial-constitution" className="text-blue-600 hover:underline">Editorial Constitution</Link>
          </div>
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500 mb-8">
        <span>{collection.volumes.length} {collection.volumes.length === 1 ? 'volume' : 'volumes'}</span>
        <span>{totalClaims} claims</span>
        <span>{totalEvidence} evidence blocks</span>
        <span>{totalSources} documents</span>
        <span>{collection.dateRange.start}–{collection.dateRange.end || 'Present'}</span>
      </div>

      <div className="grid gap-6">
        {collection.volumes.map((v) => (
          <Link
            key={v.id}
            href={`/series/${collection.slug}/volume/${v.slug}`}
            className="block border rounded-lg p-6 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-1">{v.title}</h2>
            {v.subtitle && <p className="text-gray-500 mb-2">{v.subtitle}</p>}
            <p className="text-gray-700 mb-3">{v.summary}</p>
            <div className="flex gap-4 text-sm text-gray-400">
               <span>{v.chapters.length} {v.chapters.length === 1 ? 'chapter' : 'chapters'}</span>
               <span>{v.chapters.filter(ch => ch.status === 'verified').length} verified</span>
               <span>{v.dateRange.start}–{v.dateRange.end || 'Present'}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
