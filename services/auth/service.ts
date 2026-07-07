import { getSupabaseAuth, getSession } from '@/features/auth/auth-server';
import type { AuthSession } from '@/features/auth/auth-server';

export class AuthService {
  async getSession(): Promise<AuthSession | null> {
    return getSession();
  }

  async signInEmail(data: { email: string; password: string }) {
    const supabase = await getSupabaseAuth();
    return supabase.auth.signInWithPassword(data);
  }

  async signUpEmail(data: { name: string; email: string; password: string }) {
    const supabase = await getSupabaseAuth();
    return supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });
  }

  async signOut() {
    const supabase = await getSupabaseAuth();
    return supabase.auth.signOut();
  }
}

export const authService = new AuthService();
