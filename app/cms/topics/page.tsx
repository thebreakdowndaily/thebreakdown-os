'use client';

import { useState, useEffect } from 'react';
import type { CMSTopic } from '@/utils/cms-types';

function emptyTopic(): CMSTopic {
  return { id: '', name: '', slug: '', description: '', overview: '', image: '', storyIds: [], relatedEntityIds: [], featuredStoryIds: [], countries: [], faq: [], timeline: [], statistics: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export default function CMSTopicsPage() {
  const [topics, setTopics] = useState<CMSTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CMSTopic | null>(null);
  const [draft, setDraft] = useState<CMSTopic>(emptyTopic);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/topics')
      .then(r => r.json())
      .then(res => { setTopics((res as { data: CMSTopic[] }).data || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = topics.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  async function save() {
    if (!draft.name) return;
    if (draft.id) {
      await fetch(`/api/v1/topics/${draft.slug}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } else {
      await fetch('/api/v1/topics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    }
    const res = await fetch('/api/v1/topics').then(r => r.json()) as { data: CMSTopic[] };
    setTopics(res.data || []);
    setEditing(null);
    setDraft(emptyTopic());
  }

  function edit(t: CMSTopic) { setEditing(t); setDraft({ ...t }); }
  async function remove(id: string) {
    const t = topics.find(x => x.id === id);
    if (!t) return;
    await fetch(`/api/v1/topics/${t.slug}`, { method: 'DELETE' });
    const delRes = await fetch('/api/v1/topics').then(r => r.json()) as { data: CMSTopic[] };
    setTopics(delRes.data || []);
    if (editing?.id === id) { setEditing(null); setDraft(emptyTopic()); }
  }

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Topic Manager</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{topics.length} topics</p>
        </div>
        <button onClick={() => { setEditing(null); setDraft(emptyTopic()); }} style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Topic</button>
      </div>

      <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search topics..." style={{ width: '100%', padding: '8px 14px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            {filtered.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>No topics found</div>}
            {filtered.map((t) => (
              <div key={t.id} onClick={() => { edit(t); }} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', background: editing?.id === t.id ? 'color-mix(in srgb, var(--color-amber-500) 8%, transparent)' : 'transparent', transition: 'background 0.1s' }} onMouseEnter={(e) => { if (editing?.id !== t.id) e.currentTarget.style.background = 'var(--color-surface-secondary)'; }} onMouseLeave={(e) => { if (editing?.id !== t.id) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{t.storyIds.length} stories · {t.relatedEntityIds.length} entities · Updated {new Date(t.updatedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {editing !== null || !draft.id ? (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px 0' }}>{draft.id ? 'Edit Topic' : 'New Topic'}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Field label="Name" value={draft.name} onChange={(v) => { setDraft({ ...draft, name: v, slug: v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }); }} />
                <Field label="Slug" value={draft.slug} onChange={(v) => { setDraft({ ...draft, slug: v }); }} mono />
                <TextArea label="Description" value={draft.description} onChange={(v) => { setDraft({ ...draft, description: v }); }} />
                <TextArea label="Overview" value={draft.overview || ''} onChange={(v) => { setDraft({ ...draft, overview: v }); }} />

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>FAQ</label>
                  {draft.faq.map((item, i) => (
                    <div key={i} style={{ marginBottom: '8px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                      <input value={item.question} onChange={(e) => { const faq = [...draft.faq]; faq[i] = { ...faq[i], question: e.target.value }; setDraft({ ...draft, faq }); }} placeholder="Question" style={{ width: '100%', padding: '4px 8px', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '4px' }} />
                      <textarea value={item.answer} onChange={(e) => { const faq = [...draft.faq]; faq[i] = { ...faq[i], answer: e.target.value }; setDraft({ ...draft, faq }); }} placeholder="Answer" style={{ width: '100%', padding: '4px 8px', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '40px' }} />
                      <button onClick={() => { const faq = draft.faq.filter((_, idx) => idx !== i); setDraft({ ...draft, faq }); }} style={{ marginTop: '4px', padding: '2px 8px', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>Remove</button>
                    </div>
                  ))}
                  <button onClick={() => { setDraft({ ...draft, faq: [...draft.faq, { question: '', answer: '' }] }); }} style={{ padding: '4px 12px', border: '1px dashed var(--color-border-subtle)', borderRadius: '6px', background: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>+ Add FAQ</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={save} style={{ padding: '8px 20px', background: 'var(--color-amber-500)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                  {draft.id && <button onClick={() => { remove(draft.id); }} style={{ padding: '8px 16px', border: '1px solid #EF4444', borderRadius: '8px', background: 'none', color: '#EF4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
                  <button onClick={() => { setEditing(null); setDraft(emptyTopic()); }} style={{ padding: '8px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', background: 'none', color: 'var(--color-text-tertiary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              Select or create a topic to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input value={value} onChange={(e) => { onChange(e.target.value); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: mono ? 'var(--font-mono)' : 'inherit', boxSizing: 'border-box' }} />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>{label}</label>
      <textarea value={value} onChange={(e) => { onChange(e.target.value); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '60px' }} />
    </div>
  );
}
