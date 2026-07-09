import { useState, useEffect } from 'react';
import type { MapTheme } from '../config/theme';

export const FALLBACK_THEME: MapTheme = {
  bg: '#ffffff',
  bgSecondary: '#f8f9fa',
  bgTertiary: '#e9ecef',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  brand: '#f59e0b',
  brandLight: '#fde68a',
  border: '#e5e7eb',
  borderHover: '#d1d5db',
  fontFamily: 'sans-serif',
  success: '#10b981',
  error: '#ef4444',
  water: '#1e3a5f',
  land: '#e9ecef',
};

export function useMapTheme(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [theme, setTheme] = useState<MapTheme>(FALLBACK_THEME);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const style = getComputedStyle(el);
    const get = (name: string) => style.getPropertyValue(name).trim() || '#000';
    
    setTheme({
      bg: get('--color-bg-primary') || FALLBACK_THEME.bg,
      bgSecondary: get('--color-bg-secondary') || FALLBACK_THEME.bgSecondary,
      bgTertiary: get('--color-bg-tertiary') || FALLBACK_THEME.bgTertiary,
      textPrimary: get('--color-text-primary') || FALLBACK_THEME.textPrimary,
      textSecondary: get('--color-text-secondary') || FALLBACK_THEME.textSecondary,
      textMuted: get('--color-text-muted') || FALLBACK_THEME.textMuted,
      brand: get('--color-brand-400') || FALLBACK_THEME.brand,
      brandLight: get('--color-brand-200') || FALLBACK_THEME.brandLight,
      border: get('--color-border-default') || FALLBACK_THEME.border,
      borderHover: get('--color-border-hover') || FALLBACK_THEME.borderHover,
      fontFamily: get('--font-sans') || FALLBACK_THEME.fontFamily,
      success: get('--color-success') || FALLBACK_THEME.success,
      error: get('--color-error') || FALLBACK_THEME.error,
      water: get('--color-blue-700') || FALLBACK_THEME.water,
      land: get('--color-bg-tertiary') || FALLBACK_THEME.land,
    });
  }, [containerRef]);

  return theme;
}
