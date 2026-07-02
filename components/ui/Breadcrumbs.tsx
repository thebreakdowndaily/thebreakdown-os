import React from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <ol className="flex flex-wrap items-center gap-1 text-sm" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href + item.label} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-gray-600 mx-1" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span className="text-gray-100 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
