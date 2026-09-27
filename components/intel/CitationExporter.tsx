'use client';

import { useState } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

interface CitationExporterProps {
  storySlug: string;
  storyTitle: string;
}

export function CitationExporter({ storySlug, storyTitle }: CitationExporterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `https://thebreakdown.in/story/${storySlug}`;
    const citation = `The Breakdown. (2026). ${storyTitle}. Retrieved from ${url}`;

    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      captureEvent('citation_exported', { format: 'apa', story_slug: storySlug });
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy citation to clipboard"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-sm font-medium text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      title="Copy standard citation"
    >
      <span aria-hidden="true">{copied ? '✓' : '❝'}</span>
      {copied ? 'Citation Copied' : 'Cite'}
    </button>
  );
}
