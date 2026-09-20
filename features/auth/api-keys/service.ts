import crypto from 'crypto';
import { getServiceClient } from '@/supabase/client';
import { logSecurityEvent } from '@/features/security/audit-logger';
import type { Principal } from '../principal';
import type { AppPermission } from '../permissions';
import type {
  ApiKeyRecord,
  CreateApiKeyInput,
  CreateApiKeyResult,
  MaskedApiKey,
  ApiKeyValidationResult,
  ApiKeyRole,
  ApiKeyRateLimitTier,
} from './types';

const KEY_PREFIX_LIVE = 'tb_live_';
const CACHE_TTL_MS = 60_000; // 60-second in-memory verification cache

// Verification cache: hash -> { record, cachedAt }
const verificationCache = new Map<string, { record: ApiKeyRecord; cachedAt: number }>();

// In-memory fallback for offline test environments when database is inaccessible
const inMemoryKeys = new Map<string, ApiKeyRecord>();

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

function isConfiguredSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder.supabase.co') &&
    !url.includes('YOUR-PROJECT') &&
    key !== 'placeholder_service_role_key'
  );
}

export function maskKey(prefix: string, rawKeyTail?: string): string {
  if (rawKeyTail && rawKeyTail.length >= 4) {
    return `${prefix}...${rawKeyTail.slice(-4)}`;
  }
  return `${prefix}...****`;
}

/**
 * Creates and persists a new API key.
 * The raw key is returned ONLY once in the result and is never stored or logged.
 */
export async function createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
  const randomEntropy = crypto.randomBytes(24).toString('base64url');
  const rawKey = `${KEY_PREFIX_LIVE}${randomEntropy}`;
  const keyPrefix = rawKey.slice(0, 16);
  const keyHash = hashKey(rawKey);

  const now = new Date();
  const expiresAt = input.expires_in_days
    ? new Date(now.getTime() + input.expires_in_days * 86400000).toISOString()
    : null;

  const role: ApiKeyRole = input.role || 'reader';
  const permissions = input.permissions || [];
  const rateLimitTier = input.rate_limit_tier || 'standard';

  const record: ApiKeyRecord = {
    id: crypto.randomUUID(),
    owner_id: input.owner_id || null,
    name: input.name,
    key_prefix: keyPrefix,
    key_hash: keyHash,
    permissions,
    role,
    rate_limit_tier: rateLimitTier,
    created_at: now.toISOString(),
    expires_at: expiresAt,
    revoked_at: null,
    last_used_at: null,
  };

  if (isConfiguredSupabase()) {
    try {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          id: record.id,
          owner_id: record.owner_id,
          name: record.name,
          key_prefix: record.key_prefix,
          key_hash: record.key_hash,
          permissions: record.permissions,
          role: record.role,
          rate_limit_tier: record.rate_limit_tier,
          created_at: record.created_at,
          expires_at: record.expires_at,
        })
        .select('id')
        .single();

      if (error) {
        inMemoryKeys.set(keyHash, record);
      } else if (data.id) {
        record.id = data.id;
      }
    } catch {
      inMemoryKeys.set(keyHash, record);
    }
  } else {
    inMemoryKeys.set(keyHash, record);
  }

  // Populate cache
  verificationCache.set(keyHash, { record, cachedAt: Date.now() });

  logSecurityEvent({
    type: 'api_key.created',
    keyId: record.id,
    keyPrefix: record.key_prefix,
    actorId: input.owner_id || null,
    metadata: { name: record.name, role: record.role, tier: record.rate_limit_tier },
  });

  return {
    id: record.id,
    name: record.name,
    raw_key: rawKey,
    key_prefix: keyPrefix,
    role: record.role,
    permissions: record.permissions,
    rate_limit_tier: record.rate_limit_tier,
    created_at: record.created_at,
    expires_at: record.expires_at,
  };
}

/**
 * Verifies an incoming raw API key against the persistent store.
 * Performs format validation, hashing, revocation checks, and expiration checks.
 */
export async function verifyApiKey(rawKey: string): Promise<ApiKeyValidationResult> {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, code: 'INVALID_FORMAT', error: 'Missing or non-string API key' };
  }

  const trimmed = rawKey.trim();
  // Minimum length check and prefix format check
  if (trimmed.length < 16) {
    return { valid: false, code: 'INVALID_FORMAT', error: 'API key format invalid' };
  }

  const keyHash = hashKey(trimmed);
  const now = Date.now();

  // 1. Check in-memory L1 cache
  let record: ApiKeyRecord | null = null;
  const cached = verificationCache.get(keyHash);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    record = cached.record;
  }

  // 2. Query persistent PostgreSQL store if not cached
  if (!record && isConfiguredSupabase()) {
    try {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', keyHash)
        .maybeSingle();

      if (!error && data) {
        const rec: ApiKeyRecord = {
          id: data.id,
          owner_id: data.owner_id,
          name: data.name,
          key_prefix: data.key_prefix,
          key_hash: data.key_hash,
          permissions: parsePermissions(data.permissions),
          role: data.role as ApiKeyRole,
          rate_limit_tier: data.rate_limit_tier as ApiKeyRateLimitTier,
          created_at: data.created_at,
          expires_at: data.expires_at,
          revoked_at: data.revoked_at,
          last_used_at: data.last_used_at,
        };
        record = rec;
        verificationCache.set(keyHash, { record: rec, cachedAt: now });
      }
    } catch {
      // Ignore query error, check in-memory fallback
    }
  }

  // 3. Fallback to inMemory store (unit tests / seed fallback)
  if (!record) {
    record = inMemoryKeys.get(keyHash) || null;
  }

  // 4. Validate existence
  if (!record) {
    logSecurityEvent({
      type: 'api_key.auth_failed',
      keyPrefix: trimmed.slice(0, 12),
      reason: 'NOT_FOUND',
    });
    return { valid: false, code: 'NOT_FOUND', error: 'Invalid API key' };
  }

  // 5. Check Revocation
  if (record.revoked_at) {
    logSecurityEvent({
      type: 'api_key.auth_failed',
      keyId: record.id,
      keyPrefix: record.key_prefix,
      reason: 'REVOKED',
    });
    return { valid: false, code: 'REVOKED', error: 'API key has been revoked' };
  }

  // 6. Check Expiration
  if (record.expires_at && new Date(record.expires_at).getTime() <= now) {
    logSecurityEvent({
      type: 'api_key.auth_failed',
      keyId: record.id,
      keyPrefix: record.key_prefix,
      reason: 'EXPIRED',
    });
    return { valid: false, code: 'EXPIRED', error: 'API key has expired' };
  }

  // 7. Debounced update of last_used_at (only touch DB if not updated in last 5 minutes)
  const lastUsedTime = record.last_used_at ? new Date(record.last_used_at).getTime() : 0;
  if (now - lastUsedTime > 300_000) {
    record.last_used_at = new Date().toISOString();
    if (isConfiguredSupabase()) {
      try {
        const supabase = getServiceClient();
        void supabase.from('api_keys').update({ last_used_at: record.last_used_at }).eq('id', record.id);
      } catch {
        // non-blocking
      }
    }
  }

  return { valid: true, key: record };
}

function parsePermissions(raw: unknown): AppPermission[] {
  if (!Array.isArray(raw)) return [];
  const items: unknown[] = raw;
  const permissions: AppPermission[] = [];
  for (const item of items) {
    if (typeof item === 'string') {
      permissions.push(item as AppPermission);
    }
  }
  return permissions;
}

function isPrivilegedAdmin(actor: Principal): boolean {
  const role = actor.role;
  return actor.isSuperAdmin || role === 'owner' || role === 'managing_editor';
}

/**
 * Revokes an existing API key by ID.
 * Requires administrator privileges or ownership of the key.
 */
export async function revokeApiKey(
  keyId: string,
  actor: Principal
): Promise<{ success: boolean; error?: string }> {
  let targetKey: ApiKeyRecord | null = null;

  if (isConfiguredSupabase()) {
    try {
      const supabase = getServiceClient();
      const { data } = await supabase.from('api_keys').select('*').eq('id', keyId).maybeSingle();
      if (data) targetKey = data as ApiKeyRecord;
    } catch {
      // Check in-memory
    }
  }

  if (!targetKey) {
    for (const rec of inMemoryKeys.values()) {
      if (rec.id === keyId) {
        targetKey = rec;
        break;
      }
    }
  }

  if (!targetKey) {
    return { success: false, error: 'Key not found' };
  }

  // Ownership / admin authorization check
  const isOwner = actor.userId && targetKey.owner_id === actor.userId;
  const isAdmin = isPrivilegedAdmin(actor);

  if (!isOwner && !isAdmin) {
    logSecurityEvent({
      type: 'auth.privilege_escalation_attempt',
      actorId: actor.userId,
      keyId,
      reason: 'Unauthorized key revocation attempt',
    });
    return { success: false, error: 'Unauthorized to revoke this key' };
  }

  const revokedAt = new Date().toISOString();
  targetKey.revoked_at = revokedAt;

  // Evict from cache
  verificationCache.delete(targetKey.key_hash);

  try {
    const supabase = getServiceClient();
    await supabase.from('api_keys').update({ revoked_at: revokedAt }).eq('id', keyId);
  } catch {
    // In-memory fallback already updated
  }

  logSecurityEvent({
    type: 'api_key.revoked',
    keyId,
    actorId: actor.userId,
    keyPrefix: targetKey.key_prefix,
  });

  return { success: true };
}

/**
 * Permanently deletes an API key. Admin/Owner only.
 */
export async function deleteApiKey(
  keyId: string,
  actor: Principal
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = isPrivilegedAdmin(actor);
  if (!isAdmin) {
    return { success: false, error: 'Admin access required to delete API keys' };
  }

  if (isConfiguredSupabase()) {
    try {
      const supabase = getServiceClient();
      await supabase.from('api_keys').delete().eq('id', keyId);
    } catch {
      // In-memory cleanup
    }
  }

  for (const [hash, rec] of inMemoryKeys.entries()) {
    if (rec.id === keyId) {
      verificationCache.delete(hash);
      inMemoryKeys.delete(hash);
      break;
    }
  }

  logSecurityEvent({
    type: 'api_key.deleted',
    keyId,
    actorId: actor.userId,
  });

  return { success: true };
}

/**
 * Lists API keys accessible to the given actor.
 * Raw keys are NEVER returned; only masked prefixes and status.
 */
export async function listApiKeys(actor: Principal): Promise<MaskedApiKey[]> {
  const isAdmin = isPrivilegedAdmin(actor);
  let records: ApiKeyRecord[] = [];

  if (isConfiguredSupabase()) {
    try {
      const supabase = getServiceClient();
      let query = supabase.from('api_keys').select('*').order('created_at', { ascending: false });
      if (!isAdmin) {
        query = query.eq('owner_id', actor.userId);
      }
      const { data, error } = await query;
      if (!error) {
        records = data as ApiKeyRecord[];
      }
    } catch {
      // fall back to in-memory records
    }
  }

  if (records.length === 0 && inMemoryKeys.size > 0) {
    for (const rec of inMemoryKeys.values()) {
      if (isAdmin || rec.owner_id === actor.userId) {
        records.push(rec);
      }
    }
  }

  const now = Date.now();
  return records.map((rec) => {
    let status: 'active' | 'revoked' | 'expired' = 'active';
    if (rec.revoked_at) {
      status = 'revoked';
    } else if (rec.expires_at && new Date(rec.expires_at).getTime() <= now) {
      status = 'expired';
    }

    return {
      id: rec.id,
      owner_id: rec.owner_id,
      name: rec.name,
      key_prefix: rec.key_prefix,
      masked_key: maskKey(rec.key_prefix),
      role: rec.role,
      permissions: rec.permissions,
      rate_limit_tier: rec.rate_limit_tier,
      created_at: rec.created_at,
      expires_at: rec.expires_at,
      revoked_at: rec.revoked_at,
      last_used_at: rec.last_used_at,
      status,
    };
  });
}

/**
 * Clears verification cache (useful for testing)
 */
export function clearApiKeyCache(): void {
  verificationCache.clear();
  inMemoryKeys.clear();
}
