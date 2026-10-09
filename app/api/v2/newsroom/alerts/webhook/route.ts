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

  // 3. Read raw payload with size boundary
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read request stream' },
      { status: 400 }
    );
  }

  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Payload exceeds maximum permitted size (256 KB)' },
      { status: 413 }
    );
  }

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
