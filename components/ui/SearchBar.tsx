'use client';

import React, { useState, useCallback, useRef } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
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

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search stories, topics, entities...', initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch && query.trim()) {
        onSearch(query.trim());
      }
    },
    [onSearch, query],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

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
          onChange={(e) => setQuery(e.target.value)}
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
