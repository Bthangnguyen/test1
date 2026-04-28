import React from "react";
import { Series, AbsoluteFill } from "remotion";
import { Part01_TrendsVsTools } from "./sequences/Part01_TrendsVsTools";
import { Part02_DreamVsCollision } from "./sequences/Part02_DreamVsCollision";
import { Part03_ResponsibilityVsLogic } from "./sequences/Part03_ResponsibilityVsLogic";

/* ═══════════════════════════════════════════════════════════
   MASTER: THE ARCHITECTURE OF THOUGHT
   Total: 1,800 frames (1 minute @ 30fps)  —  COMPRESSED

   Part 1: Trends vs Tools         — 600 frames (20s)
   Part 2: Dream vs Collision       — 600 frames (20s)
   Part 3: Responsibility vs Logic  — 600 frames (20s)
   ═══════════════════════════════════════════════════════════ */

export const ArchitectureOfThoughtMain: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Series>
        <Series.Sequence durationInFrames={600}>
          <Part01_TrendsVsTools />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Part02_DreamVsCollision />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Part03_ResponsibilityVsLogic />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
