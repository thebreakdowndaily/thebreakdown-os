'use client';

import { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ListenButton from './ListenButton';
import SaveButton from './SaveButton';

interface ActionBarProps {
  slug: string;
}

function ActionBarContent({ slug }: ActionBarProps) {
  const url = `https://thebreakdown.in/story/${slug}`;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams?.get('mode') || 'standard';

  const setMode = (mode: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (mode === 'standard') {
      params.delete('mode');
    } else {
      params.set('mode', mode);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Story actions">
      <ListenButton />
      <SaveButton slug={slug} />
      <button
        onClick={() => { navigator.clipboard.writeText(url); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-muted hover:text-text-primary hover:border-text-muted text-xs font-medium transition-colors"
        aria-label="Copy link"
        title="Copy link"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        Copy
      </button>

      <button
        onClick={() => { window.print(); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-muted hover:text-text-primary hover:border-text-muted text-xs font-medium transition-colors"
        aria-label="Print"
        title="Print"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        Print
      </button>

      <button
        onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(url)}`, '_blank', 'noopener'); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-muted hover:text-text-primary hover:border-text-muted text-xs font-medium transition-colors"
        aria-label="Share on X"
        title="Share on X"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        Share
      </button>

      <div className="flex items-center gap-1 ml-4 border-l border-border pl-4">
        <select
          value={currentMode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-surface-secondary border border-border text-text-primary text-xs rounded-lg focus:ring-brand-400 focus:border-brand-400 block px-2.5 py-1.5 appearance-none cursor-pointer"
          aria-label="Reading Mode"
        >
          <option value="quick">Quick Brief (30 seconds)</option>
          <option value="standard">Standard Article (5-7 minutes)</option>
          <option value="deep">Deep Research (15-20 minutes)</option>
          <option value="data">Data Only</option>
          <option value="timeline">Timeline Only</option>
        </select>
      </div>
    </div>
  );
}

export default function ActionBar({ slug }: ActionBarProps) {
  return (
    <Suspense fallback={<div className="h-8" />}>
      <ActionBarContent slug={slug} />
    </Suspense>
  );
}