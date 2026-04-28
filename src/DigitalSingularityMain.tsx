import React from "react";
import { Series, AbsoluteFill } from "remotion";
import { Seq01_TheBreach } from "./sequences/Seq01_TheBreach";
import { Seq02_DataStorm } from "./sequences/Seq02_DataStorm";
import { Seq03_CrashRebirth } from "./sequences/Seq03_CrashRebirth";

/* ═══════════════════════════════════════════════════════════
   MASTER: THE DIGITAL SINGULARITY
   Total: 5,400 frames (3 minutes @ 30fps)

   Seq 1: THE BREACH       — 1350 frames (45s)
   Seq 2: THE DATA STORM   — 1350 frames (45s)
   Seq 3: THE CRASH & REBIRTH — 2700 frames (90s)
   ═══════════════════════════════════════════════════════════ */

export const DigitalSingularityMain: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#06060c" }}>
      <Series>
        <Series.Sequence durationInFrames={1350}>
          <Seq01_TheBreach />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1350}>
          <Seq02_DataStorm />
        </Series.Sequence>
        <Series.Sequence durationInFrames={2700}>
          <Seq03_CrashRebirth />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
