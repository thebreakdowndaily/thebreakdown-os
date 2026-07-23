import { ExperienceState, ExperienceAction } from "../types";
import { rootReducer } from "../reducers/index";

export type Listener = (state: Readonly<ExperienceState>) => void;

export class StateManager {
  private state: ExperienceState;
  private listeners: Set<Listener> = new Set();
  
  constructor(initialState: ExperienceState) {
    this.state = initialState;
  }

  public getState(): Readonly<ExperienceState> {
    return this.state;
  }

  public dispatch(action: ExperienceAction): void {
    // Add default meta if not provided
    if (!action.meta) {
      action.meta = {
        timestamp: new Date().toISOString(),
        source: "kxe-core"
      };
    }

    const nextState = rootReducer(this.state, action);
    
    if (nextState !== this.state) {
      this.state = nextState;
      this.notifyListeners();
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    // Determine the array of listeners once, to guarantee deterministic order
    // and resilience against listeners being added/removed during a notify cycle.
    const currentListeners = Array.from(this.listeners);
    
    for (const listener of currentListeners) {
      try {
        listener(this.state);
      } catch (err) {
        // One failing subscriber does not prevent others from being notified
        console.error("KXE StateManager: Subscriber threw an error.", err);
      }
    }
  }
}
