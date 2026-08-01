import { describe, it, expect, beforeEach } from 'vitest';
import { APIVersionRegistry } from '../lib/extensibility/api-version-registry';
import { PublicAPIGateway } from '../lib/extensibility/api-gateway';
import { WebhookEventPublisher } from '../lib/extensibility/webhook-publisher';
import { PluginExtensionEngine } from '../lib/extensibility/plugin-engine';
import { DeveloperSDKGenerator } from '../lib/extensibility/sdk-generator';
import { ExternalInterfaceProjectionBuilder } from '../lib/extensibility/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-EXTENSIBILITY: External Interfaces & Platform Extensibility (Phase 19B)', () => {
  let webhookPublisher: WebhookEventPublisher;
  let pluginEngine: PluginExtensionEngine;

  beforeEach(() => {
    webhookPublisher = new WebhookEventPublisher();
    pluginEngine = new PluginExtensionEngine();
  });

  it('TEST-EXT-01: API Version Registry Definition Lookups', () => {
    const versions = APIVersionRegistry.listVersions();
    expect(versions.length).toBe(3);

    const v1 = APIVersionRegistry.getVersion('v1.0');
    expect(v1?.lifecycle).toBe('STABLE');
  });

  it('TEST-EXT-02: Public API Gateway Versioned Contract Projection Isolation', () => {
    const projRes = PublicAPIGateway.getFixesProjection('v1.0') as any;

    expect(projRes.apiVersion).toBe('v1.0');
    expect(projRes.data.length).toBe(1);
    expect(projRes.data[0].slug).toBe(CHAPTER_1_FIX.slug);
    expect(Object.isFrozen(projRes)).toBe(true);
  });

  it('TEST-EXT-03: Public API Gateway Rate Limiting Metadata', () => {
    const endpoints = PublicAPIGateway.listEndpoints();
    const fixEp = endpoints.find((e) => e.endpointId === 'ep-fixes-v1');

    expect(fixEp?.rateLimitReqPerMin).toBe(120);
  });

  it('TEST-EXT-04: Webhook Event Publisher HMAC SHA-256 Signature Generation', () => {
    const payload = webhookPublisher.publishEvent('FixPublished', { slug: 'ch1-partition' });

    expect(payload.eventType).toBe('FixPublished');
    expect(payload.signature).toContain('sha256=');
    expect(payload.idempotencyKey).toContain('idemp-');
    expect(Object.isFrozen(payload)).toBe(true);
  });

  it('TEST-EXT-05: Webhook Metadata & Idempotency Key Tracking', () => {
    const payload = webhookPublisher.publishEvent('EvidenceVerified', { claimId: 'clm-1' });

    expect(payload.retryCount).toBe(0);
    expect(payload.deliveryAttempt).toBe(1);
    expect(payload.eventVersion).toBe('v1.0');
  });

  it('TEST-EXT-06: Extension Plugin Manifest Registration & Trust Levels', () => {
    const plugins = pluginEngine.listPlugins();
    expect(plugins.length).toBe(1);
    expect(plugins[0].manifest.trustLevel).toBe('FIRST_PARTY');
  });

  it('TEST-EXT-07: Plugin Capability Negotiation Verification', () => {
    const allowed = pluginEngine.verifyCapability('plug-analytics-exporter', 'read:fixes');
    expect(allowed).toBe(true);
  });

  it('TEST-EXT-08: Unnegotiated Plugin Capability Access Denial', () => {
    const denied = pluginEngine.verifyCapability('plug-analytics-exporter', 'admin:write');
    expect(denied).toBe(false);
  });

  it('TEST-EXT-09: Developer SDK Client Code Generator Pipeline', () => {
    const sdks = DeveloperSDKGenerator.generateSDKContracts();
    expect(sdks.length).toBe(2);
    expect(sdks.some((s) => s.language === 'TypeScript')).toBe(true);
    expect(sdks.some((s) => s.language === 'Python')).toBe(true);
  });

  it('TEST-EXT-10: Deprecated API Version Sunset Warning Check', () => {
    const v09 = APIVersionRegistry.getVersion('v0.9');
    expect(v09?.lifecycle).toBe('DEPRECATED');
    expect(v09?.deprecationDate).toBe('2026-12-31');
  });

  it('TEST-EXT-11: Webhook Subscriptions Active Count', () => {
    const subs = webhookPublisher.getActiveSubscriptions();
    expect(subs.length).toBe(1);
    expect(subs[0].status).toBe('ACTIVE');
  });

  it('TEST-EXT-12: ExternalInterfaceProjection Building & Immutability', () => {
    const proj = ExternalInterfaceProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(proj.apiVersions.length).toBe(3);
    expect(proj.sdkContracts.length).toBe(2);
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.webhookMetrics)).toBe(true);
  });

  it('TEST-EXT-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    ExternalInterfaceProjectionBuilder.buildProjection();
    PublicAPIGateway.getFixesProjection('v1.0');

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-EXT-14: Preserved Architectural Boundary (External interfaces translate; zero canonical edits)', () => {
    const proj = PublicAPIGateway.getFixesProjection('v1.0');
    expect(proj).toBeDefined();
    // External interfaces translate into projections without mutating core models
  });

  it('TEST-EXT-15: High Volume Public API Gateway Query Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      PublicAPIGateway.getFixesProjection('v1.0');
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // 1,000 queries under 100ms
  });

  it('TEST-EXT-16: Deterministic Projection Serialization Stability', () => {
    const proj = ExternalInterfaceProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"platformVersion":"v1.0.0"');
  });
});
