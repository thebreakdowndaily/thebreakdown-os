import { auth } from '@/features/auth/auth-server';

export class AuthService {
  get handler() { return auth.handler; }

  async getSession(headers: Headers) {
    const session = await auth.api.getSession({ headers });
    return session;
  }

  async signInEmail(data: { email: string; password: string }, headers: Headers) {
    return auth.api.signInEmail({ body: data, headers });
  }

  async signUpEmail(data: { name: string; email: string; password: string }, headers: Headers) {
    return auth.api.signUpEmail({ body: data, headers });
  }

  async signOut(headers: Headers) {
    return auth.api.signOut({ headers });
  }

  async listSessions(headers: Headers) {
    return auth.api.listSessions({ headers });
  }
}

export const authService = new AuthService();
