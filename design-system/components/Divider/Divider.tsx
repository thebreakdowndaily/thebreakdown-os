import React, { forwardRef } from 'react';
import type { DividerProps } from './Divider.types';

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      color,
      label,
      spacing = 4,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={className}
          role="separator"
          aria-orientation="vertical"
          style={{
            width: 'var(--border-thin)',
            height: '100%',
            backgroundColor: color || 'var(--color-border-default)',
            marginLeft: `var(--spacing-${spacing})`,
            marginRight: `var(--spacing-${spacing})`,
            flexShrink: 0,
            ...style,
          }}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        />
      );
    }

    if (label) {
      return (
        <div
          className={className}
          role="separator"
          aria-orientation="horizontal"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            marginTop: `var(--spacing-${spacing})`,
            marginBottom: `var(--spacing-${spacing})`,
            ...style,
          }}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          <span
            style={{
              flex: 1,
              height: 'var(--border-thin)',
              backgroundColor: color || 'var(--color-border-default)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <span
            style={{
              flex: 1,
              height: 'var(--border-thin)',
              backgroundColor: color || 'var(--color-border-default)',
            }}
          />
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={className}
        role="separator"
        aria-orientation="horizontal"
        style={{
          width: '100%',
          height: 'var(--border-thin)',
          backgroundColor: color || 'var(--color-border-default)',
          border: 'none',
          margin: 0,
          marginTop: `var(--spacing-${spacing})`,
          marginBottom: `var(--spacing-${spacing})`,
          ...style,
        }}
        {...(props as React.HTMLAttributes<HTMLHRElement>)}
      />
    );
  },
);

Divider.displayName = 'Divider';
