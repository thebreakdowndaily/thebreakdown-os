'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { DocumentBlockData, DocumentAnnotation } from '@/types/canonical';
import { useState, useCallback } from 'react';

const docTypeLabels: Record<string, string> = {
  treaty: 'Treaty', speech: 'Speech', resolution: 'Resolution',
  letter: 'Letter', report: 'Report', constitution: 'Constitution',
  memorandum: 'Memorandum', transcript: 'Transcript',
};

const annotationBadge: Record<string, string> = {
  explanation: 'bg-blue-100 text-blue-700',
  context: 'bg-amber-100 text-amber-700',
  critique: 'bg-red-100 text-red-700',
  definition: 'bg-green-100 text-green-700',
};

const annotationBorder: Record<string, string> = {
  explanation: 'border-blue-300',
  context: 'border-amber-300',
  critique: 'border-red-300',
  definition: 'border-green-300',
};

export const DocumentBlock: FC<BlockComponentProps> = ({ id, data }) => {
  const {
    title, documentType, date, parties, sections, annotations,
    linkedClaims, linkedEntities, sourceId, pdfUrl,
  } = data as unknown as DocumentBlockData;

  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [facsimileOpen, setFacsimileOpen] = useState(false);

  const activeSections = sections.filter(s => !activeSection || s.id === activeSection);

  const getAnnotations = (sectionId: string): DocumentAnnotation[] =>
    annotations.filter(a => a.sectionId === sectionId);

  const dispatchInvestigation = useCallback((claimId: string) => {
    window.dispatchEvent(new CustomEvent('open-investigation', { detail: claimId }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && facsimileOpen) {
      setFacsimileOpen(false);
    }
  }, [facsimileOpen]);

  return (
    <div
      id={`document-${id}`}
      className="border-2 border-gray-200 rounded-xl overflow-hidden my-6"
      data-visual-block="document"
      onKeyDown={handleKeyDown}
    >
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Primary Document</span>
          <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-600">
            {docTypeLabels[documentType] || documentType}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
          {date && <time dateTime={date}>{date}</time>}
          {parties && parties.length > 0 && <span>Parties: {parties.join(', ')}</span>}
          {sourceId && (
            <span>
              Source:{' '}
              <span className="font-medium">{sourceId}</span>
            </span>
          )}
        </div>
      </div>

      {pdfUrl && (
        <div className="border-b border-gray-200">
          <div className="px-5 py-3 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Facsimile</p>
            <div
              className="relative rounded-lg border border-gray-200 bg-white overflow-hidden cursor-pointer group"
              onClick={() => setFacsimileOpen(true)}
              role="button"
              tabIndex={0}
              aria-label={`Open facsimile of ${title}`}
              onKeyDown={(e) => { if (e.key === 'Enter') setFacsimileOpen(true); }}
            >
              <div className="aspect-[3/4] max-h-[260px] bg-gradient-to-br from-amber-50 to-amber-100/40 flex items-center justify-center p-4">
                <div className="w-full max-w-[200px]">
                  <div className="bg-white rounded-t-sm border border-amber-200 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-amber-700/10 border-b border-amber-200" />
                    <div className="px-3 py-2.5 space-y-1.5">
                      <div className="h-2 w-3/4 rounded bg-amber-200/60" />
                      <div className="h-1.5 w-1/2 rounded bg-amber-200/40" />
                      <div className="h-px bg-amber-200/60 my-1.5" />
                      <div className="h-1.5 w-full rounded bg-amber-200/40" />
                      <div className="h-1.5 w-5/6 rounded bg-amber-200/40" />
                      <div className="h-1.5 w-2/3 rounded bg-amber-200/40" />
                      <div className="h-1.5 w-4/5 rounded bg-amber-200/40" />
                      <div className="h-1.5 w-3/4 rounded bg-amber-200/40" />
                    </div>
                  </div>
                  <div className="bg-gray-100 border-x border-b border-amber-200 rounded-b-sm px-3 py-1.5 text-center">
                    <p className="text-[10px] text-gray-500 truncate">{title}</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-blue-700 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                  Open facsimile
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {sections.length > 1 && (
        <div className="flex overflow-x-auto border-b border-gray-200 bg-white" role="tablist">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              role="tab"
              aria-selected={activeSection === s.id}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeSection === s.id
                  ? 'border-blue-500 text-blue-700 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {s.heading}
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {activeSections.map((section) => {
          const sectionAnnotations = getAnnotations(section.id);
          const sectionContext = sectionAnnotations.filter(a => a.type === 'context');
          const otherAnnotations = sectionAnnotations.filter(a => a.type !== 'context');
          const isHighlighted = section.annotationIds?.includes('highlight');
          return (
            <div key={section.id} className={`px-5 py-4 ${isHighlighted ? 'bg-amber-50/50' : ''}`}>
              {sections.length === 1 && (
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.heading}</h4>
              )}
              {isHighlighted && (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700 border border-amber-200 mb-2">Highlighted excerpt</span>
              )}
              {sectionContext.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-600">Context</span>
                  {sectionContext.map((a) => (
                    <p key={a.id} className="text-sm text-amber-800 mt-1">{a.text}</p>
                  ))}
                </div>
              )}
              <div className="flex flex-col lg:flex-row lg:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
                {showAnnotations && otherAnnotations.length > 0 && (
                  <div className="mt-4 lg:mt-0 lg:w-72 shrink-0 space-y-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Annotations</span>
                    {otherAnnotations.map((a) => (
                      <div key={a.id} className={`text-xs p-3 rounded-lg border ${annotationBorder[a.type] || 'border-gray-200'} ${annotationBadge[a.type] || ''}`}>
                        <span className="font-semibold capitalize">{a.type}</span>
                        <p className="mt-1 opacity-80">{a.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showAnnotations}
            onChange={() => setShowAnnotations(!showAnnotations)}
            className="rounded"
          />
          Show Annotations
        </label>
        {linkedClaims && linkedClaims.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500">Supports:</span>
            {linkedClaims.map((claimId) => (
              <button
                key={claimId}
                onClick={() => dispatchInvestigation(claimId)}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title={`Explore claim: ${claimId}`}
              >
                {claimId.split('.').pop()?.replace(/-/g, ' ') || claimId}
              </button>
            ))}
          </div>
        )}
        {linkedEntities && linkedEntities.length > 0 && (
          <span className="text-sm text-purple-600">
            Mentions {linkedEntities.join(', ')}
          </span>
        )}
        {sourceId && (
          <span className="text-xs text-gray-400 ml-auto">Archive ref: {sourceId.replace('s', 'Source ')}</span>
        )}
      </div>

      {facsimileOpen && pdfUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col"
          onClick={() => setFacsimileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Facsimile: ${title}`}
        >
          <div
            className="relative flex-1 flex flex-col w-full max-w-5xl mx-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/90 truncate">{title}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFacsimileOpen(false);
                    document.getElementById(`document-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="text-xs px-3 py-1.5 rounded bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                >
                  Return to story
                </button>
                <button
                  onClick={() => setFacsimileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white text-sm"
                  aria-label="Close facsimile"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full rounded-lg bg-white min-h-[60vh]"
              title={`Facsimile: ${title}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
