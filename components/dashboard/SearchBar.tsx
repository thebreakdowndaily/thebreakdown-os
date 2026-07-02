'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const recentSearches = ['semiconductor PLI India', 'DPDP Act amendments', 'RBI repo rate', 'Supreme Court CAA', 'PISA India results 2025'];

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered suggestions
  const suggestions = query.trim()
    ? [
        ...recentSearches.filter((s) => s.toLowerCase().includes(query.toLowerCase())),
        `Search all stories for "${query}"`,
        `Search entities for "${query}"`,
      ]
    : recentSearches;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        setQuery(selected);
        setIsOpen(false);
        onSearch?.(selected);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [suggestions, selectedIndex, onSearch]
  );

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-surface-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '10px',
          padding: '0 14px',
          height: '40px',
          gap: '10px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...(isOpen ? { borderColor: 'var(--color-amber-500)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--color-amber-500) 20%, transparent)' } : {}),
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search stories, entities, topics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => { setIsOpen(true); }}
          onBlur={() => setTimeout(() => { setIsOpen(false); }, 200)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            fontFamily: 'inherit',
          }}
        />
        <kbd
          style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            left: 0,
            right: 0,
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {suggestions.length === 0 ? (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              No results found
            </div>
          ) : (
            suggestions.map((suggestion, i) => (
              <div
                key={`${suggestion}-${String(i)}`}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  background: i === selectedIndex ? 'var(--color-surface-secondary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseDown={() => {
                  setQuery(suggestion);
                  setIsOpen(false);
                  onSearch?.(suggestion);
                }}
                onMouseEnter={() => { setSelectedIndex(i); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {suggestion}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
