import React from "react";
import { AbsoluteFill, useCurrentFrame, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, FONTS } from "../../motion/tokens";
import { useFadeIn, useScalePunch, useSlideIn } from "../../motion/hooks";

// ============================================================
// SCENE 01: TITLE
// ============================================================
export const GsapTitle: React.FC = () => {
  const titleOp = useFadeIn(6, 9);
  const titleScale = useScalePunch(6);
  const subOp = useFadeIn(18, 9);
  const subX = useSlideIn("left", 120, 18, 9);
  const countOp = useFadeIn(30, 9);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...FONTS.hero, fontSize: 140, color: COLORS.accent, textTransform: "uppercase",
        opacity: titleOp, transform: `scale(${titleScale})`, letterSpacing: 8 }}>
        GSAP
      </div>
      <div style={{ ...FONTS.support, color: COLORS.textPrimary, textTransform: "uppercase",
        opacity: subOp, transform: subX, marginTop: 16 }}>
        COMPLETE FEATURE SHOWCASE
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 50, opacity: countOp }}>
        {[
          { val: "160+", label: "FEATURES" },
          { val: "42+", label: "EASINGS" },
          { val: "20", label: "PLUGINS" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.accent }}>{s.val}</div>
            <div style={{ fontSize: 12, color: COLORS.textPrimary, letterSpacing: 2, opacity: 0.5, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 02: gsap.to() / gsap.from() / gsap.fromTo()
// ============================================================
export const GsapToFrom: React.FC = () => {
  const frame = useCurrentFrame();
  const BOX = 60;

  // .to() — box moves RIGHT
  const toX = interpolate(frame, [10, 50], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // .from() — box moves FROM left (starts off, ends in place)
  const fromX = interpolate(frame, [50, 90], [-400, 0], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fromOp = interpolate(frame, [50, 90], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // .fromTo() — box scales from 0.3 to 1.5
  const ftScale = interpolate(frame, [90, 130], [0.3, 1.5], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOp = (start: number) => useFadeIn(start, 4);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      {/* Section label */}
      <div style={{ position: "absolute", left: 80, top: 60, ...FONTS.support, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, opacity: useFadeIn(0, 6) }}>
        01 — CORE METHODS
      </div>

      {/* .to() row */}
      <div style={{ position: "absolute", left: 200, top: 220, display: "flex", alignItems: "center", gap: 40 }}>
        <span style={{ ...FONTS.label, color: COLORS.accent, width: 200, opacity: labelOp(8) }}>GSAP.TO()</span>
        <div style={{ width: BOX, height: BOX, backgroundColor: COLORS.figure, borderRadius: 4,
          transform: `translateX(${toX}px)` }} />
        <span style={{ ...FONTS.label, fontSize: 14, color: "#555", position: "absolute", left: 200, top: 70 }}>
          → ANIMATE TO TARGET VALUES
        </span>
      </div>

      {/* .from() row */}
      <div style={{ position: "absolute", left: 200, top: 430, display: "flex", alignItems: "center", gap: 40 }}>
        <span style={{ ...FONTS.label, color: COLORS.accent, width: 200, opacity: labelOp(48) }}>GSAP.FROM()</span>
        <div style={{ width: BOX, height: BOX, backgroundColor: COLORS.figure, borderRadius: 4,
          transform: `translateX(${fromX}px)`, opacity: fromOp }} />
        <span style={{ ...FONTS.label, fontSize: 14, color: "#555", position: "absolute", left: 200, top: 70 }}>
          → ANIMATE FROM STARTING VALUES
        </span>
      </div>

      {/* .fromTo() row */}
      <div style={{ position: "absolute", left: 200, top: 640, display: "flex", alignItems: "center", gap: 40 }}>
        <span style={{ ...FONTS.label, color: COLORS.accent, width: 200, opacity: labelOp(88) }}>GSAP.FROMTO()</span>
        <div style={{ width: BOX, height: BOX, backgroundColor: COLORS.figure, borderRadius: 4,
          transform: `scale(${ftScale})`, transformOrigin: "left center" }} />
        <span style={{ ...FONTS.label, fontSize: 14, color: "#555", position: "absolute", left: 200, top: 70 }}>
          → DEFINE BOTH START AND END
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 03: EASING GRID — 9 easings side by side
// ============================================================
export const GsapEasingGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  const easings: { name: string; fn: (t: number) => number }[] = [
    { name: "LINEAR", fn: (t) => t },
    { name: "POWER1.OUT", fn: Easing.out(Easing.poly(1)) },
    { name: "POWER2.OUT", fn: Easing.out(Easing.cubic) },
    { name: "POWER4.OUT", fn: Easing.out(Easing.poly(5)) },
    { name: "BACK.OUT", fn: Easing.out(Easing.back(1.7)) },
    { name: "BOUNCE.OUT", fn: Easing.bounce },
    { name: "ELASTIC.OUT", fn: Easing.out(Easing.elastic(1)) },
    { name: "EXPO.OUT", fn: Easing.out(Easing.exp) },
    { name: "CIRC.OUT", fn: Easing.out(Easing.circle) },
  ];

  const progress = interpolate(frame, [20, 140], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, ...FONTS.support, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, opacity: titleOp }}>
        02 — EASING LIBRARY (42+ EASINGS)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
        padding: "120px 100px 60px", width: "100%", height: "100%", boxSizing: "border-box" }}>
        {easings.map((e, i) => {
          const eased = e.fn(progress);
          const dotX = eased * 380;
          return (
            <div key={i} style={{ border: "1px solid #222", borderRadius: 6, padding: "14px 20px",
              position: "relative", overflow: "hidden", height: 80 }}>
              <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1,
                marginBottom: 8 }}>{e.name}</div>
              {/* Track */}
              <div style={{ height: 2, backgroundColor: "#222", width: "100%", borderRadius: 1 }} />
              {/* Dot */}
              <div style={{ width: 16, height: 16, borderRadius: 16, backgroundColor: COLORS.figure,
                position: "absolute", bottom: 22, left: 20 + dotX,
                boxShadow: "0 0 8px rgba(255,255,255,0.3)" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 04: TIMELINE — sequencing with position parameter
// ============================================================
export const GsapTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  // 3 elements animate in SEQUENCE (timeline)
  const box1X = interpolate(frame, [15, 35], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box2X = interpolate(frame, [35, 55], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box3X = interpolate(frame, [55, 75], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Overlap demo: position parameter "<0.3"
  const ov1X = interpolate(frame, [85, 105], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ov2X = interpolate(frame, [90, 110], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ov3X = interpolate(frame, [95, 115], [0, 500], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const colors = [COLORS.figure, COLORS.accent, COLORS.label];
  const labels = ["SEQUENTIAL", "OVERLAP (<0.3)"];

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, ...FONTS.support, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, opacity: titleOp }}>
        03 — TIMELINE & POSITION PARAMETER
      </div>

      {/* Sequential */}
      <div style={{ position: "absolute", left: 100, top: 160 }}>
        <div style={{ fontSize: 14, color: "#555", letterSpacing: 2, fontWeight: 700, marginBottom: 16 }}>SEQUENTIAL — .to().to().to()</div>
        {[box1X, box2X, box3X].map((x, i) => (
          <div key={i} style={{ width: 50, height: 50, backgroundColor: colors[i], borderRadius: 4,
            transform: `translateX(${x}px)`, marginBottom: 12 }} />
        ))}
      </div>

      {/* Overlapping */}
      <div style={{ position: "absolute", left: 100, top: 520 }}>
        <div style={{ fontSize: 14, color: "#555", letterSpacing: 2, fontWeight: 700, marginBottom: 16 }}>OVERLAP — POSITION: "&lt;0.3"</div>
        {[ov1X, ov2X, ov3X].map((x, i) => (
          <div key={i} style={{ width: 50, height: 50, backgroundColor: colors[i], borderRadius: 4,
            transform: `translateX(${x}px)`, marginBottom: 12 }} />
        ))}
      </div>

      {/* Timeline visualization bar */}
      <svg style={{ position: "absolute", right: 100, top: 200, width: 500, height: 300 }}>
        <text x={0} y={16} fill={COLORS.accent} fontSize={12} fontWeight={700} letterSpacing={2}>TIMELINE</text>
        {/* Sequential bars */}
        {[0, 1, 2].map(i => (
          <rect key={i} x={0} y={30 + i * 35} width={150} height={25} rx={3}
            fill={colors[i]} opacity={0.6} transform={`translate(${i * 155}, 0)`} />
        ))}
        {/* Overlap bars */}
        {[0, 1, 2].map(i => (
          <rect key={i} x={0} y={170 + i * 35} width={150} height={25} rx={3}
            fill={colors[i]} opacity={0.6} transform={`translate(${i * 40}, 0)`} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 05: STAGGER — from: start/center/end/random/edges
// ============================================================
export const GsapStagger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = useFadeIn(0, 6);
  const SIZE = 40;
  const COLS = 8;
  const ROWS = 5;

  // Stagger from CENTER
  const items = Array.from({ length: ROWS * COLS }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cx = (COLS - 1) / 2;
    const cy = (ROWS - 1) / 2;
    const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
    const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
    const delay = 15 + (dist / maxDist) * 40;
    const s = spring({ frame: frame - delay, fps, from: 0, to: 1,
      config: { stiffness: 300, damping: 15, mass: 0.8 } });
    return { col, row, scale: s };
  });

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, ...FONTS.support, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, opacity: titleOp }}>
        04 — STAGGER (FROM: "CENTER", GRID: [5, 8])
      </div>

      {/* Stagger grid */}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, ${SIZE + 8}px)`, gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              width: SIZE, height: SIZE, borderRadius: 4,
              backgroundColor: COLORS.figure,
              transform: `scale(${item.scale})`,
              opacity: item.scale,
            }} />
          ))}
        </div>
      </div>

      {/* Code hint */}
      <div style={{ position: "absolute", left: 80, bottom: 80, fontSize: 16, color: "#555",
        fontFamily: "monospace", letterSpacing: 1 }}>
        <span style={{ color: COLORS.accent }}>stagger:</span> {"{ grid: [5, 8], from: \"center\", each: 0.05 }"}
      </div>
    </AbsoluteFill>
  );
};
