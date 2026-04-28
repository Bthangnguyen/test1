import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
} from "remotion";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 1: THE HOOK — Kinetic Typography
   Frames: 0–900 (30 giây @ 30fps)
   ═══════════════════════════════════════════════════════════ */

const KEYWORDS = [
  { text: "SPEED", fromX: -1400, fromY: -700, color: "#6366f1" },
  { text: "DATA", fromX: 1400, fromY: 600, color: "#a855f7" },
  { text: "AUTONOMY", fromX: 0, fromY: 900, color: "#ec4899" },
];

const SUBTITLE_TEXT = "The Agentic AI Era Has Begun";

export const Seq01_TheHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ─── Master opacity fade in/out ─── */
  const masterOpacity = interpolate(
    frame,
    [0, 15, 870, 900],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ─── Beat 1: Cursor blink (0–90) ─── */
  const cursorVisible = frame < 90;
  const cursorOpacity = cursorVisible
    ? Math.abs(Math.sin((frame / fps) * Math.PI * 2.5))
    : 0;

  /* ─── Beat 2: Keywords fly in (90–450) ─── */
  const keywordElements = KEYWORDS.map((kw, i) => {
    const startFrame = 90 + i * 90; // Mỗi từ cách nhau 3 giây
    const progress = interpolate(
      frame,
      [startFrame, startFrame + 36, startFrame + 50],
      [0, 0.85, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Vị trí: bay từ góc ngoài → trung tâm
    const x = interpolate(progress, [0, 1], [kw.fromX, 0]);
    const y = interpolate(progress, [0, 1], [kw.fromY, (i - 1) * 120]);

    // Scale: to → vừa
    const scale = interpolate(progress, [0, 0.7, 1], [3, 1.6, 1.4]);

    // Blur: mờ → sắc
    const blur = interpolate(progress, [0, 0.6, 1], [25, 5, 0]);

    // Opacity
    const opacity = interpolate(progress, [0, 0.15], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <div
        key={kw.text}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
          filter: `blur(${blur}px)`,
          opacity,
          fontFamily: "'Anton', 'Impact', sans-serif",
          fontSize: 110,
          fontWeight: 900,
          color: kw.color,
          textShadow: `0 0 40px ${kw.color}66, 0 0 80px ${kw.color}33`,
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        {kw.text}
      </div>
    );
  });

  /* ─── Beat 3: Keywords align + subtitle appears (450–720) ─── */
  const alignProgress = interpolate(frame, [450, 510], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle typing
  const subtitleStart = 520;
  const visibleChars = Math.floor(
    interpolate(
      frame,
      [subtitleStart, subtitleStart + 120],
      [0, SUBTITLE_TEXT.length],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  );

  const subtitleOpacity = interpolate(frame, [subtitleStart, subtitleStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ─── Beat 4: Suck into center (720–900) ─── */
  const suckProgress = interpolate(frame, [720, 850], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const suckScale = interpolate(suckProgress, [0, 1], [1, 0]);
  const suckBlur = interpolate(suckProgress, [0, 0.5, 1], [0, 0, 15]);

  // Flash
  const flashOpacity = interpolate(frame, [845, 855, 860, 900], [0, 0.9, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ─── Background grid lines ─── */
  const gridOpacity = interpolate(frame, [60, 120], [0, 0.06], {
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

      {/* ═══ Background subtle grid ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(99,102,241,${gridOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ═══ Radial ambient glow ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ═══ Beat 1: Blinking cursor ═══ */}
      {cursorVisible && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 3,
            height: 60,
            backgroundColor: "#6366f1",
            opacity: cursorOpacity,
            boxShadow: "0 0 15px 5px rgba(99,102,241,0.4)",
          }}
        />
      )}

      {/* ═══ Beat 2+3: Keywords ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${suckScale})`,
          filter: `blur(${suckBlur}px)`,
        }}
      >
        {keywordElements}
      </div>

      {/* ═══ Beat 3: Subtitle ═══ */}
      {frame >= subtitleStart && suckProgress < 0.8 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "28%",
            transform: `translate(-50%, 0) scale(${suckScale})`,
            opacity: subtitleOpacity * (1 - suckProgress),
            filter: `blur(${suckBlur}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              fontSize: 36,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {SUBTITLE_TEXT.slice(0, visibleChars)}
            {visibleChars < SUBTITLE_TEXT.length && (
              <span
                style={{
                  opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  color: "#6366f1",
                }}
              >
                ▌
              </span>
            )}
          </span>
        </div>
      )}

      {/* ═══ Beat 4: Radial burst lines (transition to Seq02) ═══ */}
      {frame > 830 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const burstProgress = interpolate(frame, [835, 880], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const angle = (i / 12) * 360;
            const length = burstProgress * 900;
            return (
              <div key={i} style={{
                position: "absolute",
                left: "50%", top: "50%",
                width: length, height: 2,
                background: `linear-gradient(90deg, rgba(99,102,241,${0.5 * burstProgress}) 0%, transparent 100%)`,
                transformOrigin: "left center",
                transform: `rotate(${angle}deg)`,
                opacity: burstProgress * (1 - burstProgress) * 4,
              }} />
            );
          })}
        </div>
      )}

      {/* ═══ Beat 4: Flash overlay ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Vignette ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
