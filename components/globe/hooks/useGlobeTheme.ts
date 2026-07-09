import { useState, useEffect } from 'react';

export interface GlobeTheme {
  brand: string;
  bg: string;
  textMuted: string;
  textSecondary: string;
  fontFamily: string;
}

export function useGlobeTheme(containerRef: React.RefObject<Element | null>) {
  const [theme, setTheme] = useState<GlobeTheme | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const style = getComputedStyle(containerRef.current);
    const get = (name: string) => style.getPropertyValue(name).trim() || '#000';
    setTheme({
      brand: get('--color-brand-400'),
      bg: get('--color-bg-primary'),
      textMuted: get('--color-text-muted'),
      textSecondary: get('--color-text-secondary'),
      fontFamily: get('--font-sans'),
    });
  }, [containerRef]);

  return theme;
}
