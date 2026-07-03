'use client';

import Link from 'next/link';
import SubscribeButton from './SubscribeButton';
import type { NavLink } from './DesktopMenu';

interface MobileMenuProps {
  open: boolean;
  links: NavLink[];
  onClose: () => void;
}

export default function MobileMenu({ open, links, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 top-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-72 max-w-[80vw] bg-[#0A0A0A] border-l border-gray-800 shadow-2xl animate-slide-in-right overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <span className="text-sm font-semibold text-gray-300">Menu</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors" aria-label="Close menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="px-4 py-6 space-y-1" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-3 py-3 text-base font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-4 border-gray-800" />
          <Link
            href="/newsletter"
            onClick={onClose}
            className="block px-3 py-3 text-base font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            Newsletter
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className="block px-3 py-3 text-base font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            About
          </Link>
        </nav>
        <div className="px-4 pb-8">
          <SubscribeButton variant="mobile" />
        </div>
      </div>
    </div>
  );
}
