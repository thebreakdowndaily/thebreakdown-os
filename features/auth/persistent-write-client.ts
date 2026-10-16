import { NextResponse } from 'next/server';
import { createUserScopedClient } from '@/supabase/client';
import type { Principal } from '@/features/auth/principal';

/**
 * Use the caller's Supabase JWT for persistent writes so database RLS remains
 * an independent authorization layer. API-key writes are denied until there is
 * a service-to-service contract that can safely carry a scoped principal.
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
  return { client: await createUserScopedClient() };
}
