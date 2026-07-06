import { bootstrapServices } from '@/lib/bootstrap';

export default function DatasetsPage() {
  const services = bootstrapServices();
  const result = services.datasets.getDatasets({ pageSize: 50 });

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Datasets</h1>
        <p className="text-lg text-[#A1A1AA] mb-8">Explore curated datasets powering The Breakdown&apos;s intelligence reports.</p>
        <div className="grid gap-4">
          {result.data.map(dataset => (
            <a key={dataset.id} href={`/dataset/${dataset.slug}`} className="block p-5 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-[#D4A843] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[#F5F5F5]">{dataset.title}</h2>
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] bg-[#2A2A2A] px-2 py-1 rounded">{dataset.category}</span>
              </div>
              <p className="text-sm text-[#A1A1AA] mb-3">{dataset.description}</p>
              <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                <span>{dataset.frequency}</span>
                <span>{dataset.metrics.length} metrics</span>
                <span>{dataset.versions[0]?.version || 'N/A'}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
