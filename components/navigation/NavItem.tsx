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
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500 rounded-full" />
      )}
    </Link>
  );
}
