import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';
import { CanvasShaderBackground } from './CanvasShaderBackground';
import { HUDOverlay } from './HUDOverlay';

/* ═══════════════════════════════════════════════════════════
   THE CORE AWAKENING — Master Composition
   15s (450 frames @ 30fps)

   Orchestrates:
   - GLSL Background (Canvas 2D shader)
   - GSAP HUD Overlay (DOM + timeline scrub)
   - Remotion frame-accurate sequencing

   Scene 1: Boot        (0–150)    0s–5s
   Scene 2: Ignition    (150–300)  5s–10s
   Scene 3: Assimilate  (300–450)  10s–15s
   ═══════════════════════════════════════════════════════════ */

export const TheCoreAwakening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;

  // Determine current phase
  const phase = frame < 150 ? 0 : frame < 300 ? 1 : 2;
  const phaseStart = phase === 0 ? 0 : phase === 1 ? 150 : 300;
  const phaseProgress = Math.min(1, (frame - phaseStart) / 150);

  // Master opacity: fade in from black at start, fade out at end
  const masterOpacity = interpolate(frame, [0, 15, 420, 450], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity: masterOpacity }}>
      {/* Layer 1: GLSL Shader Background */}
      <CanvasShaderBackground
        width={width}
        height={height}
        time={time}
        phase={phase}
        phaseProgress={phaseProgress}
      />

      {/* Layer 2: GSAP HUD Overlay */}
      <HUDOverlay />

      {/* Layer 3: Scan line overlay (subtle CRT feel) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)',
        opacity: 0.4,
      }} />
    </AbsoluteFill>
  );
};
