import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildDatasetPage } from '@/features/dataset/view-model';
import { DatasetExplorer } from '@/features/dataset/components/DatasetExplorer';

export default async function DatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const services = bootstrapServices();
  const vm = buildDatasetPage(services, slug);
  if (!vm) notFound();

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <DatasetExplorer dataset={vm.dataset} />
        {vm.relatedStories.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Related Stories</h2>
            <div className="grid gap-3">
              {vm.relatedStories.map(story => (
                <a key={story.id} href={`/story/${story.slug}`} className="block p-4 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-[#D4A843] transition-colors">
                  <h3 className="text-sm font-medium text-[#F5F5F5]">{story.title}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-1">{story.summary.slice(0, 120)}...</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
