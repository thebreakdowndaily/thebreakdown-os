import { PromptBuilder } from '../core/prompt-builder';
import { AIClient } from '../core/ai-client';
import { GroundingValidator } from '../core/grounding-validator';
import { ENTITY_COPILOT_SYSTEM_PROMPT } from '../prompts/entity';
import { EntityCopilotContext } from '@/types/canonical';

export class EntitySkill {
  constructor(
    private aiClient: AIClient,
    private validator: GroundingValidator
  ) {}

  generateSuggestedQuestions(context: EntityCopilotContext): string[] {
    // Generate context-aware questions
    const questions = [
      `Explain recent developments for ${context.name}`,
    ];
    
    if (context.relationships.length > 0) {
      questions.push(`Why are they connected to ${context.relationships[0].targetName}?`);
    }
    
    if (context.timeline.length > 0) {
      questions.push(`Summarize the timeline events from ${new Date(context.timeline[0].date).getFullYear()}`);
    }
    
    if (context.claims.length > 0) {
      questions.push(`What evidence supports the claim about ${context.claims[0].claim.substring(0, 20)}...?`);
    }

    questions.push('What are the biggest risks based on the coverage?');
    
    return questions;
  }

  execute(context: EntityCopilotContext, userPrompt: string): ReadableStream {
    const builder = new PromptBuilder();
    
    const messages = builder
      .withSystemPrompt(ENTITY_COPILOT_SYSTEM_PROMPT)
      .withContext(context)
      .withQuestion(userPrompt)
      .build();

    // Stream generation. The validator should ideally sit between chunks
    // or validate post-generation in a real system. For now, we stream raw.
    return this.aiClient.generateStream(messages);
  }
}
