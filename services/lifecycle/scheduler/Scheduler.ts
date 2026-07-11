import { SourceRegistry } from '../registry/SourceRegistry';
import { SourceProvider } from '../providers/SourceProvider';

export class Scheduler {
  constructor(
    private registry: SourceRegistry,
    private providers: SourceProvider[]
  ) {}

  /**
   * Evaluates CRON expressions for active sources and triggers them.
   * For this implementation, we allow manual triggering of a source.
   */
  async trigger(sourceId: string) {
    const source = this.registry.get(sourceId);
    if (!source) throw new Error(`Source ${sourceId} not found`);
    if (!source.enabled || source.status === 'paused') return;

    const provider = this.providers.find(p => p.supports(source));
    if (!provider) throw new Error(`No provider found for ${source.provider}`);

    try {
      const snapshot = await provider.fetchLatest(source);
      const isValid = await provider.validate(snapshot);
      if (isValid) {
        const doc = await provider.normalize(snapshot);
        source.lastSuccess = new Date().toISOString();
        source.failureCount = 0;
        source.status = 'active';
        return doc;
      } else {
        throw new Error('Validation failed');
      }
    } catch (err) {
      source.failureCount++;
      source.lastFailure = new Date().toISOString();
      if (source.failureCount >= 3) {
        source.status = 'failing';
      }
      throw err;
    }
  }
}
