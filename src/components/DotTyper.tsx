import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

/* ═══════════════════════════════════════════════════════════
   DOT TYPER — Typewriter text with blinking cursor
   Pure Remotion interpolate, no GSAP.
   ═══════════════════════════════════════════════════════════ */

interface DotTyperProps {
  text: string;
  startFrame: number;
  charsPerFrame?: number; // how many frames per character
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  align?: "left" | "center" | "right";
  cursorColor?: string;
  style?: React.CSSProperties;
}

export const DotTyper: React.FC<DotTyperProps> = ({
  text,
  startFrame,
  charsPerFrame = 3,
  fontSize = 32,
  color = "#f5f5f5",
  fontFamily = "'Inter', 'Helvetica Neue', sans-serif",
  align = "center",
  cursorColor = "#FF4D00",
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  if (elapsed < 0) return null;

  // How many chars to show
  const totalChars = text.length;
  const visibleChars = Math.min(
    totalChars,
    Math.floor(elapsed / charsPerFrame)
  );

  // Typing complete?
  const typingDone = visibleChars >= totalChars;

  // Cursor blink (every 15 frames)
  const cursorVisible = typingDone
    ? Math.floor(frame / 15) % 2 === 0
    : true;

  // Fade in
  const opacity = interpolate(elapsed, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayText = text.slice(0, visibleChars);

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        color,
        textAlign: align,
        letterSpacing: "0.02em",
        lineHeight: 1.5,
        opacity,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {displayText}
      <span
        style={{
          display: "inline-block",
          width: 2,
          height: fontSize * 0.85,
          backgroundColor: cursorVisible ? cursorColor : "transparent",
          marginLeft: 2,
          verticalAlign: "text-bottom",
          transition: "background-color 0.05s",
        }}
      />
    </div>
  );
};
