import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSelfDraw, useSnapIn, staggerDelay } from "../motion/hooks";
import { StickFigure } from "../components/StickFigure";

// BEAT 5 — GROWTH
// Layout B: Figure Center + Assemble pattern
// Shop outline self-draws around Mia
// Window lights snap in (yellow rectangles)
// Neighbors stagger in from sides
// Concept: "SHOP" (yellow)

export const Scene05Growth: React.FC = () => {
  const frame = useCurrentFrame();
  const FIGURE_ENTER = TIMING.blackOpen;

  // Mia enters center
  const miaOp = useFadeIn(FIGURE_ENTER, TIMING.figureEnter);

  // Shop walls self-draw around her
  const SHOP_ENTER = FIGURE_ENTER + 10;
  const wallDraw = useSelfDraw(800, SHOP_ENTER, 24);

  // Roof self-draws
  const ROOF_ENTER = SHOP_ENTER + 15;
  const roofDraw = useSelfDraw(400, ROOF_ENTER, 15);

  // Windows snap in (stagger)
  const WIN_ENTER = ROOF_ENTER + 10;

  // Sign text
  const signOp = useFadeIn(WIN_ENTER + 8, 6);

  // Door
  const doorOp = useFadeIn(SHOP_ENTER + 20, 8);

  // Neighbors stagger from sides
  const neighborDelays = [50, 55, 60, 65, 70];

  // Text
  const TEXT_ENTER = FIGURE_ENTER + TIMING.textDelay;
  const textOp = useFadeIn(TEXT_ENTER, TIMING.textEnter);
  const textX = useSlideIn("left", 120, TEXT_ENTER, TIMING.textEnter);
  const CONCEPT_ENTER = TEXT_ENTER + TIMING.conceptDelay + 6;
  const conceptScale = useScalePunch(CONCEPT_ENTER);
  const conceptOp = useFadeIn(CONCEPT_ENTER, 4);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>

      {/* Shop outline — center, self-draw */}
      <svg style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        width={400} height={350} viewBox="0 0 400 350"
      >
        {/* Walls */}
        <rect x={50} y={80} width={300} height={220} rx={4}
          fill="none" stroke={COLORS.figure} strokeWidth={3}
          strokeDasharray={800} strokeDashoffset={wallDraw}
        />

        {/* Roof */}
        <path d="M30,85 L200,15 L370,85"
          fill="none" stroke={COLORS.figure} strokeWidth={3}
          strokeDasharray={400} strokeDashoffset={roofDraw}
          strokeLinejoin="round"
        />

        {/* Windows — yellow, snap in */}
        {[
          { x: 85, y: 120 },
          { x: 85, y: 190 },
          { x: 265, y: 120 },
          { x: 265, y: 190 },
        ].map((w, i) => {
          const wScale = useSnapIn(WIN_ENTER + i * 3);
          return (
            <g key={i} transform={`translate(${w.x}, ${w.y}) scale(${wScale})`}>
              <rect x={0} y={0} width={50} height={40} rx={2}
                fill={COLORS.accent} opacity={0.7}
              />
              <line x1={25} y1={0} x2={25} y2={40} stroke={COLORS.background} strokeWidth={2} />
              <line x1={0} y1={20} x2={50} y2={20} stroke={COLORS.background} strokeWidth={2} />
            </g>
          );
        })}

        {/* Door */}
        <rect x={162} y={220} width={76} height={80} rx={3}
          fill="none" stroke={COLORS.figure} strokeWidth={2.5}
          opacity={doorOp}
        />
        <circle cx={225} cy={260} r={4} fill={COLORS.accent} opacity={doorOp} />

        {/* Sign */}
        <g opacity={signOp}>
          <rect x={125} y={50} width={150} height={28} rx={4} fill={COLORS.accent} />
          <text x={200} y={70} textAnchor="middle" fill={COLORS.background}
            fontSize={14} fontWeight={900} letterSpacing={3}
          >MIA'S BAKERY</text>
        </g>
      </svg>

      {/* Mia inside shop */}
      <div style={{
        position: "absolute", left: "50%", top: "52%",
        transform: "translate(-50%, -50%)", opacity: miaOp,
      }}>
        <StickFigure headType="crown" posture="upright" scale={1.2} />
      </div>

      {/* Neighbors approaching — stagger from sides */}
      {neighborDelays.map((d, i) => {
        const nOp = useFadeIn(d, 8);
        const side = i < 3 ? "left" : "right";
        const xPos = side === "left" ? `${8 + i * 6}%` : `${72 + (i - 3) * 8}%`;
        return (
          <div key={i} style={{
            position: "absolute", left: xPos, bottom: "18%", opacity: nOp,
          }}>
            <StickFigure headType="circle" posture="upright" scale={0.7} opacity={0.6} />
          </div>
        );
      })}

      {/* Text — bottom left */}
      <div style={{ position: "absolute", left: 80, bottom: 80 }}>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase", opacity: textOp, transform: textX,
        }}>
          MONTHS LATER, MIA RENTED A TINY
        </div>
        <div style={{
          ...FONTS.hero, color: COLORS.accent, textTransform: "uppercase",
          opacity: conceptOp,
          transform: `scale(${conceptScale})`, transformOrigin: "left center",
        }}>
          SHOP
        </div>
      </div>
    </AbsoluteFill>
  );
};
