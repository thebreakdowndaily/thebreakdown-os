import React, { forwardRef } from 'react';
import type { GridProps, ResponsiveColumns } from './Grid.types';

const alignMap: Record<string, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};

const justifyMap: Record<string, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

function generateResponsiveGridStyles(columns: number | ResponsiveColumns): React.CSSProperties {
  if (typeof columns === 'number') {
    return {
      gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))`,
    };
  }
  return {
      gridTemplateColumns: `repeat(${String(columns.sm ?? 1)}, minmax(0, 1fr))`,
  };
}

function generateResponsiveMediaStyles(columns: ResponsiveColumns): string {
  const parts: string[] = [];
  if (columns.sm) {
    parts.push(
      `@media (min-width: 640px) { .grid-cols-responsive { grid-template-columns: repeat(${String(columns.sm)}, minmax(0, 1fr)); } }`,
    );
  }
  if (columns.md) {
    parts.push(
      `@media (min-width: 768px) { .grid-cols-responsive { grid-template-columns: repeat(${String(columns.md)}, minmax(0, 1fr)); } }`,
    );
  }
  if (columns.lg) {
    parts.push(
      `@media (min-width: 1024px) { .grid-cols-responsive { grid-template-columns: repeat(${String(columns.lg)}, minmax(0, 1fr)); } }`,
    );
  }
  if (columns.xl) {
    parts.push(
      `@media (min-width: 1280px) { .grid-cols-responsive { grid-template-columns: repeat(${String(columns.xl)}, minmax(0, 1fr)); } }`,
    );
  }
  return parts.join(' ');
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 1,
      gap = 6,
      align,
      justify,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const isResponsive = typeof columns === 'object';
    const baseStyles = isResponsive
      ? generateResponsiveGridStyles(columns)
      : generateResponsiveGridStyles(columns);
    const mediaStyles = isResponsive ? generateResponsiveMediaStyles(columns) : '';

    return (
      <>
        {mediaStyles && (
          <style>{mediaStyles}</style>
        )}
        <div
          ref={ref}
          className={`${isResponsive ? 'grid-cols-responsive' : ''} ${className}`}
          style={{
            display: 'grid',
            gap: `var(--spacing-${String(gap)})`,
            alignItems: align ? alignMap[align] : undefined,
            justifyContent: justify ? justifyMap[justify] : undefined,
            ...baseStyles,
            ...style,
          }}
          {...props}
        >
          {children}
        </div>
      </>
    );
  },
);

Grid.displayName = 'Grid';
