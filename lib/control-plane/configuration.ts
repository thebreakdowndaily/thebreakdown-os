// ── Runtime Configuration Service (Phase 18A WP5 / Recommendation 4) ──────────

import { RuntimeConfiguration } from '../../types/control-plane';
import { ConfigurationProvider } from './providers';

export class RuntimeConfigurationService implements ConfigurationProvider {
  private config: Readonly<RuntimeConfiguration>;

  constructor(customConfig?: Partial<RuntimeConfiguration>) {
    this.config = Object.freeze({
      maintenanceMode: false,
      featureFlags: Object.freeze({
        enableKnowledgeExplorer: true,
        enableResearchWorkspace: true,
        enablePublicPortal: true,
        enableTelemetry: true,
        enableAutomationJobs: true,
      }),
      buildVersion: 'v1.0.0-beta.18A',
      platformVersion: 'AR-13A.0',
      environment: 'production',
      maxConcurrentJobs: 5,
      ...customConfig,
    });
  }

  public getConfiguration(): RuntimeConfiguration {
    return this.config;
  }
}
