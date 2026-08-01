'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onChange?: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
}

const SearchIcon: React.FC = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onChange, placeholder = 'Search stories, topics, entities...', initialValue = '', debounceMs = 250 }) => {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      if (onSearch) {
        onSearch(q);
      } else {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [onSearch, query, router],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (onChange) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          onChange(val.trim());
        }, debounceMs);
      }
    },
    [onChange, debounceMs],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (onChange) onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full max-w-2xl">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 placeholder-gray-500 transition-colors"
          aria-label={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        )}
        {!query && (
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-amber-400 transition-colors"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
