import { StateManager } from "./state";
import { ExperienceAction } from "../types";

export interface StageGuard {
  canEnter: (state: unknown) => boolean;
  canLeave: (state: unknown) => boolean;
}

export class StageManager {
  private guards: Map<number, StageGuard> = new Map();

  constructor(private readonly store: StateManager) {}

  public registerGuard(stageIndex: number, guard: StageGuard) {
    this.guards.set(stageIndex, guard);
  }

  public navigateNext() {
    this.requestTransition("NEXT_STAGE");
  }

  public navigatePrevious() {
    this.requestTransition("PREVIOUS_STAGE");
  }

  public jumpTo(stageIndex: number) {
    this.requestTransition("JUMP_TO_STAGE", stageIndex);
  }

  private requestTransition(actionType: string, payload?: number) {
    const state = this.store.getState();
    const currentIndex = state.navigation.currentStageIndex;

    // 1. Check if we can leave the current stage
    const currentGuard = this.guards.get(currentIndex);
    if (currentGuard && !currentGuard.canLeave(state)) {
      this.store.dispatch({
        type: "TRANSITION_BLOCKED",
        meta: { timestamp: new Date().toISOString(), source: "stage-manager" }
      });
      return;
    }

    // 2. Dispatch the actual transition action
    const action: ExperienceAction = { type: actionType, payload };
    this.store.dispatch(action);

    // 3. Post-transition hooks (e.g. check if we successfully entered, handle side effects)
    // In a mature implementation, we could verify the state actually changed before triggering 'enter' effects.
  }
}
