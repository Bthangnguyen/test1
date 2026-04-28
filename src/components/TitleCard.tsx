import React from "react";
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

/* ═══════════════════════════════════════════════════════════
   TITLE CARD — Reusable section header
   Hiển thị trong 90 frames đầu mỗi Sequence
   ═══════════════════════════════════════════════════════════ */

interface TitleCardProps {
  index: string;       // "01", "02", etc.
  title: string;       // "THE HOOK"
  subtitle: string;    // "When speed becomes the only language"
  accentColor?: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({
  index,
  title,
  subtitle,
  accentColor = "#6366f1",
}) => {
  const frame = useCurrentFrame();

  // Whole card lifecycle: appear → hold → fade out
  const cardOpacity = interpolate(
    frame, [0, 15, 70, 95], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Index number
  const indexProgress = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Title: slide up + scale
  const titleProgress = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleScale = interpolate(titleProgress, [0, 0.7, 1], [0.8, 1.05, 1]);

  // Subtitle: typing effect
  const subtitleStart = 30;
  const visibleChars = Math.floor(
    interpolate(frame, [subtitleStart, subtitleStart + 50], [0, subtitle.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })
  );

  // Shimmer on title
  const shimmerPos = interpolate(frame, [15, 70], [100, -100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Decorative line width
  const lineWidth = interpolate(frame, [8, 35], [0, 280], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (frame > 100) return null;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: cardOpacity,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {/* Index number */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 18,
          fontWeight: 300,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.3em",
          marginBottom: 12,
          opacity: indexProgress,
          transform: `translateY(${interpolate(indexProgress, [0, 1], [15, 0])}px)`,
        }}
      >
        {index} /
      </div>

      {/* Main title with shimmer */}
      <div
        style={{
          fontFamily: "'Anton', 'Impact', sans-serif",
          fontSize: 90,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "0.06em",
          background: `linear-gradient(90deg, ${accentColor} 0%, #ffffff 50%, ${accentColor} 100%)`,
          backgroundSize: "200% 100%",
          backgroundPosition: `${shimmerPos}% 0`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: titleProgress,
          transform: `translateY(${titleY}px) scale(${titleScale})`,
          filter: `drop-shadow(0 0 30px ${accentColor}44)`,
        }}
      >
        {title}
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`,
          marginTop: 20,
          marginBottom: 20,
        }}
      />

      {/* Subtitle typing */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 22,
          fontWeight: 300,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {subtitle.slice(0, visibleChars)}
        {visibleChars < subtitle.length && visibleChars > 0 && (
          <span style={{ opacity: Math.sin(frame * 0.35) > 0 ? 1 : 0, color: accentColor }}>▌</span>
        )}
      </div>
    </AbsoluteFill>
  );
};
