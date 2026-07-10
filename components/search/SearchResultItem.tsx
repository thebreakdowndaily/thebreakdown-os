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
  topic: 'bg-brand-400/10 text-brand-400',
  entity: 'bg-purple-500/10 text-purple-400',
  country: 'bg-rose-500/10 text-rose-400',
  organization: 'bg-purple-500/10 text-purple-400',
  timeline: 'bg-cyan-500/10 text-cyan-400',
  fix: 'bg-green-500/10 text-green-400',
  default: 'bg-surface-tertiary text-text-muted',
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
      className={`flex items-start gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
        selected ? 'bg-brand-400/10 border border-brand-400/20' : 'hover:bg-surface-secondary border border-transparent'
      }`}
      role="option"
      aria-selected={selected}
    >
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest shrink-0 mt-1 ${typeColor(result)}`}>
        {typeLabel(result)}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-serif truncate ${selected ? 'text-brand-400' : 'text-text-primary'}`}>{result.title}</p>
        {result.description && (
          <p className="text-xs text-text-muted line-clamp-1 mt-1">{result.description}</p>
        )}
      </div>
      {result.metadata?.evidenceScore && (
        <span className="text-xs font-bold font-mono text-green-500 shrink-0 mt-1">{result.metadata.evidenceScore}%</span>
      )}
    </a>
  );
}
