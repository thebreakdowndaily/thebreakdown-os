'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { ThinkerBlockData, ThinkerArgument, ThinkerCriticism } from '@/types/canonical';
import { useState } from 'react';

export const ThinkerBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    name, school, birthYear, deathYear,
    corePrinciples, arguments: args, criticism, furtherReading
  } = data as unknown as ThinkerBlockData;

  const [activeTab, setActiveTab] = useState<'principles' | 'arguments' | 'criticism' | 'reading'>('principles');

  const tabs = [
    { id: 'principles' as const, label: 'Core Principles' },
    { id: 'arguments' as const, label: `Arguments (${args.length})` },
    { id: 'criticism' as const, label: `Criticism (${criticism.length})` },
    { id: 'reading' as const, label: 'Further Reading' },
  ];

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden my-6">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Thinker</span>
          {school && (
            <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">{school}</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        {(birthYear || deathYear) && (
          <p className="text-sm text-gray-500">{birthYear}{deathYear ? `–${deathYear}` : ''}</p>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-700 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-4">
        {activeTab === 'principles' && (
          <div className="space-y-3">
            {corePrinciples.map((principle, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 pt-0.5">{principle}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'arguments' && (
          <div className="space-y-4">
            {args.map((arg: ThinkerArgument, i: number) => (
              <ArgumentCard key={i} arg={arg} index={i} />
            ))}
          </div>
        )}

        {activeTab === 'criticism' && (
          <div className="space-y-4">
            {criticism.map((crit: ThinkerCriticism, i: number) => (
              <CriticismCard key={i} crit={crit} index={i} />
            ))}
          </div>
        )}

        {activeTab === 'reading' && (
          <ul className="space-y-2">
            {furtherReading.map((book, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{book}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function ArgumentCard({ arg, index }: { arg: ThinkerArgument; index: number }) {
  const [showEvidence, setShowEvidence] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setShowEvidence(!showEvidence)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-500">{index + 1}.</span>
          <span className="text-sm font-medium text-gray-800">{arg.title}</span>
        </div>
        <span className={`text-gray-400 transition-transform ${showEvidence ? 'rotate-180' : ''}`}>▾</span>
      </button>
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600">{arg.summary}</p>
        {showEvidence && arg.supportingEvidence.length > 0 && (
          <div className="mt-2 space-y-2 pl-4 border-l-2 border-purple-200">
            {arg.supportingEvidence.map((ev, j) => (
              <div key={j} className="text-xs text-gray-500">
                <span className="text-purple-600 font-medium">{ev.relevance}</span>: {ev.excerpt}
                <span className="text-gray-400 ml-1">[Source {ev.sourceId.replace('s', '')}]</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CriticismCard({ crit, index }: { crit: ThinkerCriticism; index: number }) {
  const [showCounter, setShowCounter] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setShowCounter(!showCounter)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-500">{index + 1}.</span>
          <span className="text-sm font-medium text-gray-800">{crit.title}</span>
        </div>
        <span className={`text-gray-400 transition-transform ${showCounter ? 'rotate-180' : ''}`}>▾</span>
      </button>
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600">{crit.summary}</p>
        {showCounter && crit.counterarguments.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Counterarguments</p>
            {crit.counterarguments.map((ca, j) => (
              <div key={j} className="text-xs text-gray-500 pl-3 border-l-2 border-red-200">
                <span className="text-red-600 font-medium">{ca.relevance}</span>: {ca.excerpt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
