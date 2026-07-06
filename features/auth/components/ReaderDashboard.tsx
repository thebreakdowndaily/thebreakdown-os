'use client';

import { useState } from 'react';
import { useAuth } from './SessionProvider';
import { UserAvatar } from './UserAvatar';

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

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-12)', color: 'var(--color-text-muted)' }}>
      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>{title}</p>
      <p style={{ fontSize: 'var(--text-sm)' }}>{description}</p>
    </div>
  );
}

function ContinueReadingSection() {
  return (
    <PlaceholderSection
      title="Continue Reading"
      description="Stories you've started will appear here. Pick up where you left off."
    />
  );
}

function BookmarksSection() {
  return (
    <PlaceholderSection
      title="Bookmarks"
      description="Save stories to read later. Your bookmarks will appear here."
    />
  );
}

function FollowingSection() {
  return (
    <PlaceholderSection
      title="Following"
      description="Follow topics, entities, and authors to get updates on new stories."
    />
  );
}

function HistorySection() {
  return (
    <PlaceholderSection
      title="Reading History"
      description="Your recently read stories will appear here."
    />
  );
}

function SettingsSection() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--spacing-6)', color: 'var(--color-text-primary)' }}>Settings</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', marginBottom: 'var(--spacing-6)' }}>
        {user && <UserAvatar name={user.name || user.email || ''} image={user.image} size={48} />}
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name || 'Reader'}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{user?.email}</div>
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

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)', background: 'var(--color-bg-primary)' }}>
      <aside style={{ width: 240, borderRight: '1px solid var(--color-border-default)', padding: 'var(--spacing-4)', flexShrink: 0 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); }}
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
        {activeTab === 'continue-reading' && <ContinueReadingSection />}
        {activeTab === 'bookmarks' && <BookmarksSection />}
        {activeTab === 'following' && <FollowingSection />}
        {activeTab === 'history' && <HistorySection />}
        {activeTab === 'settings' && <SettingsSection />}
      </main>
    </div>
  );
}
