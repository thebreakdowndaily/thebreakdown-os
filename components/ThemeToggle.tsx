import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * ThemeToggle – a simple UI widget for switching between Light, Dark, and System themes.
 *
 * - Accessible: button with aria-label reflecting the current theme.
 * - Keyboard‑navigable and focus‑visible.
 * - Persists selection via `next-themes` (which stores the value in localStorage under the key "theme").
 * - Uses design‑system CSS variables for styling – no raw colors.
 */
export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only works after component is mounted on client side.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Avoid hydration mismatch – render nothing until mounted.
    return null;
  }

  const nextTheme = theme === 'system' ? systemTheme : theme;

  const toggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const label = `Theme: ${theme} (effective ${nextTheme})`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex items-center gap-2 rounded px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2 bg-surface-primary text-text-primary transition-colors"
    >
      {/* Simple sun / moon / auto icons – using Unicode for brevity */}
      {theme === 'light' && <span aria-hidden="true">☀️</span>}
      {theme === 'dark' && <span aria-hidden="true">🌙</span>}
      {theme === 'system' && <span aria-hidden="true">🖥️</span>}
      <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
    </button>
  );
};
