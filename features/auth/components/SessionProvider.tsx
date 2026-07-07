'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, mapUser } from '../auth-client';
import type { Session } from '../auth-client';

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
