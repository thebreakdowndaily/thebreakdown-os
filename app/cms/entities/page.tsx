'use client';

import { useState, useEffect } from 'react';
import type { CMSEntity, EntityType } from '@/utils/cms-types';

const ENTITY_TYPES: EntityType[] = ['person', 'organization', 'policy', 'scheme', 'budget', 'report', 'dataset', 'source', 'country'];

function emptyEntity(): CMSEntity {
  return { id: '', type: 'organization', name: '', slug: '', description: '', aliases: [], image: '', storyCount: 0, evidenceScore: 0, relatedEntityIds: [], relatedStoryIds: [], relatedTopicIds: [], statistics: [], timeline: [], faq: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export default function CMSEntitiesPage() {
  const [entities, setEntities] = useState<CMSEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CMSEntity | null>(null);
  const [draft, setDraft] = useState<CMSEntity>(emptyEntity);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');

  useEffect(() => {
    fetch('/api/v1/entities')
      .then(r => r.json())
      .then(res => { setEntities((res as { data: CMSEntity[] }).data || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = entities.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  async function save() {
    if (!draft.name) return;
    if (draft.id) {
      await fetch(`/api/v1/entities/${draft.slug}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } else {
      await fetch('/api/v1/entities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    }
    const res = await fetch('/api/v1/entities').then(r => r.json()) as { data: CMSEntity[] };
    setEntities(res.data || []); setEditing(null); setDraft(emptyEntity());
  }

  function edit(e: CMSEntity) { setEditing(e); setDraft({ ...e }); }
  async function remove(id: string) {
    const e = entities.find(x => x.id === id);
    if (!e) return;
    await fetch(`/api/v1/entities/${e.slug}`, { method: 'DELETE' });
    const delRes = await fetch('/api/v1/entities').then(r => r.json()) as { data: CMSEntity[] };
    setEntities(delRes.data || []);
    if (editing?.id === id) { setEditing(null); setDraft(emptyEntity()); }
  }

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Entity Manager</h1><p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{entities.length} entities</p></div>
        <button onClick={() => { setEditing(null); setDraft(emptyEntity()); }} style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Entity</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as EntityType | 'all'); }} style={{ padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}>
          <option value="all">All Types</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search entities or aliases..." style={{ flex: 1, padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            {filtered.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>No entities found</div>}
            {filtered.map((e) => (
              <div key={e.id} onClick={() => { edit(e); }} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', background: editing?.id === e.id ? 'color-mix(in srgb, var(--color-amber-500) 8%, transparent)' : 'transparent' }} onMouseEnter={(ev) => { if (editing?.id !== e.id) ev.currentTarget.style.background = 'var(--color-surface-secondary)'; }} onMouseLeave={(ev) => { if (editing?.id !== e.id) ev.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>{e.name}</div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'var(--color-surface-secondary)', textTransform: 'capitalize' }}>{e.type}</span>
                  <span>{e.aliases.length > 0 ? e.aliases.join(', ') : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {draft.name !== '' || editing !== null ? (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px 0' }}>{draft.id ? 'Edit Entity' : 'New Entity'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Type</label>
                    <select value={draft.type} onChange={(e) => { setDraft({ ...draft, type: e.target.value as EntityType }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                      {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Slug</label>
                    <input value={draft.slug} onChange={(e) => { setDraft({ ...draft, slug: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Name</label>
                  <input value={draft.name} onChange={(e) => { setDraft({ ...draft, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || draft.slug }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea value={draft.description} onChange={(e) => { setDraft({ ...draft, description: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '60px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Aliases (comma-separated)</label>
                  <input value={draft.aliases.join(', ')} onChange={(e) => { setDraft({ ...draft, aliases: e.target.value.split(',').map((a) => a.trim()).filter(Boolean) }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={save} style={{ padding: '8px 20px', background: 'var(--color-amber-500)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                  {draft.id && <button onClick={() => { remove(draft.id); }} style={{ padding: '8px 16px', border: '1px solid #EF4444', borderRadius: '8px', background: 'none', color: '#EF4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
                  <button onClick={() => { setEditing(null); setDraft(emptyEntity()); }} style={{ padding: '8px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', background: 'none', color: 'var(--color-text-tertiary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Select or create an entity to edit</div>
          )}
        </div>
      </div>
    </div>
  );
}
