import { ExperienceState, ExperienceAction } from "../types";

export function pluginReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  if (action.type === "ACTIVATE_PLUGIN") {
    const pluginId = action.payload as string;
    
    if (state.plugins.activeIds.includes(pluginId)) {
      return {
        ...state,
        diagnostics: [
          ...state.diagnostics,
          {
            type: "DUPLICATE_ACTIVATION",
            message: `Plugin '${pluginId}' is already active.`,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }

    return {
      ...state,
      plugins: {
        ...state.plugins,
        activeIds: [...state.plugins.activeIds, pluginId]
      }
    };
  }

  if (action.type === "DEACTIVATE_PLUGIN") {
    const pluginId = action.payload as string;
    
    if (!state.plugins.activeIds.includes(pluginId)) {
      return {
        ...state,
        diagnostics: [
          ...state.diagnostics,
          {
            type: "UNKNOWN_PLUGIN",
            message: `Cannot deactivate unknown or inactive plugin '${pluginId}'.`,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }

    const newActiveIds = state.plugins.activeIds.filter(id => id !== pluginId);
    
    // We should also theoretically clean up the plugin's state, but PluginManager handles that lifecycle hook.
    // The reducer just updates the activeIds array and maybe clears state.
    const newPluginState = { ...state.plugins.pluginState };
    delete newPluginState[pluginId];

    return {
      ...state,
      plugins: {
        activeIds: newActiveIds,
        pluginState: newPluginState
      }
    };
  }

  // internal action used by PluginManager to sync plugin internal states back to global state
  if (action.type === "UPDATE_PLUGIN_STATE") {
    const { pluginId, newState } = action.payload as { pluginId: string, newState: unknown };
    return {
      ...state,
      plugins: {
        ...state.plugins,
        pluginState: {
          ...state.plugins.pluginState,
          [pluginId]: newState
        }
      }
    };
  }

  return state;
}
