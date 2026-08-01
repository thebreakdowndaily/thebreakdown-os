'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Fix, Source, Claim } from '@/types/canonical';
import { FixSearchEngine } from '@/services/fixes/fix-search.service';
import { FixGraphEngine } from '@/services/fixes/fix-graph.service';
import { EvidenceNetworkService } from '@/services/intelligence/evidence-network.service';
import { FixMetadataService } from '@/services/fixes/fix-metadata.service';

interface KnowledgeExplorerViewProps {
  fixes: Fix[];
  allSources?: Source[];
  allClaims?: Claim[];
  initialSearch?: string;
  initialNodeId?: string;
  initialType?: string;
}

export default function KnowledgeExplorerView({
  fixes,
  allSources = [],
  allClaims = [],
  initialSearch = '',
  initialNodeId = '',
  initialType = 'ALL',
}: KnowledgeExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(initialNodeId || (fixes[0]?.id || ''));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([initialNodeId || (fixes[0]?.id || '')]));

  // 1. Perform BM25 Faceted Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return fixes;
    const q = searchQuery.toLowerCase().trim();
    return fixes.filter((f) =>
      (f.title || f.headline || '').toLowerCase().includes(q) ||
      (f.summary || '').toLowerCase().includes(q) ||
      (f.problemStatement || '').toLowerCase().includes(q)
    );
  }, [fixes, searchQuery]);

  // 2. Filter Search Results by Object Type / Category
  const filteredResults = useMemo(() => {
    if (selectedType === 'ALL') return searchResults;
    return searchResults.filter(
      (f) =>
        (f.primaryCategory && f.primaryCategory.toUpperCase() === selectedType) ||
        (f.editorialStatus && f.editorialStatus.toUpperCase() === selectedType)
    );
  }, [searchResults, selectedType]);

  // 3. Resolve Currently Selected Target Fix Object
  const selectedFix = useMemo(() => {
    return fixes.find((f) => f.id === selectedNodeId || f.slug === selectedNodeId) || fixes[0] || null;
  }, [fixes, selectedNodeId]);

  // 4. Derive Graph View & Evidence Network for Selected Node
  const graphEdges = useMemo(() => {
    if (!selectedFix) return [];
    return FixGraphEngine.generateEdges(selectedFix);
  }, [selectedFix]);

  const evidenceChain = useMemo(() => {
    if (!selectedFix) return null;
    return EvidenceNetworkService.analyzeEvidenceNetwork(selectedFix);
  }, [selectedFix]);

  const risCitation = useMemo(() => {
    if (!selectedFix) return '';
    return FixMetadataService.toRISCitation(selectedFix);
  }, [selectedFix]);

  const jsonLdData = useMemo(() => {
    if (!selectedFix) return null;
    return FixMetadataService.toJSONLD(selectedFix);
  }, [selectedFix]);

  const toggleExpandNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="space-y-8 text-gray-100 font-sans">
      {/* Header Search & Faceted Filter Bar */}
      <section aria-labelledby="explorer-search-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
        <h2 id="explorer-search-heading" className="sr-only">Faceted Search & Discovery Controls</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-2/3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, statutory documents, policy interventions, thinkers..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-400 font-mono">Type Filter:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="INSTITUTIONAL">Institutional</option>
              <option value="STATUTORY">Statutory</option>
              <option value="TECHNOLOGICAL">Technological</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Deep Link URL State Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700/50 pt-3 flex-wrap gap-2">
          <span>Results Found: <strong className="text-amber-400">{filteredResults.length} objects</strong></span>
          <span className="font-mono text-[11px] text-gray-400">
            Shareable URL State: <code className="bg-gray-900 px-2 py-0.5 rounded text-amber-300">/explorer?node={selectedFix?.slug || ''}&search={encodeURIComponent(searchQuery)}</code>
          </span>
        </div>
      </section>

      {/* Main Grid: Search Results + Node Traversal + Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (4 Cols): Filtered Knowledge Objects List */}
        <aside className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
            Canonical Objects ({filteredResults.length})
          </h3>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredResults.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedNodeId(f.id);
                  toggleExpandNode(f.id);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 ${
                  selectedFix?.id === f.id
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 uppercase font-bold">{f.primaryCategory}</span>
                  <span className="text-[10px] bg-gray-800 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Grade {f.evidenceGrade}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-100 line-clamp-2">{f.headline || f.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-2">{f.summary}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Column (8 Cols): Relationship Graph & Evidence Inspector */}
        <div className="lg:col-span-8 space-y-8">
          
          {selectedFix ? (
            <>
              {/* Module 1: Node Overview & Details */}
              <section aria-labelledby="node-details-heading" className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700/60 pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider block">
                      Target Node ID: {selectedFix.id}
                    </span>
                    <h2 id="node-details-heading" className="text-2xl font-bold text-gray-100">
                      {selectedFix.title || selectedFix.headline}
                    </h2>
                  </div>
                  <Link href={`/fix/${selectedFix.slug}`} className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 px-3 py-1.5 rounded-lg transition-colors">
                    View Full Fix Surface →
                  </Link>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">{selectedFix.summary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-gray-700/50 pt-4">
                  <div className="bg-gray-900/60 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">Primary Category:</span>
                    <strong className="text-amber-300 font-mono uppercase">{selectedFix.primaryCategory}</strong>
                  </div>
                  <div className="bg-gray-900/60 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">Evidence Grade:</span>
                    <strong className="text-emerald-400 font-mono">{selectedFix.evidenceGrade}</strong>
                  </div>
                  <div className="bg-gray-900/60 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">Time Horizon:</span>
                    <strong className="text-blue-400 font-mono capitalize">{selectedFix.timeToImpact}</strong>
                  </div>
                </div>
              </section>

              {/* Module 2: Progressive Relationship Graph Traversal */}
              <section aria-labelledby="graph-traversal-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
                  <h3 id="graph-traversal-heading" className="text-lg font-bold text-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    Relationship Topology & Edge Taxonomy ({graphEdges.length} Edges)
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    Progressive 1st-Degree Expansion
                  </span>
                </div>

                {graphEdges.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No direct 1st-degree graph edges recorded for this node.</p>
                ) : (
                  <div className="space-y-3">
                    {graphEdges.map((edge) => {
                      const isEvidentiary = ['cites_source', 'supported_by_claim'].includes(edge.edgeType);
                      return (
                        <div key={`${edge.sourceId}-${edge.targetId}-${edge.edgeType}`} className="bg-gray-900/60 p-3.5 rounded-lg border border-gray-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-300 font-bold">{edge.sourceId}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                                isEvidentiary
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              }`}>
                                {isEvidentiary ? 'EVIDENTIARY' : 'STRUCTURAL'}: {edge.edgeType}
                              </span>
                              <span className="font-mono text-gray-300 font-bold">→ {edge.targetId}</span>
                            </div>
                            <span className="text-gray-400 text-[11px]">Direction: {edge.direction}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Module 3: Evidence Web Inspection */}
              {evidenceChain && (
                <section aria-labelledby="evidence-web-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
                    <h3 id="evidence-web-heading" className="text-lg font-bold text-gray-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      Evidence Web & Source Attestation ({evidenceChain.supportingChains.length} Chains)
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                      Tier 1 vs 3 Attestation Depth
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-1">
                      <span className="text-gray-400 block">Supporting Evidence Chains:</span>
                      <strong className="text-emerald-400 text-lg">{evidenceChain.supportingChains.length} Chains</strong>
                    </div>
                    <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-1">
                      <span className="text-gray-400 block">Root Node:</span>
                      <strong className="text-amber-300 text-sm font-mono">{evidenceChain.rootFixId}</strong>
                    </div>
                  </div>
                </section>
              )}

              {/* Module 4: Citation Export (RIS / JSON-LD) */}
              <section aria-labelledby="export-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
                <h3 id="export-heading" className="text-base font-bold text-gray-100 border-b border-gray-700/60 pb-2">
                  Academic Citation Export (RIS / JSON-LD)
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-mono block mb-1">RIS Format (EndNote / Zotero):</span>
                    <pre className="bg-gray-950 p-3 rounded border border-gray-800 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {risCitation}
                    </pre>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <p className="text-xs text-gray-400">Select an object from the list to explore its knowledge topology.</p>
          )}
        </div>
      </div>
    </div>
  );
}
