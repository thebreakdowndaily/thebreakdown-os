import React from 'react';

interface QuickFactsProps {
  facts: Array<{ label: string; value: string }>;
}

export default function QuickFacts({ facts }: QuickFactsProps) {
  if (facts.length === 0) return null;
  return (
    <section aria-label="Quick facts" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Quick Facts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facts.map((fact, i) => (
          <article key={i} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-5">
            <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1.5">{fact.label}</p>
            <p className="text-lg font-bold text-[#F5F5F5]">{fact.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
