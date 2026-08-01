'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Fix } from '@/types/canonical';
import { MemoryWorkspaceAdapter, DossierExportPackage } from '@/lib/workspace/workspace-store';

interface ResearchWorkspaceViewProps {
  fixes: Fix[];
}

export default function ResearchWorkspaceView({ fixes }: ResearchWorkspaceViewProps) {
  const [adapter] = useState(() => new MemoryWorkspaceAdapter());
  const [workspaceState, setWorkspaceState] = useState(() => adapter.getState());
  const [activeTab, setActiveTab] = useState<'collections' | 'comparison' | 'notes' | 'dossier'>('collections');
  
  // Note/Tag Inputs
  const [noteInput, setNoteInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedFixId, setSelectedFixId] = useState<string>(fixes[0]?.id || '');

  const activeCollection = workspaceState.collections[0];

  const driftReport = useMemo(() => {
    return adapter.detectDrift(activeCollection?.id || '', fixes);
  }, [adapter, activeCollection, fixes]);

  const dossierPackage: DossierExportPackage = useMemo(() => {
    return adapter.generateDossier(activeCollection?.id || '', fixes);
  }, [adapter, activeCollection, fixes, workspaceState]);

  const handleAddNote = () => {
    if (!noteInput.trim() || !selectedFixId) return;
    adapter.addNote(selectedFixId, noteInput.trim());
    setWorkspaceState(adapter.getState());
    setNoteInput('');
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !selectedFixId) return;
    adapter.addTag(selectedFixId, tagInput.trim());
    setWorkspaceState(adapter.getState());
    setTagInput('');
  };

  return (
    <div className="space-y-8 text-gray-100 font-sans">
      {/* Top Workspace Bar */}
      <section aria-labelledby="workspace-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                Schema v{workspaceState.schemaVersion}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                0 Canonical Mutations
              </span>
            </div>
            <h2 id="workspace-heading" className="text-2xl font-bold text-gray-100">
              {activeCollection?.name || 'Research Workspace'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">{activeCollection?.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'collections' ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Collections ({workspaceState.collections.length})
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'comparison' ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Side-by-Side Matrix
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'notes' ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Notes ({workspaceState.notes.length}) & Tags ({workspaceState.tags.length})
            </button>
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'dossier' ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Export Dossier
            </button>
          </div>
        </div>

        {/* Drift Detection Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 flex-wrap gap-2">
          <span>Canonical Drift Status: <strong className="text-emerald-400">All saved objects synchronized</strong></span>
          <span className="font-mono text-[11px] text-gray-400">
            Last Updated: {new Date(workspaceState.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      </section>

      {/* Tab 1: Saved Collections & Reading List */}
      {activeTab === 'collections' && (
        <section aria-labelledby="collections-tab-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <h3 id="collections-tab-heading" className="text-lg font-bold text-gray-100 border-b border-gray-800 pb-2">
              Collection Items ({activeCollection?.fixIds.length || 0})
            </h3>
            <div className="space-y-4">
              {fixes.filter((f) => activeCollection?.fixIds.includes(f.id)).map((f) => (
                <div key={f.id} className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-mono text-amber-400 font-bold uppercase">{f.primaryCategory}</span>
                      <h4 className="text-base font-bold text-gray-100">{f.title || f.headline}</h4>
                    </div>
                    <Link href={`/fix/${f.slug}`} className="text-xs font-bold text-amber-400 hover:underline">
                      View Surface →
                    </Link>
                  </div>
                  <p className="text-xs text-gray-300">{f.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider border-b border-gray-700/50 pb-2">
                Canonical Drift Monitor
              </h4>
              <div className="space-y-2 text-xs">
                {driftReport.map((d) => (
                  <div key={d.fixId} className="bg-gray-900/60 p-2.5 rounded border border-gray-800">
                    <span className="font-mono text-gray-300 block">{d.fixId}</span>
                    <span className="text-[11px] text-emerald-400">{d.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* Tab 2: Side-by-Side Comparison Matrix */}
      {activeTab === 'comparison' && (
        <section aria-labelledby="matrix-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
          <h3 id="matrix-heading" className="text-lg font-bold text-gray-100 border-b border-gray-700/60 pb-3">
            Side-by-Side Claim & Evidence Comparison Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fixes.map((f) => (
              <div key={f.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-gray-800 pb-2">
                  <span className="text-xs font-mono text-amber-400 uppercase font-bold">{f.id}</span>
                  <h4 className="text-base font-bold text-gray-100">{f.title || f.headline}</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 block">Primary Category:</span>
                    <strong className="text-amber-300 capitalize">{f.primaryCategory}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Evidence Grade:</span>
                    <strong className="text-emerald-400">{f.evidenceGrade}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Time Horizon:</span>
                    <strong className="text-blue-400 capitalize">{f.timeToImpact}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 3: Notes & Tags */}
      {activeTab === 'notes' && (
        <section aria-labelledby="notes-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6">
          <h3 id="notes-heading" className="text-lg font-bold text-gray-100 border-b border-gray-700/60 pb-3">
            Local Annotations & Structured Tags
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Note Form */}
            <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase">Add Private Note</h4>
              <select
                value={selectedFixId}
                onChange={(e) => setSelectedFixId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200"
              >
                {fixes.map((f) => (
                  <option key={f.id} value={f.id}>{f.title || f.headline}</option>
                ))}
              </select>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Record personal research observations..."
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200 h-24"
              />
              <button onClick={handleAddNote} className="bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold px-3 py-1.5 rounded">
                Save Private Note
              </button>
            </div>

            {/* Add Tag Form */}
            <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase">Add Structured Tag</h4>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. #priority-2026, #procurement-reform"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200"
              />
              <button onClick={handleAddTag} className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold px-3 py-1.5 rounded">
                Save Workspace Tag
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Export Dossier */}
      {activeTab === 'dossier' && (
        <section aria-labelledby="dossier-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
          <h3 id="dossier-heading" className="text-lg font-bold text-gray-100 border-b border-gray-700/60 pb-3">
            Compiled Evidence Dossier Package
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-400 font-mono block mb-1">Markdown Dossier Output:</span>
              <pre className="bg-gray-950 p-4 rounded border border-gray-800 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                {dossierPackage.markdownDossier}
              </pre>
            </div>
            <div>
              <span className="text-gray-400 font-mono block mb-1">RIS Bibliography Output:</span>
              <pre className="bg-gray-950 p-4 rounded border border-gray-800 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                {dossierPackage.risBibliography}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
