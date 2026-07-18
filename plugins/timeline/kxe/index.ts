import { createKXEPlugin } from "../../../packages/plugin-sdk";
import { TimelineExtensionData } from "../engine";
import { timelineManifest } from "../manifest";

export interface TimelinePluginState {
  selectedYear: number | null;
  zoomLevel: number;
  isPlaying: boolean;
  activeWindowStart: number;
  activeWindowEnd: number;
}

export const TimelineKXEPlugin = createKXEPlugin<TimelinePluginState>({
  manifest: timelineManifest,
  initialState: {
    selectedYear: null,
    zoomLevel: 1,
    isPlaying: false,
    activeWindowStart: new Date().getFullYear(),
    activeWindowEnd: new Date().getFullYear(),
  },
  onActivate: (state, extension) => {
    const timelineData = extension?.data as TimelineExtensionData | undefined;
    return {
      selectedYear: null,
      zoomLevel: 1,
      isPlaying: false,
      activeWindowStart: timelineData?.activeWindowStart ?? new Date().getFullYear(),
      activeWindowEnd: timelineData?.activeWindowEnd ?? new Date().getFullYear(),
    };
  },
  onUpdate: (state, action, pluginState) => {
    switch (action.type) {
      case "timeline/selectYear":
        return { ...pluginState, selectedYear: action.payload as number };
      case "timeline/setZoom":
        return { ...pluginState, zoomLevel: action.payload as number };
      case "timeline/play":
        return { ...pluginState, isPlaying: true };
      case "timeline/pause":
        return { ...pluginState, isPlaying: false };
      case "timeline/setWindow":
        const { start, end } = action.payload as { start: number, end: number };
        return { ...pluginState, activeWindowStart: start, activeWindowEnd: end };
      default:
        return pluginState;
    }
  }
});
