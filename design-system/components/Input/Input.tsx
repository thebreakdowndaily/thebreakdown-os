import React, { forwardRef, useState } from 'react';
import type { InputProps } from './Input.types';

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-bg-primary)',
    border: 'var(--border-thin) solid var(--color-border-default)',
  },
  filled: {
    backgroundColor: 'var(--color-bg-tertiary)',
    border: 'var(--border-thin) solid transparent',
  },
};

const sizeInputStyles: Record<string, React.CSSProperties> = {
  sm: {
    padding: 'var(--spacing-1-5) var(--spacing-3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    borderRadius: 'var(--radius-sm)',
  },
  md: {
    padding: 'var(--spacing-2-5) var(--spacing-3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    borderRadius: 'var(--radius-default)',
  },
  lg: {
    padding: 'var(--spacing-3-5) var(--spacing-4)',
    fontSize: 'var(--text-base)',
    lineHeight: 'var(--text-base--line-height)',
    borderRadius: 'var(--radius-md)',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      maxLength,
      disabled,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const currentType = showPasswordToggle && showPassword ? 'text' : type;
    const chars = typeof props.value === 'string' ? props.value.length : 0;

    const inputStyle: React.CSSProperties = {
      width: '100%',
      color: 'var(--color-text-primary)',
      outline: 'none',
      transition: 'border-color var(--duration-fast) var(--easing-out), box-shadow var(--duration-fast) var(--easing-out)',
      fontFamily: 'var(--font-sans)',
      ...variantStyles[variant],
      ...sizeInputStyles[inputSize],
      ...(error ? { borderColor: 'var(--color-error)' } : {}),
      ...(disabled ? { opacity: 'var(--opacity-disabled)', cursor: 'not-allowed' } : {}),
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 'var(--spacing-3)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
                display: 'flex',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${String(inputId)}-error` : helperText ? `${String(inputId)}-helper` : undefined
            }
            maxLength={maxLength}
            className={className}
            style={{
              ...inputStyle,
              paddingLeft: leftIcon ? 'var(--spacing-10)' : undefined,
              paddingRight:
                rightIcon || showPasswordToggle ? 'var(--spacing-10)' : undefined,
            }}
            {...props}
          />
          {(rightIcon || showPasswordToggle) && (
            <span
              aria-hidden={!showPasswordToggle}
              style={{
                position: 'absolute',
                right: 'var(--spacing-3)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                pointerEvents: showPasswordToggle ? 'auto' : 'none',
              }}
            >
              {showPasswordToggle ? (
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => { setShowPassword((v) => !v); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: 0,
                    display: 'flex',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              ) : (
                rightIcon
              )}
            </span>
          )}
        </div>
        {error && (
          <span
            id={`${String(inputId)}-error`}
            role="alert"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            id={`${String(inputId)}-helper`}
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {helperText}
          </span>
        )}
        {maxLength && (
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textAlign: 'right',
            }}
          >
            {chars}/{maxLength}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
