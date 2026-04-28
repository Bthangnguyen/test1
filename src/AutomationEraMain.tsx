import React from "react";
import { Series, AbsoluteFill } from "remotion";
import { Seq01_TheHook } from "./sequences/Seq01_TheHook";
import { Seq02_DataViz } from "./sequences/Seq02_DataViz";
import { Seq03_GlassUI } from "./sequences/Seq03_GlassUI";
import { Seq04_ChaosOrder } from "./sequences/Seq04_ChaosOrder";
import { Seq05_Resolution } from "./sequences/Seq05_Resolution";

/* ═══════════════════════════════════════════════════════════
   MASTER COMPOSITION: THE AUTOMATION ERA
   Total: 5,400 frames (3 phút @ 30fps)
   ═══════════════════════════════════════════════════════════ */

export const AutomationEraMain: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <Series>
        <Series.Sequence durationInFrames={900}>
          <Seq01_TheHook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1200}>
          <Seq02_DataViz />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1350}>
          <Seq03_GlassUI />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1350}>
          <Seq04_ChaosOrder />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Seq05_Resolution />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
