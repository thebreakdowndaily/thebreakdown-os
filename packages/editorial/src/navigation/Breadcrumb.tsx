'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb navigation" className="py-2.5">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8rem] font-mono text-[#A1A1AA]" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-[#2A2A2A]" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span className="text-[#F5F5F5] font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#D4A843] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A843]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
