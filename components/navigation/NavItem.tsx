'use client';

import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
}

/**
 * NavItem — RC-1 Editorial
 * Small-caps · gold active indicator · no background fill on hover
 */
export default function NavItem({ href, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className="relative flex items-center h-full px-3.5 text-xs font-medium transition-colors duration-150"
      style={{
        color: isActive ? '#F5F5F5' : '#777',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      {label}
      {isActive && (
        <span
          className="absolute bottom-0 left-3.5 right-3.5 h-px rounded-full"
          style={{ backgroundColor: '#C9A84C' }}
        />
      )}
    </Link>
  );
}
