import type { FC } from 'react';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import type { CanonicalTimelineEvent, CanonicalThinker, CanonicalClaim } from '@/types/canonical';

interface InvestigationContentProps {
  claim: EnrichedClaim;
  timelineEvents: CanonicalTimelineEvent[];
  thinkers: CanonicalThinker[];
  relatedClaims: CanonicalClaim[];
  chapterTitle?: string;
  onInvestigateClaim?: (claimId: string) => void;
}

const confidenceColors: Record<string, string> = {
  established: 'bg-emerald-100 text-emerald-700',
  debated: 'bg-amber-100 text-amber-700',
  contested: 'bg-red-100 text-red-700',
};

function editorialQuestion(claim: EnrichedClaim): string | null {
  if (claim.confidence === 'debated') {
    return 'Historians disagree about this claim. The available evidence supports multiple interpretations, and scholarly consensus has not formed.';
  }
  if (claim.confidence === 'contested') {
    return 'This claim is actively contested. Scholars have reached fundamentally different conclusions based on the same body of evidence.';
  }
  if (claim.confidence === 'established') {
    return 'This claim is well-established in the historical literature. Most scholars agree on the core findings, though interpretive nuances remain.';
  }
  return null;
}

export const InvestigationContent: FC<InvestigationContentProps> = ({
  claim,
  timelineEvents,
  thinkers,
  relatedClaims,
  chapterTitle,
  onInvestigateClaim,
}) => {
  const eq = editorialQuestion(claim);

  return (
    <div className="p-6 space-y-8 flex-1 overflow-y-auto">
      {/* Breadcrumb */}
      {chapterTitle && (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400" aria-label="Breadcrumb">
          <span>{chapterTitle}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium truncate">{claim.statement.slice(0, 60)}…</span>
        </nav>
      )}

      {/* Claim Statement */}
      <section>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-gray-900 leading-snug">{claim.statement}</h2>
          <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${confidenceColors[claim.confidence] || 'bg-gray-100 text-gray-600'}`}>
            {claim.confidence}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {claim.evidence.length} evidence reference{claim.evidence.length !== 1 ? 's' : ''}
          {' · '}{claim.sourceIds.length} source{claim.sourceIds.length !== 1 ? 's' : ''}
          {claim.documentIds.length > 0 && <> · {claim.documentIds.length} document{claim.documentIds.length !== 1 ? 's' : ''}</>}
        </p>
      </section>

      {/* Evidence — Why do you say that? */}
      {claim._evidence.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Evidence</h3>
          <div className="space-y-3">
            {claim._evidence.map((ev) => (
              <div key={ev.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${
                    ev.relevance === 'direct' ? 'bg-blue-100 text-blue-700' :
                    ev.relevance === 'supporting' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                  }`}>{ev.relevance}</span>
                  <span className="text-xs text-gray-400">{ev.confidence}% confidence</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{ev.excerpt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Source: {ev.sourceId}
                  {ev.documentId && <> &middot; Document: {ev.documentId}</>}
                  {ev.verifiedAt && <> &middot; Verified: {new Date(ev.verifiedAt).toLocaleDateString()}</>}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Primary Documents — Where did that evidence come from? */}
      {claim._documents.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Primary Documents</h3>
          <div className="space-y-3">
            {claim._documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-sm text-gray-900">{doc.title}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-500">
                  {doc.documentType && (
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">
                      {doc.documentType}
                    </span>
                  )}
                  {doc.date && (
                    <>
                      <span>·</span>
                      <time dateTime={doc.date}>{doc.date}</time>
                    </>
                  )}
                  {doc.sourceId && (
                    <>
                      <span>·</span>
                      <span>Source: {doc.sourceId}</span>
                    </>
                  )}
                  {doc.parties && doc.parties.length > 0 && (
                    <>
                      <span>·</span>
                      <span>Parties: {doc.parties.join(', ')}</span>
                    </>
                  )}
                </div>
                {doc.pdfUrl && (
                  <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    View document →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline — When did this happen? */}
      {timelineEvents.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Timeline</h3>
          <div className="space-y-3">
            {timelineEvents.map((ev) => (
              <div key={ev.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="w-px flex-1 bg-gray-200" />
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-xs text-gray-400">{ev.date}</p>
                  <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Counterarguments — Who disagrees? */}
      {claim.counterArguments.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3">Counterarguments</h3>
          <div className="space-y-2">
            {claim.counterArguments.map((arg, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-gray-800 leading-relaxed">{arg}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Thinkers — Who argues this? */}
      {thinkers.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Thinkers</h3>
          <div className="space-y-3">
            {thinkers.map((t) => (
              <div key={t.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-sm text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.school}</p>
                {t.corePrinciples.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.corePrinciples.map((p, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Editorial Question — Why do historians disagree? */}
      {eq && (
        <section className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-700 mb-2">Why do historians disagree?</h3>
          <p className="text-sm text-gray-800 leading-relaxed">{eq}</p>
        </section>
      )}

      {/* Sources — Where can I read more? */}
      {claim._sources.length > 0 && (() => {
        const primary = claim._sources.filter(s => s.tier === 1);
        const secondary = claim._sources.filter(s => s.tier === 2);
        const supporting = claim._sources.filter(s => s.tier !== 1 && s.tier !== 2);

        return (
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sources</h3>
            
            {primary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Primary Sources</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-emerald-100">
                  {primary.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-50/50 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{s.title}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded font-mono ml-2 bg-green-100 text-green-700">
                        Primary • Tier 1
                      </span>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                           className="flex-shrink-0 ml-2 text-blue-600 hover:underline text-xs font-medium">
                          View Original Document →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {secondary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide">Secondary Sources</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-blue-100">
                  {secondary.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-50/50 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{s.title}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded font-mono ml-2 bg-blue-100 text-blue-700">
                        Secondary • Tier 2
                      </span>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                           className="flex-shrink-0 ml-2 text-blue-600 hover:underline text-xs font-medium">
                          View Secondary Analysis →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {supporting.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Supporting Sources</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-gray-100">
                  {supporting.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-50/50 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{s.title}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded font-mono ml-2 bg-gray-100 text-gray-600">
                        Supporting • Tier {s.tier}
                      </span>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                           className="flex-shrink-0 ml-2 text-blue-600 hover:underline text-xs font-medium">
                          View Source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* Related Claims */}
      {relatedClaims.length > 0 && (
        <section className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Related Claims</h3>
          <div className="space-y-2">
            {relatedClaims.map((rc) => (
              <button
                key={rc.id}
                onClick={() => onInvestigateClaim?.(rc.id)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    rc.confidence === 'established' ? 'bg-emerald-400' :
                    rc.confidence === 'debated' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                  <p className="text-sm text-gray-800 leading-snug">{rc.statement}</p>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
