// ── External Interfaces & Platform Extensibility Specification (Phase 19B) ───
// Immutable Extensibility domain interfaces.

export type APIVersionLifecycle = 'PREVIEW' | 'STABLE' | 'DEPRECATED';
export type PluginTrustLevel = 'FIRST_PARTY' | 'THIRD_PARTY';

export interface APIVersionDefinition {
  version: string; // e.g. "v1.0"
  lifecycle: APIVersionLifecycle;
  supportedSchema: string;
  deprecationDate?: string;
  compatibilityRules: readonly string[];
}

export interface PublicAPIEndpoint {
  endpointId: string;
  path: string;
  method: 'GET' | 'POST';
  version: string;
  projectionContract: string;
  rateLimitReqPerMin: number;
}

export interface WebhookEventPayload {
  eventId: string;
  eventVersion: string;
  eventType: 'FixPublished' | 'EvidenceVerified' | 'ClaimUpdated';
  timestamp: string;
  retryCount: number;
  deliveryAttempt: number;
  idempotencyKey: string;
  signature: string; // HMAC SHA-256
  data: Record<string, unknown>;
}

export interface WebhookSubscription {
  subscriptionId: string;
  targetUrl: string;
  subscribedEvents: readonly string[];
  secretKey: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface PluginCapability {
  capabilityId: string;
  name: string;
  description: string;
  granted: boolean;
}

export interface ExtensionPluginManifest {
  pluginId: string;
  name: string;
  version: string;
  apiVersionCompatibility: string;
  trustLevel: PluginTrustLevel;
  requiredCapabilities: readonly string[];
  resourceLimits: { maxMemoryMb: number; maxExecutionTimeMs: number };
}

export interface ExtensionPlugin {
  manifest: ExtensionPluginManifest;
  status: 'REGISTERED' | 'ACTIVE' | 'DISABLED';
  registeredAt: string;
}

export interface SDKContract {
  sdkVersion: string;
  language: 'TypeScript' | 'Python';
  generatedFromSpec: string;
  specVersion: string;
  buildStatus: 'SUCCESS' | 'BUILDING' | 'FAILED';
  compiledAt: string;
}

export interface ExternalInterfaceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  apiVersions: readonly APIVersionDefinition[];
  endpoints: readonly PublicAPIEndpoint[];
  activeWebhooks: readonly WebhookSubscription[];
  webhookMetrics: { totalDelivered: number; successRate: number; retryRate: number };
  registeredPlugins: readonly ExtensionPlugin[];
  sdkContracts: readonly SDKContract[];
}
