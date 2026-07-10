'use client';

import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
}

export default function NavItem({ href, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`relative flex items-center h-full px-3 text-sm font-medium transition-colors duration-200 ${
        isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-400 rounded-full" />
      )}
    </Link>
  );
}
