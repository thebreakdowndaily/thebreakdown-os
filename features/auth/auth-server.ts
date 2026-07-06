import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  database: {} as any,
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  advanced: ({
    defaultPasswordHash: 'argon2',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
  user: {
    additionalFields: {
      displayName: { type: 'string', required: false },
      avatarUrl: { type: 'string', required: false },
      role: { type: 'string', required: false, defaultValue: 'reader' },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    additionalFields: {
      currentWorkspace: { type: 'string', required: false },
    },
  },
});

export type Auth = typeof auth;
