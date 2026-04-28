import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSelfDraw } from "../motion/hooks";

// BEAT 7 — CLOSING (the quote)
// Layout B: Full center
// Compound text: White setup → Yellow concept snap
// Hands SVG — flour covered
// Self-draw underline beneath "SMALL STEPS"
// Hold on full quote

export const Scene07Closing: React.FC = () => {
  const frame = useCurrentFrame();

  // Hands enter
  const HANDS_ENTER = TIMING.blackOpen;
  const handsOp = useFadeIn(HANDS_ENTER, 12);

  // White setup text
  const WHITE_ENTER = HANDS_ENTER + 15;
  const whiteOp = useFadeIn(WHITE_ENTER, 9);
  const whiteX = useSlideIn("left", 100, WHITE_ENTER, 9);

  // Yellow concept word — compound snap
  const YELLOW_ENTER = WHITE_ENTER + 8;
  const yellowScale = useScalePunch(YELLOW_ENTER);
  const yellowOp = useFadeIn(YELLOW_ENTER, 4);

  // Rest of quote
  const REST_ENTER = YELLOW_ENTER + 8;
  const restOp = useFadeIn(REST_ENTER, 9);
  const restX = useSlideIn("left", 80, REST_ENTER, 9);

  // Self-draw underline
  const underlineDraw = useSelfDraw(500, YELLOW_ENTER + 6, 12);

  // "ONE BRAVE STEP AT A TIME" — final punch
  const FINAL_ENTER = REST_ENTER + 12;
  const finalScale = useScalePunch(FINAL_ENTER);
  const finalOp = useFadeIn(FINAL_ENTER, 6);

  // Attribution
  const ATTR_ENTER = FINAL_ENTER + 12;
  const attrOp = useFadeIn(ATTR_ENTER, 9);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        width: "100%", height: "100%",
      }}>
        {/* Flour-covered hands */}
        <div style={{ opacity: handsOp, marginBottom: 50 }}>
          <svg width={200} height={100} viewBox="0 0 170 100">
            <path d="M35,60 C25,55 15,45 18,35 C20,28 28,25 35,28 L38,18 C40,12 48,12 48,18 L48,25 L52,14 C54,8 62,9 60,16 L56,28 L60,18 C62,12 70,13 68,20 L62,35 L66,28 C68,22 76,24 74,30 L65,55 C60,65 45,68 35,60 Z"
              fill={COLORS.figure} />
            <path d="M135,60 C145,55 155,45 152,35 C150,28 142,25 135,28 L132,18 C130,12 122,12 122,18 L122,25 L118,14 C116,8 108,9 110,16 L114,28 L110,18 C108,12 100,13 102,20 L108,35 L104,28 C102,22 94,24 96,30 L105,55 C110,65 125,68 135,60 Z"
              fill={COLORS.figure} />
            {/* Flour dust dots */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
              <circle key={d} cx={30 + d * 15} cy={40 + (d % 3) * 12}
                r={2} fill={COLORS.figure} opacity={0.25}
              />
            ))}
          </svg>
        </div>

        {/* Quote — compound reveal */}
        <div style={{ textAlign: "center", maxWidth: 1100 }}>
          {/* "MIA LOOKED AT HER FLOUR-COVERED HANDS AND WHISPERED:" */}
          <div style={{
            ...FONTS.support, color: COLORS.textPrimary,
            textTransform: "uppercase", opacity: whiteOp, transform: whiteX,
            marginBottom: 20,
          }}>
            MIA LOOKED AT HER FLOUR-COVERED HANDS AND WHISPERED:
          </div>

          {/* "SMALL STEPS" — yellow snap */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
            <div style={{
              fontSize: 110, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
              color: COLORS.accent, textTransform: "uppercase",
              opacity: yellowOp,
              transform: `scale(${yellowScale})`,
            }}>
              SMALL STEPS
            </div>
            {/* Self-draw underline */}
            <svg width={500} height={8} style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)" }}>
              <line x1={0} y1={4} x2={500} y2={4}
                stroke={COLORS.accent} strokeWidth={4} strokeLinecap="round"
                strokeDasharray={500} strokeDashoffset={underlineDraw}
              />
            </svg>
          </div>

          {/* "CAN BUILD THE LIFE YOU IMAGINE" */}
          <div style={{
            ...FONTS.support, fontSize: 44, color: COLORS.textPrimary,
            textTransform: "uppercase", opacity: restOp, transform: restX,
            marginTop: 24,
          }}>
            CAN BUILD THE LIFE YOU IMAGINE
          </div>

          {/* "ONE BRAVE STEP AT A TIME" — final punch */}
          <div style={{
            fontSize: 64, fontWeight: 900, letterSpacing: 2, lineHeight: 1,
            color: COLORS.accent, textTransform: "uppercase",
            opacity: finalOp,
            transform: `scale(${finalScale})`,
            marginTop: 32,
          }}>
            ONE BRAVE STEP AT A TIME
          </div>
        </div>

        {/* Divider line */}
        <div style={{
          width: 200, height: 3, backgroundColor: COLORS.figure,
          marginTop: 40, opacity: attrOp * 0.3,
        }} />

        {/* Attribution */}
        <div style={{
          fontSize: 20, fontWeight: 700, color: COLORS.figure,
          textTransform: "uppercase", letterSpacing: 6,
          marginTop: 20, opacity: attrOp * 0.5,
        }}>
          — MIA
        </div>
      </div>
    </AbsoluteFill>
  );
};
