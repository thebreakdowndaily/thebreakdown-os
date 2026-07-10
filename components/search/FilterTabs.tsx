import React from 'react';

interface FilterTabsProps {
  active: string;
  onChange: (filter: string) => void;
}

const filters = [
  { id: '', label: 'All' },
  { id: 'story', label: 'Stories' },
  { id: 'entity', label: 'Entities' },
  { id: 'topic', label: 'Topics' },
];

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-primary">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${
            active === f.id
              ? 'bg-brand-400/10 text-brand-400 border border-brand-400/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary border border-transparent'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
