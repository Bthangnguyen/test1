import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useSnapIn, staggerDelay } from "../motion/hooks";
import { StickFigure } from "../components/StickFigure";

// BEAT 2 — DOUBT
// Layout D: Central Mia (slouched) + 4 orbiting figures laughing
// Red stamp "LAUGHED" diagonal
// Concept: "PAY BILLS" (yellow)

export const Scene02Doubt: React.FC = () => {
  const FIGURE_ENTER = TIMING.blackOpen;
  const figureOp = useFadeIn(FIGURE_ENTER, TIMING.figureEnter);

  // Orbiting figures stagger in
  const orbiters = [
    { x: "10%", top: "30%", delay: 10 },
    { x: "22%", top: "55%", delay: 13 },
    { x: "70%", top: "28%", delay: 16 },
    { x: "82%", top: "52%", delay: 19 },
  ];

  // Text
  const TEXT_ENTER = FIGURE_ENTER + TIMING.textDelay;
  const textOp = useFadeIn(TEXT_ENTER, TIMING.textEnter);
  const textX = useSlideIn("left", 120, TEXT_ENTER, TIMING.textEnter);

  const CONCEPT_ENTER = TEXT_ENTER + TIMING.conceptDelay;
  const conceptOp = useFadeIn(CONCEPT_ENTER, 4);
  const conceptScale = useSnapIn(CONCEPT_ENTER);

  // Red stamp
  const STAMP_ENTER = CONCEPT_ENTER + 6;
  const stampOp = useFadeIn(STAMP_ENTER, 3);
  const stampScale = useSnapIn(STAMP_ENTER, { stiffness: 500, damping: 10, mass: 0.6 });

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>

      {/* Central Mia — slouched */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        opacity: figureOp,
      }}>
        <StickFigure headType="circle" posture="slouched" scale={1.6} />
      </div>

      {/* Orbiting laughing figures — 60% scale */}
      {orbiters.map((o, i) => {
        const oOp = useFadeIn(o.delay, 6);
        return (
          <div key={i} style={{
            position: "absolute", left: o.x, top: o.top, opacity: oOp,
          }}>
            <StickFigure headType="circle" posture="upright" scale={0.9} />
            {/* Laugh lines */}
            <svg width={40} height={20} viewBox="0 0 40 20"
              style={{ position: "absolute", top: -5, left: 20, opacity: oOp * 0.6 }}
            >
              <path d="M5,15 Q20,0 35,15" fill="none" stroke={COLORS.figure} strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
        );
      })}

      {/* Red stamp — "LAUGHED" diagonal */}
      <div style={{
        position: "absolute", left: "50%", top: "35%",
        transform: `translate(-50%, -50%) rotate(-15deg) scale(${stampScale})`,
        opacity: stampOp,
        padding: "6px 28px",
        border: `3px solid ${COLORS.label}`,
        borderRadius: 4,
      }}>
        <span style={{
          ...FONTS.label, color: COLORS.label,
          textTransform: "uppercase", letterSpacing: 4,
        }}>LAUGHED</span>
      </div>

      {/* Text — bottom left */}
      <div style={{
        position: "absolute", left: 80, bottom: 100,
      }}>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase", opacity: textOp, transform: textX,
        }}>
          PEOPLE SAID DREAMS DON'T
        </div>
        <div style={{
          ...FONTS.concept, color: COLORS.accent,
          textTransform: "uppercase",
          opacity: conceptOp,
          transform: `scale(${conceptScale})`,
          transformOrigin: "left center",
        }}>
          PAY BILLS
        </div>
      </div>
    </AbsoluteFill>
  );
};
