import { NextResponse } from 'next/server';
import { getCurrentPrincipal, type Principal } from './principal';

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'Forbidden: insufficient privileges') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Server-side guard that returns the authenticated Principal or throws UnauthorizedError.
 * Use in Server Components or Server Actions where an unauthenticated caller must be rejected.
 */
export async function requireAuth(): Promise<Principal> {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    throw new UnauthorizedError();
  }
  return principal;
}

/**
 * Route Handler guard that returns either the verified Principal or a NextResponse 401.
 */
export async function requireApiAuth(): Promise<{ principal: Principal } | { response: NextResponse }> {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    return {
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Valid authentication session required' },
        { status: 401 }
      ),
    };
  }
  return { principal };
}
