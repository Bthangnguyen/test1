import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSelfDraw } from "../motion/hooks";
import { StickFigure } from "../components/StickFigure";

// BEAT 1 — DREAM
// Layout A: Figure right, Text left
// Figure: Star head (aspiration)
// Self-draw dream bubble with bread icon
// 4-phase: Black open → Figure fade → Text slide → Concept snap

export const Scene01Dream: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Black open (0-6f)
  // Phase 2: Figure enters (6-15f)
  const FIGURE_ENTER = TIMING.blackOpen;
  const figureOp = useFadeIn(FIGURE_ENTER, TIMING.figureEnter);

  // Phase 2b: Dream bubble self-draw (9-24f)
  const BUBBLE_ENTER = FIGURE_ENTER + 3;
  const bubbleDraw = useSelfDraw(320, BUBBLE_ENTER, 18);

  // Phase 3: Text enters (12-21f)
  const TEXT_ENTER = FIGURE_ENTER + TIMING.textDelay;
  const textOp = useFadeIn(TEXT_ENTER, TIMING.textEnter);
  const textX = useSlideIn("left", 120, TEXT_ENTER, TIMING.textEnter);

  // Phase 3b: Concept word snaps (18-24f)
  const CONCEPT_ENTER = TEXT_ENTER + TIMING.conceptDelay;
  const conceptScale = useScalePunch(CONCEPT_ENTER);
  const conceptOp = useFadeIn(CONCEPT_ENTER, 4);

  // Bread icon inside bubble
  const breadOp = useFadeIn(BUBBLE_ENTER + 12, 6);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>
      {/* LEFT: Text Zone */}
      <div style={{
        position: "absolute", left: 80, top: 0, bottom: 0, width: "45%",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase",
          opacity: textOp, transform: textX,
        }}>
          EVERY MORNING, MIA STOOD
        </div>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase",
          opacity: textOp, transform: textX, marginBottom: 16,
        }}>
          WITH ONE SMALL
        </div>
        <div style={{
          ...FONTS.hero, color: COLORS.accent,
          textTransform: "uppercase",
          opacity: conceptOp,
          transform: `scale(${conceptScale})`,
          transformOrigin: "left center",
        }}>
          DREAM
        </div>
      </div>

      {/* RIGHT: Figure Zone */}
      <div style={{
        position: "absolute", right: 120, top: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: figureOp,
      }}>
        {/* Bus stop pole */}
        <div style={{ position: "absolute", left: -80, bottom: "22%" }}>
          <svg width={60} height={200} viewBox="0 0 60 200">
            <line x1={30} y1={0} x2={30} y2={200} stroke={COLORS.figure} strokeWidth={3} />
            <rect x={5} y={10} width={50} height={25} rx={3} fill="none" stroke={COLORS.figure} strokeWidth={2} />
            <text x={30} y={28} textAnchor="middle" fill={COLORS.figure} fontSize={12} fontWeight={700}>BUS</text>
          </svg>
        </div>

        <StickFigure headType="star" posture="upright" scale={1.8} />

        {/* Dream bubble — self-draw circle */}
        <svg width={140} height={140} viewBox="0 0 140 140"
          style={{ position: "absolute", top: "10%", right: -40 }}
        >
          <circle cx={70} cy={70} r={55} fill="none"
            stroke={COLORS.accent} strokeWidth={2.5}
            strokeDasharray={320}
            strokeDashoffset={bubbleDraw}
          />
          {/* Bread icon inside */}
          <g opacity={breadOp}>
            <ellipse cx={70} cy={70} rx={28} ry={14} fill={COLORS.accent} opacity={0.85} />
            <path d="M48,68 Q70,56 92,68" fill="none" stroke="#D4A017" strokeWidth={2} />
          </g>
        </svg>

        {/* Bubble tail dots */}
        {[0, 1].map(d => (
          <div key={d} style={{
            position: "absolute", right: -10 + d * 20, top: `${55 + d * 8}%`,
            width: 10 - d * 3, height: 10 - d * 3, borderRadius: 10,
            backgroundColor: COLORS.accent, opacity: breadOp * 0.4,
          }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
