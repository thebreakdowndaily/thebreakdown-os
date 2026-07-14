'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { DocumentBlockData, DocumentAnnotation } from '@/types/canonical';
import { useState } from 'react';

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

export const DocumentBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    title, documentType, date, parties, sections, annotations,
    linkedClaims, linkedEntities, sourceId
  } = data as unknown as DocumentBlockData;

  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [showAnnotations, setShowAnnotations] = useState(true);

  const activeSections = sections.filter(s => !activeSection || s.id === activeSection);

  const getAnnotations = (sectionId: string): DocumentAnnotation[] =>
    annotations.filter(a => a.sectionId === sectionId);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden my-6">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Primary Document</span>
          <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-600">
            {docTypeLabels[documentType] || documentType}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
          <span>{date}</span>
          {parties && parties.length > 0 && <span>Parties: {parties.join(', ')}</span>}
          <span>Source: {sourceId.replace('s', '')}</span>
        </div>
      </div>

      {sections.length > 1 && (
        <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
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
          return (
            <div key={section.id} className="px-5 py-4">
              {sections.length === 1 && (
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.heading}</h4>
              )}
              <div className="flex flex-col lg:flex-row lg:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
                {showAnnotations && sectionAnnotations.length > 0 && (
                  <div className="mt-4 lg:mt-0 lg:w-72 shrink-0 space-y-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Annotations</span>
                    {sectionAnnotations.map((a) => (
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

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showAnnotations}
            onChange={() => setShowAnnotations(!showAnnotations)}
            className="rounded"
          />
          Show Annotations
        </label>
        {linkedClaims.length > 0 && (
          <span className="text-sm text-blue-600">
            Linked to {linkedClaims.length} claim{linkedClaims.length !== 1 ? 's' : ''}
          </span>
        )}
        {linkedEntities.length > 0 && (
          <span className="text-sm text-purple-600">
            Mentions {linkedEntities.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};
