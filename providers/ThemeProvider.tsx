import { ThemeProvider as NextThemeProvider } from 'next-themes';
import React, { ReactNode } from 'react';

/**
 * ThemeProvider wraps the Next.js app and supplies Light/Dark/System themes.
 * It uses `next-themes` with CSS class strategy and stores the selected theme
 * in `localStorage` under the key "theme". The inline script injected in
 * `app/layout.tsx` ensures the correct class is applied before React hydrates,
 * eliminating any flash of unstyled content.
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      {children}
    </NextThemeProvider>
  );
};
