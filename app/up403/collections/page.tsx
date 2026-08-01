'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUp403Data } from '@/components/up403/data';
import { useCollections } from '@/components/up403/collections';
import { PartyBadge } from '@/components/up403/ui';
import { downloadCsv, downloadJson, buildCitationReport, downloadBlob } from '@/lib/up403/export';

export default function Up403CollectionsPage() {
  const { byId } = useUp403Data();
  const { collections, removeCollection, membersOf, renameCollection } = useCollections();
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Research Collections</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Saved research sets. Stored locally in your browser — export to CSV, JSON or a citation report.
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center">
          <p className="text-sm text-[#A1A1AA]">No collections yet.</p>
          <p className="mt-1 text-xs text-[#6B6B6B]">Run a query and save the results, or save a constituency from its explorer page.</p>
          <Link href="/up403/query" className="mt-4 inline-block rounded-lg bg-[#D4A843] px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
            Open Query Builder
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {collections.map(col => {
            const members = membersOf(col, byId);
            const isOpen = expanded === col.id;
            return (
              <section key={col.id} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#F5F5F5]">{col.name}</h2>
                      <span className="rounded bg-[#1C1C1C] px-2 py-0.5 text-xs text-[#A1A1AA]">{col.memberIds.length} seats</span>
                    </div>
                    {col.note ? <p className="mt-1 text-xs text-[#6B6B6B]">{col.note}</p> : null}
                    <p className="mt-1 text-xs text-[#6B6B6B]">Created {new Date(col.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renaming === col.id ? (
                      <input
                        value={newName}
                        onChange={e => { setNewName(e.target.value); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newName.trim()) {
                            renameCollection(col.id, newName.trim());
                            setRenaming(null);
                          }
                        }}
                        placeholder="New name"
                        className="w-40 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-sm text-[#E5E5E5] outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => { setRenaming(col.id); setNewName(col.name); }}
                        className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#A1A1AA] hover:border-[#D4A843]/40"
                      >
                        Rename
                      </button>
                    )}
                    <button
                      onClick={() => { downloadCsv(members, `collection-${col.name.replace(/\s+/g, '-')}.csv`); }}
                      disabled={members.length === 0}
                      className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#A1A1AA] hover:border-[#22C55E]/40 disabled:opacity-40"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => { downloadJson(members, `collection-${col.name.replace(/\s+/g, '-')}.json`); }}
                      disabled={members.length === 0}
                      className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#A1A1AA] hover:border-[#22C55E]/40 disabled:opacity-40"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => { downloadBlob(new Blob([buildCitationReport(members)], { type: 'text/plain;charset=utf-8' }), `citation-${col.name.replace(/\s+/g, '-')}.txt`); }}
                      disabled={members.length === 0}
                      className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#A1A1AA] hover:border-[#22C55E]/40 disabled:opacity-40"
                    >
                      Citation report
                    </button>
                    <button
                      onClick={() => { removeCollection(col.id); }}
                      className="rounded-lg border border-[#FF3B30]/40 px-3 py-1.5 text-sm text-[#FF6B61] hover:bg-[#FF3B30]/10"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => { setExpanded(isOpen ? null : col.id); }}
                      className="rounded-lg bg-[#D4A843] px-3 py-1.5 text-sm font-semibold text-black hover:opacity-90"
                    >
                      {isOpen ? 'Collapse' : 'View seats'}
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 border-t border-[#232323] pt-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {members.map(rec => (
                        <Link
                          key={rec.canonical_constituency_id}
                          href={`/up403/constituencies/${rec.canonical_constituency_id}`}
                          className="rounded-xl border border-[#232323] bg-[#111111] p-3 transition-colors hover:border-[#D4A843]/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#F5F5F5]">{rec.constituency_name}</span>
                            <span className="text-xs text-[#6B6B6B]">AC-{rec.ac_number}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-[#A1A1AA]">
                            <span>{rec.district}</span>
                            <PartyBadge party={rec.winner_party_2022} />
                          </div>
                        </Link>
                      ))}
                    </div>
                    {members.length === 0 ? <p className="text-sm text-[#6B6B6B]">Members not yet loadable for this collection.</p> : null}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">About collections</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[#A1A1AA]">
          <li>Collections are stored in your browser (<code className="text-[#D4A843]">localStorage</code>) — nothing leaves your machine until you export.</li>
          <li>Every member is a canonical constituency record linked to its evidence and provenance.</li>
          <li>Citation reports include dataset version, verification date and evidence chain for responsible use.</li>
        </ul>
      </section>
    </div>
  );
}
