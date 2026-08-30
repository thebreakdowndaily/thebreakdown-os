'use client';

/**
 * ReaderDashboard — reader library (device-local).
 * TASK-24 — Reader dashboard reuse; no second dashboard. Governed by:
 * TASK-24 §17/§19 (no account required to read content; reuse existing
 * dashboard, extend minimally).
 *
 * All tabs read device-local state (see lib/retention/reader-state.ts):
 * nothing here requires an account. Settings is the only account-aware tab
 * and degrades gracefully when no user is present.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './SessionProvider';
import { UserAvatar } from './UserAvatar';
import { readerState, getReadingHistory } from '@/lib/retention/reader-state';
import { captureEvent } from '@/lib/analytics/capture';
import type { FollowedTopic, SavedStory } from '@/lib/retention/reader-state';
import type { HistoryEntry } from '@/components/narrative/StoryMemoryWriter';

type ReaderTab = 'continue-reading' | 'bookmarks' | 'following' | 'history' | 'settings';

interface TabConfig {
  id: ReaderTab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'continue-reading', label: 'Continue Reading', icon: '📖' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
  { id: 'following', label: 'Following', icon: '👤' },
  { id: 'history', label: 'Reading History', icon: '📚' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function EmptySection({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-12)', color: 'var(--color-text-muted)' }}>
      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>{title}</p>
      <p style={{ fontSize: 'var(--text-sm)' }}>{description}</p>
    </div>
  );
}

function StoryList({ entries, emptyTitle }: { entries: HistoryEntry[]; emptyTitle: string }) {
  if (entries.length === 0) {
    return (
      <EmptySection title={emptyTitle} description="Everything you read appears here, on this device. Nothing is sent to us." />
    );
  }
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', listStyle: 'none', padding: 0, margin: 0 }}>
      {entries.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/story/${item.slug}`}
            style={{
              display: 'block',
              padding: 'var(--spacing-4)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}
          >
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{item.headline}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Opened {new Date(item.readAt).toLocaleDateString()}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SavedList({ saved }: { saved: SavedStory[] }) {
  if (saved.length === 0) {
    return <EmptySection title="No saved stories yet" description="Tap Save on any story to add it to your library. It stays on this device." />;
  }
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', listStyle: 'none', padding: 0, margin: 0 }}>
      {saved.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/story/${item.slug}`}
            style={{
              display: 'block',
              padding: 'var(--spacing-4)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}
          >
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{item.headline}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Saved {new Date(item.savedAt).toLocaleDateString()}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FollowingList({ followed }: { followed: FollowedTopic[] }) {
  if (followed.length === 0) {
    return <EmptySection title="Not following anything yet" description="Follow a topic to see what changes here. Your follows stay on this device." />;
  }
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', listStyle: 'none', padding: 0, margin: 0 }}>
      {followed.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/topic/${item.slug}`}
            style={{
              display: 'block',
              padding: 'var(--spacing-4)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}
          >
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{item.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Following since {new Date(item.followedAt).toLocaleDateString()}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SettingsSection() {
  const { user } = useAuth();

  if (!user) {
    return (
      <EmptySection
        title="Account settings"
        description="Reading, bookmarks and follows work without an account — they live on this device. Settings for your email and notifications need a signed-in account."
      />
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--spacing-6)', color: 'var(--color-text-primary)' }}>Settings</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', marginBottom: 'var(--spacing-6)' }}>
        <UserAvatar name={user.name || user.email || ''} image={user.image} size={48} />
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name || 'Reader'}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{user.email}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Email notifications</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Weekly digest</span>
        </label>
      </div>
    </div>
  );
}

export function ReaderDashboard() {
  const [activeTab, setActiveTab] = useState<ReaderTab>('continue-reading');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saved, setSaved] = useState<SavedStory[]>([]);
  const [followed, setFollowed] = useState<FollowedTopic[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = readerState();
    const hist = getReadingHistory();
    // device-local storage is an external system; the one-time read is
    // populated after hydration so the SSR "Loading" render stays consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(hist.length > 1 ? hist.slice(1, 8) : hist.slice(0, 8));
    setSaved(state.getSavedStories().slice(0, 12));
    setFollowed(state.getFollowedTopics().slice(0, 12));
    setReady(true);
    captureEvent('reader_dashboard_opened', { tab: 'overview' });
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)', background: 'var(--color-bg-primary)' }}>
      <aside style={{ width: 240, borderRight: '1px solid var(--color-border-default)', padding: 'var(--spacing-4)', flexShrink: 0 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                captureEvent('reader_dashboard_opened', { tab: tab.id });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-2) var(--spacing-3)',
                background: activeTab === tab.id ? 'color-mix(in srgb, var(--color-brand-400) 10%, transparent)' : 'none',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: activeTab === tab.id ? 'var(--color-brand-400)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 'var(--spacing-8)', overflowY: 'auto' }}>
        {!ready && <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading your library…</p>}
        {ready && activeTab === 'continue-reading' && (
          <section aria-label="Continue reading">
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Continue Reading</h2>
            <StoryList entries={history.filter((h) => h.slug !== saved[0]?.slug)} emptyTitle="Nothing to pick up yet" />
          </section>
        )}
        {ready && activeTab === 'bookmarks' && (
          <section aria-label="Bookmarks">
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Bookmarks</h2>
            <SavedList saved={saved} />
          </section>
        )}
        {ready && activeTab === 'following' && (
          <section aria-label="Following">
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Following</h2>
            <FollowingList followed={followed} />
          </section>
        )}
        {ready && activeTab === 'history' && (
          <section aria-label="Reading history">
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Reading History</h2>
            <StoryList entries={history} emptyTitle="Your reading history is empty" />
          </section>
        )}
        {ready && activeTab === 'settings' && <SettingsSection />}
      </main>
    </div>
  );
}