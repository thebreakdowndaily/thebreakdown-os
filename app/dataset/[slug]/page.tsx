import { notFound } from 'next/navigation';
import Link from 'next/link';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildDatasetPage } from '@/features/dataset/view-model';
import { DatasetViewTabs } from '@/components/dataset/DatasetViewTabs';
import { seedDatasets } from '@/lib/datasets/seed-data';
import Container from '@/components/ui/Container';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHeader from '@/components/ui/SectionHeader';

export function generateStaticParams() {
  return seedDatasets.map((ds) => ({ slug: ds.slug }));
}

export default async function DatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const services = bootstrapServices();
  const vm = await buildDatasetPage(services, slug);
  if (!vm) return notFound();
  const { dataset, relatedStories } = vm;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Datasets', href: '/datasets' },
          { label: dataset.title, href: `/dataset/${dataset.slug}` },
        ]}
      />

      <main className="flex-1 w-full" role="main">
        <Container className="py-8">
          <DatasetViewTabs dataset={dataset} />

          {relatedStories.length > 0 && (
            <section className="mt-12">
              <SectionHeader eyebrow="Coverage" title="Related Stories" description={`${relatedStories.length} stories referencing this dataset`} />
              <div className="grid gap-3">
                {relatedStories.map(story => (
                  <Link key={story.id} href={`/story/${story.slug}`} className="block p-4 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-[#D4A843] transition-colors">
                    <h3 className="text-sm font-medium text-[#F5F5F5]">{story.title}</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">{story.summary.slice(0, 120)}...</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
    </>
  );
}
