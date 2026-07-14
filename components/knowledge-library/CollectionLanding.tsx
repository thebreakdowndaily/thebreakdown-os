import Link from 'next/link';
import type { KnowledgeCollection } from '@/types/canonical';

export function CollectionLanding({ collection }: { collection: KnowledgeCollection }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/series" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to Library</Link>
      <h1 className="text-3xl font-bold mb-1">{collection.title}</h1>
      {collection.subtitle && <p className="text-lg text-gray-500 mb-2">{collection.subtitle}</p>}
      <p className="text-gray-700 mb-8">{collection.summary}</p>

      <div className="grid gap-6">
        {collection.volumes.map((v) => (
          <Link
            key={v.id}
            href={`/series/${collection.librarySlug}/volume/${v.slug}`}
            className="block border rounded-lg p-6 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-1">{v.title}</h2>
            {v.subtitle && <p className="text-gray-500 mb-2">{v.subtitle}</p>}
            <p className="text-gray-700 mb-3">{v.summary}</p>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>{v.chapters.length} chapters</span>
              {v.dateRange.start}–{v.dateRange.end || 'Present'}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
