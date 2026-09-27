import React from 'react';
import type { CaseEvidenceCardData } from './types';

export default function CaseEvidenceCardBlock({
  title,
  citation,
  event,
  whatRecordShows,
  accountabilityMechanism,
  legalStatus,
  whatItDoesNotEstablish,
  sources,
}: CaseEvidenceCardData) {
  return (
    <article
      aria-labelledby={`evidence-card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="my-8 p-6 sm:p-7 rounded-2xl bg-[#0F0F0F] border border-neutral-800 shadow-md"
    >
      <header className="border-b border-neutral-800 pb-4 mb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#FFD900] bg-[#FFD900]/10 px-2 py-0.5 rounded border border-[#FFD900]/20 inline-block mb-1.5">
            Verified Case Dossier
          </span>
          <h3
            id={`evidence-card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-xl font-bold text-white tracking-tight"
          >
            {title}
          </h3>
        </div>
        {citation && (
          <span className="text-xs font-mono text-neutral-400">
            {citation}
          </span>
        )}
      </header>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        {/* Event */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <dt className="font-mono text-[11px] uppercase font-bold text-neutral-400 tracking-wider mb-1.5">
            1. The Event
          </dt>
          <dd className="text-neutral-200 leading-relaxed">{event}</dd>
        </div>

        {/* What the Record Shows */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <dt className="font-mono text-[11px] uppercase font-bold text-emerald-400 tracking-wider mb-1.5">
            2. What the Record Shows
          </dt>
          <dd className="text-neutral-200 leading-relaxed">{whatRecordShows}</dd>
        </div>

        {/* Accountability Mechanism */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <dt className="font-mono text-[11px] uppercase font-bold text-sky-400 tracking-wider mb-1.5">
            3. Accountability Mechanism Applied
          </dt>
          <dd className="text-neutral-200 leading-relaxed">{accountabilityMechanism}</dd>
        </div>

        {/* Legal / Administrative Status */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <dt className="font-mono text-[11px] uppercase font-bold text-amber-400 tracking-wider mb-1.5">
            4. Current Legal / Administrative Status
          </dt>
          <dd className="text-neutral-200 leading-relaxed">{legalStatus}</dd>
        </div>
      </dl>

      {/* What It Does Not Establish (Crucial Boundary) */}
      <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs sm:text-sm">
        <dt className="font-mono text-[11px] uppercase font-bold text-red-400 tracking-wider mb-1.5 block">
          5. What This Record Does Not Establish
        </dt>
        <dd className="text-neutral-300 leading-relaxed">{whatItDoesNotEstablish}</dd>
      </div>

      {/* Sources Footer */}
      {sources && sources.length > 0 && (
        <footer className="mt-4 pt-3 border-t border-neutral-850 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-neutral-500 font-bold uppercase text-[10px]">Documented Sources:</span>
          {sources.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]"
            >
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFD900] underline"
                >
                  {s.name}
                </a>
              ) : (
                s.name
              )}
              {s.date && <span className="text-neutral-500">({s.date})</span>}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}
