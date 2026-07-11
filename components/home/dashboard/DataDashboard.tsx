'use client';

interface DataDashboardProps {
  data: {
    evidenceGrowth: string;
    coverageTrend: string;
    countries: number;
    organizations: number;
    people: number;
    mediaAssets: number;
  };
}

export default function DataDashboard({ data }: DataDashboardProps) {
  const metrics = [
    { label: 'Evidence Growth', value: data.evidenceGrowth },
    { label: 'Coverage Trend', value: data.coverageTrend },
    { label: 'Countries', value: data.countries.toLocaleString() },
    { label: 'Organizations', value: data.organizations.toLocaleString() },
    { label: 'People', value: data.people.toLocaleString() },
    { label: 'Media Assets', value: data.mediaAssets.toLocaleString() },
  ];

  return (
    <section className="py-24 bg-[#050505] border-t border-neutral-900" aria-labelledby="dashboard-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-12 border-b border-neutral-800 pb-4">
          <h2 id="dashboard-heading" className="text-3xl font-serif text-white">Editorial Intelligence</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {metrics.map((metric, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-5xl font-light text-emerald-500 font-mono tracking-tight">{metric.value}</span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
