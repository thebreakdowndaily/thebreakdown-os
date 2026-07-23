import React from "react";
import { createRenderer } from "../../../packages/plugin-sdk";
import { useDispatch } from "../../../packages/renderer/hooks";
import { TimelineExtensionData } from "../engine";
import { TimelinePluginState } from "../kxe";
import { timelineManifest } from "../manifest";

export const TimelineRenderer = createRenderer<TimelinePluginState, TimelineExtensionData>({
  manifest: timelineManifest,
  fallback: <div>Timeline initializing...</div>,
  render: function TimelineView({ state, pluginState, extensionData }) {
    const dispatch = useDispatch();

    return (
      <div className="timeline-container" style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Timeline</h2>
        <div className="timeline-controls" style={{ marginBottom: "20px" }}>
          <button 
            onClick={() => dispatch({ type: "timeline/play" })}
            disabled={pluginState.isPlaying}
          >
            Play
          </button>
          <button 
            onClick={() => dispatch({ type: "timeline/pause" })}
            disabled={!pluginState.isPlaying}
          >
            Pause
          </button>
          <span style={{ marginLeft: "10px" }}>
            Zoom Level: {pluginState.zoomLevel}
            <button onClick={() => dispatch({ type: "timeline/setZoom", payload: pluginState.zoomLevel + 1 })}>+</button>
            <button onClick={() => dispatch({ type: "timeline/setZoom", payload: Math.max(1, pluginState.zoomLevel - 1) })}>-</button>
          </span>
          <span style={{ marginLeft: "10px" }}>
            Selected Year: {pluginState.selectedYear || "None"}
          </span>
        </div>

        <div className="timeline-events" style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px" }}>
          {extensionData.events.map((event) => (
            <div 
              key={event.nodeId} 
              onClick={() => dispatch({ type: "timeline/selectYear", payload: event.startYear })}
              style={{ 
                minWidth: "150px", 
                padding: "10px", 
                border: pluginState.selectedYear === event.startYear ? "2px solid blue" : "1px solid #eee",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: pluginState.selectedYear === event.startYear ? "#eef" : "white"
              }}
            >
              <strong>{event.startYear}{event.endYear ? ` - ${event.endYear}` : ""}</strong>
              <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>{event.title}</p>
            </div>
          ))}
          {extensionData.events.length === 0 && (
            <p>No timeline events available for this topic.</p>
          )}
        </div>
      </div>
    );
  }
});
