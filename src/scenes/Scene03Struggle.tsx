import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, TIMING, FONT_FAMILY } from "../motion/tokens";
import { useFadeIn, useSlideIn, useScalePunch, useSnapIn, useIdleOscillate, staggerDelay, useSelfDraw } from "../motion/hooks";
import { StickFigure } from "../components/StickFigure";

// BEAT 3 — STRUGGLE
// Layout A: Text left, Figure right (wrench head, working posture)
// 3 icons stagger: cake(X), book, jar
// Idle loop: hammering animation
// Concept: "PRACTICED" (yellow)

export const Scene03Struggle: React.FC = () => {
  const frame = useCurrentFrame();
  const FIGURE_ENTER = TIMING.blackOpen;
  const figureOp = useFadeIn(FIGURE_ENTER, TIMING.figureEnter);

  // Idle hammering loop
  const hammerSwing = useIdleOscillate(20, 18, FIGURE_ENTER + 12);

  // 3 icons stagger in
  const icons = [
    { label: "BURNING CAKES", symbol: "cake", delay: 18 },
    { label: "FIXING RECIPES", symbol: "book", delay: 24 },
    { label: "SAVING COINS", symbol: "jar", delay: 30 },
  ];

  // Self-draw underline beneath concept word
  const CONCEPT_ENTER = 36;
  const underlineDraw = useSelfDraw(400, CONCEPT_ENTER + 6, 12);

  // Text
  const TEXT_ENTER = FIGURE_ENTER + TIMING.textDelay;
  const textOp = useFadeIn(TEXT_ENTER, TIMING.textEnter);
  const textX = useSlideIn("left", 120, TEXT_ENTER, TIMING.textEnter);
  const conceptScale = useScalePunch(CONCEPT_ENTER);
  const conceptOp = useFadeIn(CONCEPT_ENTER, 4);

  return (
    <AbsoluteFill style={{ background: COLORS.background, fontFamily: FONT_FAMILY }}>

      {/* LEFT: Text + Icon column */}
      <div style={{
        position: "absolute", left: 80, top: 0, bottom: 0, width: "45%",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{
          ...FONTS.support, color: COLORS.textPrimary,
          textTransform: "uppercase", opacity: textOp, transform: textX,
          marginBottom: 8,
        }}>
          STILL, SHE
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{
            ...FONTS.hero, color: COLORS.accent,
            textTransform: "uppercase", opacity: conceptOp,
            transform: `scale(${conceptScale})`, transformOrigin: "left center",
          }}>
            PRACTICED
          </div>
          {/* Self-draw underline */}
          <svg width={400} height={8} style={{ position: "absolute", bottom: -4, left: 0 }}>
            <line x1={0} y1={4} x2={400} y2={4}
              stroke={COLORS.accent} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={400} strokeDashoffset={underlineDraw}
            />
          </svg>
        </div>

        {/* 3 icons stagger */}
        <div style={{ display: "flex", gap: 40, marginTop: 50 }}>
          {icons.map((icon, i) => {
            const iconScale = useSnapIn(icon.delay);
            const iconOp = useFadeIn(icon.delay, 4);
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                opacity: iconOp, transform: `scale(${iconScale})`,
              }}>
                <svg width={50} height={50} viewBox="0 0 50 50">
                  {icon.symbol === "cake" && (
                    <>
                      <rect x={10} y={20} width={30} height={25} rx={4} fill="none" stroke={COLORS.figure} strokeWidth={2} />
                      <path d="M10,22 Q25,10 40,22" fill="none" stroke={COLORS.figure} strokeWidth={2} />
                      {/* X mark — burnt */}
                      <line x1={15} y1={18} x2={35} y2={42} stroke={COLORS.label} strokeWidth={3} strokeLinecap="round" />
                      <line x1={35} y1={18} x2={15} y2={42} stroke={COLORS.label} strokeWidth={3} strokeLinecap="round" />
                    </>
                  )}
                  {icon.symbol === "book" && (
                    <>
                      <rect x={10} y={10} width={30} height={35} rx={2} fill="none" stroke={COLORS.figure} strokeWidth={2} />
                      <line x1={25} y1={10} x2={25} y2={45} stroke={COLORS.figure} strokeWidth={2} />
                      <line x1={14} y1={18} x2={22} y2={18} stroke={COLORS.figure} strokeWidth={1.5} opacity={0.5} />
                      <line x1={14} y1={24} x2={22} y2={24} stroke={COLORS.figure} strokeWidth={1.5} opacity={0.5} />
                      <line x1={28} y1={18} x2={36} y2={18} stroke={COLORS.figure} strokeWidth={1.5} opacity={0.5} />
                    </>
                  )}
                  {icon.symbol === "jar" && (
                    <>
                      <rect x={14} y={12} width={22} height={30} rx={3} fill="none" stroke={COLORS.figure} strokeWidth={2} />
                      <rect x={12} y={8} width={26} height={6} rx={2} fill={COLORS.figure} opacity={0.5} />
                      {/* Coins inside */}
                      <circle cx={22} cy={35} r={3} fill={COLORS.accent} opacity={0.8} />
                      <circle cx={28} cy={33} r={3} fill={COLORS.accent} opacity={0.6} />
                      <circle cx={25} cy={29} r={3} fill={COLORS.accent} opacity={0.4} />
                    </>
                  )}
                </svg>
                <span style={{ fontSize: 11, color: COLORS.textPrimary, letterSpacing: 1, opacity: 0.6, textTransform: "uppercase" }}>
                  {icon.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Figure (wrench head, working, hammer idle) */}
      <div style={{
        position: "absolute", right: 140, top: "50%",
        transform: "translateY(-50%)",
        opacity: figureOp,
      }}>
        <div style={{ transform: `rotate(${hammerSwing * 0.3}deg)`, transformOrigin: "center bottom" }}>
          <StickFigure headType="wrench" posture="working" scale={1.8} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
