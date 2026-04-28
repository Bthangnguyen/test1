import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSnapIn, staggerDelay } from "../motion/hooks";
import { StickFigure } from "../components/StickFigure";

// BEAT 6 — TRIUMPH
// Layout D: Central figure + orbiting crowd (queue)
// 10+ figures stagger snap in from right
// Concept: "CORNER" (yellow)
// Scale punch on concept word

export const Scene06Triumph: React.FC = () => {
  const FIGURE_ENTER = TIMING.blackOpen;

  // Mia (shop, right side — reference from previous beat)
  const miaOp = useFadeIn(FIGURE_ENTER, 6);

  // Queue — 12 figures stagger from left to right
  const queue = Array.from({ length: 12 }, (_, i) => ({
    x: 100 + i * 100,
    delay: 8 + i * 2,
  }));

  // Text
  const TEXT_ENTER = FIGURE_ENTER + TIMING.textDelay;
  const textOp = useFadeIn(TEXT_ENTER, TIMING.textEnter);
  const textX = useSlideIn("left", 120, TEXT_ENTER, TIMING.textEnter);
  const CONCEPT_ENTER = TEXT_ENTER + TIMING.conceptDelay;
  const conceptScale = useScalePunch(CONCEPT_ENTER);
  const conceptOp = useFadeIn(CONCEPT_ENTER, 4);

  // Self-draw line underneath queue
  const lineOp = useFadeIn(10, 9);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>

      {/* Ground line — white, thin */}
      <line style={{ position: "absolute" }} />
      <svg style={{ position: "absolute", bottom: 180, left: 0, width: 1920, height: 4 }}>
        <line x1={60} y1={2} x2={1860} y2={2}
          stroke={COLORS.figure} strokeWidth={1.5} opacity={lineOp * 0.15}
        />
      </svg>

      {/* Queue — 12 figures stagger snap in */}
      {queue.map((p, i) => {
        const pScale = useSnapIn(p.delay);
        const pOp = useFadeIn(p.delay, 4);
        return (
          <div key={i} style={{
            position: "absolute", left: p.x, bottom: 185,
            transform: `scale(${pScale})`, opacity: pOp,
          }}>
            <StickFigure headType="circle" posture="upright" scale={0.7} opacity={0.6 + (i % 3) * 0.1} />
          </div>
        );
      })}

      {/* Shop icon — right side, anchor */}
      <div style={{
        position: "absolute", right: 80, bottom: 185, opacity: miaOp,
      }}>
        <svg width={120} height={130} viewBox="0 0 120 130">
          {/* Simple shop outline */}
          <rect x={10} y={35} width={100} height={90} rx={3} fill="none" stroke={COLORS.figure} strokeWidth={2.5} />
          <path d="M0,38 L60,5 L120,38" fill="none" stroke={COLORS.figure} strokeWidth={2.5} strokeLinejoin="round" />
          {/* Window glow */}
          <rect x={25} y={50} width={25} height={20} rx={2} fill={COLORS.accent} opacity={0.7} />
          <rect x={70} y={50} width={25} height={20} rx={2} fill={COLORS.accent} opacity={0.7} />
          {/* Door */}
          <rect x={42} y={85} width={36} height={40} rx={2} fill="none" stroke={COLORS.figure} strokeWidth={2} />
          <circle cx={70} cy={105} r={2.5} fill={COLORS.accent} />
        </svg>

        {/* Mia inside shop */}
        <div style={{ position: "absolute", bottom: 10, left: 20 }}>
          <StickFigure headType="crown" posture="upright" scale={0.6} />
        </div>
      </div>

      {/* Self-draw arrow from queue end → shop */}
      <svg style={{ position: "absolute", bottom: 220, right: 200, width: 200, height: 40 }}>
        <path d="M0,20 L180,20" fill="none" stroke={COLORS.accent} strokeWidth={3}
          strokeDasharray={200}
          strokeDashoffset={useFadeIn(35, 1) > 0.5 ? 0 : 200}
          strokeLinecap="round"
        />
        <polygon points="175,12 195,20 175,28" fill={COLORS.accent}
          opacity={useFadeIn(38, 4)}
        />
      </svg>

      {/* Text — top left */}
      <div style={{ position: "absolute", left: 80, top: 100 }}>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase", opacity: textOp, transform: textX,
        }}>
          ON OPENING DAY, THE LINE STRETCHED AROUND THE
        </div>
        <div style={{
          ...FONTS.hero, color: COLORS.accent, textTransform: "uppercase",
          opacity: conceptOp,
          transform: `scale(${conceptScale})`, transformOrigin: "left center",
        }}>
          CORNER
        </div>
      </div>
    </AbsoluteFill>
  );
};
