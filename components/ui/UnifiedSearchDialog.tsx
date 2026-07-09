'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UnifiedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedSearchDialog: React.FC<UnifiedSearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          // Typically the parent handles this, but we can't open ourselves if we're not rendered
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small timeout to allow transition to start before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    },
    [query, router, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-950/80 backdrop-blur-md">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <form onSubmit={handleSubmit} className="relative border-b border-neutral-800">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, topics, entities..."
            className="w-full bg-transparent text-neutral-100 placeholder-neutral-500 pl-12 pr-12 py-4 text-lg focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-12 pr-4 flex items-center text-neutral-500 hover:text-neutral-300"
            >
              Clear
            </button>
          )}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 border border-neutral-800 rounded px-1.5 py-0.5 bg-neutral-900">
              ESC
            </span>
          </div>
        </form>
        
        <div className="p-4 sm:p-6 bg-neutral-950">
          {!query ? (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-500 mb-2">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Elections', 'Supreme Court', 'Economy', 'Climate'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors border border-neutral-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-2 text-sm text-neutral-400 text-center">
              Press Enter to search for &quot;<span className="text-amber-400 font-medium">{query}</span>&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedSearchDialog;
