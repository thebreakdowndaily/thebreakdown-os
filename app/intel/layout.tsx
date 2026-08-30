'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/components/SessionProvider';
import { intelModulesForRole, intelRoleLabel, type IntelModule } from '@/features/auth/roles';

interface IntelTab {
  module: IntelModule;
  href: string;
  label: string;
  icon: string;
}

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + Phase IV sprint brief (Executive Intelligence Surface)
// Mission Control is the executive surface. The remaining tabs are the module surfaces
// it links to — the hierarchy is: Executive surface → engine surfaces.

const INTEL_TABS: IntelTab[] = [
  { module: 'dashboard', href: '/intel', label: 'Mission Control', icon: '◈' },
  { module: 'editorial', href: '/intel/editorial', label: 'Editorial Intelligence', icon: '🧭' },
  { module: 'watch-list', href: '/intel/watch-list', label: 'Watch List', icon: '📋' },
  { module: 'predictions', href: '/intel/predictions', label: 'Predictions', icon: '🎯' },
  { module: 'scenarios', href: '/intel/scenarios', label: 'Scenarios', icon: '🔄' },
  { module: 'research', href: '/intel/research', label: 'Evidence & Research', icon: '🔍' },
  { module: 'demand', href: '/intel/demand', label: 'Public Demand', icon: '📊' },
  { module: 'verification', href: '/intel/verification', label: 'Verification', icon: '✔️' },
  { module: 'toolkit', href: '/intel/toolkit', label: 'Journalist Toolkit', icon: '🧰' },
  { module: 'candidates', href: '/intel/candidates', label: 'Candidates', icon: '👤' },
  { module: 'media', href: '/intel/media', label: 'Media Intelligence', icon: '📡' },
  { module: 'story-builder', href: '/intel/story-builder', label: 'Story Builder', icon: '✍️' },
  { module: 'rti', href: '/intel/rti', label: 'RTI', icon: '📄' },
  { module: 'tasks', href: '/intel/tasks', label: 'Tasks', icon: '✅' },
];

function IntelTabLink({ tab, active }: { tab: IntelTab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-amber-500)' : 'var(--color-text-secondary)',
        background: active ? 'color-mix(in srgb, var(--color-amber-500) 10%, transparent)' : 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '15px' }}>{tab.icon}</span>
      {tab.label}
    </Link>
  );
}

export default function IntelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const role = user?.role ?? 'guest';
  const accessible = intelModulesForRole(role);
  const tabs = INTEL_TABS.filter(t => accessible.includes(t.module));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-surface-primary)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          background: 'var(--color-surface-elevated)',
          borderBottom: '1px solid var(--color-border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '56px', gap: '24px' }}>
            <Link href="/intel" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#000' }}>B</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-amber-500)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>THE BREAKDOWN</div>
                <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Intelligence Workspace</div>
              </div>
            </Link>

            <nav style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto' }}>
              {tabs.map(tab => {
                const active = tab.href === '/intel' ? pathname === '/intel' : pathname.startsWith(tab.href);
                return <IntelTabLink key={tab.module} tab={tab} active={active} />;
              })}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              {!loading && user ? (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '12px', color: 'var(--color-text-secondary)',
                  }}
                >
                  <div
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'var(--color-amber-500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#000',
                    }}
                  >
                    {(user.name || user.email || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <span style={{ whiteSpace: 'nowrap' }}>{intelRoleLabel(user.role)}</span>
                </div>
              ) : null}
              <a href="/" target="_blank" style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px' }}>
                View Site ↗
              </a>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
