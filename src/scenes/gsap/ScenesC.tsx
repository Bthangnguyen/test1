import React from "react";
import { AbsoluteFill, useCurrentFrame, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, FONTS } from "../../motion/tokens";
import { useFadeIn, useScalePunch, useSlideIn, useSnapIn } from "../../motion/hooks";

// ============================================================
// SCENE 09: MOTIONPATH — element following curve
// ============================================================
export const GsapMotionPath: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  const progress = interpolate(frame, [15, 130], [0, 1], {
    easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Parametric curve (figure-8 / infinity)
  const t = progress * Math.PI * 2;
  const pathX = 400 + Math.sin(t) * 300;
  const pathY = 350 + Math.sin(t * 2) * 120;

  // Trail dots
  const trail = Array.from({ length: 15 }, (_, i) => {
    const tp = Math.max(0, progress - i * 0.015) * Math.PI * 2;
    return { x: 400 + Math.sin(tp) * 300, y: 350 + Math.sin(tp * 2) * 120, op: 1 - i * 0.06 };
  });

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, opacity: titleOp }}>
        08 — MOTIONPATH PLUGIN
      </div>

      {/* Path outline */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
        <ellipse cx={400} cy={350} rx={300} ry={120}
          fill="none" stroke="#222" strokeWidth={1.5} strokeDasharray="8 8" />
        {/* Trail */}
        {trail.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={4} fill={COLORS.accent} opacity={d.op * 0.4} />
        ))}
      </svg>

      {/* Moving element */}
      <div style={{
        position: "absolute", left: pathX - 20, top: pathY - 20,
        width: 40, height: 40, borderRadius: 40,
        backgroundColor: COLORS.accent, boxShadow: "0 0 20px rgba(245,229,0,0.4)",
      }} />

      {/* Coordinate display */}
      <div style={{ position: "absolute", right: 200, top: 250, fontFamily: "monospace", fontSize: 18, color: "#555" }}>
        <div>x: <span style={{ color: COLORS.accent }}>{Math.round(pathX)}</span></div>
        <div>y: <span style={{ color: COLORS.accent }}>{Math.round(pathY)}</span></div>
        <div>progress: <span style={{ color: COLORS.figure }}>{(progress * 100).toFixed(0)}%</span></div>
      </div>

      <div style={{ position: "absolute", left: 200, bottom: 80, fontSize: 16, color: "#555", fontFamily: "monospace" }}>
        gsap.to(<span style={{ color: COLORS.accent }}>"#dot"</span>, {`{ motionPath: { path: "#curve", align: "#curve" } }`})
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 10: SPLITTEXT — character animation
// ============================================================
export const GsapSplitText: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  const text = "GSAP SPLITTEXT";
  const chars = text.split("");

  // Line 2: word-level split
  const words = "ANIMATE EACH WORD".split(" ");

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: 80, top: 50, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, opacity: titleOp }}>
        09 — SPLITTEXT (CHARS / WORDS / LINES)
      </div>

      {/* Character split — stagger from center */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
          TYPE: "CHARS" — STAGGER FROM CENTER
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          {chars.map((ch, i) => {
            const center = (chars.length - 1) / 2;
            const dist = Math.abs(i - center);
            const delay = 15 + dist * 3;
            const s = spring({ frame: frame - delay, fps, from: 0, to: 1,
              config: { stiffness: 300, damping: 14, mass: 0.8 } });
            const y = interpolate(s, [0, 1], [40, 0]);
            return (
              <span key={i} style={{
                fontSize: 72, fontWeight: 900, color: ch === " " ? "transparent" : COLORS.accent,
                display: "inline-block", transform: `translateY(${y}px)`, opacity: s,
                minWidth: ch === " " ? 20 : undefined,
              }}>{ch}</span>
            );
          })}
        </div>
      </div>

      {/* Word split */}
      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
          TYPE: "WORDS" — STAGGER 0.2S
        </div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
          {words.map((w, i) => {
            const delay = 50 + i * 6;
            const wOp = useFadeIn(delay, 6);
            const wScale = useScalePunch(delay);
            return (
              <span key={i} style={{
                fontSize: 56, fontWeight: 900, color: COLORS.figure,
                transform: `scale(${wScale})`, opacity: wOp,
              }}>{w}</span>
            );
          })}
        </div>
      </div>

      {/* Lines split demo */}
      <div style={{ marginTop: 50 }}>
        <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
          TYPE: "LINES" — SLIDE IN
        </div>
        {["FIRST LINE SLIDES IN", "SECOND LINE FOLLOWS", "THIRD LINE ARRIVES"].map((line, i) => {
          const lOp = useFadeIn(75 + i * 8, 9);
          const lX = useSlideIn("left", 150, 75 + i * 8, 9);
          return (
            <div key={i} style={{ fontSize: 28, fontWeight: 700, color: COLORS.figure,
              opacity: lOp, transform: lX, textAlign: "center", marginBottom: 4 }}>{line}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 11: FLIP — layout animation
// ============================================================
export const GsapFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = useFadeIn(0, 6);

  // Simulate FLIP: elements transition from grid → single row
  const flipProgress = interpolate(frame, [30, 70], [0, 1], {
    easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const items = [
    { gridX: 0, gridY: 0, rowX: 0 },
    { gridX: 1, gridY: 0, rowX: 1 },
    { gridX: 2, gridY: 0, rowX: 2 },
    { gridX: 0, gridY: 1, rowX: 3 },
    { gridX: 1, gridY: 1, rowX: 4 },
    { gridX: 2, gridY: 1, rowX: 5 },
  ];

  const stateLabel = flipProgress < 0.5 ? "STATE A (GRID)" : "STATE B (ROW)";

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 80, top: 50, fontSize: 14,
        color: COLORS.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, opacity: titleOp }}>
        10 — FLIP PLUGIN
      </div>

      <div style={{ position: "absolute", left: "50%", top: "45%", transform: "translate(-50%, -50%)" }}>
        {items.map((item, i) => {
          const gridPosX = (item.gridX - 1) * 100;
          const gridPosY = (item.gridY - 0.5) * 100;
          const rowPosX = (item.rowX - 2.5) * 90;
          const rowPosY = 0;

          const x = interpolate(flipProgress, [0, 1], [gridPosX, rowPosX]);
          const y = interpolate(flipProgress, [0, 1], [gridPosY, rowPosY]);

          return (
            <div key={i} style={{
              position: "absolute",
              left: x, top: y,
              width: 70, height: 70,
              backgroundColor: i === 2 ? COLORS.accent : COLORS.figure,
              borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 900, color: COLORS.background,
            }}>{i + 1}</div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: "50%", top: "72%", transform: "translateX(-50%)",
        fontSize: 20, fontWeight: 900, color: COLORS.figure, letterSpacing: 4 }}>
        {stateLabel}
      </div>

      {/* Flip explanation */}
      <div style={{ position: "absolute", left: 200, bottom: 80, fontSize: 14, color: "#555", fontFamily: "monospace" }}>
        <div>1. <span style={{ color: COLORS.accent }}>Flip.getState()</span> — record positions</div>
        <div>2. Change DOM layout</div>
        <div>3. <span style={{ color: COLORS.accent }}>Flip.from(state)</span> — animate from old → new</div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 12: CLOSING
// ============================================================
export const GsapClosing: React.FC = () => {
  const titleOp = useFadeIn(10, 12);
  const titleScale = useScalePunch(10);
  const subOp = useFadeIn(25, 9);
  const subX = useSlideIn("left", 100, 25, 9);

  const features = ["TWEENS", "EASINGS", "TIMELINES", "STAGGER", "PLUGINS", "UTILITIES"];

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

      <div style={{ ...FONTS.hero, fontSize: 100, color: COLORS.accent, textTransform: "uppercase",
        opacity: titleOp, transform: `scale(${titleScale})`, letterSpacing: 6 }}>
        GSAP
      </div>

      <div style={{ ...FONTS.support, color: COLORS.textPrimary, textTransform: "uppercase",
        opacity: subOp, transform: subX, marginTop: 12 }}>
        THE STANDARD FOR WEB ANIMATION
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 50, flexWrap: "wrap", justifyContent: "center" }}>
        {features.map((f, i) => {
          const fOp = useFadeIn(35 + i * 4, 4);
          const fScale = useSnapIn(35 + i * 4);
          return (
            <div key={i} style={{
              padding: "8px 20px", border: `2px solid ${i === 0 ? COLORS.accent : "#333"}`,
              borderRadius: 4, opacity: fOp, transform: `scale(${fScale})`,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2,
                color: i === 0 ? COLORS.accent : COLORS.textPrimary }}>{f}</span>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", bottom: 80, fontSize: 14, color: "#555",
        letterSpacing: 3, fontWeight: 700, opacity: useFadeIn(65, 9) }}>
        160+ FEATURES — 42+ EASINGS — 20 PLUGINS
      </div>
    </AbsoluteFill>
  );
};
