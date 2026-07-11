'use client';

interface HealthData {
  title: string;
  metrics: Array<{ label: string; value: number }>;
}

export default function HealthMetricsGrid({ sections }: { sections: HealthData[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {sections.map((section, idx) => (
        <section key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 pb-4 border-b border-neutral-800">
            {section.title}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {section.metrics.map((m, i) => (
              <div key={i} className="flex flex-col">
                <span className={`text-3xl font-light font-mono mb-1 ${m.value > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                  {m.value}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold leading-tight">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
