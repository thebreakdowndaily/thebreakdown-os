import React from 'react';
import type { DocumentaryEvidenceData } from './types';

export default function DocumentaryEvidenceBlock({
  source,
  date,
  documentType,
  title,
  extract,
  significance,
  url,
}: DocumentaryEvidenceData) {
  return (
    <figure
      aria-labelledby={`doc-heading-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="my-8 p-6 sm:p-7 rounded-2xl bg-[#111111] border-l-4 border-l-[#FFD900] border-y border-r border-neutral-800 shadow-lg"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#FFD900] bg-[#FFD900]/10 px-2 py-0.5 rounded border border-[#FFD900]/30">
            {documentType}
          </span>
          <span className="text-xs font-mono text-neutral-400">
            Date: {date}
          </span>
        </div>
        <span className="text-xs font-mono text-neutral-400">
          Source: {source}
        </span>
      </header>

      <h4
        id={`doc-heading-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="text-lg font-bold text-white mb-3"
      >
        {title}
      </h4>

      {/* Documentary Extract Box */}
      <blockquote className="p-4 sm:p-5 rounded-xl bg-[#0A0A0A] border border-neutral-800 font-serif text-sm sm:text-base text-neutral-200 leading-relaxed italic mb-4">
        &ldquo;{extract}&rdquo;
      </blockquote>

      <figcaption className="text-xs text-neutral-300 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong className="text-neutral-400 uppercase tracking-wider font-mono text-[11px] block sm:inline sm:mr-1">
            Institutional Significance:
          </strong>
          {significance}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-[#FFD900] hover:underline flex-shrink-0"
          >
            Inspect Primary Record &rarr;
          </a>
        )}
      </figcaption>
    </figure>
  );
}
