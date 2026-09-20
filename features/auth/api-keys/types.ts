import type { AppPermission } from '../permissions';

export type ApiKeyRole = 'reader' | 'contributor' | 'reporter' | 'editor' | 'admin' | 'owner';
export type ApiKeyRateLimitTier = 'tier_low' | 'standard' | 'tier_high' | 'unlimited';

export interface ApiKeyRecord {
  id: string;
  owner_id: string | null;
  name: string;
  key_prefix: string;
  key_hash: string;
  permissions: AppPermission[];
  role: ApiKeyRole;
  rate_limit_tier: ApiKeyRateLimitTier;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
}

export interface CreateApiKeyInput {
  name: string;
  owner_id?: string | null;
  role?: ApiKeyRole;
  permissions?: AppPermission[];
  rate_limit_tier?: ApiKeyRateLimitTier;
  expires_in_days?: number | null;
}

export interface CreateApiKeyResult {
  id: string;
  name: string;
  raw_key: string;
  key_prefix: string;
  role: ApiKeyRole;
  permissions: AppPermission[];
  rate_limit_tier: ApiKeyRateLimitTier;
  created_at: string;
  expires_at: string | null;
}

export interface MaskedApiKey {
  id: string;
  owner_id: string | null;
  name: string;
  key_prefix: string;
  masked_key: string;
  role: ApiKeyRole;
  permissions: AppPermission[];
  rate_limit_tier: ApiKeyRateLimitTier;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  status: 'active' | 'revoked' | 'expired';
}

export interface ApiKeyValidationResult {
  valid: boolean;
  code?: 'INVALID_FORMAT' | 'NOT_FOUND' | 'REVOKED' | 'EXPIRED' | 'UNAUTHORIZED';
  error?: string;
  key?: ApiKeyRecord;
}
