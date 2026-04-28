import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";

type TitleTransitionProps = {
  title: string;
};

export const TitleTransition: React.FC<TitleTransitionProps> = ({title}) => {
  const frame = useCurrentFrame();
  const safePadding = {left: 120, right: 120, top: 100, bottom: 100};
  const textPrimary = "#F9FAFB";
  const textSecondary = "#CBD5F5";
  const themeColor = "#6366F1";
  const accentColor = "#22D3EE";

  const intro = interpolate(frame, [0, 28], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outro = interpolate(frame, [122, 150], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = intro * outro;

  const titleYIn = interpolate(frame, [0, 28], [34, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleYOut = interpolate(frame, [122, 150], [0, -20], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        color: textPrimary,
        fontFamily:
          '"Iosevka Charon Mono", "IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
        paddingLeft: safePadding.left,
        paddingRight: safePadding.right,
        paddingTop: safePadding.top,
        paddingBottom: safePadding.bottom,
      }}
    >
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 12% 18%, rgba(99,102,241,0.20), transparent 40%), radial-gradient(circle at 86% 76%, rgba(34,211,238,0.16), transparent 44%)",
        }}
      />

      {[0, 1, 2].map((i) => {
        const drift = Math.sin(frame / (20 + i * 8)) * (16 + i * 6);
        const twinkle = 0.16 + ((Math.sin(frame / (14 + i * 3) + i) + 1) / 2) * 0.2;
        const size = 180 + i * 110;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size,
              left: `${10 + i * 28}%`,
              top: `${18 + i * 20}%`,
              transform: `translateY(${drift}px)`,
              background:
                i % 2 === 0
                  ? `radial-gradient(circle, rgba(99,102,241,${twinkle}) 0%, rgba(99,102,241,0) 70%)`
                  : `radial-gradient(circle, rgba(34,211,238,${twinkle}) 0%, rgba(34,211,238,0) 70%)`,
              filter: "blur(2px)",
              pointerEvents: "none",
            }}
          />
        );
      })}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          gap: 30,
          opacity,
          transform: `translateY(${titleYIn + titleYOut}px)`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.3,
            fontWeight: 600,
            color: textSecondary,
            letterSpacing: 0,
          }}
        >
          OPENAI SERIES
        </div>

        <div
          style={{
            fontSize: 72,
            lineHeight: 1.1,
            fontWeight: 700,
            color: textPrimary,
            maxWidth: 1400,
            textWrap: "balance",
          }}
        >
          {title}
        </div>

        <div
          style={{
            width: 260,
            height: 6,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${accentColor} 0%, ${themeColor} 100%)`,
            boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            opacity,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
