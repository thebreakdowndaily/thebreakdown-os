import { ExperienceState, ExperienceAction } from "../types";

export function navigationReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  if (action.type === "NEXT_STAGE") {
    if (state.navigation.canGoNext) {
      const newIndex = state.navigation.currentStageIndex + 1;
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentStageIndex: newIndex,
          canGoNext: newIndex < state.navigation.totalStages - 1,
          canGoPrevious: true,
        }
      };
    } else {
      return {
        ...state,
        diagnostics: [
          ...state.diagnostics,
          {
            type: "INVALID_TRANSITION",
            message: "Cannot go to next stage (already at end).",
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  }

  if (action.type === "PREVIOUS_STAGE") {
    if (state.navigation.canGoPrevious) {
      const newIndex = state.navigation.currentStageIndex - 1;
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentStageIndex: newIndex,
          canGoNext: true,
          canGoPrevious: newIndex > 0,
        }
      };
    } else {
      return {
        ...state,
        diagnostics: [
          ...state.diagnostics,
          {
            type: "INVALID_TRANSITION",
            message: "Cannot go to previous stage (already at start).",
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  }

  if (action.type === "JUMP_TO_STAGE") {
    const targetIndex = action.payload as number;
    if (targetIndex >= 0 && targetIndex < state.navigation.totalStages) {
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentStageIndex: targetIndex,
          canGoNext: targetIndex < state.navigation.totalStages - 1,
          canGoPrevious: targetIndex > 0,
        }
      };
    } else {
      return {
        ...state,
        diagnostics: [
          ...state.diagnostics,
          {
            type: "INVALID_TRANSITION",
            message: `Cannot jump to stage ${targetIndex} (out of bounds).`,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  }

  return state;
}
