import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey, getAllApiKeys, createApiKey } from '@/utils/api-auth';
import type { ApiKey } from '@/utils/api-auth';

function getAuthKey(request: NextRequest): string | null {
  return request.headers.get('x-api-key');
}

export function GET(request: NextRequest) {
  const apiKey = getAuthKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Missing API key' }, { status: 401 });
  }

  const key = validateApiKey(apiKey);
  if (!key || key.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
  }

  const keys = getAllApiKeys().map((k: ApiKey) => ({
    name: k.name,
    role: k.role,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed,
    enabled: k.enabled,
    key: k.key.slice(0, 8) + '...' + k.key.slice(-4),
  }));

  return NextResponse.json({ keys });
}

interface CreateKeyRequest {
  name?: string;
  role?: 'editor' | 'reader';
}

export async function POST(request: NextRequest) {
  const apiKey = getAuthKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Missing API key' }, { status: 401 });
  }

  const key = validateApiKey(apiKey);
  if (!key || key.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as CreateKeyRequest;
    const name = body.name || 'Unnamed Key';
    const role = (body.role === 'editor' || body.role === 'reader') ? body.role : 'reader';

    const newKey = createApiKey(name, role);
    return NextResponse.json({
      name: newKey.name,
      role: newKey.role,
      key: newKey.key,
      createdAt: newKey.createdAt,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Bad Request', message: 'Invalid JSON body' }, { status: 400 });
  }
}
