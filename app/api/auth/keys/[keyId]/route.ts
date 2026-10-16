import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentPrincipal, type Principal } from '@/features/auth/principal';
import { can } from '@/features/auth/policy';
import { verifyApiKey, revokeApiKey, deleteApiKey } from '@/features/auth/api-keys/service';
import { apiKeyRecordToPrincipal } from '@/features/auth/api-keys/principal';
import { rateLimiter } from '@/features/rate-limiting/limiter';

async function resolveRequestPrincipal(request: NextRequest): Promise<Principal | null> {
  const sessionPrincipal = await getCurrentPrincipal();
  if (sessionPrincipal) return sessionPrincipal;

  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    const res = await verifyApiKey(apiKeyHeader);
    if (res.valid && res.key) {
      return apiKeyRecordToPrincipal(res.key);
    }
  }

  return null;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ keyId: string }> }
) {
  const { keyId } = await context.params;
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rate = await rateLimiter.checkLimit({
    key: `keys:${clientIp}`,
    tier: 'auth',
    endpoint: `/api/auth/keys/${keyId}`,
    ip: clientIp,
  });
  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  const principal = await resolveRequestPrincipal(request);
  if (!principal) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
  }

  if (!can(principal, 'api_key.revoke')) {
    return NextResponse.json({ error: 'Forbidden', message: 'Admin access required to revoke API keys' }, { status: 403 });
  }

  const revokeResult = await revokeApiKey(keyId, principal);
  if (!revokeResult.success) {
    return NextResponse.json({ error: 'Not Found', message: revokeResult.error || 'Key not found' }, { status: 404 });
  }

  // Also remove from storage
  await deleteApiKey(keyId, principal);

  const response = NextResponse.json({ message: 'API key successfully revoked and deleted' });
  rateLimiter.applyHeaders(response.headers, rate);
  return response;
}
