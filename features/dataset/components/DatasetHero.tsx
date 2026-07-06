'use client';

import type { Dataset } from '@/types/canonical';

const CATEGORY_COLORS: Record<string, string> = {
  economy: '#22C55E', climate: '#3B82F6', health: '#F43F5E',
  education: '#D4A843', demographics: '#A855F7', energy: '#F97316',
  trade: '#06B6D4', governance: '#6366F1', technology: '#8B5CF6',
  military: '#EF4444', infrastructure: '#10B981', social: '#EC4899',
  environment: '#14B8A6', finance: '#F59E0B',
};

export function DatasetHero({ dataset }: { dataset: Dataset }) {
  const color = CATEGORY_COLORS[dataset.category] || '#6B7280';
  return (
    <div className="border-b border-[#2A2A2A] pb-8">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm uppercase tracking-widest text-[#A1A1AA]">
          {dataset.category}
        </span>
        <span className="text-sm text-[#A1A1AA]">·</span>
        <span className="text-sm text-[#A1A1AA]">{dataset.frequency}</span>
      </div>
      <h1 className="text-3xl font-bold text-[#F5F5F5] mb-4">{dataset.title}</h1>
      <p className="text-lg text-[#A1A1AA] max-w-3xl">{dataset.description}</p>
    </div>
  );
}
