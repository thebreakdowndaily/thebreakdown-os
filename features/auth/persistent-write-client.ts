import { NextResponse } from 'next/server';
import { createUserScopedClient } from '@/supabase/client';
import type { Principal } from './principal';

/**
 * Obtains a database client carrying the authenticated user's Supabase JWT so
 * PostgreSQL RLS remains an independent write authorization boundary.
 *
 * API-key principals do not carry a Supabase user JWT. They must not silently
 * fall back to the anonymous client for persistent writes; a dedicated
 * service-to-service write contract is required before enabling that path.
 */
export async function getPersistentWriteClient(principal: Principal): Promise<
  { client: Awaited<ReturnType<typeof createUserScopedClient>> } |
  { response: ReturnType<typeof NextResponse.json> }
> {
  if (principal.email.startsWith('api_key:')) {
    return {
      response: NextResponse.json(
        { error: 'A user session is required for persistent resource writes' },
        { status: 403 },
      ),
    };
  }

  try {
    return {
      client: await createUserScopedClient({ fallbackToAnon: false }),
    };
  } catch {
    return {
      response: NextResponse.json(
        { error: 'Authenticated database session unavailable' },
        { status: 503 },
      ),
    };
  }
}
