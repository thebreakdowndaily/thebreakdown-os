'use client';

import React, { useCallback } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, baseUrl, onPageChange }) => {
  const handleClick = useCallback(
    (page: number) => (e: React.MouseEvent) => {
      if (onPageChange) {
        e.preventDefault();
        onPageChange(page);
      }
    },
    [onPageChange],
  );

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      start = 2;
      end = Math.min(totalPages - 1, 4);
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
      end = totalPages - 1;
    }

    if (start > 2) pages.push('ellipsis');

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages - 1) pages.push('ellipsis');

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const linkOrButton = (page: number, disabled: boolean, children: React.ReactNode, ariaLabel: string) => {
    const baseClasses =
      'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-lg text-sm font-medium transition-colors';
    const disabledClasses = 'text-gray-600 cursor-not-allowed';
    const activeClasses = 'bg-amber-400 text-gray-900';
    const inactiveClasses = 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700';

    if (disabled) {
      return (
        <span className={`${baseClasses} ${disabledClasses}`} aria-disabled="true">
          {children}
        </span>
      );
    }

    const classes = page === currentPage ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;

    if (baseUrl && !onPageChange) {
      return (
        <a href={`${baseUrl}?page=${String(page)}`} className={classes} aria-label={ariaLabel} aria-current={page === currentPage ? 'page' : undefined}>
          {children}
        </a>
      );
    }

    return (
      <button onClick={handleClick(page)} className={classes} aria-label={ariaLabel} aria-current={page === currentPage ? 'page' : undefined}>
        {children}
      </button>
    );
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 py-4">
      {linkOrButton(
        currentPage - 1,
        currentPage <= 1,
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline ml-1">Prev</span>
        </>,
        'Previous page',
      )}

      {pageNumbers.map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${String(idx)}`} className="px-2 text-gray-500 select-none" aria-hidden="true">
            &hellip;
          </span>
        ) : (
          <React.Fragment key={page}>
            {linkOrButton(page, false, String(page), `Page ${String(page)}`)}
          </React.Fragment>
        ),
      )}

      {linkOrButton(
        currentPage + 1,
        currentPage >= totalPages,
        <>
          <span className="hidden sm:inline mr-1">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </>,
        'Next page',
      )}
    </nav>
  );
};

export default Pagination;
