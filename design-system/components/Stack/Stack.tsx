import React, { forwardRef, Children, isValidElement, cloneElement } from 'react';
import type { StackProps } from './Stack.types';

const alignMap: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const justifyMap: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      gap = 4,
      align,
      justify,
      wrap = false,
      dividers = false,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const count = Children.count(children);
    const items = Children.toArray(children);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          flexDirection: direction,
          alignItems: align ? alignMap[align] : undefined,
          justifyContent: justify ? justifyMap[justify] : undefined,
          flexWrap: wrap ? 'wrap' : undefined,
          gap: gap !== undefined ? `var(--spacing-${gap})` : undefined,
          ...style,
        }}
        {...props}
      >
        {dividers
          ? items.map((child, index) => (
              <React.Fragment key={index}>
                {isValidElement(child) && typeof child.type !== 'string'
                  ? cloneElement(child, child.props as Record<string, unknown>)
                  : child}
                {index < count - 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      width: direction === 'column' ? '100%' : 'var(--border-thin)',
                      height: direction === 'column' ? 'var(--border-thin)' : '100%',
                      backgroundColor: 'var(--color-border-default)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </React.Fragment>
            ))
          : children}
      </div>
    );
  },
);

Stack.displayName = 'Stack';
