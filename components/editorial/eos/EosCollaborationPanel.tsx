'use client';

import React from 'react';
import type { ResearchDossier } from '@/types/editorial-newsroom';

export default function EosCollaborationPanel({
  dossier,
  storyId,
  currentUser,
}: {
  dossier: ResearchDossier;
  storyId: string;
  currentUser: string;
}) {
  const [notes, setNotes] = React.useState(dossier.notes);
  const [body, setBody] = React.useState('');
  const [mentions, setMentions] = React.useState('');

  const addNote = () => {
    if (!body.trim()) return;
    const now = new Date().toISOString();
    setNotes(prev => [
      ...prev,
      {
        id: `note-${String(Date.now())}`,
        dossierId: dossier.id,
        authorId: currentUser,
        body: body.trim(),
        mentions: mentions.split(',').map(m => m.trim()).filter(Boolean),
        createdAt: now,
      },
    ]);
    setBody('');
    setMentions('');
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
        Collaboration · {storyId}
      </h3>
      <div className="mb-4">
        <textarea
          aria-label="New note"
          value={body}
          onChange={e => { setBody(e.target.value); }}
          placeholder="Shared research note, question, or review request…"
          rows={3}
          className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 resize-y"
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            aria-label="Mentions (comma separated)"
            value={mentions}
            onChange={e => { setMentions(e.target.value); }}
            placeholder="Mention editors (comma separated)"
            className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300"
          />
          <button
            type="button"
            onClick={addNote}
            className="rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-gray-950 hover:bg-amber-400"
          >
            Add note
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {notes.map(n => (
          <li key={n.id} className="rounded bg-gray-950/50 border border-gray-800 p-3 text-sm text-gray-300">
            <div>{n.body}</div>
            <div className="mt-1 text-xs text-gray-500 font-mono">
              {n.authorId} · {new Date(n.createdAt).toLocaleString()}
              {n.mentions.length > 0 ? ` · mentions ${n.mentions.join(', ')}` : ''}
            </div>
          </li>
        ))}
        {notes.length === 0 ? <li className="text-sm text-gray-500">No notes yet.</li> : null}
      </ul>
    </div>
  );
}
