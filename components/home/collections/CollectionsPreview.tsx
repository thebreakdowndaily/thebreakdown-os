import Link from 'next/link';
import type { KnowledgeLibrary } from '@/types/canonical';

interface CollectionsPreviewProps {
  libraries: KnowledgeLibrary[];
}

export function CollectionsPreview({ libraries }: CollectionsPreviewProps) {
  return (
    <section aria-label="Knowledge collections">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Collections</h2>
        <p className="text-gray-500 mb-8">Evidence-based collections on the topics that matter.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {libraries.map((lib) =>
            lib.collections.map((col) => (
              <Link
                key={col.id}
                href={`/series/${lib.slug}`}
                className="block border rounded-lg p-6 hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <h3 className="text-lg font-semibold mb-1">{col.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{col.subtitle}</p>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{col.summary}</p>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{col.volumes.length} {col.volumes.length === 1 ? 'volume' : 'volumes'}</span>
                  <span>{col.volumes.reduce((a, v) => a + v.chapters.length, 0)} chapters</span>
                  <span>{col.dateRange.start}–{col.dateRange.end || 'Present'}</span>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="mt-6 text-center">
          <Link href="/series" className="text-blue-600 hover:underline text-sm">
            Browse all collections →
          </Link>
        </div>
      </div>
    </section>
  );
}
