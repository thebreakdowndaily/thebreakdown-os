import { StateManager } from "./state";
import { KXEPlugin } from "../types";

export class PluginManager {
  private plugins: Map<string, KXEPlugin> = new Map();
  private initialized: Set<string> = new Set();
  
  // We need to listen to state changes to pump `update` cycles to active plugins.
  private unsubscribe: (() => void) | null = null;

  constructor(private readonly store: StateManager) {
    // We subscribe so that when any action modifies the state, we can run the update() hook for active plugins.
    // However, Redux strongly discourages side effects inside reducers. 
    // The proper way is a middleware or subscribing.
    // But if we subscribe and then dispatch inside the subscriber, we might get infinite loops.
    // So for now, we leave update() to be explicitly called, or we wrap dispatch.
    // We'll wrap dispatch via KXE engine itself, not here, to keep things clean.
  }

  public register(plugin: KXEPlugin) {
    this.plugins.set(plugin.id, plugin);
    if (plugin.initialize) {
      plugin.initialize();
      this.initialized.add(plugin.id);
    }
  }

  public activate(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      this.store.dispatch({
        type: "UNKNOWN_PLUGIN",
        payload: pluginId
      });
      return;
    }

    const state = this.store.getState();
    if (state.plugins.activeIds.includes(pluginId)) {
      // Already active, handled by reducer, but let's dispatch to let reducer log it
      this.store.dispatch({ type: "ACTIVATE_PLUGIN", payload: pluginId });
      return;
    }

    // 1. Run lifecycle hook
    let initialState = {};
    if (plugin.activate) {
      initialState = plugin.activate(state) || {};
    }

    // 2. Dispatch activation to global state
    this.store.dispatch({ type: "ACTIVATE_PLUGIN", payload: pluginId });
    
    // 3. Sync initial state back to global store
    if (Object.keys(initialState).length > 0) {
      this.store.dispatch({ 
        type: "UPDATE_PLUGIN_STATE", 
        payload: { pluginId, newState: initialState } 
      });
    }
  }

  public deactivate(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    const state = this.store.getState();
    if (state.plugins.activeIds.includes(pluginId) && plugin.deactivate) {
      plugin.deactivate(state, state.plugins.pluginState[pluginId]);
    }

    this.store.dispatch({ type: "DEACTIVATE_PLUGIN", payload: pluginId });
  }

  // Called by KXE engine loop when actions occur
  public onStateUpdate(action: any) {
    const state = this.store.getState();
    for (const activeId of state.plugins.activeIds) {
      const plugin = this.plugins.get(activeId);
      if (plugin && plugin.update) {
        const pluginState = state.plugins.pluginState[activeId];
        const nextPluginState = plugin.update(state, action, pluginState);
        
        if (nextPluginState !== pluginState) {
          this.store.dispatch({
            type: "UPDATE_PLUGIN_STATE",
            payload: { pluginId: activeId, newState: nextPluginState }
          });
        }
      }
    }
  }
}
