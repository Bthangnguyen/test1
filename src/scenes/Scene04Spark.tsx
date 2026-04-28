import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSelfDraw } from "../motion/hooks";
import { StickFigure } from "../components/StickFigure";

// BEAT 4 — SPARK (turning point)
// Layout C: Arrow Connector
// Mia left extending arm → yellow self-draw arrow → neighbor right
// Bread icon on arrow midpoint
// Concept: "SMILED" (yellow)

export const Scene04Spark: React.FC = () => {
  const frame = useCurrentFrame();
  const FIGURE_ENTER = TIMING.blackOpen;

  // Mia enters (left)
  const miaOp = useFadeIn(FIGURE_ENTER, TIMING.figureEnter);

  // Neighbor enters (right, delayed)
  const neighborOp = useFadeIn(FIGURE_ENTER + 8, TIMING.figureEnter);

  // Arrow self-draws between them
  const ARROW_ENTER = FIGURE_ENTER + 12;
  const arrowDraw = useSelfDraw(600, ARROW_ENTER, 18);

  // Bread on arrow midpoint
  const breadOp = useFadeIn(ARROW_ENTER + 15, 6);

  // Smile arc on neighbor
  const smileOp = useFadeIn(ARROW_ENTER + 20, 6);

  // Text
  const TEXT_ENTER = FIGURE_ENTER + TIMING.textDelay;
  const textOp = useFadeIn(TEXT_ENTER, TIMING.textEnter);
  const textX = useSlideIn("left", 120, TEXT_ENTER, TIMING.textEnter);
  const CONCEPT_ENTER = TEXT_ENTER + TIMING.conceptDelay;
  const conceptScale = useScalePunch(CONCEPT_ENTER);
  const conceptOp = useFadeIn(CONCEPT_ENTER, 4);

  // Rain lines — contextual texture (script: "rainy night")
  const rain = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 97 + 30) % 1920,
    y: ((frame * 4 + i * 53) % 1200) - 100,
    len: 20 + (i % 3) * 8,
  }));

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>

      {/* Rain — very subtle background texture */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
        {rain.map((d, i) => (
          <line key={i} x1={d.x} y1={d.y} x2={d.x - 1} y2={d.y + d.len}
            stroke={COLORS.figure} strokeWidth={1} opacity={0.08}
          />
        ))}
      </svg>

      {/* Mia — left, extending arm */}
      <div style={{
        position: "absolute", left: "18%", top: "50%",
        transform: "translateY(-50%)", opacity: miaOp,
      }}>
        <StickFigure headType="heart" posture="extending" scale={1.6} armExtend />
      </div>

      {/* Arrow: Mia → Neighbor (yellow, self-draw) */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
        <path d="M 520 440 Q 760 320 1000 440"
          fill="none" stroke={COLORS.accent} strokeWidth={4}
          strokeDasharray={600} strokeDashoffset={arrowDraw}
          strokeLinecap="round"
        />
        {/* Arrowhead */}
        {arrowDraw < 50 && (
          <polygon points="990,432 1010,440 990,448" fill={COLORS.accent} opacity={1 - arrowDraw / 50} />
        )}

        {/* Bread icon at arrow midpoint */}
        <g transform="translate(740, 310)" opacity={breadOp}>
          <ellipse cx={25} cy={12} rx={22} ry={10} fill={COLORS.accent} />
          <path d="M8,10 Q25,2 42,10" fill="none" stroke="#D4A017" strokeWidth={1.5} />
        </g>
      </svg>

      {/* Neighbor — right */}
      <div style={{
        position: "absolute", right: "18%", top: "50%",
        transform: "translateY(-50%)", opacity: neighborOp,
      }}>
        <StickFigure headType="circle" posture="upright" scale={1.6} />

        {/* Smile arc */}
        <svg width={30} height={20} viewBox="0 0 30 20"
          style={{ position: "absolute", top: 35, left: 30, opacity: smileOp }}
        >
          <path d="M5,8 Q15,18 25,8" fill="none" stroke={COLORS.accent} strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>

      {/* Text — bottom */}
      <div style={{ position: "absolute", left: 80, bottom: 100 }}>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase", opacity: textOp, transform: textX,
        }}>
          ONE RAINY NIGHT, A NEIGHBOR TASTED HER WARM BREAD AND
        </div>
        <div style={{
          ...FONTS.hero, color: COLORS.accent, textTransform: "uppercase",
          opacity: conceptOp,
          transform: `scale(${conceptScale})`, transformOrigin: "left center",
        }}>
          SMILED
        </div>
      </div>
    </AbsoluteFill>
  );
};
