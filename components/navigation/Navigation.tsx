'use client';

import { useState, useEffect, useCallback } from 'react';
import Logo from './Logo';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import UnifiedSearchDialog from '@/components/search/UnifiedSearchDialog';
import SubscribeButton from './SubscribeButton';
import { ProfileDropdown } from '@/features/auth/components/ProfileDropdown';
import type { NavLink } from './DesktopMenu';

interface NavigationProps {
  currentPath?: string;
  transparent?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Stories', href: '/stories' },
  { label: 'Topics', href: '/topics' },
  { label: 'Investigations', href: '/investigations' },
  { label: 'Countries', href: '/countries' },
  { label: 'Organizations', href: '/organizations' },
  { label: 'The Fix', href: '/fix' },
  { label: 'Data', href: '/data' },
  { label: 'Graph', href: '/graph' },
];

export default function Navigation({ currentPath = '', transparent = false }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const showSolid = !transparent || scrolled || mobileOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
          showSolid
            ? 'bg-surface-primary border-b border-surface'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Left */}
            <Logo />

            {/* Center */}
            <DesktopMenu links={navLinks} currentPath={currentPath} />

            {/* Right */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-surface-muted hover:text-surface-primary border border-surface rounded-md transition-colors text-sm hover:bg-surface-tertiary"
                aria-label="Search (press / or ⌘K)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden md:inline">Search...</span>
                <kbd className="hidden md:inline font-mono text-[10px] px-1.5 py-0.5 rounded border border-surface bg-surface-secondary">⌘K</kbd>
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <SubscribeButton />
                <ProfileDropdown />
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
