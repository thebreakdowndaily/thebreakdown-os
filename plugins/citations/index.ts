import { KOSPlugin } from "../../packages/plugin-sdk/registry";
import { citationsManifest } from "./manifest";
import { CitationEnginePlugin } from "./engine";
import { CitationsKXEPlugin } from "./kxe";
import { CitationRenderer } from "./renderer";

export const CitationsPlugin: KOSPlugin = {
  manifest: citationsManifest,
  engine: CitationEnginePlugin,
  kxe: CitationsKXEPlugin,
  renderer: CitationRenderer,
};

export * from "./manifest";
export * from "./engine";
export * from "./kxe";
export * from "./renderer";
