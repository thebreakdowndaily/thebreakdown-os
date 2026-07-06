'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './SessionProvider';
import { UserAvatar } from './UserAvatar';
import { useRouter } from 'next/navigation';

export function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('mousedown', handleClick); };
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-1)', borderRadius: 'var(--radius-md)' }}
      >
        <UserAvatar name={user.name || user.email || ''} image={user.image} size={28} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 'var(--spacing-2)',
            width: 220,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-border-default)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name || 'Reader'}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.email}</div>
          </div>

          <div style={{ padding: 'var(--spacing-2)' }}>
            <button
              onClick={() => { router.push('/dashboard'); setOpen(false); }}
              style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'none', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Dashboard
            </button>
            <button
              onClick={() => { router.push('/settings'); setOpen(false); }}
              style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'none', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Settings
            </button>
          </div>

          <div style={{ padding: 'var(--spacing-2)', borderTop: '1px solid var(--color-border-default)' }}>
            <button
              onClick={() => { void signOut(); setOpen(false); }}
              style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'none', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-red-400)', fontSize: 'var(--text-sm)', textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
