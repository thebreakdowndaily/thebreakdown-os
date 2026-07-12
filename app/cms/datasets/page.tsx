import { bootstrapServices } from '@/lib/bootstrap';

export default async function CmsDatasetsPage() {
  const services = bootstrapServices();
  const result = await services.datasets.getDatasets({ pageSize: 100 });
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Dataset Manager</h1>
            <p className="text-sm text-[#A1A1AA] mt-1">{result.meta?.total ?? 0} datasets</p>
          </div>
          <a href="/cms/datasets/new" className="px-4 py-2 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#C49A38] transition-colors">
            New Dataset
          </a>
        </div>
        <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left py-3 px-4 text-[#A1A1AA] font-medium">Title</th>
                <th className="text-left py-3 px-4 text-[#A1A1AA] font-medium">Category</th>
                <th className="text-left py-3 px-4 text-[#A1A1AA] font-medium">Frequency</th>
                <th className="text-left py-3 px-4 text-[#A1A1AA] font-medium">Metrics</th>
                <th className="text-left py-3 px-4 text-[#A1A1AA] font-medium">Updated</th>
                <th className="text-right py-3 px-4 text-[#A1A1AA] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map(dataset => (
                <tr key={dataset.id} className="border-b border-[#2A2A2A]/50 hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-3 px-4 text-[#F5F5F5]">{dataset.title}</td>
                  <td className="py-3 px-4 text-[#A1A1AA] text-xs uppercase">{dataset.category}</td>
                  <td className="py-3 px-4 text-[#A1A1AA] text-xs uppercase">{dataset.frequency}</td>
                  <td className="py-3 px-4 text-[#A1A1AA]">{dataset.metrics.length}</td>
                  <td className="py-3 px-4 text-[#A1A1AA] text-xs">{new Date(dataset.updatedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <a href={`/cms/datasets/${dataset.slug}`} className="text-[#D4A843] hover:underline text-xs">Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
