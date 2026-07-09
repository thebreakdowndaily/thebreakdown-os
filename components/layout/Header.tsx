'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '../ui/SearchBar';
import UnifiedSearchDialog from '../ui/UnifiedSearchDialog';

interface HeaderProps {
  transparent?: boolean;
}

const navLinks = [
  { label: "Stories", href: "/stories" },
  { label: "Investigations", href: "/investigations" },
  { label: "Data", href: "/data" },
  { label: "The Fix", href: "/fix" },
  { label: "Topics", href: "/topics" }
];

/* ── Inline SVG icons (no icon system dependency) ──────────────────────── */
const MenuIcon: React.FC = () => (
  <svg
    style={{ width: 'var(--spacing-6)', height: 'var(--spacing-6)' }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg
    style={{ width: 'var(--spacing-6)', height: 'var(--spacing-6)' }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ── Header ────────────────────────────────────────────────────────────── */
const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMobile = useCallback(() => { setMobileOpen((prev) => !prev); }, []);
  const closeMobile = useCallback(() => { setMobileOpen(false); }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        width: '100%',
        backgroundColor: transparent
          ? 'color-mix(in srgb, var(--color-bg-primary) 80%, transparent)'
          : 'var(--color-bg-primary)',
        backdropFilter: transparent ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: transparent ? 'blur(8px)' : 'none',
        borderBottom: '1px solid var(--color-border-default)',
      }}
      role="banner"
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 var(--spacing-4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem',
            gap: 'var(--spacing-4)',
          }}
        >
          {/* Logo */}
<Link
  href="/"
  aria-label="The Breakdown — Home"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    flexShrink: 0,
  }}
>
  {/* Temporary Logo Mark */}
  <div
    style={{
      width: "12px",
      height: "12px",
      borderRadius: "2px",
      background: "var(--color-brand-400)",
    }}
  />

  {/* Logo Text */}
  <div style={{ display: "flex", flexDirection: "column" }}>
    <span
      style={{
        fontSize: "var(--text-xl)",
        fontWeight: "var(--font-weight-bold)",
        color: "var(--color-brand-400)",
        lineHeight: 1.1,
      }}
    >
      The Breakdown
    </span>

    <span
      style={{
        fontSize: "var(--text-xs)",
        color: "var(--color-text-muted)",
        letterSpacing: "0.08em",
      }}
    >
      India Explained
    </span>
  </div>
  </Link>
          {/* Desktop nav */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 'var(--spacing-6)',
            }}
            className="nav-desktop"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                }}
                className="nav-link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Search Button (Command Palette Trigger) */}
          <div
            style={{
              display: 'none',
              flex: 1,
              maxWidth: '28rem',
              marginLeft: 'auto',
            }}
            className="search-desktop"
          >
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between bg-neutral-900 border border-neutral-800 text-neutral-400 text-sm rounded-lg px-4 py-2 hover:bg-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search...</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 bg-neutral-950 border border-neutral-800 rounded">⌘K</kbd>
              </div>
            </button>
          </div>

          <UnifiedSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

          {/* Mobile menu button */}
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-2)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            className="mobile-menu-btn"
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '4rem',
            zIndex: 'var(--z-overlay)',
            backgroundColor: 'var(--color-bg-primary)',
            borderTop: '1px solid var(--color-border-default)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--spacing-6)',
              gap: 'var(--spacing-4)',
            }}
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  padding: 'var(--spacing-2) 0',
                }}
              >
                {link.label}
              </a>
            ))}
            <div
              style={{
                marginTop: 'var(--spacing-4)',
                paddingTop: 'var(--spacing-4)',
                borderTop: '1px solid var(--color-border-default)',
              }}
            >
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between bg-neutral-900 border border-neutral-800 text-neutral-400 text-sm rounded-lg px-4 py-3 hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search stories, topics...</span>
                </div>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile-first responsive styles injected once */}
      <style>{`
        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .search-desktop { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
        .nav-link:hover,
        .nav-link:focus-visible {
          color: var(--color-brand-400) !important;
          transition: color var(--duration-fast) var(--easing-out);
        }
        .mobile-menu-btn:hover {
          color: var(--color-text-primary) !important;
          background-color: var(--color-bg-secondary) !important;
        }
      `}</style>
    </header>
  );
};

export default Header;
