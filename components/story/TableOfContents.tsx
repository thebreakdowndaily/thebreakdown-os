'use client';

import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3 px-3">
        On this page
      </h3>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(item.id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              setActiveId(item.id);
            }
          }}
          className={`block px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
            activeId === item.id
              ? 'text-[#D4A843] bg-[#D4A843]/10 font-medium'
              : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]'
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
