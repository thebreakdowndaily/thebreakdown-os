'use client';

import { useState, useEffect } from 'react';
import type { CMSTimeline } from '@/utils/cms-types';

function emptyTimeline(): CMSTimeline {
  return { id: '', title: '', description: '', category: '', storyIds: [], entityIds: [], topicIds: [], events: [{ date: '', title: '', description: '' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export default function CMSTimelinesPage() {
  const [timelines, setTimelines] = useState<CMSTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<CMSTimeline>(emptyTimeline);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/timelines')
      .then(r => r.json())
      .then(res => { setTimelines((res as { data: CMSTimeline[] }).data || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = timelines.filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  async function save() {
    if (!draft.title) return;
    if (draft.id) {
      await fetch(`/api/v1/timelines/${draft.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } else {
      await fetch('/api/v1/timelines', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    }
    const res = await fetch('/api/v1/timelines').then(r => r.json()) as { data: CMSTimeline[] };
    setTimelines(res.data || []); setEditing(false); setDraft(emptyTimeline());
  }

  function edit(t: CMSTimeline) { setEditing(true); setDraft({ ...t }); }
  async function remove(id: string) {
    await fetch(`/api/v1/timelines/${id}`, { method: 'DELETE' });
    const delRes = await fetch('/api/v1/timelines').then(r => r.json()) as { data: CMSTimeline[] };
    setTimelines(delRes.data || []);
    if (draft.id === id) { setEditing(false); setDraft(emptyTimeline()); }
  }
  function removeEvent(idx: number) { const events = draft.events.filter((_, i) => i !== idx); setDraft({ ...draft, events }); }

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Timeline Editor</h1><p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{timelines.length} timelines</p></div>
        <button onClick={() => { setEditing(true); setDraft(emptyTimeline()); }} style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Timeline</button>
      </div>

      <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search timelines..." style={{ width: '100%', padding: '8px 14px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            {filtered.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>No timelines found</div>}
            {filtered.map((t) => (
              <div key={t.id} onClick={() => { edit(t); }} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', background: editing && draft.id === t.id ? 'color-mix(in srgb, var(--color-amber-500) 8%, transparent)' : 'transparent' }} onMouseEnter={(e) => { if (!editing || draft.id !== t.id) e.currentTarget.style.background = 'var(--color-surface-secondary)'; }} onMouseLeave={(e) => { if (!editing || draft.id !== t.id) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>{t.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{t.events.length} events · {t.category} · Updated {new Date(t.updatedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {editing ? (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px 0' }}>{draft.id ? 'Edit Timeline' : 'New Timeline'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Title</label>
                    <input value={draft.title} onChange={(e) => { setDraft({ ...draft, title: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Category</label>
                    <input value={draft.category} onChange={(e) => { setDraft({ ...draft, category: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea value={draft.description} onChange={(e) => { setDraft({ ...draft, description: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '50px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Events (drag to reorder)</label>
                  {draft.events.map((ev, i) => (
                    <div key={i} style={{ marginBottom: '8px', padding: '12px', background: 'var(--color-surface-secondary)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Event {i + 1}</span>
                        <button onClick={() => { removeEvent(i); }} style={{ padding: '2px 6px', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>✕</button>
                      </div>
                      <input value={ev.date} onChange={(e) => { const events = [...draft.events]; events[i] = { ...events[i], date: e.target.value }; setDraft({ ...draft, events }); }} placeholder="Date (e.g. Jul 2026)" style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box', marginBottom: '4px' }} />
                      <input value={ev.title} onChange={(e) => { const events = [...draft.events]; events[i] = { ...events[i], title: e.target.value }; setDraft({ ...draft, events }); }} placeholder="Event title" style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '4px' }} />
                      <textarea value={ev.description} onChange={(e) => { const events = [...draft.events]; events[i] = { ...events[i], description: e.target.value }; setDraft({ ...draft, events }); }} placeholder="Description" style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '36px' }} />
                    </div>
                  ))}
                  <button onClick={() => { setDraft({ ...draft, events: [...draft.events, { date: '', title: '', description: '' }] }); }} style={{ padding: '6px 14px', border: '1px dashed var(--color-border-subtle)', borderRadius: '6px', background: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>+ Add Event</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={save} style={{ padding: '8px 20px', background: 'var(--color-amber-500)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                  {draft.id && <button onClick={() => { remove(draft.id); }} style={{ padding: '8px 16px', border: '1px solid #EF4444', borderRadius: '8px', background: 'none', color: '#EF4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
                  <button onClick={() => { setEditing(false); setDraft(emptyTimeline()); }} style={{ padding: '8px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', background: 'none', color: 'var(--color-text-tertiary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              Select or create a timeline to edit events
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
