import { KOSPlugin } from "../../packages/plugin-sdk/registry";
import { citationsManifest } from "./manifest";
import { CitationsEnginePlugin } from "./engine";
import { CitationsKXEPlugin } from "./kxe";
import { CitationRenderer } from "./renderer";

export const CitationsPlugin: KOSPlugin = {
  manifest: citationsManifest,
  engine: CitationsEnginePlugin,
  kxe: CitationsKXEPlugin,
  renderer: CitationRenderer,
};

export * from "./manifest";
export * from "./engine";
export * from "./kxe";
export * from "./renderer";
