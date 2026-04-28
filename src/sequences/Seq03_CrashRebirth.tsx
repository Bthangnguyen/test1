import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";
import { GlitchText } from "../components/GlitchText";
import {
  seededRandom,
  bassAmplitude,
  screenShake,
  jitter,
  scanlineY,
} from "../utils/glitch";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 3: THE CRASH & REBIRTH
   2700 frames (90s @ 30fps)

   Beat 1 (0–300):      Screen shatter into 8×8 grid
   Beat 2 (300–1200):   Shard messages with micro-glitch
   Beat 3 (1200–2100):  Massive "SINGULARITY" noise-masked
   Beat 4 (2100–2700):  Char explosion → "THE FUTURE IS AGENTIC" → black
   ═══════════════════════════════════════════════════════════ */

const GRID = 4;
const SHARD_COUNT = GRID * GRID;

const SHARD_WORDS = [
  "ADAPT", "EVOLVE", "TRANSCEND", "OVERRIDE", "INFINITE",
  "NEURAL", "QUANTUM", "SWARM", "GENESIS", "APEX",
  "DECODE", "MUTATE", "ASCEND", "BREACH", "FUSION",
  "PRIME", "SURGE", "NEXUS", "OMEGA", "ZERO",
  // Fill remaining shards
  "NODE", "CORE", "FLUX", "SYNC", "GRID",
  "WAVE", "VOID", "LINK", "PULSE", "SHIFT",
  "LOOP", "HASH", "CODE", "DATA", "BYTE",
  "LOCK", "FORK", "PIPE", "MESH", "EDGE",
  "HEAP", "PUSH", "PULL", "BIND", "CAST",
  "CALL", "EMIT", "SCAN", "SEED", "TRAP",
  "WARP", "DROP", "FADE", "GLOW", "BURN",
  "MELT", "RIFT", "TORN", "WAKE", "DEEP",
  "DARK", "FAST", "FURY", "RAGE", "DOOM",
];

const FINAL_TEXT = "THE FUTURE IS AGENTIC";
const SINGULARITY_CHARS = "SINGULARITY".split("");

interface Shard {
  col: number;
  row: number;
  word: string;
  floatPhase: number;
  floatAmp: number;
}

function generateShards(): Shard[] {
  const shards: Shard[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const idx = row * GRID + col;
      shards.push({
        col,
        row,
        word: SHARD_WORDS[idx % SHARD_WORDS.length],
        floatPhase: seededRandom(idx * 37) * Math.PI * 2,
        floatAmp: 5 + seededRandom(idx * 53) * 15,
      });
    }
  }
  return shards;
}

/* ─── Noise texture for text masking (grid of seeded pixels) ─── */
const NOISE_SIZE = 48;
const NoiseTexture: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${NOISE_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${NOISE_SIZE}, 1fr)`,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: NOISE_SIZE * NOISE_SIZE }).map((_, i) => {
        const b = seededRandom(frame * 7919 + i) * 255;
        return (
          <div
            key={i}
            style={{ backgroundColor: `rgb(${b},${b},${b})` }}
          />
        );
      })}
    </div>
  );
};

export const Seq03_CrashRebirth: React.FC = () => {
  const frame = useCurrentFrame();
  const shards = useMemo(() => generateShards(), []);
  const timeSec = frame / 30;
  const bass = bassAmplitude(frame);

  const masterOpacity = interpolate(
    frame,
    [0, 10, 2650, 2700],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ═══ Screen shake — CRANKED ×3 ═══ */
  const initShake = screenShake(frame, 5, 36, 18);
  const microShake = {
    x: Math.sin(frame * 0.7) * (3 + bass * 6),
    y: Math.cos(frame * 0.9) * (3 + bass * 6),
  };

  /* ═══ Beat 1: Shatter (0–300) ═══ */
  const shatterProgress = interpolate(frame, [0, 250], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // power4.out easing for explosive start
  const shatterEased = 1 - Math.pow(1 - shatterProgress, 4);

  /* ═══ Beat 2: Shard float (300–1200) ═══ */
  const floatActive = frame >= 300 && frame < 1200;

  /* ═══ Beat 3: Merge + SINGULARITY (1200–2100) ═══ */
  const mergeProgress = interpolate(frame, [1200, 1400], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const singularityVisible = frame >= 1400 && frame < 2100;
  const singularityOpacity = interpolate(frame, [1400, 1450, 2050, 2100], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ═══ Beat 4: Char explosion + final text (2100–2700) ═══ */
  const charExplodeProgress = interpolate(frame, [2100, 2200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const finalTextProgress = interpolate(frame, [2250, 2310], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const finalTextScale = finalTextProgress < 1
    ? 0.5 + finalTextProgress * 0.5 * (1.1 - 0.1 * finalTextProgress)
    : 1;
  const finalTextOpacity = interpolate(frame, [2250, 2300, 2550, 2650], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ═══ Shimmer for final text ═══ */
  const shimmerPos = interpolate(frame, [2300, 2600], [100, -100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const w = 1920 / GRID;
  const h = 1080 / GRID;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06060c",
        opacity: masterOpacity,
        overflow: "hidden",
      }}
    >
      {/* ═══ Content with shake ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${initShake.x + microShake.x}px, ${initShake.y + microShake.y}px)`,
          perspective: 1200,
        }}
      >
        {/* ═══ Beat 1+2: Shards ═══ */}
        {mergeProgress < 1 &&
          shards.map((shard, idx) => {
            const cx = (shard.col + 0.5) / GRID - 0.5;
            const cy = (shard.row + 0.5) / GRID - 0.5;
            const dist = Math.sqrt(cx * cx + cy * cy);

            // Shatter: fly outward AGGRESSIVELY — power4.out distance
            const flyX = cx * 800 * shatterEased * (1 - mergeProgress);
            const flyY = cy * 600 * shatterEased * (1 - mergeProgress);
            const rotX =
              seededRandom(idx * 31) * 80 * shatterEased * (1 - mergeProgress) +
              (bass * 15 * seededRandom(idx * 47));
            const rotY =
              seededRandom(idx * 47) * 80 * shatterEased * (1 - mergeProgress) +
              (bass * 15 * seededRandom(idx * 31));
            const flyZ = dist * 400 * shatterEased * (1 - mergeProgress);

            // Float oscillation
            const floatY = floatActive
              ? Math.sin(timeSec * 1.2 + shard.floatPhase) * shard.floatAmp
              : 0;
            const floatX = floatActive
              ? Math.cos(timeSec * 0.8 + shard.floatPhase * 1.3) * shard.floatAmp * 0.5
              : 0;

            // Word text visibility
            const wordOpacity =
              floatActive && shatterEased > 0.8
                ? interpolate(frame, [300 + idx * 3, 330 + idx * 3], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }) * (1 - mergeProgress)
                : 0;

            // Merge: shards return to grid position
            const shardOpacity = 1 - mergeProgress * 0.3;

            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: shard.col * w,
                  top: shard.row * h,
                  width: w,
                  height: h,
                  transform: `
                    translate(${flyX + floatX}px, ${flyY + floatY}px)
                    translateZ(${flyZ}px)
                    rotateX(${rotX}deg)
                    rotateY(${rotY}deg)
                  `,
                  opacity: shardOpacity,
                  overflow: "hidden",
                  border:
                    shatterEased > 0.01
                      ? `1px solid rgba(139,92,246,${0.1 * (1 - mergeProgress)})`
                      : "none",
                  // Glass effect on each shard
                  background: `rgba(10,10,15,${0.95 - dist * 0.1})`,
                  // Simplified shadow for performance
                  boxShadow:
                    shatterEased > 0.5
                      ? `0 0 12px rgba(139,92,246,${0.08 * (1 - mergeProgress)})`
                      : "none",
                }}
              >
                {/* Shard background gradient piece */}
                <div
                  style={{
                    position: "absolute",
                    left: -shard.col * w,
                    top: -shard.row * h,
                    width: 1920,
                    height: 1080,
                    background:
                      "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
                  }}
                />

                {/* Word on shard — lightweight plain text (perf optimized) */}
                {wordOpacity > 0 && idx % 4 === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Anton', 'Impact', sans-serif",
                      fontSize: Math.min(24, w / shard.word.length * 1.1),
                      fontWeight: 900,
                      color: `rgba(139,92,246,${wordOpacity * 0.8})`,
                      textShadow: frame % 5 === 0
                        ? `${(seededRandom(frame * 3 + idx) - 0.5) * 6}px ${(seededRandom(frame * 7 + idx) - 0.5) * 4}px 0 rgba(255,0,0,0.4), ${(seededRandom(frame * 11 + idx) - 0.5) * 6}px ${(seededRandom(frame * 13 + idx) - 0.5) * 4}px 0 rgba(0,255,0,0.4)`
                        : `0 0 8px rgba(139,92,246,0.3)`,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {frame % 8 === 0
                      ? shard.word.split("").map((c, ci) => 
                          seededRandom(frame * 99 + ci + idx) > 0.7 
                            ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(seededRandom(frame * 33 + ci) * 26)]
                            : c
                        ).join("")
                      : shard.word}
                  </div>
                )}
              </div>
            );
          })}

        {/* ═══ Beat 3: SINGULARITY massive text ═══ */}
        {singularityVisible && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              opacity: singularityOpacity,
            }}
          >
            {/* Noise texture overlay (the mask effect) */}
            <div
              style={{
                position: "relative",
                fontFamily: "'Anton', 'Impact', sans-serif",
                fontSize: 180,
                fontWeight: 900,
                letterSpacing: "0.15em",
                textAlign: "center",
                lineHeight: 1,
                // The noise-mask: clip text to noise
                color: "transparent",
                WebkitTextStroke: "3px rgba(139,92,246,0.25)",
              }}
            >
              SINGULARITY
              {/* Noise fill inside text via clip */}
              <div
                style={{
                  position: "absolute",
                  inset: -10,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "'Anton', 'Impact', sans-serif",
                  fontSize: 180,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textAlign: "center",
                  lineHeight: 1,
                  // Animated gradient shimmer as "noise" visual
                  background: `linear-gradient(
                    ${90 + Math.sin(timeSec) * 45}deg,
                    #6366f1 ${shimmerPos - 20}%,
                    #a855f7 ${shimmerPos}%,
                    #ec4899 ${shimmerPos + 20}%,
                    #a855f7 ${shimmerPos + 40}%,
                    #6366f1 ${shimmerPos + 60}%
                  )`,
                }}
              >
                SINGULARITY
              </div>
            </div>

            {/* Glow behind text */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "120%",
                height: "200%",
                background:
                  `radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139,92,246,${0.15 + bass * 0.1}) 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* ═══ Beat 4: Char explosion ═══ */}
        {charExplodeProgress > 0 && charExplodeProgress < 1 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {SINGULARITY_CHARS.map((char, i) => {
              const angle = (i / SINGULARITY_CHARS.length) * Math.PI * 2 + seededRandom(i * 99) * 0.5;
              // power4.out for explosive outward burst
              const easedExplode = 1 - Math.pow(1 - charExplodeProgress, 4);
              const radius = easedExplode * (500 + seededRandom(i * 77) * 600);
              const cx = 960 + Math.cos(angle) * radius;
              const cy = 540 + Math.sin(angle) * radius;
              const rot = easedExplode * (seededRandom(i * 33) - 0.5) * 1080;

              return (
                <div
                  key={`explode-${i}`}
                  style={{
                    position: "absolute",
                    left: cx,
                    top: cy,
                    transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${1 - charExplodeProgress * 0.5})`,
                    fontFamily: "'Anton', 'Impact', sans-serif",
                    fontSize: 80,
                    fontWeight: 900,
                    color: `rgba(139,92,246,${1 - charExplodeProgress})`,
                    textShadow: `0 0 20px rgba(139,92,246,${0.5 - charExplodeProgress * 0.5})`,
                  }}
                >
                  {char}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ Beat 4: "THE FUTURE IS AGENTIC" final text ═══ */}
        {finalTextOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${finalTextScale})`,
              opacity: finalTextOpacity,
              fontFamily: "'Anton', 'Impact', sans-serif",
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textAlign: "center",
              lineHeight: 1.2,
              background: `linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #a855f7, #6366f1)`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${shimmerPos}% 0`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(0 0 ${40 + finalTextProgress * 30}px rgba(99,102,241,${finalTextProgress * 0.6}))`,
            }}
          >
            {FINAL_TEXT}
          </div>
        )}
      </div>

      {/* ═══ Scanlines ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Scan band ═══ */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanlineY(frame, 3) - 30,
          height: 60,
          background:
            "linear-gradient(180deg, transparent, rgba(139,92,246,0.03), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* ═══ Fade to black ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity: interpolate(frame, [2600, 2700], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />

      {/* ═══ Vignette ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 65% 65% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
