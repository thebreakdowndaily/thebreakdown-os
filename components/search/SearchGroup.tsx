import React from 'react';
import SearchResultItem from './SearchResultItem';
import type { SearchResultData } from './SearchResultItem';

interface SearchGroupProps {
  label: string;
  results: SearchResultData[];
  selectedIndex: number;
  globalOffset: number;
  onSelect: (index: number) => void;
}

export default function SearchGroup({ label, results, selectedIndex, globalOffset, onSelect }: SearchGroupProps) {
  if (results.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 px-4 py-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</h3>
        <span className="text-[10px] text-text-muted/40 font-mono tabular-nums">{results.length}</span>
      </div>
      <div className="space-y-0.5 px-2">
        {results.map((result, i) => {
          const idx = globalOffset + i;
          return (
            <SearchResultItem
              key={`${result.type}:${result.id}`}
              result={result}
              selected={selectedIndex === idx}
              onSelect={() => onSelect(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}
