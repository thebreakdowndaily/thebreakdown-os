import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildSearchPage } from '@/features/search/view-model';
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
  const { q: query = '', type: typeFilter = '' } = await searchParams;
  const services = bootstrapServices();
  
  const vm = await buildSearchPage(services, query, typeFilter);
  const { spotlight, grouped, suggestions, total } = vm;

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
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        
        {/* Search Header Info */}
        <p className="text-sm text-neutral-400">
          {total > 0 ? `Found ${total} knowledge nodes for "${query}"` : query ? `No results found for "${query}"` : 'Enter a search term'}
        </p>

        {/* Knowledge Spotlight */}
        {spotlight && (
          <section className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Knowledge Spotlight
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              {spotlight.type === 'Entity' && spotlight.data.image && (
                <img src={spotlight.data.image} alt={spotlight.data.name} className="w-24 h-24 rounded-full object-cover border-2 border-neutral-800" />
              )}
              {spotlight.type === 'Topic' && spotlight.data.image && (
                <img src={spotlight.data.image} alt={spotlight.data.name} className="w-32 h-24 rounded-lg object-cover border border-neutral-800" />
              )}
              <div>
                <h3 className="text-3xl font-black text-white mb-2">
                  <a href={`/${spotlight.type.toLowerCase()}/${spotlight.data.slug}`} className="hover:underline">
                    {spotlight.data.name}
                  </a>
                </h3>
                <p className="text-neutral-300 leading-relaxed max-w-2xl">
                  {spotlight.data.description}
                </p>
                <div className="mt-4 flex gap-3">
                  <a href={`/${spotlight.type.toLowerCase()}/${spotlight.data.slug}`} className="inline-flex items-center gap-1 text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                    Open Terminal
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Grouped Results */}
        {total > 0 && (
          <div className="space-y-12">
            
            {/* Entities Group */}
            {grouped.entities.length > 0 && (
              <section>
                <h3 className="text-lg font-bold border-b border-neutral-800 pb-2 mb-4">Entities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped.entities.map((e: any) => (
                    <EntityCard
                      key={e.id}
                      entity={{ slug: e.slug, name: e.title, type: e.type, description: e.description }}
                      size="sm"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Topics Group */}
            {grouped.topics.length > 0 && (
              <section>
                <h3 className="text-lg font-bold border-b border-neutral-800 pb-2 mb-4">Topics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grouped.topics.map((t: any) => (
                    <a key={t.id} href={`/topic/${t.slug}`} className="block p-4 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:border-emerald-500/50 transition-colors">
                      <h4 className="font-bold text-white mb-1">{t.title}</h4>
                      <p className="text-sm text-neutral-400 line-clamp-2">{t.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Stories Group */}
            {grouped.latestStories.length > 0 && (
              <section>
                <h3 className="text-lg font-bold border-b border-neutral-800 pb-2 mb-4">Intelligence & Coverage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {grouped.latestStories.map((s: any) => (
                    <StoryCard
                      key={s.id}
                      story={{ slug: s.slug, headline: s.title, summary: s.description, publishedAt: s.updatedAt, readingTime: 0, evidenceScore: s.score, category: 'general' }}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Suggestions */}
        {query && (suggestions.relatedSearches.length > 0 || suggestions.relatedEntities.length > 0) && (
          <section className="pt-8 border-t border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-500 mb-4 uppercase tracking-widest">Knowledge Graph Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {[...suggestions.relatedSearches, ...suggestions.relatedEntities, ...suggestions.relatedTopics].map((sug, i) => (
                <a key={i} href={`/search?q=${encodeURIComponent(sug)}`} className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors">
                  {sug}
                </a>
              ))}
            </div>
          </section>
        )}

      </div>
    </SearchLayout>
  );
}
