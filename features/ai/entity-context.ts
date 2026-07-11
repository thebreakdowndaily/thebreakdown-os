import { EntityTerminalViewModel, EntityCopilotContext } from '@/types/canonical';

export function buildCopilotContext(viewModel: EntityTerminalViewModel): EntityCopilotContext {
  return {
    id: viewModel.id,
    name: viewModel.name,
    type: viewModel.type,
    description: viewModel.description,
    aliases: viewModel.aliases,
    timeline: viewModel.timeline,
    relationships: viewModel.relationships.map(r => ({
      targetName: r.entity.name,
      role: r.role,
      confidence: r.confidence,
      evidenceCount: r.evidence,
    })),
    claims: viewModel.claims,
    statistics: viewModel.statistics,
    signals: viewModel.signals,
    health: {
      confidence: viewModel.health.confidence,
      evidenceCount: viewModel.health.evidenceCount,
    }
  };
}
