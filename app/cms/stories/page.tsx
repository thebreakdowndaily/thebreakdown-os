'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockCMSStories } from '@/utils/cms-data';
import type { StoryStatus } from '@/utils/cms-data';

const statusColors: Record<StoryStatus, string> = { draft: 'var(--color-text-tertiary)', review: 'var(--color-amber-500)', published: 'var(--color-emerald-500)' };

export default function CMSStoryListPage() {
  const [filter, setFilter] = useState<StoryStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const stories = mockCMSStories.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Stories</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{mockCMSStories.length} total</p>
        </div>
        <Link href="/cms/story/new" style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>+ New Story</Link>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        {(['all', 'draft', 'review', 'published'] as const).map((status) => (
          <button key={status} onClick={() => { setFilter(status); }} style={{ padding: '6px 14px', borderRadius: '999px', border: `1px solid ${filter === status ? status === 'all' ? 'var(--color-amber-500)' : statusColors[status] : 'var(--color-border-subtle)'}`, background: filter === status ? 'color-mix(in srgb, var(--color-amber-500) 10%, transparent)' : 'transparent', color: filter === status ? 'var(--color-amber-500)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>{status}</button>
        ))}
        <div style={{ flex: 1 }} />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search stories..." style={{ width: '220px', padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit' }} />
      </div>

      <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
        {stories.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>No stories found</div>}
        {stories.map((s) => (
          <Link key={s.id} href={`/cms/story/${s.id}`} style={{ display: 'block', padding: '14px 18px', borderBottom: '1px solid var(--color-border-subtle)', textDecoration: 'none', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-secondary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{s.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[s.status], display: 'inline-block' }} />
                  <span style={{ textTransform: 'capitalize' }}>{s.status}</span>
                  <span>·</span>
                  <span>{s.blocks.length} blocks</span>
                  <span>·</span>
                  <span>Updated {new Date(s.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>{s.slug}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
