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
    <div className="flex items-center gap-1 px-4 py-2 border-b border-[#2A2A2A]">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            active === f.id
              ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20'
              : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
