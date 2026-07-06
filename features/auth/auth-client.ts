import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient();

export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified?: boolean;
    displayName?: string;
    avatarUrl?: string;
    role?: string;
  };
  session: {
    id: string;
    expiresAt: number;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
    currentWorkspace?: string;
  };
};

export type User = Session['user'];
