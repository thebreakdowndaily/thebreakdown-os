import type { Session } from './auth-client';

const DEMO_FLAG = 'tb_demo_session';

export function isDemoMode(): boolean {
  const noSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return noSupabase && process.env.NODE_ENV !== 'production';
}

export const DEMO_USER = {
  id: 'demo-editor',
  email: 'editor@demo.local',
  name: 'Demo Editor',
  image: null,
  emailVerified: true,
  role: 'editor',
} as const;

export function enableDemoSession(): void {
  if (typeof window !== 'undefined') localStorage.setItem(DEMO_FLAG, '1');
}

export function disableDemoSession(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(DEMO_FLAG);
}

export function hasDemoSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_FLAG) === '1';
}

export function buildDemoSession(): Session {
  return {
    user: DEMO_USER,
    session: { id: DEMO_USER.id, expiresAt: Date.now() + 86400000 },
  };
}
