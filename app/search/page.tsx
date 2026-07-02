import type { Metadata } from 'next';
import type { PageSpec } from '@/utils/types';
import { buildSearch } from '@/utils/website-builder';
import { semanticSearch } from '@/utils/search/engine';
import type { SemanticSearchResponse, SemanticResult } from '@/utils/search/engine';
import SearchLayout from '@/layouts/SearchLayout';
import StoryCard from '@/components/ui/StoryCard';
import EntityCard from '@/components/ui/EntityCard';
import ConceptTrail from '@/components/search/ConceptTrail';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

function searchResults(query: string, typeFilter: string, page: number): {
  results: SemanticSearchResponse['results'];
  understood: SemanticSearchResponse['understood'] | null;
  total: number;
  totalPages: number;
} {
  if (!query.trim()) {
    return { results: [], understood: null, total: 0, totalPages: 0 };
  }

  const result = semanticSearch(query, {
    page,
    pageSize: 10,
    type: typeFilter || undefined,
    depth: 2,
  });

  return {
    results: result.results,
    understood: result.understood,
    total: result.meta.total,
    totalPages: result.meta.totalPages,
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q: query = '' } = await searchParams;
  return {
    title: query ? `Search: ${query} — The Breakdown` : 'Search — The Breakdown',
    description: query ? `Semantic search results for "${query}" on The Breakdown` : 'Search stories, topics, entities on The Breakdown.',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = '', type: typeFilter = '', page: pageStr = '1' } = await searchParams;
  const currentPage = parseInt(pageStr, 10);

  const { results, understood, total, totalPages } = searchResults(query, typeFilter, currentPage);

  const pageSpec: PageSpec = buildSearch(query, results);

  return (
    <SearchLayout seo={pageSpec.seo} query={query}>
      {understood && understood.detectedConcepts.length > 0 && (
        <div className="mb-6">
          <ConceptTrail
            detectedConcepts={understood.detectedConcepts}
            expansionTrail={understood.expansionTrail}
          />
        </div>
      )}

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
            {results.map((result: SemanticResult) => {
              if (result.type === 'story') {
                return (
                  <div key={`${result.type}:${result.id}`}>
                    {result.matchType !== 'keyword' && (
                      <div className="mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          result.matchType === 'exact' ? 'bg-emerald-900/50 text-emerald-300'
                          : result.matchType === 'concept' ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-amber-900/50 text-amber-300'
                        }`}>
                          {result.matchType === 'exact' ? 'Direct match'
                            : result.matchType === 'concept' ? 'Concept match'
                            : 'Expanded match'}
                        </span>
                        {result.conceptMatch.length > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            via {result.conceptMatch.slice(0, 2).join(', ')}
                            {result.conceptMatch.length > 2 ? ` +${String(result.conceptMatch.length - 2)}` : ''}
                          </span>
                        )}
                      </div>
                    )}
                    <StoryCard
                      story={{
                        slug: result.id,
                        headline: result.title,
                        summary: result.description,
                        heroImage: result.image,
                        publishedAt: result.date || new Date().toISOString(),
                        readingTime: 0,
                        evidenceScore: result.score,
                        category: result.category || 'general',
                      }}
                      variant={result.score > 85 ? 'featured' : 'default'}
                    />
                  </div>
                );
              }
              return (
                <div key={`${result.type}:${result.id}`}>
                  {result.matchType !== 'keyword' && (
                    <div className="mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        result.matchType === 'exact' ? 'bg-emerald-900/50 text-emerald-300'
                        : result.matchType === 'concept' ? 'bg-blue-900/50 text-blue-300'
                        : 'bg-amber-900/50 text-amber-300'
                      }`}>
                        {result.matchType === 'exact' ? 'Direct match'
                          : result.matchType === 'concept' ? 'Concept match'
                          : 'Expanded match'}
                      </span>
                    </div>
                  )}
                  <EntityCard
                    entity={{
                      slug: result.id,
                      name: result.title,
                      type: result.category || 'entity',
                      description: result.description,
                    }}
                  />
                </div>
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
