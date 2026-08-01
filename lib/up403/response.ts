import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_VERSION = 'v1';
const DATASET_VERSION = '1.1.0';

export function apiVersion(): string {
  return API_VERSION;
}

export function datasetVersion(): string {
  return DATASET_VERSION;
}

export function okResponse(data: unknown, extra: Record<string, unknown> = {}): NextResponse {
  const body = {
    success: true,
    version: API_VERSION,
    dataset_version: DATASET_VERSION,
    ...extra,
    data,
  };

  const json = JSON.stringify(body);
  const etag = crypto.createHash('sha256').update(json).digest('hex').slice(0, 16);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'ETag': `"${etag}"`,
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      'Vary': 'Accept-Encoding',
      'X-API-Version': API_VERSION,
      'X-Dataset-Version': DATASET_VERSION,
    },
  });
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      version: API_VERSION,
      error: 'not_found',
      message,
      documentation_url: '/api/up403/v1',
    },
    {
      status: 404,
      headers: {
        'Cache-Control': 'no-cache',
        'X-API-Version': API_VERSION,
      },
    }
  );
}

export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      version: API_VERSION,
      error: 'bad_request',
      message,
      documentation_url: '/api/up403/v1',
    },
    {
      status: 400,
      headers: {
        'Cache-Control': 'no-cache',
        'X-API-Version': API_VERSION,
      },
    }
  );
}

export function parsePagination(url: URL): { page: number; limit: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  return { page, limit };
}

export function shouldIncludeProvenance(url: URL): boolean {
  return url.searchParams.get('include') === 'provenance';
}
