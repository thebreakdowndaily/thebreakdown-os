import { redirect } from 'next/navigation';

interface IntelDeniedProps {
  reason: 'unauthenticated' | 'forbidden';
  roleLabel?: string;
}

export function IntelDenied({ reason, roleLabel }: IntelDeniedProps) {
  if (reason === 'unauthenticated') redirect('/login');
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Access Denied</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 420, textAlign: 'center' }}>
        Your current role ({roleLabel ?? 'Guest'}) does not permit access to this module.
      </p>
      <a href="/intel" style={{ padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-brand-400)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none' }}>
        Back to Mission Control
      </a>
    </div>
  );
}
