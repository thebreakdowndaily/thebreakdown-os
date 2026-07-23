import React from "react";
import type { Renderer } from "../../renderer/types";
import { PluginManifest } from "../manifest";
import { ExperienceState } from "../../kxe/types";
import { SessionExtension } from "../../engine/types";

export type { Renderer };

export interface RendererProps<TState, TData> {
  state: Readonly<ExperienceState>;
  pluginState: TState;
  extensionData: TData;
}

export interface RendererConfig<TState, TData> {
  manifest: PluginManifest;
  render: React.ComponentType<RendererProps<TState, TData>>;
  fallback?: React.ReactNode;
}

export function createRenderer<TState, TData>(config: RendererConfig<TState, TData>): Renderer {
  const RenderComponent = config.render;
  
  return {
    id: config.manifest.id,
    version: config.manifest.version,
    displayName: config.manifest.displayName,
    capabilities: config.manifest.capabilities,
    render(state: Readonly<ExperienceState>) {
      const pluginState = state.plugins.pluginState[config.manifest.id] as TState | undefined;
      const extension = state.session.extensions[config.manifest.id] as SessionExtension | undefined;

      if (!pluginState || !extension) {
        return <>{config.fallback || null}</>;
      }

      return <RenderComponent state={state} pluginState={pluginState} extensionData={extension.data as TData} />;
    }
  };
}
