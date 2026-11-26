import 'server-only';

import { canAccessIntelModule, normalizeIntelRole, type IntelRole } from '@/features/auth/roles';
import { createUserScopedClient } from '@/supabase/client';

export type MediaAuthorization =
  | { ok: true; userId: string; role: IntelRole }
  | { ok: false; status: 401 | 403 | 503; message: string };

/**
 * Resolve media permissions from a verified Supabase JWT plus the authoritative
 * user_roles row. user_metadata is never used for privilege decisions.
 */
export async function authorizeMediaEditor(): Promise<MediaAuthorization> {
  try {
    const supabase = await createUserScopedClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsData?.claims as Record<string, unknown> | undefined;
    const userId = typeof claims?.sub === 'string' ? claims.sub : null;

    if (claimsError || !claims || !userId) {
      return { ok: false, status: 401, message: 'A valid signed-in staff session is required.' };
    }

    const { data: roleRecord, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError) {
      return { ok: false, status: 503, message: 'Media authorization is temporarily unavailable.' };
    }

    if (roleRecord && roleRecord.status !== 'active') {
      return { ok: false, status: 403, message: 'This staff account is not active.' };
    }

    const appMetadata = claims.app_metadata as Record<string, unknown> | undefined;
    const metadataRole = typeof appMetadata?.role === 'string' ? appMetadata.role : null;
    const role = normalizeIntelRole(roleRecord?.role ?? metadataRole);

    if (!canAccessIntelModule(role, 'media')) {
      return { ok: false, status: 403, message: 'Your staff role cannot access media management.' };
    }

    return { ok: true, userId, role };
  } catch {
    return { ok: false, status: 503, message: 'Media authorization is temporarily unavailable.' };
  }
}
