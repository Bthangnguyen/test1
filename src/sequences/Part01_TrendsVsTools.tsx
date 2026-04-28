import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";
import { DotTyper } from "../components/DotTyper";
import {
  seededRandom,
  shockwave,
  screenShake,
} from "../utils/PhysicsUtils";

/* ═══════════════════════════════════════════════════════════
   PART 1: TRENDS ARE NOT THE TRUTH
   600 frames (20s @ 30fps)  —  COMPRESSED & AGGRESSIVE

   A (0–150):    Chaos circles spawn + orbit + trend words
   B (150–155):  2-frame BLACK SILENCE (Contrast Timing)
   C (155–210):  Gravity SUCK — all circles power4.in to center
   D (210–230):  Square SLAM — scale 3→1 + shockwave + shake
   E (230–600):  Square sits heavy. Typewriter lesson.
   ═══════════════════════════════════════════════════════════ */

const ACCENT = "#FF4D00";
const TREND_WORDS = [
  "Systems", "Stoicism", "Healing", "Mindfulness",
  "Manifestation", "Journaling", "Biohacking", "Flow State",
  "Cold Showers", "Dopamine Detox", "5AM Club", "Meditation",
];
const PASTEL_COLORS = [
  "rgba(180,180,200,0.4)", "rgba(200,170,190,0.35)", "rgba(170,190,210,0.35)",
  "rgba(190,200,170,0.35)", "rgba(210,180,170,0.35)", "rgba(175,185,195,0.4)",
];

interface FloatingCircle {
  x0: number; y0: number;
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
  size: number;
  color: string;
  word: string;
}

function generateCircles(): FloatingCircle[] {
  const circles: FloatingCircle[] = [];
  for (let i = 0; i < 22; i++) {
    circles.push({
      x0: 200 + seededRandom(i * 17) * 1520,
      y0: 150 + seededRandom(i * 31) * 780,
      orbitRadius: 30 + seededRandom(i * 47) * 80,
      orbitSpeed: 0.4 + seededRandom(i * 61) * 1.0,
      phase: seededRandom(i * 73) * Math.PI * 2,
      size: 40 + seededRandom(i * 89) * 60,
      color: PASTEL_COLORS[i % PASTEL_COLORS.length],
      word: TREND_WORDS[i % TREND_WORDS.length],
    });
  }
  return circles;
}

export const Part01_TrendsVsTools: React.FC = () => {
  const frame = useCurrentFrame();
  const circles = useMemo(() => generateCircles(), []);
  const timeSec = frame / 30;

  const masterOpacity = interpolate(
    frame, [0, 5, 570, 600], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ═══ Gravity SUCK progress (power4.in) ═══ */
  const suckRaw = interpolate(frame, [155, 210], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // power4.in: slow start then VIOLENT acceleration
  const suckEased = Math.pow(suckRaw, 4);

  /* ═══ Circles visible? ═══ */
  const circlesVisible = frame < 215;

  /* ═══ Black silence (Contrast Timing) ═══ */
  const isSilence = frame >= 150 && frame <= 152;

  /* ═══ Square SLAM ═══ */
  const slamActive = frame >= 210;
  const slamProgress = interpolate(frame, [210, 220], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scale: 3.0 → 1.0 with overshoot bounce
  const slamScale = slamActive
    ? 3.0 - 2.0 * (1 - Math.pow(1 - Math.min(slamProgress, 1), 3)) +
      (slamProgress > 0.5 && slamProgress < 1 ? Math.sin((slamProgress - 0.5) * Math.PI * 4) * 0.08 : 0)
    : 0;

  /* ═══ Shockwave ═══ */
  const shock = shockwave(frame, 215, 700, 30);

  /* ═══ Camera shake on slam ═══ */
  const slamShake = screenShake(frame, 215, 30, 18);

  /* ═══ Lesson text timing ═══ */
  const lessonOpacity = interpolate(frame, [280, 310], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        opacity: masterOpacity,
        overflow: "hidden",
      }}
    >
      {/* Black silence overlay */}
      {isSilence && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#000", zIndex: 100 }} />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${slamShake.x}px, ${slamShake.y}px)`,
        }}
      >
        {/* ═══ Floating circles ═══ */}
        {circlesVisible && circles.map((c, i) => {
          // Spawn stagger
          const spawnT = interpolate(frame, [i * 3, i * 3 + 15], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          if (spawnT <= 0) return null;

          // Frozen time during suck
          const frozenTime = frame < 155 ? timeSec : 155 / 30;
          const orbitX = c.x0 + Math.cos(frozenTime * c.orbitSpeed + c.phase) * c.orbitRadius;
          const orbitY = c.y0 + Math.sin(frozenTime * c.orbitSpeed * 0.7 + c.phase * 1.3) * c.orbitRadius * 0.6;

          // SUCK toward center
          const cx = orbitX + (960 - orbitX) * suckEased;
          const cy = orbitY + (540 - orbitY) * suckEased;

          // Shrink as they approach center
          const suckScale = 1 - suckEased * 0.9;
          const suckOpacity = 1 - suckEased * 0.8;

          // Word flicker (show word briefly on some circles)
          const wordCycle = Math.floor((frame + i * 20) / 40) % 5;
          const wordVisible = frame < 150 && wordCycle === 0;
          const wordOpacity = wordVisible
            ? interpolate((frame + i * 20) % 40, [0, 5, 25, 30], [0, 0.6, 0.6, 0], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              })
            : 0;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx - c.size / 2,
                top: cy - c.size / 2,
                width: c.size,
                height: c.size,
                borderRadius: "50%",
                border: `2px solid ${c.color}`,
                transform: `scale(${suckScale * spawnT})`,
                opacity: suckOpacity * spawnT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {wordOpacity > 0 && (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: Math.min(11, c.size * 0.2),
                  color: `rgba(200,200,210,${wordOpacity})`,
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}>
                  {c.word}
                </span>
              )}
            </div>
          );
        })}

        {/* ═══ Square SLAM ═══ */}
        {slamActive && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${Math.max(0.01, slamScale)})`,
              width: 80,
              height: 80,
              backgroundColor: ACCENT,
              boxShadow: `0 0 ${40 + slamProgress * 30}px rgba(255,77,0,${0.5 * Math.min(1, slamProgress * 2)}),
                           0 0 ${80 + slamProgress * 40}px rgba(255,77,0,${0.2 * Math.min(1, slamProgress * 2)})`,
            }}
          />
        )}

        {/* ═══ Shockwave ring ═══ */}
        {shock.opacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: shock.radius * 2,
              height: shock.radius * 2,
              borderRadius: "50%",
              border: `2px solid rgba(255,77,0,${shock.opacity})`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* ═══ Lesson section ═══ */}
        {slamActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
              opacity: lessonOpacity,
            }}
          >
            <div style={{ height: 120 }} /> {/* spacer for square */}
            <DotTyper
              text="It's a hammer."
              startFrame={310}
              fontSize={44}
              fontFamily="'Inter', sans-serif"
              charsPerFrame={3}
              style={{ fontWeight: 700 }}
            />
            <DotTyper
              text="You pick it up. You use it. You put it down."
              startFrame={400}
              fontSize={22}
              fontFamily="'Inter', sans-serif"
              charsPerFrame={2}
              color="rgba(245,245,245,0.55)"
            />
          </div>
        )}
      </div>

      {/* ═══ Chaos text ═══ */}
      {frame < 150 && (
        <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", maxWidth: 550 }}>
          <DotTyper text="Everyone is selling you a system..." startFrame={20} fontSize={22} charsPerFrame={2} color="rgba(245,245,245,0.45)" />
        </div>
      )}

      {/* ═══ Vignette ═══ */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />
    </AbsoluteFill>
  );
};
