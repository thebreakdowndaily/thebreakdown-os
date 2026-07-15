'use client';

import type { FC } from 'react';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import { useState } from 'react';

export const ClaimRegistrySection: FC<{ claims: EnrichedClaim[] }> = ({ claims }) => {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Claims Registry</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {claims.length} claim{claims.length !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Every factual claim made in this content is registered, evidence-backed, and reusable across the platform.
      </p>
      <div className="space-y-3">
        {claims.map((claim) => {
          const isExpanded = expandedClaim === claim.id;
          const confidenceStyle = claim.confidence === 'established' ? 'bg-green-100 text-green-700' :
            claim.confidence === 'debated' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

          return (
            <div key={claim.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${confidenceStyle}`}>
                      {claim.confidence}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{claim.id}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{claim.statement}</p>
                </div>
                <span className={`text-gray-400 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {claim._evidence.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Evidence ({claim._evidence.length})</h4>
                      <div className="space-y-2">
                        {claim._evidence.map((ev, i) => (
                          <div key={i} className="text-xs pl-3 border-l-2 border-blue-200 py-1">
                            <span className={`font-medium ${
                              ev.relevance === 'direct' ? 'text-green-600' :
                              ev.relevance === 'supporting' ? 'text-blue-600' : 'text-gray-500'
                            }`}>{ev.relevance}</span>
                            <p className="text-gray-700 mt-0.5">{ev.excerpt}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-gray-400">Source: {ev.sourceId}</span>
                              {ev.confidence && (
                                <span className="text-gray-400">Confidence: {Math.round(ev.confidence * 100)}%</span>
                              )}
                              {ev.verifiedAt && (
                                <span className="text-gray-400">Verified: {ev.verifiedAt}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim._sources.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Sources</h4>
                      <div className="space-y-1">
                        {claim._sources.map((s, i) => (
                          <div key={i} className="text-xs flex items-center gap-2">
                            <span className={`px-1 py-0.5 rounded ${
                              s.tier <= 2 ? 'bg-green-100 text-green-700' :
                              s.tier <= 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>Tier {s.tier}</span>
                            <span className="text-gray-700">{s.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim._documents.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Documents</h4>
                      <div className="space-y-1">
                        {claim._documents.map((d, i) => (
                          <p key={i} className="text-xs text-gray-700">{d.title} ({d.documentType})</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim._concepts.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Concepts</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {claim._concepts.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                            {c?.term || 'Unknown'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim.appearsIn.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Appears In</h4>
                      <div className="space-y-1">
                        {claim.appearsIn.map((a, i) => (
                          <p key={i} className="text-xs text-gray-600">
                            {a.contentType}: {a.contentTitle}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim.counterArguments.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Counterarguments</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {claim.counterArguments.map((ca, i) => (
                          <li key={i} className="text-xs text-gray-600">{ca}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
