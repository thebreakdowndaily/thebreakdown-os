import { DatasetEditor } from '@/features/cms/components/DatasetEditor';

export default function CmsDatasetNewPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-8">New Dataset</h1>
        <DatasetEditor dataset={null} />
      </div>
    </main>
  );
}
