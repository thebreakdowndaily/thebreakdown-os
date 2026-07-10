'use client';

import { useState } from 'react';

interface VersionEntry {
  date: string;
  description: string;
}

interface VersionHistoryProps {
  history: VersionEntry[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function VersionHistory({ history }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const latest = history[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface-secondary text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Updated {latest ? timeAgo(latest.date) : ''}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-72 bg-surface-primary border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-tertiary/50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Version History</h4>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {history.map((entry, i) => (
                <li key={i} className="px-4 py-3 border-b border-border last:border-0">
                  <p className="text-xs text-text-muted font-medium">{timeAgo(entry.date)}</p>
                  <p className="text-sm text-text-primary mt-0.5">{entry.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}