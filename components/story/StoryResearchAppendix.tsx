import type { ResearchAppendixPresentation } from '@/lib/story/presentation-model';

interface StoryResearchAppendixProps {
  research?: ResearchAppendixPresentation;
}

export function StoryResearchAppendix({ research }: StoryResearchAppendixProps) {
  if (!research) return null;

  const { claims, sources, faq, versionHistory } = research;
  if ((!claims || claims.length === 0) && (!sources || sources.length === 0) && (!faq || faq.length === 0)) {
    return null;
  }

  return (
    <section id="research-appendix" className="my-12 pt-10 border-t border-neutral-800/80 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white">Research & Evidence Appendix</h3>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            Complete provenance, source claims, methodology, and verification audit ledger.
          </p>
        </div>
      </div>

      {/* Claims Ledger */}
      {claims && claims.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
            Claims Assessed ({claims.length})
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {claims.map((claim) => {
              const badge =
                claim.status === 'supported'
                  ? { label: 'Supported', bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' }
                  : claim.status === 'mixed'
                  ? { label: 'Mixed', bg: 'bg-amber-950/60 text-amber-400 border-amber-800/40' }
                  : claim.status === 'not_supported'
                  ? { label: 'Not Supported', bg: 'bg-red-950/60 text-red-400 border-red-800/40' }
                  : { label: 'Unverified', bg: 'bg-neutral-900 text-neutral-400 border-neutral-800' };

              return (
                <article key={claim.id} aria-labelledby={`claim-title-${claim.id}`} className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p id={`claim-title-${claim.id}`} className="text-sm font-semibold text-white leading-snug">{claim.statement}</p>
                  {claim.explanation && <p className="text-xs text-neutral-300 leading-relaxed">{claim.explanation}</p>}
                  {claim.sources && claim.sources.length > 0 && (
                    <div className="pt-2 text-xs text-neutral-400">
                      <span className="font-mono text-[10px] uppercase font-bold text-neutral-400 block">Sources:</span>
                      {claim.sources.map((s, i) => (
                        <span key={i} className="inline-block mr-3">
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                              {s.title}
                            </a>
                          ) : (
                            s.title
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources List */}
      {sources && sources.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
            Cited Sources ({sources.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((src, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-neutral-900/30 border border-neutral-800/60 flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-sm font-medium text-white">{src.title}</h5>
                  {src.tierLabel && (
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {src.tierLabel}
                    </span>
                  )}
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] rounded text-xs text-emerald-400 hover:text-emerald-300 font-mono underline shrink-0"
                  >
                    View Source ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Accordion */}
      {faq && faq.length > 0 && (
        <div className="space-y-4" id="faq">
          <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
            Frequently Asked Questions
          </h4>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details key={i} className="group p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                <summary className="font-semibold text-sm text-white cursor-pointer list-none flex items-center justify-between">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="text-neutral-400 group-open:rotate-180 transition-transform font-mono text-xs">▼</span>
                </summary>
                <p className="mt-3 text-xs md:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Revision History */}
      {versionHistory && versionHistory.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-neutral-800/60">
          <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-neutral-400">
            Substantive Revision History
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-mono">
            {versionHistory.map((v, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-neutral-400 shrink-0">{v.date}</span>
                <span className="text-neutral-300">{v.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
