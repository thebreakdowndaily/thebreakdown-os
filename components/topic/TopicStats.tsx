import React from 'react';

interface TopicStatsProps {
  statistics: Array<{ label: string; value: string }>;
}

export default function TopicStats({ statistics }: TopicStatsProps) {
  if (!statistics || statistics.length === 0) return null;

  return (
    <section aria-label="Key statistics" className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800 border border-neutral-800 rounded-2xl overflow-hidden">
        {statistics.slice(0, 4).map((stat, i) => (
          <div key={i} className="bg-neutral-950 p-6 sm:p-8 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">
              {stat.label}
            </span>
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none" style={{ fontFamily: 'var(--font-editorial)' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
