import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE, PATCH } from '@/app/api/v2/newsroom/alerts/webhook/route';
import { signWebhookPayload } from '@/services/notifications';

describe('Internal Newsroom Alert Webhook Receiver Route (/api/v2/newsroom/alerts/webhook)', () => {
  const TEST_SECRET = 'internal-test-receiver-secret-2026';
  const originalEnv = process.env.RADAR_ALERT_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.RADAR_ALERT_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.RADAR_ALERT_WEBHOOK_SECRET = originalEnv;
    } else {
      delete process.env.RADAR_ALERT_WEBHOOK_SECRET;
    }
  });

  const createRequest = (
    body: string,
    signatureHeader?: string,
    contentType: string = 'application/json'
  ): NextRequest => {
    const headers = new Headers();
    headers.set('content-type', contentType);
    if (signatureHeader) {
      headers.set('x-breakdown-signature', signatureHeader);
    }

    return new NextRequest('http://localhost:3000/api/v2/newsroom/alerts/webhook', {
      method: 'POST',
      headers,
      body,
    });
  };

  it('1. returns 500 when RADAR_ALERT_WEBHOOK_SECRET is unset on server', async () => {
    delete process.env.RADAR_ALERT_WEBHOOK_SECRET;
    const req = createRequest('{}', 't=123,v1=abc');
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('secret unconfigured');
  });

  it('2. returns 405 Method Not Allowed for GET, PUT, DELETE, PATCH', async () => {
    const getRes = await GET();
    expect(getRes.status).toBe(405);
    expect(getRes.headers.get('Allow')).toBe('POST');

    const putRes = await PUT();
    expect(putRes.status).toBe(405);

    const delRes = await DELETE();
    expect(delRes.status).toBe(405);

    const patchRes = await PATCH();
    expect(patchRes.status).toBe(405);
  });

  it('3. returns 415 when Content-Type is not application/json', async () => {
    const req = createRequest('{}', 't=123,v1=abc', 'text/plain');
    const res = await POST(req);
    expect(res.status).toBe(415);
    const json = await res.json();
    expect(json.error).toContain('Invalid Content-Type');
  });

  it('4. returns 401 when X-Breakdown-Signature header is missing', async () => {
    const req = createRequest('{}');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('Missing X-Breakdown-Signature');
  });

  it('5. returns 401 when HMAC signature is invalid', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ deliveryId: 'del-123', event: 'RADAR_P0_SIGNAL' });
    const invalidSigHeader = `t=${nowSec},v1=0000000000000000000000000000000000000000000000000000000000000000`;

    const req = createRequest(body, invalidSigHeader);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('signature mismatch');
  });

  it('6. returns 401 when timestamp is stale (> 300 seconds)', async () => {
    const staleSec = Math.floor(Date.now() / 1000) - 301;
    const body = JSON.stringify({ deliveryId: 'del-123', event: 'RADAR_P0_SIGNAL' });
    const sig = signWebhookPayload(body, TEST_SECRET, staleSec);
    const sigHeader = `t=${staleSec},v1=${sig}`;

    const req = createRequest(body, sigHeader);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('tolerance window');
  });

  it('7. returns 400 when body is malformed JSON', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const body = '{ invalid-json ';
    const sig = signWebhookPayload(body, TEST_SECRET, nowSec);
    const sigHeader = `t=${nowSec},v1=${sig}`;

    const req = createRequest(body, sigHeader);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Malformed JSON');
  });

  it('8. returns 400 when required payload fields are missing', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ onlySomeField: 'value' });
    const sig = signWebhookPayload(body, TEST_SECRET, nowSec);
    const sigHeader = `t=${nowSec},v1=${sig}`;

    const req = createRequest(body, sigHeader);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Missing required payload fields');
  });

  it('9. returns 200 OK with delivery acknowledgment when signature and payload are valid', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      deliveryId: 'del-valid-456',
      event: 'RADAR_P0_SIGNAL',
      alert: { id: 'alt-789', severity: 'critical' },
    };
    const body = JSON.stringify(payload);
    const sig = signWebhookPayload(body, TEST_SECRET, nowSec);
    const sigHeader = `t=${nowSec},v1=${sig}`;

    const req = createRequest(body, sigHeader);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(json.deliveryId).toBe('del-valid-456');
    expect(json.event).toBe('RADAR_P0_SIGNAL');
  });
});
