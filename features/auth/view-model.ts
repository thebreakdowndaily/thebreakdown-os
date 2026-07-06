import type { UserRole } from '@/types/canonical';

export interface AuthPageViewModel {
  loginUrl: string;
  registerUrl: string;
  providers: Array<{ id: string; name: string; icon: string }>;
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string | null;
  } | null;
}

export function buildAuthPage(): AuthPageViewModel {
  return {
    loginUrl: '/api/auth/sign-in',
    registerUrl: '/api/auth/sign-up',
    providers: [
      { id: 'google', name: 'Google', icon: 'G' },
      { id: 'github', name: 'GitHub', icon: 'GH' },
    ],
    isAuthenticated: false,
    user: null,
  };
}
