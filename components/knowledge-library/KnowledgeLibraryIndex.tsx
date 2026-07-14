import Link from 'next/link';
import type { KnowledgeLibrary } from '@/types/canonical';

export function KnowledgeLibraryIndex({ libraries }: { libraries: KnowledgeLibrary[] }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Knowledge Library</h1>
      <p className="text-lg text-gray-600 mb-8">Evidence-based collections on the topics that matter.</p>
      <div className="grid gap-6">
        {libraries.map((lib) => (
          <Link
            key={lib.id}
            href={`/series/${lib.slug}`}
            className="block border rounded-lg p-6 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-1">{lib.title}</h2>
            {lib.subtitle && <p className="text-gray-500 mb-2">{lib.subtitle}</p>}
            <p className="text-gray-700">{lib.summary}</p>
            <p className="text-sm text-gray-400 mt-3">
              {lib.collections.reduce((a, c) => a + c.volumes.length, 0)} volumes
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
