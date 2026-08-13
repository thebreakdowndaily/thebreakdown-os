'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  description: string;
  href: string;
}

const mockCommands: CommandItem[] = [
  { id: 'home', category: 'Navigation', title: 'Go to Homepage', description: 'Return to the main publication workspace', href: '/' },
  { id: 'newsroom', category: 'Navigation', title: 'Open Newsroom Portal', description: 'Editorial priority cases ledger', href: '/newsroom' },
  { id: 'story-rbi', category: 'Stories', title: 'RBI Monetary Policy Story', description: 'Review details on RBI repo rates & liquidity', href: '/story/rbi-monetary-policy' },
  { id: 'up403', category: 'Workspace', title: 'UP Assembly Ledger', description: 'Audit directory for Uttar Pradesh constituencies', href: '/up403' },
  { id: 'settings', category: 'System', title: 'Workspace Settings', description: 'Manage keyboard shortcut binds and theme', href: '/settings' },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = mockCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex] as CommandItem | undefined;
        if (selected) {
          router.push(selected.href);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filtered, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  const activeItem = filtered[selectedIndex] as CommandItem | undefined;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette shortcuts"
    >
      <div className="fixed inset-0" onClick={() => { onClose(); }} aria-hidden="true" />
      
      <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-[#2A2A2A] rounded-md shadow-2xl overflow-hidden flex flex-col h-[400px]">
        
        {/* Search header */}
        <div className="border-b border-[#2A2A2A] flex items-center px-4">
          <span className="text-[#737373] text-sm font-mono mr-3">⌘K</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or navigation path..."
            className="w-full bg-transparent text-[#F5F5F5] placeholder-[#737373] py-4 text-sm font-sans focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* Content grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel: List */}
          <div className="w-1/2 border-r border-[#2A2A2A] overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-xs font-mono text-[#737373] text-center">
                No commands matching query
              </div>
            ) : (
              filtered.map((cmd, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      router.push(cmd.href);
                      onClose();
                    }}
                    onMouseEnter={() => {
                      setSelectedIndex(idx);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-sm text-xs transition-colors flex flex-col gap-0.5 focus-visible:outline-none ${
                      isActive 
                        ? 'bg-[#1A1A1A] text-[#D4A843] font-medium' 
                        : 'text-[#A1A1AA] hover:bg-[#121212] hover:text-[#F5F5F5]'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#737373]">
                      {cmd.category}
                    </span>
                    <span>{cmd.title}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Right panel: Preview */}
          <div className="w-1/2 bg-[#0C0C0C] p-4 flex flex-col justify-between">
            {activeItem ? (
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A843] border border-[#D4A843]/30 px-1.5 py-0.5 rounded-sm bg-[#D4A843]/5">
                  {activeItem.category}
                </span>
                <h4 className="text-sm font-bold text-[#F5F5F5] font-sans">{activeItem.title}</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">{activeItem.description}</p>
                <div className="pt-2 border-t border-[#2A2A2A] text-[10px] font-mono text-[#737373] space-y-1">
                  <div>Destination: <span className="text-emerald-500">{activeItem.href}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-[#737373] h-full flex items-center justify-center">
                Select a command to preview destination
              </div>
            )}
            <div className="border-t border-[#2A2A2A] pt-3 flex items-center justify-between text-[9px] font-mono text-[#737373]">
              <span>Use arrows to navigate, Enter to select</span>
              <span>ESC to exit</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
