'use client';

import React from 'react';
import { mockCMSStories, type CMSStory, type StoryStatus } from '@/utils/cms-data';

interface CMSShellProps {
  children: React.ReactNode;
  selectedId?: string;
}

const statusColors: Record<StoryStatus, string> = {
  draft: 'var(--color-text-tertiary)',
  review: 'var(--color-amber-500)',
  published: 'var(--color-emerald-500)',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CMSShell({ children, selectedId }: CMSShellProps) {
  const [showNewMenu, setShowNewMenu] = React.useState(false);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 140px)',
        background: 'var(--color-surface-primary)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      {/* ─── Sidebar ─────────────────────────── */}
      <aside
        style={{
          width: '280px',
          background: 'var(--color-surface-elevated)',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-amber-500)', letterSpacing: '-0.02em' }}>
                THE BREAKDOWN
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                Content Manager
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                style={{
                  background: 'var(--color-amber-500)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>+</span> New Story
              </button>
              {showNewMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    zIndex: 50,
                    width: '200px',
                    overflow: 'hidden',
                  }}
                  onMouseLeave={() => setShowNewMenu(false)}
                >
                  <button
                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', color: 'var(--color-text-primary)', fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { window.location.href = '/cms/story/new'; }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📰 Blank Story
                  </button>
                  <button
                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', color: 'var(--color-text-primary)', fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { window.location.href = '/cms/story/new?template=explainer'; }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📝 Explainer Template
                  </button>
                  <button
                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', color: 'var(--color-text-primary)', fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { window.location.href = '/cms/story/new?template=data-story'; }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📊 Data Story Template
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              padding: '0 10px',
              gap: '8px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search stories..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                padding: '8px 0',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Story list */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', padding: '0 4px' }}>
            {(['all', 'draft', 'review', 'published'] as const).map((status) => (
              <button
                key={status}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid var(--color-border-subtle)',
                  background: status === 'all' ? 'var(--color-surface-secondary)' : 'transparent',
                  color: 'var(--color-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {mockCMSStories.map((story) => (
            <a
              key={story.id}
              href={`/cms/story/${story.id}`}
              style={{
                display: 'block',
                padding: '12px',
                borderRadius: '8px',
                textDecoration: 'none',
                cursor: 'pointer',
                marginBottom: '4px',
                background: selectedId === story.id ? 'color-mix(in srgb, var(--color-amber-500) 10%, transparent)' : 'transparent',
                border: selectedId === story.id ? '1px solid color-mix(in srgb, var(--color-amber-500) 30%, transparent)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (selectedId !== story.id) {
                  e.currentTarget.style.background = 'var(--color-surface-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== story.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.3,
                  marginBottom: '6px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {story.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: statusColors[story.status],
                    display: 'inline-block',
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>{story.status}</span>
                <span>·</span>
                <span>{story.blocks.length} blocks</span>
                <span>·</span>
                <span>{timeAgo(story.updatedAt)}</span>
              </div>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{mockCMSStories.length} stories</span>
          <span>{mockCMSStories.filter((s) => s.status === 'draft').length} drafts</span>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
