'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/components/SessionProvider';
import { canAccessIntelModule, intelRoleLabel, type IntelModule } from '@/features/auth/roles';

export function IntelModuleGuard({ module, children }: { module: IntelModule; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading...</div>
      </div>
    );
  }

  if (!user || !canAccessIntelModule(user.role, module)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Access Denied</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 420, textAlign: 'center' }}>
          Your current role ({user ? intelRoleLabel(user.role) : 'Guest'}) does not permit access to this module.
        </p>
        <Link href="/intel" style={{ padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-brand-400)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none' }}>
          Back to Mission Control
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
