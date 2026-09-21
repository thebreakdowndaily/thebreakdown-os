'use client';

/**
 * Navigation — Global Site Header
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Earth-inspired design: Deep charcoal background, warm ochre accent.
 * Three-environment system: Dark Discovery surface (homepage/nav layer).
 *
 * Navigation IA (product-aligned):
 *   Library      → /series          (Knowledge Library — primary product)
 *   Investigations → /investigations (Deep journalism)
 *   Explainers   → /fix             (How things work)
 *   Topics       → /topics          (Subject navigation)
 *   Data         → /data            (Evidence + datasets)
 *   The Brief    → /newsletter      (Editorial newsletter)
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import UnifiedSearchDialog from '@/components/search/UnifiedSearchDialog';
import { ProfileDropdown } from '@/features/auth/components/ProfileDropdown';

// ── Navigation link definition ──────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Library',        href: '/series' },
  { label: 'Investigations', href: '/investigations' },
  { label: 'Explainers',     href: '/fix' },
  { label: 'Topics',         href: '/topics' },
  { label: 'Data',           href: '/data' },
  { label: 'The Brief',      href: '/newsletter' },
];

// ── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      href="/"
      className="flex flex-col leading-none group"
      aria-label="The Breakdown — Home"
    >
      <span
        className="text-[11px] font-mono uppercase tracking-[0.22em] transition-colors duration-150"
        style={{ color: 'var(--color-earth-dust)' }}
      >
        The
      </span>
      <span
        className="text-xl font-bold tracking-tight transition-colors duration-150 group-hover:text-[var(--color-brand-400)]"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color: 'var(--color-text-primary)',
          lineHeight: '1.1',
        }}
      >
        Breakdown
      </span>
    </Link>
  );
}

// ── Desktop menu ─────────────────────────────────────────────────────────────

function DesktopMenu({
  links,
  currentPath,
}: {
  links: NavLink[];
  currentPath: string;
}) {
  return (
    <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
      {links.map((link) => {
        const isActive = currentPath === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2 text-sm transition-colors duration-150 rounded"
            style={{
              color: isActive
                ? 'var(--color-brand-400)'
                : 'var(--color-text-muted)',
              fontWeight: isActive ? 500 : 400,
              letterSpacing: '0.01em',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Mobile menu drawer ────────────────────────────────────────────────────────

function MobileMenu({
  open,
  links,
  onClose,
}: {
  open: boolean;
  links: NavLink[];
  onClose: () => void;
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(14,13,11,0.6)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border-default)',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <span
            className="text-sm font-mono uppercase tracking-widest"
            style={{ color: 'var(--color-earth-ochre)' }}
          >
            Navigate
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded transition-colors duration-150"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <ul className="flex flex-col py-4 px-3 gap-1 flex-1 list-none m-0 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors duration-150"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom — brief separator */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <Link
            href="/about"
            onClick={onClose}
            className="block text-xs font-mono uppercase tracking-widest transition-colors duration-150"
            style={{ color: 'var(--color-earth-dust)' }}
          >
            About The Breakdown
          </Link>
        </div>
      </nav>
    </>
  );
}

// ── Search button ─────────────────────────────────────────────────────────────

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm transition-colors duration-150 rounded"
      style={{
        color: 'var(--color-text-muted)',
        border: '1px solid var(--color-border-default)',
        backgroundColor: 'transparent',
      }}
      aria-label="Search (press / to open)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span>Search</span>
      <kbd
        className="hidden lg:inline font-mono text-[10px] px-1.5 py-0.5 rounded"
        style={{
          border: '1px solid var(--color-border-default)',
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-muted)',
        }}
      >
        /
      </kbd>
    </button>
  );
}

// ── Navigation root ───────────────────────────────────────────────────────────

interface NavigationProps {
  currentPath?: string;
  transparent?: boolean;
}

export default function Navigation({ currentPath = '', transparent = false }: NavigationProps) {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // '/' keyboard shortcut opens search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const showSolid   = !transparent || scrolled || mobileOpen;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: showSolid ? 'var(--color-bg-primary)' : 'transparent',
          borderBottom: showSolid
            ? '1px solid var(--color-border-default)'
            : '1px solid transparent',
        }}
        role="banner"
      >
        {/* Skip to main content — keyboard / screen reader */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-[var(--z-modal)] focus:px-4 focus:py-2 focus:rounded focus:text-xs focus:font-mono"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-brand-400)',
            border: '1px solid var(--color-brand-400)',
            outline: 'none',
          }}
        >
          Skip to main content
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            {/* Left — wordmark */}
            <Logo />

            {/* Center — desktop navigation */}
            <DesktopMenu links={navLinks} currentPath={currentPath} />

            {/* Right — search + profile + mobile toggle */}
            <div className="flex items-center gap-3">
              <SearchButton onClick={() => setSearchOpen(true)} />

              <div className="hidden md:flex items-center gap-2">
                <ProfileDropdown />
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded transition-colors duration-150"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} links={navLinks} onClose={closeMobile} />
      <UnifiedSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
