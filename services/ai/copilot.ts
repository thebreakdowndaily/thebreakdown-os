import { StreamService } from './core/stream-service';
import { GroundingValidator } from './core/grounding-validator';
import { MockProvider } from './providers/mock';
import { EntitySkill } from './skills/entity';
import { EntityCopilotContext } from '@/types/canonical';

/**
 * KnowledgeCopilot
 * The main orchestrator for AI interactions across the platform.
 */
export class KnowledgeCopilot {
  private streamService: StreamService;
  private validator: GroundingValidator;
  
  // Skills
  public entity: EntitySkill;

  constructor() {
    this.streamService = new StreamService();
    this.validator = new GroundingValidator();
    
    // Defaulting to MockProvider for development
    const provider = new MockProvider();
    
    this.entity = new EntitySkill(provider, this.validator);
  }

  createStreamResponse(stream: ReadableStream): Response {
    return this.streamService.createStreamResponse(stream);
  }
}

// Singleton export
export const copilot = new KnowledgeCopilot();
