'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, mapUser } from '../auth-client';
import type { Session } from '../auth-client';
import { isDemoMode, hasDemoSession, buildDemoSession, disableDemoSession, DEMO_USER } from '../demo';

interface AuthContextValue {
  user: Session['user'] | null;
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
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (isDemoMode()) {
      if (hasDemoSession()) {
        setUser(DEMO_USER);
        setSession(buildDemoSession());
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
      return;
    }
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s?.user) {
        setUser(mapUser(s.user));
        setSession({
          user: mapUser(s.user),
          session: { id: s.user.id, expiresAt: s.expires_at ? s.expires_at * 1000 : 0 },
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
    refresh();

    if (isDemoMode()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        setUser(mapUser(s.user));
        setSession({
          user: mapUser(s.user),
          session: { id: s.user.id, expiresAt: s.expires_at ? s.expires_at * 1000 : 0 },
        });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, [refresh]);

  const signOut = useCallback(async () => {
    if (isDemoMode()) {
      disableDemoSession();
      setUser(null);
      setSession(null);
      if (typeof window !== 'undefined') window.location.reload();
      return;
    }
    await supabase.auth.signOut();
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
