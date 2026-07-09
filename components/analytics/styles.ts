import React from 'react';

export const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-5)',
};

export const headingStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 'var(--spacing-3)',
};

export const valueStyle: React.CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
};

export const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
};
