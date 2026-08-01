/**
 * SpatialNarrativeBreadcrumb — NOS Volume III Projection Primitive
 * Governance: NOS-v3.0 Chapter 11 | ERD-NAV-001 | WCAG 2.2 AAA
 *
 * Server Component — Renders semantic breadcrumbs establishing spatial position
 * awareness across all reader surfaces without imposing forced navigation.
 */

import Link from 'next/link';

export interface NarrativeBreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface SpatialNarrativeBreadcrumbProps {
  items: NarrativeBreadcrumbItem[];
  theme?: 'dark' | 'light';
}

export default function SpatialNarrativeBreadcrumb({
  items,
  theme = 'dark',
}: SpatialNarrativeBreadcrumbProps) {
  if (items.length === 0) return null;

  const isDark = theme === 'dark';

  const containerClasses = isDark
    ? 'text-neutral-400 bg-neutral-900/60 border-neutral-800'
    : 'text-gray-600 bg-gray-50 border-gray-200';

  const linkClasses = isDark
    ? 'hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1'
    : 'hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600 rounded px-1';

  const activeClasses = isDark
    ? 'text-emerald-400 font-medium'
    : 'text-emerald-800 font-medium';

  const jsonLdItems = items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.label,
    item: `https://thebreakdown.in${item.href}`,
  }));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: jsonLdItems,
  };

  return (
    <>
      {/* Schema.org Breadcrumb JSON-LD for SEO & Discovery */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav
        aria-label="Spatial Narrative Position"
        className={`inline-flex items-center flex-wrap gap-2 px-3 py-1.5 rounded-md border text-xs font-mono tracking-tight ${containerClasses}`}
      >
        <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold mr-1">
          Position:
        </span>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1 || item.current;

          return (
            <span key={item.href} className="inline-flex items-center gap-2">
              {idx > 0 && (
                <span aria-hidden="true" className="text-neutral-600 select-none">
                  →
                </span>
              )}

              {isLast ? (
                <span
                  aria-current="location"
                  className={`line-clamp-1 max-w-[240px] sm:max-w-xs ${activeClasses}`}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={linkClasses}>
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
