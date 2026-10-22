import { StreamService } from './core/stream-service';
import { GroundingValidator } from './core/grounding-validator';
import { AIClient } from './core/ai-client';
import { getAIProvider, ProviderFactoryOptions } from './providers/factory';
import { EntitySkill } from './skills/entity';

/**
 * KnowledgeCopilot
 * The main orchestrator for AI interactions across the platform.
 */
export class KnowledgeCopilot {
  private streamService: StreamService;
  private validator: GroundingValidator;
  private currentProvider: AIClient;
  
  // Skills
  public entity: EntitySkill;

  constructor(options?: ProviderFactoryOptions | AIClient) {
    this.streamService = new StreamService();
    this.validator = new GroundingValidator();

    if (options && typeof options === 'object' && 'generateStream' in options && 'generate' in options) {
      this.currentProvider = options as AIClient;
    } else {
      this.currentProvider = getAIProvider(options as ProviderFactoryOptions | undefined);
    }
    
    this.entity = new EntitySkill(this.currentProvider, this.validator);
  }

  /**
   * Dynamically switch the underlying AI provider.
   */
  public setProvider(provider: AIClient): void {
    this.currentProvider = provider;
    this.entity = new EntitySkill(this.currentProvider, this.validator);
  }

  /**
   * Returns the currently configured AI provider.
   */
  public getProvider(): AIClient {
    return this.currentProvider;
  }

  createStreamResponse(stream: ReadableStream): Response {
    return this.streamService.createStreamResponse(stream);
  }
}

// Singleton export
export const copilot = new KnowledgeCopilot();
