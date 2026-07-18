import { KXEPlugin, ExperienceState, ExperienceAction } from "../../kxe/types";
import { PluginManifest } from "../manifest";
import { SessionExtension } from "../../engine/types";

export interface KXEPluginConfig<TState> {
  manifest: PluginManifest;
  initialState: TState;
  onActivate?: (state: Readonly<ExperienceState>, extension?: SessionExtension) => TState;
  onUpdate: (state: Readonly<ExperienceState>, action: ExperienceAction, pluginState: TState) => TState;
  onDeactivate?: () => void;
}

export function createKXEPlugin<TState>(config: KXEPluginConfig<TState>): KXEPlugin<TState> {
  return {
    id: config.manifest.id,
    name: config.manifest.displayName,
    initialize() {
      // Setup handled by KXE
    },
    activate(state: Readonly<ExperienceState>) {
      if (config.onActivate) {
        const extension = state.session.extensions[config.manifest.id];
        return config.onActivate(state, extension);
      }
      return config.initialState;
    },
    update(state: Readonly<ExperienceState>, action: ExperienceAction, pluginState: TState) {
      // Only process actions namespaced for this plugin, unless it's a global reset
      if (action.type.startsWith(`${config.manifest.id}/`)) {
        return config.onUpdate(state, action, pluginState);
      }
      return pluginState;
    },
    deactivate() {
      if (config.onDeactivate) {
        config.onDeactivate();
      }
    }
  };
}
