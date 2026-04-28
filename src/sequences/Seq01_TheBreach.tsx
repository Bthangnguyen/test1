import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";
import { GlitchText } from "../components/GlitchText";
import {
  seededRandom,
  screenShake,
  strobe,
  bassAmplitude,
  scanlineY,
  jitter,
} from "../utils/glitch";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 1: THE BREACH — Kinetic Overload
   1350 frames (45s @ 30fps)

   Beat 1 (0–60):      TV static noise boot
   Beat 2 (60–600):    Glitch text PUNCH × 6 words
   Beat 3 (600–900):   Compound slam — all words + jitter
   Beat 4 (900–1350):  Screen shatter → transition
   ═══════════════════════════════════════════════════════════ */

const WORDS = [
  { text: "SPEED", color: "#6366f1" },
  { text: "DATA", color: "#a855f7" },
  { text: "AUTONOMY", color: "#ec4899" },
  { text: "INTELLIGENCE", color: "#818cf8" },
  { text: "SINGULARITY", color: "#f472b6" },
  { text: "NOW", color: "#ef4444" },
];

// Each word gets ~90 frames (3s): 1 black, 4 slam, 25 settle, 60 hold
const WORD_DURATION = 90;

/* ─── TV Static Noise Grid ─── */
const NOISE_COLS = 96;
const NOISE_ROWS = 54;

const NoiseGrid: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  if (opacity <= 0) return null;

  const pixels = useMemo(() => {
    const p: { key: number; brightness: number }[] = [];
    for (let i = 0; i < NOISE_COLS * NOISE_ROWS; i++) {
      p.push({ key: i, brightness: 0 });
    }
    return p;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${NOISE_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${NOISE_ROWS}, 1fr)`,
        opacity,
        pointerEvents: "none",
      }}
    >
      {pixels.map((p) => {
        const brightness = seededRandom(frame * 10000 + p.key) * 255;
        return (
          <div
            key={p.key}
            style={{
              backgroundColor: `rgb(${brightness},${brightness},${brightness})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ─── Scanline Overlay ─── */
const Scanlines: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const y = scanlineY(frame, 4);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {/* Horizontal scan band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 40,
          height: 80,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)",
        }}
      />
      {/* Fine scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />
    </div>
  );
};

export const Seq01_TheBreach: React.FC = () => {
  const frame = useCurrentFrame();

  /* ─── Master fade ─── */
  const masterOpacity = interpolate(
    frame,
    [0, 5, 1310, 1350],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ═══ Accumulated screen shake ═══ */
  let shakeX = 0;
  let shakeY = 0;

  // Shake on each word punch — CRANKED ×3
  WORDS.forEach((_, i) => {
    const punchFrame = 61 + i * WORD_DURATION;
    const shake = screenShake(frame, punchFrame, 24 + i * 6, 15);
    shakeX += shake.x;
    shakeY += shake.y;
  });

  // Big shake at compound slam — CRANKED ×3
  const slamShake = screenShake(frame, 600, 45, 18);
  shakeX += slamShake.x;
  shakeY += slamShake.y;

  /* ═══ Beat 1: TV static (0–60) ═══ */
  const noiseOpacity = interpolate(frame, [0, 5, 50, 60], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strobeFlash =
    frame < 60 ? strobe(frame, 200) * 0.6 : 0;

  /* ═══ Beat 2: Word PUNCH (60–600) ═══ */
  const wordElements = WORDS.map((word, i) => {
    const wordStart = 60 + i * WORD_DURATION;
    const wordEnd = wordStart + WORD_DURATION;

    // Not visible yet or already past
    if (frame < wordStart || frame >= wordEnd) return null;

    const localFrame = frame - wordStart;

    // Frame 0–1: black silence (Contrast Timing — EXTENDED for harder impact)
    if (localFrame <= 1) return null;

    // Frame 2–6: SLAM — full intensity glitch (CRANKED)
    const slamPhase = localFrame >= 2 && localFrame <= 6;
    const settlePhase = localFrame > 6 && localFrame <= 25;
    const holdPhase = localFrame > 25;

    // RGB split intensity — CRANKED ×2
    let glitchIntensity = 0;
    if (slamPhase) {
      glitchIntensity = 30;
    } else if (settlePhase) {
      // power4.out decay: drops FAST then lingers
      const settleT = (localFrame - 6) / 19;
      const eased = 1 - Math.pow(settleT, 4);
      glitchIntensity = 30 * eased;
    } else if (holdPhase) {
      // Aggressive micro-glitch every 3 frames
      glitchIntensity = localFrame % 3 === 0 ? 8 : localFrame % 7 === 0 ? 5 : 0;
    }

    // Scale: EXPLOSIVE power4.out — instant overshoot → brutal snap-back
    const scale = slamPhase
      ? 1.25
      : settlePhase
        ? (() => {
            const t = (localFrame - 6) / 19;
            // power4.out: shoots out fast, snaps back hard
            const eased = 1 - Math.pow(1 - t, 4);
            return 1.25 - 0.25 * eased + (t < 0.3 ? -0.08 * Math.sin(t * Math.PI * 6) : 0);
          })()
        : 1;

    // Strobe on slam
    const slamStrobe = slamPhase ? strobe(frame, 300) : 1;

    // Exit: quick tear-out
    const exitProgress = interpolate(localFrame, [75, WORD_DURATION], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const exitScale = 1 + exitProgress * 3;
    const exitBlur = exitProgress * 20;
    const exitOpacity = 1 - exitProgress;

    return (
      <div
        key={word.text}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale * exitScale})`,
          filter: `blur(${exitBlur}px)`,
          opacity: slamStrobe * exitOpacity,
          width: "100%",
        }}
      >
        <GlitchText
          text={word.text}
          frame={frame}
          intensity={glitchIntensity}
          fontSize={word.text.length > 8 ? 100 : 140}
          scramble={slamPhase}
        />
      </div>
    );
  });

  /* ═══ Beat 3: Compound slam — all words stacked (600–900) ═══ */
  const compoundActive = frame >= 600 && frame < 900;
  const compoundOpacity = compoundActive
    ? interpolate(frame, [600, 610, 860, 900], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const compoundScale = compoundActive
    ? 1 + bassAmplitude(frame) * 0.18
    : 1;

  /* ═══ Beat 4: Screen shatter (900–1350) ═══ */
  const shatterActive = frame >= 900;
  const shatterProgress = interpolate(frame, [900, 1250], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4x4 grid shatter
  const SHARD_COLS = 4;
  const SHARD_ROWS = 4;
  const shardElements = shatterActive
    ? Array.from({ length: SHARD_COLS * SHARD_ROWS }).map((_, idx) => {
        const col = idx % SHARD_COLS;
        const row = Math.floor(idx / SHARD_COLS);
        const w = 1920 / SHARD_COLS;
        const h = 1080 / SHARD_ROWS;

        // Direction away from center
        const cx = (col + 0.5) / SHARD_COLS - 0.5;
        const cy = (row + 0.5) / SHARD_ROWS - 0.5;

        // power4.out easing for explosive shard flight
        const easedShatter = 1 - Math.pow(1 - shatterProgress, 4);
        const flyX = cx * 3000 * easedShatter;
        const flyY = cy * 2200 * easedShatter;
        const rotX = seededRandom(idx * 31) * 360 * easedShatter;
        const rotY = seededRandom(idx * 47) * 360 * easedShatter;
        const shardOpacity = 1 - easedShatter;

        return (
          <div
            key={`shard-${idx}`}
            style={{
              position: "absolute",
              left: col * w,
              top: row * h,
              width: w,
              height: h,
              transform: `translate(${flyX}px, ${flyY}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              opacity: shardOpacity,
              overflow: "hidden",
              border: shatterProgress > 0.01 ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}
          >
            {/* Each shard shows a piece of the gradient background */}
            <div
              style={{
                position: "absolute",
                left: -col * w,
                top: -row * h,
                width: 1920,
                height: 1080,
                background:
                  "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)",
              }}
            />
          </div>
        );
      })
    : null;

  /* ═══ End flash ═══ */
  const endFlash = interpolate(frame, [1300, 1310, 1330, 1350], [0, 0.9, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        opacity: masterOpacity,
        overflow: "hidden",
      }}
    >
      {/* ═══ Content wrapper with shake ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          perspective: 1000,
        }}
      >
        {/* Beat 1: Noise */}
        <NoiseGrid frame={frame} opacity={noiseOpacity} />

        {/* Beat 2: Individual word punches */}
        {wordElements}

        {/* Beat 3: Compound — all words stacked */}
        {compoundActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: compoundOpacity,
              transform: `scale(${compoundScale})`,
            }}
          >
            {WORDS.map((word, i) => {
              const j = jitter(frame, i, 18, 2);
              const microGlitch =
                frame % 4 === 0
                  ? 8
                  : frame % 3 === 0
                    ? 5
                    : 2;

              return (
                <div
                  key={`comp-${word.text}`}
                  style={{
                    transform: `translate(${j.x}px, ${j.y}px)`,
                    width: "100%",
                  }}
                >
                  <GlitchText
                    text={word.text}
                    frame={frame + i * 100}
                    intensity={microGlitch}
                    fontSize={word.text.length > 8 ? 64 : 80}
                    scramble={microGlitch > 2}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Beat 4: Shatter shards */}
        {shardElements && (
          <div style={{ position: "absolute", inset: 0, perspective: 800 }}>
            {shardElements}
          </div>
        )}
      </div>

      {/* ═══ Scanlines overlay ═══ */}
      <Scanlines frame={frame} opacity={frame > 60 ? 0.5 : 0.8} />

      {/* ═══ Strobe flash (Beat 1) ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#fff",
          opacity: strobeFlash,
          pointerEvents: "none",
        }}
      />

      {/* ═══ End flash ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#fff",
          opacity: endFlash,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Vignette ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
