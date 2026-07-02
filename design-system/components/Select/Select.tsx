import React, { forwardRef } from 'react';
import type { SelectProps } from './Select.types';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      helperText,
      error,
      placeholder,
      disabled,
      className = '',
      style,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            className={className}
            style={{
              width: '100%',
              padding: 'var(--spacing-2-5) var(--spacing-3)',
              paddingRight: 'var(--spacing-10)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--text-sm--line-height)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              border: 'var(--border-thin) solid var(--color-border-default)',
              borderRadius: 'var(--radius-default)',
              outline: 'none',
              transition: 'border-color var(--duration-fast) var(--easing-out), box-shadow var(--duration-fast) var(--easing-out)',
              fontFamily: 'var(--font-sans)',
              appearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 'var(--opacity-disabled)' : 1,
              ...(error ? { borderColor: 'var(--color-error)' } : {}),
              ...style,
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 'var(--spacing-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
              fontSize: 'var(--text-xs)',
            }}
          >
            &#9662;
          </span>
        </div>
        {error && (
          <span
            id={`${selectId}-error`}
            role="alert"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            id={`${selectId}-helper`}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
