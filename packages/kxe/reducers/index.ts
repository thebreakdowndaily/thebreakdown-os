import { ExperienceState, ExperienceAction } from "../types";
import { navigationReducer } from "./navigation";
import { pluginReducer } from "./plugins";
import { uiReducer } from "./ui";

export function rootReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  // Pass through all slice reducers
  let nextState = navigationReducer(state, action);
  nextState = pluginReducer(nextState, action);
  nextState = uiReducer(nextState, action);

  return nextState;
}
