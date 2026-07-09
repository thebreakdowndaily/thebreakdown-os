import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import type { SearchIndexEntry } from '@/types/canonical';
import SearchLayout from '@/layouts/SearchLayout';
import StoryCard from '@/components/ui/StoryCard';
import EntityCard from '@/components/ui/EntityCard';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q: query = '' } = await searchParams;
  return {
    title: query ? `Search: ${query} — The Breakdown` : 'Search — The Breakdown',
    description: query ? `Search results for "${query}" on The Breakdown` : 'Search stories, topics, entities on The Breakdown.',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = '', type: typeFilter = '', page: pageStr = '1' } = await searchParams;
  const currentPage = parseInt(pageStr, 10);
  const services = bootstrapServices();

  let results: SearchIndexEntry[] = [];
  let total = 0;
  if (query.trim()) {
    const pageSize = 10;
    const res = typeFilter
      ? services.search.searchByType(query, typeFilter, { page: currentPage, pageSize })
      : services.search.search(query, { page: currentPage, pageSize });
    results = res.data;
    total = res.meta?.total ?? 0;
  }

  const totalPages = Math.ceil(total / 10);

  const seo = query ? {
    title: `Search: ${query} — The Breakdown`,
    description: `Search results for "${query}" on The Breakdown`,
    canonical: `https://thebreakdown.in/search?q=${encodeURIComponent(query)}`,
    ogType: 'website' as const,
  } : {
    title: 'Search — The Breakdown',
    description: 'Search stories, topics, entities on The Breakdown.',
    canonical: 'https://thebreakdown.in/search',
    ogType: 'website' as const,
  };

  return (
    <SearchLayout seo={seo} query={query}>
      <div>
        <p className="text-sm text-gray-400 mb-4">
          {total} result{total !== 1 ? 's' : ''} for &quot;{query || 'all'}&quot;
          {typeFilter ? ` in ${typeFilter}` : ''}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-12">
            {query ? (
              <div>
                <p className="text-gray-400 mb-2">No results found for &quot;{query}&quot;.</p>
                <p className="text-gray-500 text-sm">
                  Try searching for broader concepts like &quot;employment&quot;, &quot;budget&quot;, or &quot;agriculture&quot;.
                </p>
              </div>
            ) : (
              <p className="text-gray-400">Enter a search term to find stories, entities, and topics.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => {
              if (result.type === 'story') {
                return (
                  <StoryCard
                    key={`${result.type}:${result.id}`}
                    story={{
                      slug: result.slug,
                      headline: result.title,
                      summary: result.description,
                      publishedAt: result.updatedAt,
                      readingTime: 0,
                      evidenceScore: result.score,
                      category: 'general',
                    }}
                    variant={result.score > 85 ? 'featured' : 'default'}
                  />
                );
              }
              return (
                <EntityCard
                  key={`${result.type}:${result.id}`}
                  entity={{
                    slug: result.slug,
                    name: result.title,
                    type: result.type,
                    description: result.description,
                  }}
                />
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <a
                href={`/search?q=${encodeURIComponent(query)}&type=${typeFilter}&page=${String(currentPage - 1)}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Previous
              </a>
            )}
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <a
                href={`/search?q=${encodeURIComponent(query)}&type=${typeFilter}&page=${String(currentPage + 1)}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </SearchLayout>
  );
}
