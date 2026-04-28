import React from "react";
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";
import { DotTyper } from "../components/DotTyper";
import {
  seededRandom,
  layeredNoise,
  screenShake,
  backOut,
} from "../utils/PhysicsUtils";

/* ═══════════════════════════════════════════════════════════
   PART 3: RESPONSIBILITY IS NOT SELF-ABUSE
   600 frames (20s @ 30fps)  —  COMPRESSED

   A (0–200):    Noisy heartbeat SVG line + flickering self-abuse text
   B (200–250):  THE FLATTEN — noise snaps to 0, camera shake
   C (250–450):  3 accent nodes grow on flat line sequentially
   D (450–600):  Resolution text, fade to black
   ═══════════════════════════════════════════════════════════ */

const ACCENT = "#FF4D00";
const LINE_Y = 540;
const LINE_POINTS = 180;

const ABUSE_TEXTS = [
  { text: "I'm useless", x: 300, y: 400, delay: 20 },
  { text: "I should have known", x: 1100, y: 640, delay: 60 },
  { text: "What's wrong with me", x: 700, y: 420, delay: 100 },
  { text: "I always fail", x: 1400, y: 600, delay: 140 },
];

const NODES = [
  { x: 500, label: "My mistake", delay: 270 },
  { x: 960, label: "I broke this", delay: 330 },
  { x: 1420, label: "I will fix this part", delay: 390 },
];

export const Part03_ResponsibilityVsLogic: React.FC = () => {
  const frame = useCurrentFrame();

  const masterOpacity = interpolate(
    frame, [0, 5, 570, 600], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isNoise = frame < 200;
  const isFlatten = frame >= 200 && frame < 250;
  const isNodes = frame >= 250 && frame < 450;
  const isResolution = frame >= 450;

  /* ═══ Noise amplitude — escalates then SNAPS to 0 ═══ */
  const noiseAmplitude = isNoise
    ? interpolate(frame, [0, 50, 150, 200], [15, 50, 130, 180], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : isFlatten
      ? interpolate(frame, [200, 205], [180, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        })
      : 0;

  /* ═══ Red pulse ═══ */
  const bgPulse = isNoise
    ? Math.abs(Math.sin(frame * 0.18)) * interpolate(frame, [80, 200], [0, 0.07], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 0;

  /* ═══ Flatten shake ═══ */
  const flattenShake = screenShake(frame, 202, 25, 10);

  /* ═══ SVG path ═══ */
  const pathD = (() => {
    const points: string[] = [];
    for (let i = 0; i <= LINE_POINTS; i++) {
      const x = (i / LINE_POINTS) * 1920;
      const noise = layeredNoise(x, frame, noiseAmplitude);
      points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(LINE_Y + noise).toFixed(1)}`);
    }
    return points.join(" ");
  })();

  const lineOpacity = interpolate(frame, [0, 15], [0, 0.65], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const flatLineOpacity = interpolate(frame, [205, 215], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Nodes ═══ */
  const nodeElements = NODES.map((node, i) => {
    const np = interpolate(frame, [node.delay, node.delay + 20], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    if (np <= 0) return null;

    const nodeScale = backOut(np, 1.5);
    const litP = interpolate(frame, [node.delay + 10, node.delay + 18], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const textOp = interpolate(frame, [node.delay + 20, node.delay + 35], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const ns = 16;

    return (
      <React.Fragment key={`n-${i}`}>
        <div style={{
          position: "absolute", left: node.x - ns / 2, top: LINE_Y - ns / 2,
          width: ns, height: ns, borderRadius: "50%",
          backgroundColor: litP > 0 ? `rgba(255,77,0,${litP})` : "transparent",
          border: `2px solid rgba(245,245,245,${0.3 + litP * 0.5})`,
          transform: `scale(${nodeScale})`,
          boxShadow: litP > 0 ? `0 0 ${litP * 18}px rgba(255,77,0,${litP * 0.3})` : "none",
        }} />
        {textOp > 0 && (
          <div style={{
            position: "absolute", left: node.x, top: LINE_Y + 28,
            transform: "translateX(-50%)",
            fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 500,
            color: `rgba(245,245,245,${textOp * 0.85})`,
            textAlign: "center", letterSpacing: "0.03em", whiteSpace: "nowrap",
          }}>
            {node.label}
          </div>
        )}
        {i > 0 && litP > 0 && (
          <div style={{
            position: "absolute", left: NODES[i - 1].x, top: LINE_Y,
            width: node.x - NODES[i - 1].x, height: 1,
            backgroundColor: `rgba(255,77,0,${litP * 0.3})`,
          }} />
        )}
      </React.Fragment>
    );
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgb(${10 + bgPulse * 400},${10},${10})`,
        opacity: masterOpacity,
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${flattenShake.x}px, ${flattenShake.y}px)`,
      }}>
        {/* Noisy SVG line */}
        {noiseAmplitude > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: lineOpacity }}>
            <path d={pathD} fill="none" stroke="rgba(245,245,245,0.7)" strokeWidth={1.5} />
          </svg>
        )}

        {/* Flat line */}
        {frame >= 205 && (
          <div style={{
            position: "absolute", left: 80, right: 80, top: LINE_Y, height: 1,
            backgroundColor: `rgba(245,245,245,${flatLineOpacity * 0.8})`,
          }} />
        )}

        {/* Nodes */}
        {(isNodes || isResolution) && nodeElements}

        {/* Self-abuse flickering text */}
        {isNoise && ABUSE_TEXTS.map((txt, i) => {
          const elapsed = frame - txt.delay;
          if (elapsed < 0) return null;
          const cycle = elapsed % 80;
          const visible = cycle < 30;
          const fOp = visible
            ? interpolate(cycle, [0, 4, 22, 30], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 0;
          if (fOp <= 0) return null;
          const jx = (seededRandom(frame * 3 + i) - 0.5) * 8;
          const jy = (seededRandom(frame * 7 + i) - 0.5) * 5;
          return (
            <div key={`a-${i}`} style={{
              position: "absolute", left: txt.x + jx, top: txt.y + jy,
              fontFamily: "'Inter', sans-serif", fontSize: 15, fontStyle: "italic",
              color: `rgba(200,150,150,${fOp})`, letterSpacing: "0.05em",
            }}>
              {txt.text}
            </div>
          );
        })}
      </div>

      {/* Flatten text */}
      {isFlatten && (
        <div style={{
          position: "absolute", left: "50%", top: "35%",
          transform: "translate(-50%, -50%)",
          opacity: interpolate(frame, [210, 218, 240, 248], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 800,
            color: "#f5f5f5", textAlign: "center",
          }}>
            True responsibility is incredibly cold.
          </div>
        </div>
      )}

      {/* Resolution */}
      {isResolution && (
        <div style={{
          position: "absolute", left: "50%", top: "70%", transform: "translate(-50%, -50%)", maxWidth: 450,
          opacity: interpolate(frame, [470, 495], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <DotTyper text="No drama. No self-pity. Just a list." startFrame={495} fontSize={26} fontFamily="'Inter', sans-serif" charsPerFrame={3} style={{ fontWeight: 600 }} />
        </div>
      )}

      {/* Fade to black */}
      <div style={{
        position: "absolute", inset: 0, backgroundColor: "#000", pointerEvents: "none",
        opacity: interpolate(frame, [560, 600], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }} />

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};
