'use client';

import { SessionProvider } from './SessionProvider';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
