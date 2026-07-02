import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey, revokeApiKey, deleteApiKey } from '@/utils/api-auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ keyId: string }> }
) {
  const { keyId } = await context.params;
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Missing API key' }, { status: 401 });
  }

  const key = validateApiKey(apiKey);
  if (!key || key.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
  }

  revokeApiKey(keyId);
  deleteApiKey(keyId);

  return NextResponse.json({ message: 'Key deleted' });
}
