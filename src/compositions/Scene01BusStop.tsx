import React, { useRef, useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";
import { LPCSprite } from "../components/LPCSprite";

/* ─────────────── CONSTANTS ─────────────── */
const STAR_COUNT = 45;
const SMOKE_COUNT = 6;
const LEAF_COUNT = 5;

/* ─────────────── STARS (random but stable per-render) ─────────────── */
interface StarData {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function generateStars(count: number, seed: number): StarData[] {
  const stars: StarData[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * 100,
      y: rand() * 45, // top 45% only (sky region)
      size: 1.5 + rand() * 2.5,
      delay: rand() * 3,
      duration: 1.5 + rand() * 2.5,
    });
  }
  return stars;
}

/* ─────────────── COMPONENT ─────────────── */
export const Scene01BusStop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(() => generateStars(STAR_COUNT, 42), []);

  // ─── Fade in/out ───
  const sceneOpacity = interpolate(
    frame,
    [0, 20, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ─── Moon glow pulse ───
  const moonGlow = interpolate(
    frame,
    [0, 60, 120, 180, 210],
    [20, 35, 20, 35, 20],
    { extrapolateRight: "clamp" }
  );

  // ─── Lamp flicker ───
  const lampFlicker =
    0.85 + 0.15 * Math.sin(frame * 0.8) * Math.cos(frame * 1.3);

  // ─── Thought bubble ───
  const thoughtProgress = spring({
    frame: frame - 90, // appear at 3s
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  const thoughtText = "Mình sẽ mở tiệm bánh...";
  const visibleChars = Math.floor(
    interpolate(frame, [100, 170], [0, thoughtText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // ─── Time in seconds for CSS animations ───
  const timeSec = frame / fps;

  return (
    <AbsoluteFill
      ref={containerRef}
      style={{ opacity: sceneOpacity, backgroundColor: "#0a0a1a" }}
    >
      {/* ═══════ LAYER 0: Sky gradient ═══════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #0a0a2e 0%, #151540 30%, #1a1a4a 50%, #252560 100%)",
        }}
      />

      {/* ═══════ LAYER 0b: Stars twinkling ═══════ */}
      {stars.map((star, i) => {
        const twinkle =
          0.2 +
          0.8 *
            Math.abs(
              Math.sin((timeSec + star.delay) * (Math.PI / star.duration))
            );
        return (
          <div
            key={`star-${i}`}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: "#fffde7",
              opacity: twinkle,
              boxShadow: `0 0 ${star.size * 2}px ${star.size * 0.5}px rgba(255,253,231,${twinkle * 0.4})`,
            }}
          />
        );
      })}

      {/* ═══════ LAYER 0c: Moon + glow ═══════ */}
      <div
        style={{
          position: "absolute",
          right: "12%",
          top: "8%",
          width: 60,
          height: 60,
        }}
      >
        {/* Moon glow */}
        <div
          style={{
            position: "absolute",
            inset: -30,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,253,200,0.25) 0%, transparent 70%)",
            transform: `scale(${1 + moonGlow / 80})`,
          }}
        />
        {/* Moon body - crescent effect */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#fffde7",
            boxShadow: `0 0 ${moonGlow}px ${moonGlow / 2}px rgba(255,253,200,0.4)`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -5,
              left: 12,
              width: 45,
              height: 45,
              borderRadius: "50%",
              backgroundColor: "#151540",
            }}
          />
        </div>
      </div>

      {/* ═══════ LAYER 1: Background image (mountains+buildings+ground+busstop) ═══════ */}
      <Img
        src={staticFile("scene01/bg_night.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
        }}
      />

      {/* ═══════ LAYER 2: Chimney smoke particles ═══════ */}
      {Array.from({ length: SMOKE_COUNT }).map((_, i) => {
        const cycleTime = 4; // seconds per cycle
        const offset = (i / SMOKE_COUNT) * cycleTime;
        const t = ((timeSec + offset) % cycleTime) / cycleTime; // 0→1
        const smokeY = interpolate(t, [0, 1], [0, -180]);
        const smokeX = interpolate(t, [0, 1], [0, 40 + i * 5]);
        const smokeScale = interpolate(t, [0, 0.5, 1], [0.3, 1, 1.8]);
        const smokeOpacity = interpolate(t, [0, 0.2, 0.7, 1], [0, 0.35, 0.15, 0]);
        return (
          <div
            key={`smoke-${i}`}
            style={{
              position: "absolute",
              left: "32%",
              top: "35%",
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "rgba(180,180,200,0.6)",
              transform: `translate(${smokeX}px, ${smokeY}px) scale(${smokeScale})`,
              opacity: smokeOpacity,
              filter: "blur(2px)",
            }}
          />
        );
      })}

      {/* ═══════ LAYER 3: Falling leaves ═══════ */}
      {Array.from({ length: LEAF_COUNT }).map((_, i) => {
        const leafCycle = 6 + i * 1.2;
        const leafOffset = i * 1.5;
        const lt =
          ((timeSec + leafOffset) % leafCycle) / leafCycle;
        const leafY = interpolate(lt, [0, 1], [-30, height + 30]);
        const leafX =
          (20 + i * 15) * (width / 100) +
          Math.sin(lt * Math.PI * 3) * 40;
        const leafRot = lt * 720;
        const leafOp = interpolate(lt, [0, 0.1, 0.8, 1], [0, 0.7, 0.5, 0]);
        const leafColors = ["#4a7a3a", "#5a8a40", "#8a6a30", "#6a9a45", "#aa8833"];
        return (
          <div
            key={`leaf-${i}`}
            style={{
              position: "absolute",
              left: leafX,
              top: leafY,
              width: 7,
              height: 5,
              backgroundColor: leafColors[i % leafColors.length],
              borderRadius: "0 50% 50% 50%",
              transform: `rotate(${leafRot}deg)`,
              opacity: leafOp,
              imageRendering: "pixelated",
            }}
          />
        );
      })}

      {/* ═══════ LAYER 4: Lamp post glow ═══════ */}
      <div
        style={{
          position: "absolute",
          right: "22%",
          top: "42%",
          width: 280,
          height: 400,
          background: `radial-gradient(ellipse 40% 70% at 50% 0%, rgba(255,220,100,${0.2 * lampFlicker}) 0%, rgba(255,200,80,${0.08 * lampFlicker}) 40%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Lamp bulb glow */}
      <div
        style={{
          position: "absolute",
          right: "24.5%",
          top: "40%",
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: `rgba(255,230,120,${0.9 * lampFlicker})`,
          boxShadow: `0 0 20px 10px rgba(255,220,80,${0.5 * lampFlicker})`,
        }}
      />

      {/* ═══════ LAYER 5: Mia character (LPC Sprite) ═══════ */}
      <div
        style={{
          position: "absolute",
          right: "26%",
          bottom: "18%",
        }}
      >
        <LPCSprite
          src={staticFile("scene01/mia_lpc.png")}
          action={frame < 60 ? "walk_down" : "spellcast_up"} // Example changing action over time
          playing={frame < 60}
          scale={2.2} // Scale up the 64x64 frame
        />
      </div>

      {/* ═══════ LAYER 6: Thought bubble ═══════ */}
      {frame >= 85 && (
        <div
          style={{
            position: "absolute",
            right: "14%",
            bottom: "52%",
            transform: `scale(${thoughtProgress})`,
            transformOrigin: "bottom left",
            opacity: thoughtProgress,
          }}
        >
          {/* Bubble dots */}
          <div
            style={{
              position: "absolute",
              bottom: -15,
              left: 15,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.85)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: 30,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.85)",
            }}
          />
          {/* Main bubble */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: "14px 22px",
              maxWidth: 280,
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            <span
              style={{
                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                fontSize: 13,
                color: "#2a2a4a",
                lineHeight: 1.6,
                letterSpacing: 0.5,
              }}
            >
              {thoughtText.slice(0, visibleChars)}
              {visibleChars < thoughtText.length && (
                <span
                  style={{
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                >
                  ▌
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ═══════ Vignette overlay ═══════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
