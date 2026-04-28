import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const safePadding = {left: 120, right: 120, top: 100, bottom: 100};
  const textPrimary = "#F9FAFB";
  const textSecondary = "#CBD5F5";
  const themeColor = "#6366F1";
  const accentColor = "#22D3EE";

  const data = [
    {year: "2022", revenue: 0.03, label: "$30M"},
    {year: "2023", revenue: 1.6, label: "$1.6B"},
    {year: "2024", revenue: 3.7, label: "$3.7B"},
    {year: "2025", revenue: 10.0, label: "$10.0B"},
    {year: "2026E", revenue: 12.7, label: "$12.7B"},
  ];

  const maxRevenue = 14;
  const chartHeight = 520;
  const barWidth = 160;
  const gap = 105;

  const introOpacity = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introY = interpolate(frame, [0, 24], [28, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outroOpacity = interpolate(frame, [272, 300], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contentOpacity = introOpacity * outroOpacity;

  const pulse = (speed: number, base: number) =>
    base + (Math.sin((frame / 30) * speed) + 1) * 0.5 * 0.35;

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
        justifyContent: "center",
      }}
    >
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 15% 20%, rgba(99,102,241,0.20), transparent 40%), radial-gradient(circle at 85% 76%, rgba(34,211,238,0.16), transparent 44%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 30,
          width: "100%",
          height: "100%",
          zIndex: 2,
          opacity: contentOpacity,
          transform: `translateY(${introY}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 70,
              lineHeight: 1.1,
              fontWeight: 700,
              color: textPrimary,
            }}
          >
            OpenAI Revenue Growth
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.5,
              fontWeight: 400,
              color: textSecondary,
            }}
          >
            2022 to 2026 estimate
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap,
            height: chartHeight,
            paddingTop: 10,
            position: "relative",
          }}
        >
          {[0.25, 0.5, 0.75, 1].map((g, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${g * 100}%`,
                height: 1,
                backgroundColor: "rgba(203,213,245,0.14)",
              }}
            />
          ))}

          {data.map((item, i) => {
            const delay = 36 + i * 24;
            const progress = interpolate(frame, [delay, delay + 34], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const barHeight = progress * (item.revenue / maxRevenue) * chartHeight;
            const isKeyMoment = item.year === "2023" || item.year === "2025";
            const glowOpacity = isKeyMoment ? pulse(4, 0.35) * progress : 0.25 * progress;

            return (
              <div
                key={item.year}
                style={{
                  width: barWidth,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 16,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    lineHeight: 1.3,
                    fontWeight: 600,
                    color: textPrimary,
                    opacity: interpolate(frame, [delay + 14, delay + 34], [0, 1], {
                      easing: Easing.out(Easing.cubic),
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    width: "100%",
                    height: chartHeight,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: barHeight,
                      minHeight: progress > 0 ? 6 : 0,
                      borderRadius: 14,
                      background: `linear-gradient(180deg, ${accentColor} 0%, ${themeColor} 100%)`,
                      boxShadow: `0 0 28px rgba(99,102,241,${glowOpacity})`,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.3,
                    fontWeight: 600,
                    color: textSecondary,
                  }}
                >
                  {item.year}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 24,
            lineHeight: 1.5,
            fontWeight: 600,
            color: textSecondary,
            opacity: 0.9,
          }}
        >
          Revenue figures shown in USD, with 2026E as estimate.
        </div>
      </div>
    </AbsoluteFill>
  );
};
