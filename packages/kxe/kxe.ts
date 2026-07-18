import { ResolvedKnowledgeSession } from "../engine/types";
import { ExperienceState, ExperienceAction, KXEPlugin } from "./types";
import { StateManager, Listener } from "./managers/state";
import { StageManager, StageGuard } from "./managers/stage";
import { PluginManager } from "./managers/plugin";

export class KnowledgeExperienceEngine {
  private stateManager: StateManager;
  private stageManager: StageManager;
  private pluginManager: PluginManager;
  private isDispatching: boolean = false;

  constructor(session: ResolvedKnowledgeSession, totalStages: number = 3) {
    const initialState: ExperienceState = {
      session,
      navigation: {
        currentStageIndex: 0,
        totalStages,
        canGoNext: totalStages > 1,
        canGoPrevious: false,
      },
      plugins: {
        activeIds: [],
        pluginState: {},
      },
      ui: {
        isTransitioning: false,
        transientState: {},
      },
      diagnostics: [],
    };

    this.stateManager = new StateManager(initialState);
    this.stageManager = new StageManager(this.stateManager);
    this.pluginManager = new PluginManager(this.stateManager);
  }

  public getState(): Readonly<ExperienceState> {
    return this.stateManager.getState();
  }

  public dispatch(action: ExperienceAction): void {
    if (this.isDispatching) {
      // Prevent recursive dispatches
      console.warn("KXE: Cannot dispatch actions while already dispatching.");
      return;
    }

    try {
      this.isDispatching = true;
      this.stateManager.dispatch(action);

      // Now notify plugins so they can react to the state update
      this.pluginManager.onStateUpdate(action);

    } finally {
      this.isDispatching = false;
    }
  }

  public subscribe(listener: Listener): () => void {
    return this.stateManager.subscribe(listener);
  }

  // --- Convenience Methods to bypass raw string dispatching ---

  public nextStage(): void {
    this.stageManager.navigateNext();
  }

  public previousStage(): void {
    this.stageManager.navigatePrevious();
  }

  public jumpToStage(index: number): void {
    this.stageManager.jumpTo(index);
  }

  public registerGuard(stageIndex: number, guard: StageGuard): void {
    this.stageManager.registerGuard(stageIndex, guard);
  }

  public registerPlugin(plugin: KXEPlugin): void {
    this.pluginManager.register(plugin);
  }

  public activatePlugin(pluginId: string): void {
    this.pluginManager.activate(pluginId);
  }

  public deactivatePlugin(pluginId: string): void {
    this.pluginManager.deactivate(pluginId);
  }
}
