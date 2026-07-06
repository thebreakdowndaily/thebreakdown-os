'use client';

import { useAuth } from '@/features/auth/components/SessionProvider';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { UserAvatar } from '@/features/auth/components/UserAvatar';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-8)', color: 'var(--color-text-primary)' }}>Settings</h1>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
          {user && <UserAvatar name={user.name || user.email || ''} image={user.image} size={48} />}
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name || 'Reader'}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{user?.email}</div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Preferences</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Email notifications for new stories</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Weekly newsletter</span>
          </label>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Account</h2>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>
            Manage your account settings and connected services.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <button
              style={{ padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-brand-400)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}
              onClick={() => { alert('Password change coming soon'); }}
            >
              Change Password
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
