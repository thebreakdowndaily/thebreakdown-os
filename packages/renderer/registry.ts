import { Capability } from "../compiler/types";
import { Renderer } from "./types";

export class RendererRegistry {
  private readonly renderers = new Map<Capability, Renderer>();

  /**
   * Registers a renderer for its defined capabilities.
   * Throws an error if a capability is already registered.
   */
  public register(renderer: Renderer): void {
    for (const capability of renderer.capabilities) {
      if (this.renderers.has(capability)) {
        throw new Error(
          `RendererRegistry: Capability '${capability}' is already registered to renderer '${this.renderers.get(capability)?.id}'.`
        );
      }
    }

    for (const capability of renderer.capabilities) {
      this.renderers.set(capability, renderer);
    }
  }

  /**
   * Resolves a renderer for a given capability.
   * Returns null if no renderer is registered for that capability.
   */
  public resolve(capability: Capability): Renderer | null {
    return this.renderers.get(capability) || null;
  }
}
