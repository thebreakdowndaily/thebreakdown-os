import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentPrincipal, type Principal } from '@/features/auth/principal';
import { can } from '@/features/auth/policy';
import { verifyApiKey, createApiKey, listApiKeys } from '@/features/auth/api-keys/service';
import type { ApiKeyRole, ApiKeyRateLimitTier } from '@/features/auth/api-keys/types';
import type { AppPermission } from '@/features/auth/permissions';
import { rateLimiter } from '@/features/rate-limiting/limiter';
import type { IntelRole } from '@/features/auth/roles';

async function resolveRequestPrincipal(request: NextRequest): Promise<Principal | null> {
  // 1. Try authenticated session principal
  const sessionPrincipal = await getCurrentPrincipal();
  if (sessionPrincipal) return sessionPrincipal;

  // 2. Try x-api-key header principal
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    const res = await verifyApiKey(apiKeyHeader);
    if (res.valid && res.key) {
      return {
        userId: res.key.owner_id || res.key.id,
        email: `api_key:${res.key.name}`,
        name: res.key.name,
        role: res.key.role as IntelRole,
        isSuperAdmin: res.key.role === 'owner',
        status: res.key.revoked_at ? 'suspended' : 'active',
        organizationId: null,
      };
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  
  // Rate limit check for key administration
  const rate = await rateLimiter.checkLimit({
    key: `keys:${clientIp}`,
    tier: 'auth',
    endpoint: '/api/auth/keys',
    ip: clientIp,
  });
  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  const principal = await resolveRequestPrincipal(request);
  if (!principal) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
  }

  if (!can(principal, 'api_key.read')) {
    return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
  }

  const keys = await listApiKeys(principal);
  const response = NextResponse.json({ keys });
  rateLimiter.applyHeaders(response.headers, rate);
  return response;
}

interface CreateKeyRequestBody {
  name?: string;
  role?: ApiKeyRole;
  permissions?: AppPermission[];
  rateLimitTier?: ApiKeyRateLimitTier;
  expiresInDays?: number;
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rate = await rateLimiter.checkLimit({
    key: `keys:${clientIp}`,
    tier: 'auth',
    endpoint: '/api/auth/keys',
    ip: clientIp,
  });
  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  const principal = await resolveRequestPrincipal(request);
  if (!principal) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
  }

  if (!can(principal, 'api_key.create')) {
    return NextResponse.json({ error: 'Forbidden', message: 'Admin access required to create API keys' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as CreateKeyRequestBody;
    const name = (body.name || 'Unnamed Key').trim();
    if (!name) {
      return NextResponse.json({ error: 'Bad Request', message: 'Key name is required' }, { status: 400 });
    }

    const validRoles: ApiKeyRole[] = ['reader', 'contributor', 'reporter', 'editor', 'admin', 'owner'];
    const role = body.role && validRoles.includes(body.role) ? body.role : 'reader';
    const permissions = Array.isArray(body.permissions) ? body.permissions : [];
    const rateLimitTier: ApiKeyRateLimitTier = body.rateLimitTier || 'standard';
    const expiresInDays = typeof body.expiresInDays === 'number' && body.expiresInDays > 0 ? body.expiresInDays : null;

    const newKey = await createApiKey({
      name,
      role,
      permissions,
      rate_limit_tier: rateLimitTier,
      owner_id: principal.userId,
      expires_in_days: expiresInDays,
    });

    const response = NextResponse.json(
      {
        id: newKey.id,
        name: newKey.name,
        role: newKey.role,
        permissions: newKey.permissions,
        rateLimitTier: newKey.rate_limit_tier,
        key: newKey.raw_key, // Returned strictly once
        createdAt: newKey.created_at,
        expiresAt: newKey.expires_at,
      },
      { status: 201 }
    );
    rateLimiter.applyHeaders(response.headers, rate);
    return response;
  } catch {
    return NextResponse.json({ error: 'Bad Request', message: 'Invalid JSON body' }, { status: 400 });
  }
}
