'use client';

import { useEffect, useCallback } from 'react';
import SearchBar from '@/components/ui/SearchBar';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-[#0A0A0A] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <SearchBar />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-gray-900 rounded border border-gray-700 shrink-0">ESC</kbd>
        </div>
        <div className="p-6 text-center text-sm text-gray-500">
          Start typing to search stories, topics, entities...
        </div>
      </div>
    </div>
  );
}
