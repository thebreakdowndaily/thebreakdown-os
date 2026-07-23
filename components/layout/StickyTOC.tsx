import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { spacingLayout } from '@/design-system/tokens';

/**
 * Sticky Table of Contents (TOC) component.
 *
 * Renders a navigation rail that lists headings extracted from the provided
 * `contentRef`. The TOC is displayed only on the large (`lg`) breakpoint and
 * is sticky within the viewport. It respects a configurable set of heading
 * levels and generates deterministic IDs for headings that lack them.
 */
interface StickyTOCProps {
  /** Reference to the content element containing heading elements. */
  contentRef: React.RefObject<HTMLElement | null>;
  /** Optional title displayed above the list of links. */
  title?: string;
  /** Heading levels to include (e.g. [2, 3] corresponds to <h2> and <h3>). */
  headingLevels?: readonly (2 | 3 | 4 | 5 | 6)[];
}

interface TOCItem {
  id: string;
  label: string;
}

/**
 * Generate a slug from a string suitable for use as an HTML id.
 * Simplistic: lowercase, trim, replace non‑alphanumerics with hyphens,
 * collapse multiple hyphens.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\d]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export default function StickyTOC({
  contentRef,
  title = 'On this page',
  headingLevels = [2, 3] as const,
}: StickyTOCProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings when the content reference changes.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const selector = headingLevels.map((lvl) => `h${String(lvl)}`).join(',');
    const headingEls = Array.from(container.querySelectorAll<HTMLElement>(selector));

    const generatedIds = new Map<string, number>();
    const tocItems: TOCItem[] = headingEls.map((el) => {
      let id = el.id;
      if (!id) {
        const base = slugify(el.textContent);
        const count = generatedIds.get(base) ?? 0;
        generatedIds.set(base, count + 1);
        id = count === 0 ? base : `${base}-${String(count + 1)}`;
        el.id = id; // mutate the DOM to guarantee stable anchor targets
      }
      return { id, label: el.textContent.trim() };
    });

    setItems(tocItems);
    if (tocItems.length) setActiveId(tocItems[0].id);
  }, [contentRef, headingLevels]);

  // Track which heading is currently intersecting the viewport.
  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const chosen = visible.reduce((best, cur) => {
          const curTop = cur.boundingClientRect.top;
          const bestTop = best.boundingClientRect.top;
          return curTop < bestTop ? cur : best;
        }, visible[0]);
        setActiveId(chosen.target.id);
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  // Do not render if fewer than two headings.
  if (items.length < 2) return null;

  return (
    <aside
      aria-label="Table of contents"
      className={cn('hidden lg:block', 'sticky top-24')}
      style={{ width: spacingLayout.sidebarWidth }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider text-primary mb-3">
        {title}
      </h3>
      <nav className="space-y-1">
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
            className={cn(
              'block px-3 py-1.5 text-sm rounded transition-colors duration-200',
              activeId === item.id
                ? 'text-primary bg-primary/10 font-medium'
                : 'text-muted hover:text-primary hover:bg-surface-secondary'
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
