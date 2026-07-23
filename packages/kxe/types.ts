import { ResolvedKnowledgeSession } from "../engine/types";

export interface ExperienceDiagnostic {
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ExperienceState {
  readonly session: ResolvedKnowledgeSession;
  readonly navigation: {
    readonly currentStageIndex: number;
    readonly totalStages: number;
    readonly canGoNext: boolean;
    readonly canGoPrevious: boolean;
  };
  readonly plugins: {
    readonly activeIds: string[];
    readonly pluginState: Record<string, unknown>; // Opaque state managed by plugins
  };
  readonly ui: {
    readonly isTransitioning: boolean;
    readonly transientState: Record<string, unknown>;
  };
  readonly diagnostics: ExperienceDiagnostic[];
}

export interface ExperienceAction {
  type: string;
  payload?: unknown;
  meta?: {
    timestamp: string;
    source: string;
  };
}

export interface KXEPlugin<TState = unknown> {
  id: string;
  name: string;
  
  initialize?(): void;
  activate?(state: Readonly<ExperienceState>): TState;
  update?(state: Readonly<ExperienceState>, action: ExperienceAction, pluginState: TState): TState;
  deactivate?(state: Readonly<ExperienceState>, pluginState: TState): void;
  dispose?(): void;
}
