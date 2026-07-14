'use client';

import type { FC } from 'react';
import type { KnowledgeConcept, Source } from '@/types/canonical';
import type { ChapterLink, EntityLink } from '@/lib/knowledge/knowledge-graph';
import { useState } from 'react';

interface GraphSidebarProps {
  concepts: KnowledgeConcept[];
  relatedConcepts: KnowledgeConcept[];
  relatedChapters: ChapterLink[];
  entityLinks: EntityLink[];
  sources: Source[];
}

type TabId = 'concepts' | 'graph' | 'sources';

export const GraphSidebar: FC<GraphSidebarProps> = ({
  concepts, relatedConcepts, relatedChapters, entityLinks, sources,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('concepts');

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'concepts', label: 'Concepts', count: concepts.length + relatedConcepts.length },
    { id: 'graph', label: 'Connections', count: entityLinks.length + relatedChapters.length },
    { id: 'sources', label: 'Sources', count: sources.length },
  ];

  return (
    <aside className="w-full lg:w-80 shrink-0 border-l border-gray-200 bg-gray-50">
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className="ml-1 text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {activeTab === 'concepts' && (
          <ConceptsPanel concepts={concepts} relatedConcepts={relatedConcepts} />
        )}
        {activeTab === 'graph' && (
          <GraphPanel entityLinks={entityLinks} relatedChapters={relatedChapters} />
        )}
        {activeTab === 'sources' && (
          <SourcesPanel sources={sources} />
        )}
      </div>
    </aside>
  );
};

const categoryColors: Record<string, string> = {
  doctrine: 'bg-indigo-100 text-indigo-700',
  theory: 'bg-purple-100 text-purple-700',
  event: 'bg-red-100 text-red-700',
  movement: 'bg-amber-100 text-amber-700',
  policy: 'bg-blue-100 text-blue-700',
  institution: 'bg-green-100 text-green-700',
  agreement: 'bg-teal-100 text-teal-700',
  idea: 'bg-rose-100 text-rose-700',
  strategy: 'bg-cyan-100 text-cyan-700',
  period: 'bg-gray-100 text-gray-700',
};

function ConceptsPanel({ concepts, relatedConcepts }: { concepts: KnowledgeConcept[]; relatedConcepts: KnowledgeConcept[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (concepts.length === 0 && relatedConcepts.length === 0) {
    return <p className="text-sm text-gray-400">No concepts defined for this chapter.</p>;
  }

  return (
    <div className="space-y-4">
      {concepts.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Core Concepts</h4>
          <div className="space-y-2">
            {concepts.map(c => (
              <ConceptCard key={c.id} concept={c} expanded={expanded === c.id} onToggle={() => setExpanded(expanded === c.id ? null : c.id)} />
            ))}
          </div>
        </div>
      )}
      {relatedConcepts.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Related Concepts</h4>
          <div className="flex flex-wrap gap-1.5">
            {relatedConcepts.map(c => (
              <span key={c.id} className={`px-2 py-1 text-xs rounded-full ${categoryColors[c.category] || 'bg-gray-100 text-gray-600'}`}>
                {c.term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConceptCard({ concept, expanded, onToggle }: { concept: KnowledgeConcept; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors">
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-800">{concept.term}</span>
          <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${categoryColors[concept.category] || 'bg-gray-100 text-gray-600'}`}>
            {concept.category}
          </span>
        </div>
        <span className={`text-gray-400 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-600 leading-relaxed mt-1">{concept.definition}</p>
          {concept.relatedEntityIds.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">
              Related entities: {concept.relatedEntityIds.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function GraphPanel({ entityLinks, relatedChapters }: { entityLinks: EntityLink[]; relatedChapters: ChapterLink[] }) {
  if (entityLinks.length === 0 && relatedChapters.length === 0) {
    return <p className="text-sm text-gray-400">No connections found.</p>;
  }

  return (
    <div className="space-y-4">
      {entityLinks.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Entities ({entityLinks.length})</h4>
          <div className="space-y-1.5">
            {entityLinks.map((link, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200">
                <span className="text-sm text-gray-800 font-medium">{link.entityName}</span>
                <span className="text-xs text-gray-400 capitalize">{link.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {relatedChapters.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Related Chapters ({relatedChapters.length})</h4>
          <div className="space-y-1.5">
            {relatedChapters.map((ch, i) => (
              <div key={i} className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-800">{ch.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ch.summary}</p>
                <p className="text-xs text-blue-500 mt-1">{ch.relationship}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourcesPanel({ sources }: { sources: Source[] }) {
  if (sources.length === 0) {
    return <p className="text-sm text-gray-400">No sources listed.</p>;
  }

  return (
    <div className="space-y-2">
      {sources.map((s, i) => (
        <div key={i} className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800 truncate">{s.title}</p>
          {s.tier && (
            <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${
              s.tier <= 2 ? 'bg-green-100 text-green-700' :
              s.tier <= 3 ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              Tier {s.tier}
            </span>
          )}
          {s.url && (
            <p className="text-xs text-blue-600 truncate mt-0.5">{s.url}</p>
          )}
          {s.accessedAt && (
            <p className="text-xs text-gray-400 mt-0.5">Accessed: {s.accessedAt}</p>
          )}
        </div>
      ))}
    </div>
  );
}
