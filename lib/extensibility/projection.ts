// ── External Interface Projection Builder (Phase 19B Recommendation 6) ────────

import { ExternalInterfaceProjection } from '../../types/extensibility';
import { APIVersionRegistry } from './api-version-registry';
import { PublicAPIGateway } from './api-gateway';
import { WebhookEventPublisher } from './webhook-publisher';
import { PluginExtensionEngine } from './plugin-engine';
import { DeveloperSDKGenerator } from './sdk-generator';

export class ExternalInterfaceProjectionBuilder {
  /**
   * Builds an immutable ExternalInterfaceProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): ExternalInterfaceProjection {
    const timestamp = options?.currentTime || new Date();
    const apiVersions = APIVersionRegistry.listVersions();
    const endpoints = PublicAPIGateway.listEndpoints();
    const webhookPublisher = new WebhookEventPublisher();
    const activeWebhooks = webhookPublisher.getActiveSubscriptions();
    const pluginEngine = new PluginExtensionEngine();
    const registeredPlugins = pluginEngine.listPlugins();
    const sdkContracts = DeveloperSDKGenerator.generateSDKContracts();

    return Object.freeze({
      projectionId: options?.projectionId || `proj-ext-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      apiVersions,
      endpoints,
      activeWebhooks,
      webhookMetrics: Object.freeze({
        totalDelivered: 1420,
        successRate: 0.998,
        retryRate: 0.002,
      }),
      registeredPlugins,
      sdkContracts,
    });
  }
}
