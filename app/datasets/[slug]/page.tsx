import { bootstrapServices } from '@/lib/bootstrap';
import { DatasetExplorer } from '@/features/dataset/components/DatasetExplorer';
import type { Dataset } from '@/types/canonical';

export default async function DatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const services = bootstrapServices();
  const dataset = services.datasets.getDatasetBySlug(slug) as Dataset | undefined;
  if (!dataset) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Dataset Not Found</h1>
          <p className="text-[#A1A1AA]">No dataset found with slug &quot;{slug}&quot;</p>
          <a href="/datasets" className="inline-block mt-4 text-[#D4A843] hover:underline">Browse all datasets</a>
        </div>
      </main>
    );
  }
  const relatedStories = dataset.relatedStoryIds.map(id => services.stories.getStory(id)).filter(Boolean);
  const relatedTopics = dataset.relatedTopicIds.map(id => services.topics.getTopic(id)).filter(Boolean);
  const relatedEntities = dataset.relatedEntityIds.map(id => services.entities.getEntity(id)).filter(Boolean);
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <DatasetExplorer dataset={dataset} />
        {relatedStories.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Related Stories</h2>
            <div className="grid gap-3">
              {relatedStories.map(s => s && (
                <a key={s.id} href={`/story/${s.slug}`} className="block p-3 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-[#D4A843] transition-colors">
                  <h3 className="text-sm font-medium text-[#F5F5F5]">{s.title}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-1">{s.summary}</p>
                </a>
              ))}
            </div>
          </section>
        )}
        {relatedTopics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Related Topics</h2>
            <div className="flex gap-2 flex-wrap">
              {relatedTopics.map(t => t && (
                <a key={t.id} href={`/topic/${t.slug}`} className="px-3 py-1.5 text-xs rounded-full bg-[#151515] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843] transition-colors">
                  {t.name}
                </a>
              ))}
            </div>
          </section>
        )}
        {relatedEntities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Related Entities</h2>
            <div className="flex gap-2 flex-wrap">
              {relatedEntities.map(e => e && (
                <a key={e.id} href={`/entity/${e.slug}`} className="px-3 py-1.5 text-xs rounded-full bg-[#151515] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843] transition-colors">
                  {e.name}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
