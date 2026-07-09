'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabProps {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}

function Tab({ href, label, icon, active }: TabProps) {
  return (
    <Link
      href={href}
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
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--color-surface-secondary)'; }}}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; }}}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {label}
    </Link>
  );
}

const TABS = [
  { href: '/cms', label: 'Dashboard', icon: '📊' },
  { href: '/cms/stories', label: 'Stories', icon: '📰' },
  { href: '/cms/topics', label: 'Topics', icon: '🏷️' },
  { href: '/cms/entities', label: 'Entities', icon: '🏛️' },
  { href: '/cms/timelines', label: 'Timelines', icon: '📅' },
  { href: '/cms/fixes', label: 'The Fix', icon: '🔧' },
  { href: '/cms/media', label: 'Media', icon: '🖼️' },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
      {/* Top navigation bar */}
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
            {/* Brand */}
            <Link href="/cms" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#000' }}>B</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-amber-500)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>THE BREAKDOWN</div>
                <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Editorial CMS</div>
              </div>
            </Link>

            {/* Navigation tabs */}
            <nav style={{ display: 'flex', gap: '2px', flex: 1, overflow: 'hidden' }}>
              {TABS.map((tab) => {
                const active = tab.href === '/cms' ? pathname === '/cms' : pathname.startsWith(tab.href);
                return <Tab key={tab.href} {...tab} active={active} />;
              })}
            </nav>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="/"
                target="_blank"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                View Site ↗
              </a>
              <div
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--color-amber-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#000',
                  cursor: 'pointer',
                }}
                title="The Breakdown Editorial (admin)"
              >
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
