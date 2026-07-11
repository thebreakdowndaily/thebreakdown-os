'use client';

import { useState } from 'react';
import type { ChapterHeadingData } from './types';

export default function ChapterHeadingBlock({ title, anchorId }: ChapterHeadingData) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); }, 2000);
  };

  return (
    <h2 
      id={anchorId} 
      className="group text-2xl font-bold text-[#F5F5F5] pt-10 mt-10 border-t border-[#2A2A2A] scroll-mt-24 flex items-center gap-3"
    >
      {title}
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-surface-secondary text-text-muted hover:text-text-primary"
        aria-label="Copy link to this section"
        title="Copy link to this section"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        )}
      </button>
    </h2>
  );
}
