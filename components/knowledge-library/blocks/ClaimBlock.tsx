'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { ClaimBlockData, EvidenceRef } from '@/types/canonical';
import { getSource } from '@/lib/knowledge/source-registry';

interface ThreeLayerData {
  documentedFacts?: Array<{ fact: string; sources: string[] }>;
  interpretations?: Array<{ historian: string; school?: string; argument: string }>;
  editorialSynthesis?: string;
  counterArguments?: Array<{ viewpoint: string; argument: string; proponents?: string }>;
}

export const ClaimBlock: FC<BlockComponentProps> = ({ id, data }) => {
  const { statement, confidence, evidence } = data as unknown as ClaimBlockData;
  const threeLayer = data as unknown as ThreeLayerData;
  const hasThreeLayer = Array.isArray(threeLayer.documentedFacts) && threeLayer.documentedFacts.length > 0;

  const badgeColor =
    confidence === 'established' ? 'bg-green-100 text-green-700' :
    confidence === 'debated' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';
  const badgeLabel =
    confidence === 'established' ? 'Established' :
    confidence === 'debated' ? 'Debated' : 'Contested';

  if (!hasThreeLayer) {
    return (
      <div className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 my-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">Claim</p>
        <p className="text-gray-800 font-medium">{statement}</p>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badgeLabel}</span>
          <span className="text-gray-400">{evidence?.length || 0} evidence source{(evidence?.length || 0) !== 1 ? 's' : ''}</span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-investigation', { detail: id }))}
            className="ml-auto px-2 py-0.5 rounded text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors"
            aria-label={`Investigate claim: ${statement.slice(0, 60)}...`}
          >
            Investigate
          </button>
        </div>
        {evidence && evidence.length > 0 && (
          <div className="mt-2 space-y-1">
            {evidence.map((e: EvidenceRef, i: number) => {
              const src = getSource(e.sourceId);
              return (
                <p key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-blue-300">
                  <span className="text-xs uppercase font-medium text-blue-500">{e.relevance}</span>
                  : {e.excerpt}
                  <span className="text-gray-400 ml-1">
                    — {src ? src.title : 'Unknown Source'}
                  </span>
                </p>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg my-6 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Claim</p>
        <p className="text-gray-900 font-semibold text-lg mt-1">{statement}</p>
      </div>

      <div className="divide-y divide-slate-100">
        {threeLayer.documentedFacts && threeLayer.documentedFacts.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 font-bold">✓</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Documented Fact</p>
            </div>
            <div className="space-y-3">
              {threeLayer.documentedFacts.map((f, i) => (
                <div key={i}>
                  <p className="text-sm text-gray-800">{f.fact}</p>
                  {f.sources && f.sources.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sources: {f.sources.map(s => {
                        const src = getSource(s);
                        return src ? src.title : 'Unknown Source';
                      }).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {threeLayer.interpretations && threeLayer.interpretations.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-amber-700 font-semibold">📚</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Historical Interpretation</p>
            </div>
            <div className="space-y-3">
              {threeLayer.interpretations.map((interp, i) => (
                <div key={i}>
                  <p className="text-sm">
                    <span className="font-medium text-gray-800">{interp.historian}</span>
                    {interp.school && <span className="text-xs text-gray-400 ml-1">({interp.school})</span>}
                    <span className="text-gray-700">: {interp.argument}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {threeLayer.editorialSynthesis && (
          <div className="px-5 py-4 bg-violet-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-violet-700 font-semibold">⚖</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Editorial Synthesis</p>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{threeLayer.editorialSynthesis}</p>
          </div>
        )}

        {evidence && evidence.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Evidence</p>
            <div className="space-y-2">
              {evidence.map((e: EvidenceRef, i: number) => {
                const src = getSource(e.sourceId);
                return (
                  <p key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-slate-300">
                    <span className={`text-xs uppercase font-medium ${
                      e.relevance === 'direct' ? 'text-blue-500' :
                      e.relevance === 'supporting' ? 'text-teal-500' : 'text-slate-400'
                    }`}>{e.relevance}</span>
                    : {e.excerpt}
                    <span className="text-gray-400 ml-1">
                      — {src ? src.title : 'Unknown Source'}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {threeLayer.counterArguments && threeLayer.counterArguments.length > 0 && (
          <div className="px-5 py-4 bg-amber-50">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3">Counterarguments</p>
            <div className="space-y-3">
              {threeLayer.counterArguments.map((ca, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-amber-800">{ca.viewpoint}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{ca.argument}</p>
                  {ca.proponents && (
                    <p className="text-xs text-amber-600 mt-0.5">Proponents: {ca.proponents}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 px-5 py-2.5 flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>{badgeLabel}</span>
        <span className="text-xs text-gray-400">{evidence?.length || 0} evidence source{(evidence?.length || 0) !== 1 ? 's' : ''}</span>
        {threeLayer.documentedFacts && <span className="text-xs text-gray-400">{threeLayer.documentedFacts.length} documented fact{threeLayer.documentedFacts.length !== 1 ? 's' : ''}</span>}
        {threeLayer.interpretations && <span className="text-xs text-gray-400">{threeLayer.interpretations.length} scholarly interpretation{threeLayer.interpretations.length !== 1 ? 's' : ''}</span>}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-investigation', { detail: id }))}
          className="ml-auto px-2 py-0.5 rounded text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors"
          aria-label={`Investigate claim: ${statement.slice(0, 60)}...`}
        >
          Investigate
        </button>
      </div>
    </div>
  );
};