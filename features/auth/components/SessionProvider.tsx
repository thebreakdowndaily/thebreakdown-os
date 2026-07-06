'use client';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '../auth-client';
import { authClient } from '../auth-client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d: any = await authClient.getSession();
      const data = d?.data ?? d;
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u: any = data.user;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s: any = data.session;
        setUser({
          id: u?.id || '',
          email: u?.email || '',
          name: u?.name || '',
          image: u?.image,
          emailVerified: !!u?.emailVerified,
          displayName: u?.displayName,
          avatarUrl: u?.avatarUrl,
          role: u?.role,
        });
        setSession({
          user: {
            id: u?.id || '',
            email: u?.email || '',
            name: u?.name || '',
            image: u?.image,
          },
          session: {
            id: s?.id || '',
            expiresAt: typeof s?.expiresAt === 'object' ? s.expiresAt.getTime() : (s?.expiresAt || 0),
            token: s?.token || '',
            createdAt: String(s?.createdAt || ''),
            updatedAt: String(s?.updatedAt || ''),
            ipAddress: s?.ipAddress || undefined,
            userAgent: s?.userAgent || undefined,
            currentWorkspace: s?.currentWorkspace || undefined,
          },
        });
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh().catch(() => {});
    }, 0);
    return () => { clearTimeout(timer); };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
