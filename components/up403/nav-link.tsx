'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
  icon: string;
}

export function Up403NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none ${active ? 'bg-[#1C1C1C] text-[#F5F5F5]' : 'text-[#A1A1AA] hover:bg-[#1C1C1C] hover:text-[#F5F5F5]'}`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
    </Link>
  );
}
