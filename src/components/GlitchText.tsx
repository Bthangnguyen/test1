import React from "react";
import { rgbSplit, seededRandom } from "../utils/glitch";

/* ═══════════════════════════════════════════════════════════
   GLITCH TEXT — RGB Split text with 3-channel color offset
   Creates the classic chromatic aberration / VHS glitch look
   ═══════════════════════════════════════════════════════════ */

interface GlitchTextProps {
  text: string;
  frame: number;
  intensity: number;      // RGB split distance (px), 0 = no glitch
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: string;
  /** If true, randomly scramble 1-2 chars per frame */
  scramble?: boolean;
  style?: React.CSSProperties;
}

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  frame,
  intensity,
  fontSize = 120,
  fontFamily = "'Anton', 'Impact', sans-serif",
  fontWeight = 900,
  letterSpacing = "0.06em",
  scramble = false,
  style = {},
}) => {
  const split = rgbSplit(frame, intensity);

  // Optional char scramble
  let displayText = text;
  if (scramble && intensity > 2) {
    const chars = text.split("");
    const scrambleCount = Math.ceil(intensity / 8);
    for (let i = 0; i < scrambleCount; i++) {
      const idx = Math.floor(seededRandom(frame * 99 + i * 77) * chars.length);
      const charIdx = Math.floor(seededRandom(frame * 33 + i * 55) * GLITCH_CHARS.length);
      if (chars[idx] !== " ") {
        chars[idx] = GLITCH_CHARS[charIdx];
      }
    }
    displayText = chars.join("");
  }

  const baseStyle: React.CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight: 1,
    whiteSpace: "nowrap" as const,
    position: "absolute" as const,
    left: 0,
    top: 0,
    width: "100%",
    textAlign: "center" as const,
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: fontSize * 1.2,
        ...style,
      }}
    >
      {/* Red channel */}
      <div
        style={{
          ...baseStyle,
          color: "#ff0000",
          mixBlendMode: "screen",
          transform: `translate(${split.r.x}px, ${split.r.y}px)`,
        }}
      >
        {displayText}
      </div>

      {/* Green channel */}
      <div
        style={{
          ...baseStyle,
          color: "#00ff00",
          mixBlendMode: "screen",
          transform: `translate(${split.g.x}px, ${split.g.y}px)`,
        }}
      >
        {displayText}
      </div>

      {/* Blue channel */}
      <div
        style={{
          ...baseStyle,
          color: "#0000ff",
          mixBlendMode: "screen",
          transform: `translate(${split.b.x}px, ${split.b.y}px)`,
        }}
      >
        {displayText}
      </div>

      {/* White core (crisp readable layer) */}
      <div
        style={{
          ...baseStyle,
          color: "rgba(255,255,255,0.85)",
          mixBlendMode: "screen",
        }}
      >
        {displayText}
      </div>
    </div>
  );
};
