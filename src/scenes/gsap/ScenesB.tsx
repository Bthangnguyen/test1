import React from "react";
import { AbsoluteFill, useCurrentFrame, Easing, interpolate } from "remotion";
import { COLORS, FONT_FAMILY } from "../../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSelfDraw } from "../../motion/hooks";

// ============================================================
// SCENE 06: REPEAT & YOYO
// ============================================================
export const GsapRepeatYoyo: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  // Repeat: box bounces back and forth using modulo
  const CYCLE = 40;
  const phase = (frame - 10 + CYCLE * 100) % CYCLE;
  const repeatX = interpolate(phase, [0, CYCLE / 2, CYCLE], [0, 600, 0], {
    easing: Easing.inOut(Easing.cubic),
  });

  // Yoyo rotation
  const yoyoPhase = ((frame - 10 + CYCLE * 100) % CYCLE) / CYCLE;
  const yoyoRot = interpolate(yoyoPhase, [0, 0.5, 1], [0, 360, 0]);

  // Repeat count indicator
  const repeatCount = Math.floor((frame - 10 + CYCLE * 100) / CYCLE);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, opacity: titleOp }}>
        05 — REPEAT & YOYO
      </div>

      {/* Repeat: -1 (infinite) */}
      <div style={{ position: "absolute", left: 200, top: 220 }}>
        <div style={{ fontSize: 14, color: "#555", letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>
          REPEAT: -1 (INFINITE) + YOYO: TRUE
        </div>
        {/* Track */}
        <div style={{ width: 700, height: 2, backgroundColor: "#222", position: "absolute", top: 75 }} />
        {/* Moving box */}
        <div style={{ width: 50, height: 50, backgroundColor: COLORS.accent, borderRadius: 4,
          transform: `translateX(${repeatX}px)` }} />
        <div style={{ position: "absolute", right: -180, top: 10, fontSize: 36, fontWeight: 900,
          color: COLORS.figure, opacity: 0.3, fontFamily: "monospace" }}>
          ×{Math.min(repeatCount, 99)}
        </div>
      </div>

      {/* Yoyo rotation */}
      <div style={{ position: "absolute", left: 200, top: 480 }}>
        <div style={{ fontSize: 14, color: "#555", letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>
          ROTATION: 360° + YOYO + REPEAT
        </div>
        <div style={{ display: "flex", gap: 100, alignItems: "center" }}>
          <div style={{ width: 80, height: 80, border: `3px solid ${COLORS.figure}`, borderRadius: 4,
            transform: `rotate(${yoyoRot}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 6, height: 30, backgroundColor: COLORS.accent, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 16, color: "#555", fontFamily: "monospace" }}>
            {"{ rotation: 360, repeat: -1, yoyo: true }"}
          </div>
        </div>
      </div>

      {/* repeatDelay visual */}
      <div style={{ position: "absolute", left: 200, top: 700 }}>
        <div style={{ fontSize: 14, color: "#555", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>
          REPEATDELAY: 0.5
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: 20 }, (_, i) => {
            const active = (frame - 10) % 60 < 40 ? ((frame - 10) % 40) > i * 2 : false;
            return <div key={i} style={{ width: 16, height: 30, borderRadius: 2,
              backgroundColor: active ? COLORS.accent : "#222" }} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 07: DRAWSVG — stroke animation
// ============================================================
export const GsapDrawSVG: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  // Star path drawing
  const starDraw = useSelfDraw(500, 15, 40);
  // Circle drawing
  const circleDraw = useSelfDraw(380, 25, 35);
  // Arrow drawing
  const arrowDraw = useSelfDraw(600, 35, 40);

  // Partial draw (drawSVG: "20% 80%")
  const partialStart = interpolate(frame, [60, 100], [0, 0.2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const partialEnd = interpolate(frame, [60, 100], [0, 0.8], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, opacity: titleOp }}>
        06 — DRAWSVG PLUGIN
      </div>

      {/* Star self-draw */}
      <svg style={{ position: "absolute", left: 200, top: 200 }} width={200} height={200} viewBox="0 0 200 200">
        <polygon points="100,10 40,190 190,78 10,78 160,190"
          fill="none" stroke={COLORS.accent} strokeWidth={3}
          strokeDasharray={500} strokeDashoffset={starDraw}
          strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 220, top: 410, fontSize: 12, color: "#555", fontWeight: 700 }}>
        drawSVG: "0% 100%"
      </div>

      {/* Circle self-draw */}
      <svg style={{ position: "absolute", left: 550, top: 200 }} width={200} height={200} viewBox="0 0 200 200">
        <circle cx={100} cy={100} r={80}
          fill="none" stroke={COLORS.figure} strokeWidth={3}
          strokeDasharray={380} strokeDashoffset={circleDraw} />
      </svg>
      <div style={{ position: "absolute", left: 570, top: 410, fontSize: 12, color: "#555", fontWeight: 700 }}>
        CIRCLE REVEAL
      </div>

      {/* Arrow path */}
      <svg style={{ position: "absolute", left: 900, top: 200 }} width={400} height={200} viewBox="0 0 400 200">
        <path d="M10,180 Q100,20 200,100 Q300,180 390,20"
          fill="none" stroke={COLORS.accent} strokeWidth={3}
          strokeDasharray={600} strokeDashoffset={arrowDraw}
          strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 1020, top: 410, fontSize: 12, color: "#555", fontWeight: 700 }}>
        CURVED PATH
      </div>

      {/* Partial draw demo */}
      <div style={{ position: "absolute", left: 200, top: 520 }}>
        <div style={{ fontSize: 14, color: "#555", letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>
          PARTIAL DRAW — "20% 80%"
        </div>
        <svg width={800} height={60} viewBox="0 0 800 60">
          <line x1={0} y1={30} x2={800} y2={30} stroke="#222" strokeWidth={4} />
          <line x1={partialStart * 800} y1={30} x2={partialEnd * 800} y2={30}
            stroke={COLORS.accent} strokeWidth={6} strokeLinecap="round" />
        </svg>
      </div>

      {/* Code */}
      <div style={{ position: "absolute", left: 200, bottom: 80, fontSize: 16, color: "#555",
        fontFamily: "monospace" }}>
        gsap.from(<span style={{ color: COLORS.accent }}>"path"</span>, {`{ drawSVG: "0%", duration: 1.5 }`})
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 08: MORPHSVG — shape morphing
// ============================================================
export const GsapMorphSVG: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  // Morph progress: circle → star → triangle → circle
  const p = interpolate(frame, [15, 130], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Simulate morph by interpolating corner count and radius
  const phase = p * 3; // 0→1: circle→star, 1→2: star→triangle, 2→3: triangle→circle
  const corners = phase < 1 ? interpolate(phase, [0, 1], [32, 5]) :
                  phase < 2 ? interpolate(phase, [1, 2], [5, 3]) :
                              interpolate(phase, [2, 3], [3, 32]);
  const n = Math.round(corners);
  const r = 80;
  const cx = 200, cy = 150;

  const points = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const innerR = n === 5 ? (i % 2 === 0 ? r : r * 0.45) : r;
    const px = cx + Math.cos(angle) * innerR;
    const py = cy + Math.sin(angle) * innerR;
    return `${px},${py}`;
  }).join(" ");

  const shapeName = phase < 1 ? "CIRCLE → STAR" : phase < 2 ? "STAR → TRIANGLE" : "TRIANGLE → CIRCLE";

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, opacity: titleOp }}>
        07 — MORPHSVG PLUGIN
      </div>

      {/* Morphing shape */}
      <div style={{ position: "absolute", left: "50%", top: "45%", transform: "translate(-50%, -50%)" }}>
        <svg width={400} height={300} viewBox="0 0 400 300">
          <polygon points={points}
            fill="none" stroke={COLORS.accent} strokeWidth={3}
            strokeLinejoin="round" />
        </svg>
      </div>

      {/* Current morph label */}
      <div style={{ position: "absolute", left: "50%", top: "72%", transform: "translateX(-50%)",
        fontSize: 24, fontWeight: 900, color: COLORS.figure, letterSpacing: 4, textTransform: "uppercase" }}>
        {shapeName}
      </div>

      {/* Code */}
      <div style={{ position: "absolute", left: 200, bottom: 80, fontSize: 16, color: "#555", fontFamily: "monospace" }}>
        gsap.to(<span style={{ color: COLORS.accent }}>"#circle"</span>, {`{ morphSVG: "#star", duration: 1 }`})
      </div>
    </AbsoluteFill>
  );
};
