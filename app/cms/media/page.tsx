'use client';

import { useState, useEffect } from 'react';
import type { CMSMediaItem } from '@/utils/cms-types';

const TYPE_COLORS: Record<string, string> = { image: '#3B82F6', video: '#EF4444', chart: '#22C55E', document: '#8B5CF6', svg: '#F59E0B', map: '#06B6D4' };

function formatSize(bytes?: number): string {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function CMSMediaPage() {
  const [media, setMedia] = useState<CMSMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [draft, setDraft] = useState<CMSMediaItem | null>(null);

  useEffect(() => {
    fetch('/api/v1/media')
      .then(r => r.json())
      .then(res => { setMedia((res as { data: CMSMediaItem[] }).data || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = media.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (search && !m.caption.toLowerCase().includes(search.toLowerCase()) && !m.alt.toLowerCase().includes(search.toLowerCase()) && !m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  async function saveItem() {
    if (!draft) return;
    if (draft.id) {
      await fetch(`/api/v1/media/${draft.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } else {
      await fetch('/api/v1/media', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    }
    const res = await fetch('/api/v1/media').then(r => r.json()) as { data: CMSMediaItem[] };
    setMedia(res.data || []);
    setDraft(null);
  }

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Media Library</h1><p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{media.length} items</p></div>
        <button onClick={() => { setDraft({ id: '', type: 'image', src: '', alt: '', caption: '', tags: [], credit: '', width: 0, height: 0, fileSize: 0, version: 1, createdAt: '', updatedAt: '' }); }} style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Media</button>
      </div>

      {draft && (
        <div style={{ marginBottom: '20px', padding: '20px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px 0' }}>Add / Edit Media</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Type</label>
              <select value={draft.type} onChange={(e) => { setDraft({ ...draft, type: e.target.value as CMSMediaItem['type'] }); }} style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}>
                {['image', 'video', 'chart', 'document', 'svg', 'map'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Source URL</label>
              <input value={draft.src} onChange={(e) => { setDraft({ ...draft, src: e.target.value }); }} placeholder="/images/..." style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Credit</label>
              <input value={draft.credit} onChange={(e) => { setDraft({ ...draft, credit: e.target.value }); }} placeholder="Photo by..." style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Alt Text</label>
              <input value={draft.alt} onChange={(e) => { setDraft({ ...draft, alt: e.target.value }); }} placeholder="Descriptive alt text for accessibility" style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Caption</label>
              <input value={draft.caption} onChange={(e) => { setDraft({ ...draft, caption: e.target.value }); }} placeholder="Caption" style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Tags (comma-separated)</label>
              <input value={draft.tags.join(', ')} onChange={(e) => { setDraft({ ...draft, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }); }} placeholder="tag1, tag2" style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onClick={saveItem} style={{ padding: '8px 20px', background: 'var(--color-amber-500)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            <button onClick={() => { setDraft(null); }} style={{ padding: '8px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', background: 'none', color: 'var(--color-text-tertiary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); }} style={{ padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}>
          <option value="all">All Types</option>
          {['image', 'video', 'chart', 'document', 'svg', 'map'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search by caption, alt, or tags..." style={{ flex: 1, padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
            No media items found. Click "+ Add Media" to upload your first item.
          </div>
        )}
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => { setDraft({ ...item }); }}
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '10px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = TYPE_COLORS[item.type] || 'var(--color-border-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
          >
            <div style={{ height: '140px', background: 'var(--color-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              {item.type === 'image' && <span>🖼️</span>}
              {item.type === 'video' && <span>🎬</span>}
              {item.type === 'chart' && <span>📊</span>}
              {item.type === 'document' && <span>📄</span>}
              {item.type === 'svg' && <span>🎨</span>}
              {item.type === 'map' && <span>🗺️</span>}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.caption || item.alt || 'Untitled'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: TYPE_COLORS[item.type], padding: '1px 6px', borderRadius: '4px', background: 'color-mix(in srgb, ' + TYPE_COLORS[item.type] + ' 15%, transparent)', textTransform: 'uppercase' }}>{item.type}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{formatSize(item.fileSize)}</span>
                {item.width && item.height && <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{item.width}×{item.height}</span>}
              </div>
              {item.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {item.tags.slice(0, 3).map((tag) => <span key={tag} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>{tag}</span>)}
                  {item.tags.length > 3 && <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>+{item.tags.length - 3}</span>}
                </div>
              )}
              <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>v{item.version} · {new Date(item.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
