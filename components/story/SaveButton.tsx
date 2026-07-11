'use client';

import { useState, useEffect } from 'react';

export default function SaveButton({ slug }: { slug: string }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_stories') || '[]') as string[];
      if (saved.includes(slug)) {
        setTimeout(() => setIsSaved(true), 0);
      }
    } catch {
      // Ignore
    }
  }, [slug]);

  const toggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_stories') || '[]') as string[];
      if (isSaved) {
        const updated = saved.filter((id: string) => id !== slug);
        localStorage.setItem('saved_stories', JSON.stringify(updated));
        setIsSaved(false);
      } else {
        saved.push(slug);
        localStorage.setItem('saved_stories', JSON.stringify(saved));
        setIsSaved(true);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <button
      onClick={toggleSave}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
        isSaved
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          : 'border-border bg-surface-secondary text-text-muted hover:text-text-primary hover:border-text-muted'
      }`}
      aria-label={isSaved ? "Remove from saved" : "Save story"}
      title={isSaved ? "Remove from saved" : "Save story"}
    >
      {isSaved ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
      )}
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}
