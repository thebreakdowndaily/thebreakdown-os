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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  // Show solid background when: explicitly not transparent, after scroll, or mobile menu open
  const showSolid = !transparent || scrolled || mobileOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolid
            ? 'bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/60'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] lg:h-[64px]">
            {/* Left: Logo */}
            <Logo />

            {/* Center: Nav links */}
            <DesktopMenu links={navLinks} currentPath={currentPath} />

            {/* Right: Search + Subscribe + Profile */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-neutral-400 hover:text-neutral-100 rounded-md transition-colors duration-200 group"
                aria-label="Search (press /)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {/* Keyboard hint — desktop only */}
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 bg-neutral-800/60 border border-neutral-700/60 rounded">
                  /
                </kbd>
              </button>

              {/* Subscribe + Profile — desktop only */}
              <div className="hidden lg:flex items-center gap-2 ml-2">
                <SubscribeButton />
                <ProfileDropdown />
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] text-neutral-400 hover:text-neutral-100 rounded-md transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <span className="block w-5 h-px bg-current transition-transform duration-200" aria-hidden="true" />
                <span className="block w-5 h-px bg-current transition-transform duration-200" aria-hidden="true" />
                <span className="block w-3 h-px bg-current transition-transform duration-200 self-start ml-1" aria-hidden="true" />
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
