import { ExperienceState, ExperienceAction } from "../types";

export function uiReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  if (action.type === "SET_UI_STATE") {
    const payload = action.payload as Record<string, unknown>;
    return {
      ...state,
      ui: {
        ...state.ui,
        transientState: {
          ...state.ui.transientState,
          ...payload
        }
      }
    };
  }

  if (action.type === "SET_TRANSITIONING") {
    const isTransitioning = action.payload as boolean;
    return {
      ...state,
      ui: {
        ...state.ui,
        isTransitioning
      }
    };
  }

  return state;
}
