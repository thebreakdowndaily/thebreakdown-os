'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb, { BreadcrumbItem } from '../navigation/Breadcrumb';
import CommandPalette from '../navigation/CommandPalette';
import SkipLink from '../accessibility/SkipLink';

interface EditorialHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
}

export default function EditorialHeader({ breadcrumbItems }: EditorialHeaderProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[100] w-full bg-[#0A0A0A] border-b border-[#2A2A2A] px-4 py-1.5" role="banner">
        {/* Skip link for accessibility */}
        <SkipLink />

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs font-mono font-bold tracking-widest text-[#D4A843] uppercase hover:text-white transition-colors"
            >
              THE BREAKDOWN
            </Link>
            <span className="text-[#2A2A2A] text-xs font-mono">|</span>
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setPaletteOpen(true); }}
              className="flex items-center gap-2 px-2.5 py-1 text-[0.7rem] font-mono text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A843]"
              aria-label="Open command palette (press ⌘K)"
            >
              <span>Search / Actions</span>
              <kbd className="text-[9px] text-[#737373] bg-[#0A0A0A] border border-[#2A2A2A] px-1 rounded-sm">⌘K</kbd>
            </button>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => { setPaletteOpen(false); }} />
    </>
  );
}
