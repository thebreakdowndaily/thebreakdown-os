import { KOSPlugin } from "../../packages/plugin-sdk/registry";
import { timelineManifest } from "./manifest";
import { TimelineEnginePlugin } from "./engine";
import { TimelineKXEPlugin } from "./kxe";
import { TimelineRenderer } from "./renderer";

export const TimelinePlugin: KOSPlugin = {
  manifest: timelineManifest,
  engine: TimelineEnginePlugin,
  kxe: TimelineKXEPlugin,
  renderer: TimelineRenderer,
};

export * from "./manifest";
export * from "./engine";
export * from "./kxe";
export * from "./renderer";
