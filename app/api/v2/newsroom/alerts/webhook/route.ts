/**
 * ─── Newsroom Alert Inbound Webhook Receiver ─────────────────────────────────
 *
 * Route: /api/v2/newsroom/alerts/webhook
 * Governing Document: .planning/PHASE-4B-1-PRODUCTION-RECEIVER-DECISION.md
 * Operating Doctrine: AGENTS.md (Operational Observability, Security, Durability)
 *
 * Dedicated authenticated internal operational sink for Radar alert deliveries.
 * Enforces:
 *   - POST only (405 for all other verbs)
 *   - Strict HMAC-SHA256 signature verification via X-Breakdown-Signature
 *   - 300-second timestamp drift tolerance / replay protection
 *   - Safe payload bounds and sanitized JSON parsing
 *   - Deterministic HTTP response codes
 *   - Zero credential or payload leakage in logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/services/notifications';

const MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB safety bound

type BoundedBodyResult =
  | { ok: true; rawBody: string }
  | { ok: false; status: 400 | 413; message: string };

async function readBoundedBody(request: NextRequest): Promise<BoundedBodyResult> {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_PAYLOAD_BYTES) {
    return { ok: false, status: 413, message: 'Payload exceeds maximum permitted size (256 KB)' };
  }

  const stream = request.body;
  if (!stream) return { ok: false, status: 400, message: 'Request body is required' };
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PAYLOAD_BYTES) {
        try { await reader.cancel(); } catch { /* best-effort cancellation */ }
        return { ok: false, status: 413, message: 'Payload exceeds maximum permitted size (256 KB)' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, message: 'Failed to read request stream' };
  } finally {
    try { reader.releaseLock(); } catch { /* stream may already be released */ }
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, rawBody: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, status: 400, message: 'Request body must be valid UTF-8' };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.RADAR_ALERT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook signing secret unconfigured on receiver' },
      { status: 500 }
    );
  }

  // 1. Content-Type check
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid Content-Type; expected application/json' },
      { status: 415 }
    );
  }

  // 2. Signature header check
  const signatureHeader = request.headers.get('x-breakdown-signature');
  if (!signatureHeader) {
    return NextResponse.json(
      { error: 'Missing X-Breakdown-Signature header' },
      { status: 401 }
    );
  }

  // 3. Read a bounded byte stream before allocating the whole payload.
  const bodyResult = await readBoundedBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json({ error: bodyResult.message }, { status: bodyResult.status });
  }
  const { rawBody } = bodyResult;

  // 4. Verify HMAC-SHA256 signature and replay window (300s)
  const sigCheck = verifyWebhookSignature(rawBody, signatureHeader, secret, 300);
  if (!sigCheck.valid) {
    return NextResponse.json(
      { error: sigCheck.reason || 'Cryptographic signature verification failed' },
      { status: 401 }
    );
  }

  // 5. Parse and validate JSON schema
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON payload' },
      { status: 400 }
    );
  }

  if (!payload || typeof payload !== 'object' || !payload.deliveryId || !payload.event) {
    return NextResponse.json(
      { error: 'Missing required payload fields (deliveryId, event)' },
      { status: 400 }
    );
  }

  // 6. Safe audit log (sanitized operational metadata only; no secrets or private data)
  console.log(
    `[NewsroomAlertWebhook] Acknowledged delivery: id=${payload.deliveryId} event=${payload.event} alertId=${payload.alert?.id || 'none'}`
  );

  return NextResponse.json(
    {
      received: true,
      deliveryId: payload.deliveryId,
      event: payload.event,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

// ── Method Not Allowed Handlers ──────────────────────────────────────────────
const disallowedResponse = () =>
  NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );

export async function GET(): Promise<NextResponse> {
  return disallowedResponse();
}

export async function PUT(): Promise<NextResponse> {
  return disallowedResponse();
}

export async function DELETE(): Promise<NextResponse> {
  return disallowedResponse();
}

export async function PATCH(): Promise<NextResponse> {
  return disallowedResponse();
}
