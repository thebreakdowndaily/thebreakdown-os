// The Breakdown OS — v2 API shared utilities

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/supabase/client';

export type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export function db() {
  return getSupabaseClient();
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function list<T>(data: T[], total: number, page = 1, pageSize = data.length) {
  return NextResponse.json({
    data,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function notFound(entity = 'Resource') {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[API v2]', msg);
  return NextResponse.json({ error: 'Internal server error', details: msg }, { status: 500 });
}
