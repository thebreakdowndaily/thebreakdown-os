import { bootstrapServices } from '@/lib/bootstrap';
import { DatasetEditor } from '@/features/cms/components/DatasetEditor';
import type { Dataset } from '@/types/canonical';

export default async function CmsDatasetEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = bootstrapServices();
  const dataset = slug === 'new' ? null : (await services.datasets.getDatasetBySlug(slug)) as Dataset | null;
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-8">
          {dataset ? `Edit: ${dataset.title}` : 'New Dataset'}
        </h1>
        <DatasetEditor dataset={dataset} />
      </div>
    </main>
  );
}
