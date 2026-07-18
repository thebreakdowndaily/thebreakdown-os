import { EnginePlugin, EnginePluginContext, SessionExtension, ResolvedKnowledgeSession } from "../../engine/types";
import { PluginManifest } from "../manifest";

export interface EnginePluginConfig<TData> {
  manifest: PluginManifest;
  supports?: (session: ResolvedKnowledgeSession) => boolean;
  resolve: (ctx: EnginePluginContext) => TData;
}

export function createEnginePlugin<TData>(config: EnginePluginConfig<TData>): EnginePlugin {
  return {
    id: config.manifest.id,
    supports(session: ResolvedKnowledgeSession): boolean {
      if (config.supports) {
        return config.supports(session);
      }
      return config.manifest.capabilities.some(cap => session.capabilities.includes(cap));
    },
    resolve(ctx: EnginePluginContext): SessionExtension | null {
      const data = config.resolve(ctx);
      if (data === null || data === undefined) {
        return null;
      }
      return {
        id: config.manifest.id,
        version: config.manifest.version,
        data
      };
    }
  };
}
