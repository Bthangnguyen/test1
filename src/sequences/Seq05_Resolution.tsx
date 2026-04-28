import React from "react";
import {
  useCurrentFrame,
  AbsoluteFill,
  interpolate,
} from "remotion";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 5: THE RESOLUTION — Ending & Outro
   Frames: 0–600 (20 giây @ 30fps)
   ═══════════════════════════════════════════════════════════ */

const SLOGAN = "THE FUTURE IS AGENTIC";
const TAGLINE = "Powered by AI. Driven by Purpose.";

export const Seq05_Resolution: React.FC = () => {
  const frame = useCurrentFrame();

  /* ─── Master fade ─── */
  const masterOpacity = interpolate(
    frame, [0, 10, 510, 600], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ═══ Beat 1: Explosion ring (0–120) ═══ */
  const ringProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ringScale = interpolate(ringProgress, [0, 1], [0.1, 25]);
  const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0.9, 0.5, 0]);

  /* ═══ Beat 2: Slogan impact (100–370) ═══ */
  const sloganProgress = interpolate(frame, [100, 145], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // back.out(1.4) approximation
  const sloganScale = sloganProgress < 1
    ? sloganProgress * (2.4 * sloganProgress * sloganProgress - 1.4 * sloganProgress * sloganProgress + 1)
    : 1;
  const sloganY = interpolate(sloganProgress, [0, 1], [150, 0]);
  const sloganOpacity = interpolate(sloganProgress, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  /* ═══ Shimmer gradient position ═══ */
  const shimmerPos = interpolate(frame, [120, 500], [100, -100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Character stagger reveal ═══ */
  const sloganChars = SLOGAN.split("");

  /* ═══ Beat 3: Tagline (250–400) ═══ */
  const taglineProgress = interpolate(frame, [250, 290], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [25, 0]);

  /* ═══ Fade to black (last 3 seconds = 90 frames) ═══ */
  const fadeBlack = interpolate(frame, [510, 600], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06060c",
        opacity: masterOpacity,
        overflow: "hidden",
      }}
    >

      {/* ═══ Background ambient ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(99,102,241,0.08) 0%, transparent 60%)",
      }} />

      {/* ═══ Beat 1: Explosion ring ═══ */}
      {ringProgress > 0 && ringProgress < 1 && (
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 80, height: 80,
          borderRadius: "50%",
          border: "3px solid rgba(139,92,246,0.8)",
          boxShadow: "0 0 30px rgba(139,92,246,0.5), inset 0 0 30px rgba(139,92,246,0.2)",
          opacity: ringOpacity,
        }} />
      )}

      {/* ═══ Beat 2: Slogan with shimmer mask ═══ */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "42%",
          transform: `translate(-50%, -50%) translateY(${sloganY}px) scale(${Math.max(0.5, sloganScale)})`,
          opacity: sloganOpacity,
          display: "flex",
          gap: 0,
        }}
      >
        {sloganChars.map((char, i) => {
          const charDelay = 110 + i * 4;
          const charProgress = interpolate(frame, [charDelay, charDelay + 20], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const charRotation = interpolate(charProgress, [0, 1], [
            (i % 2 === 0 ? -1 : 1) * 60, 0
          ]);

          return (
            <span
              key={`${char}-${i}`}
              style={{
                display: "inline-block",
                fontFamily: "'Anton', 'Impact', sans-serif",
                fontSize: 120,
                fontWeight: 900,
                lineHeight: 1,
                // Shimmer gradient text fill
                background: `linear-gradient(
                  90deg,
                  #6366f1 0%,
                  #a855f7 25%,
                  #ec4899 50%,
                  #a855f7 75%,
                  #6366f1 100%
                )`,
                backgroundSize: "200% 100%",
                backgroundPosition: `${shimmerPos}% 0`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                opacity: charProgress,
                transform: `scale(${charProgress}) rotate(${charRotation}deg)`,
                textShadow: "none",
                filter: `drop-shadow(0 0 20px rgba(99,102,241,${charProgress * 0.3}))`,
                minWidth: char === " " ? "0.35em" : undefined,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* ═══ Beat 3: Tagline ═══ */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "58%",
          transform: `translate(-50%, 0) translateY(${taglineY}px)`,
          opacity: taglineProgress,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontSize: 28,
          fontWeight: 300,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {TAGLINE}
      </div>

      {/* ═══ Decorative horizontal line ═══ */}
      <div style={{
        position: "absolute",
        left: "35%", right: "35%",
        top: "55%",
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)",
        opacity: taglineProgress,
      }} />

      {/* ═══ Fade to black overlay ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "#000",
        opacity: fadeBlack,
        pointerEvents: "none",
      }} />

      {/* ═══ Vignette ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
