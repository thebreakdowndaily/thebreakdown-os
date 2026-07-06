import React from 'react';

export interface SearchResultData {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  score: number;
  category?: string;
  metadata?: {
    evidenceScore?: number;
    updatedAt?: string;
    category?: string;
  };
}

const typeColors: Record<string, string> = {
  story: 'bg-blue-500/10 text-blue-400',
  topic: 'bg-[#D4A843]/10 text-[#D4A843]',
  entity: 'bg-purple-500/10 text-purple-400',
  country: 'bg-rose-500/10 text-rose-400',
  organization: 'bg-purple-500/10 text-purple-400',
  timeline: 'bg-cyan-500/10 text-cyan-400',
  fix: 'bg-green-500/10 text-green-400',
  default: 'bg-gray-500/10 text-gray-400',
};

const typeLabels: Record<string, string> = {
  story: 'Story',
  topic: 'Topic',
  entity: 'Entity',
  country: 'Country',
  organization: 'Org',
  timeline: 'Timeline',
  fix: 'The Fix',
};

interface SearchResultItemProps {
  result: SearchResultData;
  selected: boolean;
  onSelect: () => void;
}

const typeLabel = (result: SearchResultData): string => {
  if (result.type === 'entity' && result.category) {
    return typeLabels[result.category] || typeLabels[result.type] || result.category;
  }
  return typeLabels[result.type] || typeLabels.default;
};

const typeColor = (result: SearchResultData): string => {
  const key = result.type === 'entity' && result.category ? result.category : result.type;
  return typeColors[key] || typeColors.default;
};

export default function SearchResultItem({ result, selected, onSelect }: SearchResultItemProps) {
  return (
    <a
      href={result.url}
      onClick={(e) => { if (!selected) e.preventDefault(); }}
      onMouseDown={(e) => { e.preventDefault(); window.location.href = result.url; }}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
        selected ? 'bg-[#D4A843]/10 border border-[#D4A843]/20' : 'hover:bg-[#151515] border border-transparent'
      }`}
      role="option"
      aria-selected={selected}
    >
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider shrink-0 mt-0.5 ${typeColor(result)}`}>
        {typeLabel(result)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F5F5F5] truncate">{result.title}</p>
        {result.description && (
          <p className="text-xs text-[#A1A1AA] line-clamp-1 mt-0.5">{result.description}</p>
        )}
      </div>
      {result.metadata?.evidenceScore && (
        <span className="text-xs font-medium text-[#22C55E] shrink-0">{result.metadata.evidenceScore}%</span>
      )}
    </a>
  );
}
