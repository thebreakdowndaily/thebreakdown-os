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
      className={`relative flex items-center h-full px-3 text-[13px] font-medium transition-colors duration-200 ${
        isActive
          ? 'text-white'
          : 'text-neutral-400 hover:text-neutral-100'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
      {isActive && (
        <span
          className="absolute bottom-0 left-3 right-3 h-px bg-amber-400"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
