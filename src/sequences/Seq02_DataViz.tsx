import React, { useMemo } from "react";
import {
  useCurrentFrame,
  AbsoluteFill,
  interpolate,
} from "remotion";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 2: THE EXPLOSION — Data Visualization
   REWRITE: Aggressive, destructive, explosive
   Frames: 0–1200 (40s @ 30fps)
   ═══════════════════════════════════════════════════════════ */

const BAR_DATA = [
  { label: "GPT-4", height: 35, color: "#6366f1", stat: "1.8T params" },
  { label: "Gemini", height: 50, color: "#818cf8", stat: "2.5T params" },
  { label: "Claude", height: 58, color: "#a78bfa", stat: "3.2T params" },
  { label: "GPT-5", height: 75, color: "#c084fc", stat: "10T params" },
  { label: "Agents", height: 60, color: "#e879f9", stat: "∞ tools" },
  { label: "Swarm", height: 88, color: "#f472b6", stat: "100x speed" },
  { label: "AGI", height: 100, color: "#ef4444", stat: "SINGULARITY" },
];

function generateGridLines(count: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
  for (let i = 0; i < count; i++) {
    const y = 100 + (i / count) * 800;
    lines.push({ x1: -100, y1: y, x2: 2020, y2: y, delay: i * 0.08 });
  }
  for (let i = 0; i < count; i++) {
    const x = 100 + (i / count) * 1700;
    lines.push({ x1: x, y1: -100, x2: x, y2: 1180, delay: i * 0.08 + 0.5 });
  }
  return lines;
}

export const Seq02_DataViz: React.FC = () => {
  const frame = useCurrentFrame();
  const gridLines = useMemo(() => generateGridLines(10), []);

  const masterOpacity = interpolate(
    frame, [0, 15, 1160, 1200], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ═══ Screen shake ═══ */
  const getShake = (triggerFrame: number, intensity: number) => {
    const diff = frame - triggerFrame;
    if (diff < 0 || diff > 8) return { x: 0, y: 0 };
    const decay = Math.exp(-diff * 0.5);
    return {
      x: Math.sin(diff * 12) * intensity * decay,
      y: Math.cos(diff * 15) * intensity * decay,
    };
  };

  // Accumulate shakes from each bar landing
  let totalShakeX = 0;
  let totalShakeY = 0;
  BAR_DATA.forEach((_, i) => {
    const landFrame = 200 + i * 55 + 18; // when each bar lands
    const shake = getShake(landFrame, 3 + i * 1.5); // AGI shakes hardest
    totalShakeX += shake.x;
    totalShakeY += shake.y;
  });

  // Big shake at crack moment
  const crackShake = getShake(850, 12);
  totalShakeX += crackShake.x;
  totalShakeY += crackShake.y;

  /* ═══ Grid reveal from center burst (0–200) ═══ */
  const gridProgress = interpolate(frame, [0, 180], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Bars LAUNCH (200–650) ═══ */
  const barElements = BAR_DATA.map((bar, i) => {
    const launchStart = 200 + i * 55;
    const launchDuration = 18; // FAST: 0.6s
    const launchProgress = interpolate(
      frame, [launchStart, launchStart + launchDuration], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Rocket launch curve: slow start, SLAM at top
    const eased = 1 - Math.pow(1 - launchProgress, 4); // power4.out
    const overshoot = launchProgress >= 1
      ? 1 + 0.08 * Math.sin((frame - launchStart - launchDuration) * 0.8)
          * Math.exp(-(frame - launchStart - launchDuration) * 0.3)
      : eased;

    const barWidth = 130;
    const gap = 25;
    const totalWidth = BAR_DATA.length * barWidth + (BAR_DATA.length - 1) * gap;
    const startX = (1920 - totalWidth) / 2;
    const x = startX + i * (barWidth + gap);
    const barHeight = (bar.height / 100) * 550;
    const currentHeight = barHeight * Math.min(overshoot, 1.08);

    // Motion trail (fading tail below bar)
    const trailOpacity = launchProgress > 0 && launchProgress < 1
      ? 0.6 * (1 - launchProgress) : 0;

    // Stat SLAM (falls from above)
    const statStart = launchStart + launchDuration + 15;
    const statProgress = interpolate(
      frame, [statStart, statStart + 12], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const statScale = interpolate(statProgress, [0, 0.6, 1], [3, 0.9, 1]);
    const statBlur = interpolate(statProgress, [0, 0.5, 1], [10, 2, 0]);
    const statY = interpolate(statProgress, [0, 1], [-60, 0]);

    // AGI special: red glow pulse
    const isAGI = i === BAR_DATA.length - 1;
    const agiPulse = isAGI && launchProgress >= 1
      ? 0.3 + 0.2 * Math.sin((frame - launchStart) * 0.15)
      : 0;

    return (
      <React.Fragment key={bar.label}>
        {/* Motion trail */}
        {trailOpacity > 0 && (
          <div style={{
            position: "absolute",
            left: x + 10, bottom: 220,
            width: barWidth - 20,
            height: currentHeight * 0.6,
            background: `linear-gradient(180deg, ${bar.color}00 0%, ${bar.color}88 100%)`,
            filter: "blur(8px)",
            opacity: trailOpacity,
          }} />
        )}

        {/* Bar */}
        <div style={{
          position: "absolute",
          left: x, bottom: 220,
          width: barWidth,
          height: Math.max(0, currentHeight),
          background: `linear-gradient(180deg, ${bar.color} 0%, ${bar.color}99 60%, ${bar.color}44 100%)`,
          borderRadius: "4px 4px 0 0",
          transformOrigin: "bottom center",
          boxShadow: `0 -4px 20px ${bar.color}66, inset 0 2px 0 rgba(255,255,255,0.15)`,
          ...(isAGI && launchProgress >= 1 && {
            boxShadow: `0 0 ${30 + agiPulse * 40}px ${bar.color}aa, 0 -4px 20px ${bar.color}66`,
          }),
        }} />

        {/* Stat label — SLAM from above */}
        {statProgress > 0 && (
          <div style={{
            position: "absolute",
            left: x + barWidth / 2,
            bottom: 220 + currentHeight + 15,
            transform: `translateX(-50%) translateY(${statY}px) scale(${statScale})`,
            filter: `blur(${statBlur}px)`,
            opacity: statProgress,
            fontFamily: "'Inter', sans-serif",
            fontSize: isAGI ? 26 : 20,
            fontWeight: 900,
            color: isAGI ? "#ef4444" : bar.color,
            textShadow: `0 0 15px ${bar.color}aa`,
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
          }}>
            {bar.stat}
          </div>
        )}

        {/* Shockwave ring when stat lands */}
        {statProgress > 0.5 && statProgress < 1 && (
          <div style={{
            position: "absolute",
            left: x + barWidth / 2,
            bottom: 220 + currentHeight + 10,
            width: 60, height: 60,
            borderRadius: "50%",
            border: `1px solid ${bar.color}44`,
            transform: `translate(-50%, 50%) scale(${1 + (statProgress - 0.5) * 4})`,
            opacity: 1 - (statProgress - 0.5) * 2,
          }} />
        )}

        {/* Bar label */}
        <div style={{
          position: "absolute",
          left: x + barWidth / 2,
          bottom: 190,
          transform: "translateX(-50%)",
          opacity: interpolate(launchProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.08em",
        }}>
          {bar.label}
        </div>
      </React.Fragment>
    );
  });

  /* ═══ Screen crack overlay (850–1200) ═══ */
  const crackProgress = interpolate(frame, [850, 870], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Danger color shift (850+) ═══ */
  const dangerTint = interpolate(frame, [850, 900], [0, 0.08], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Collapse to center (1000–1200) ═══ */
  const collapseScale = interpolate(frame, [1000, 1180], [1, 0.15], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const collapseBlur = interpolate(frame, [1050, 1180], [0, 15], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Flash at end ═══ */
  const flashOpacity = interpolate(frame, [1170, 1185, 1195, 1200], [0, 0.9, 0.4, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const pulsePhase = (frame / 30) * 0.8;

  return (
    <AbsoluteFill style={{
      backgroundColor: "#0a0a0f",
      opacity: masterOpacity,
      overflow: "hidden",
    }}>


      {/* ═══ Danger tint ═══ */}
      {dangerTint > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "#ef4444",
          opacity: dangerTint,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }} />
      )}

      {/* ═══ Content with shake ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${totalShakeX}px, ${totalShakeY}px) scale(${collapseScale})`,
        filter: `blur(${collapseBlur}px)`,
        transformOrigin: "center center",
      }}>
        {/* ═══ Background glow ═══ */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 40% at 50% 60%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }} />

        {/* ═══ SVG Grid ═══ */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {gridLines.map((line, i) => {
            const lineProgress = interpolate(
              frame, [line.delay * 30, line.delay * 30 + 45], [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const len = Math.sqrt((line.x2 - line.x1) ** 2 + (line.y2 - line.y1) ** 2);
            return (
              <line key={i}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="rgba(99,102,241,0.1)" strokeWidth={1}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - lineProgress * gridProgress)}
              />
            );
          })}

          {/* Pulse dots */}
          {gridLines.slice(0, 6).map((line, i) => {
            const t = ((pulsePhase + i * 0.3) % 2) / 2;
            return (
              <circle key={`p-${i}`}
                cx={line.x1 + (line.x2 - line.x1) * t}
                cy={line.y1 + (line.y2 - line.y1) * t}
                r={2.5} fill="#6366f1"
                opacity={frame > 40 ? 0.5 * Math.sin(t * Math.PI) : 0}
              />
            );
          })}
        </svg>

        {/* ═══ Section title ═══ */}
        {frame > 95 && (
          <div style={{
            position: "absolute", left: "50%", top: 50,
            transform: "translateX(-50%)",
            opacity: interpolate(frame, [95, 130, 950, 1000], [0, 0.7, 0.7, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            }),
            fontFamily: "'Inter', sans-serif",
            fontSize: 36, fontWeight: 200,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}>
            AI Model Parameters Growth
          </div>
        )}

        {/* ═══ Bars ═══ */}
        {barElements}

        {/* ═══ Baseline ═══ */}
        <div style={{
          position: "absolute", left: "8%", right: "8%",
          bottom: 218, height: 1,
          backgroundColor: "rgba(255,255,255,0.12)",
          opacity: interpolate(frame, [180, 210], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }),
        }} />
      </div>

      {/* ═══ Crack overlay ═══ */}
      {crackProgress > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          opacity: crackProgress * 0.6,
          pointerEvents: "none",
          background: `
            linear-gradient(${35 + crackProgress * 10}deg, transparent 48%, rgba(255,255,255,0.15) 49%, rgba(255,255,255,0.15) 50%, transparent 51%),
            linear-gradient(${-60 + crackProgress * 5}deg, transparent 47%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.1) 50%, transparent 51%),
            linear-gradient(${80 - crackProgress * 15}deg, transparent 49%, rgba(255,255,255,0.08) 50%, transparent 51%),
            linear-gradient(${-25}deg, transparent 46%, rgba(239,68,68,0.12) 48%, transparent 50%)
          `,
        }} />
      )}

      {/* ═══ Flash ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "#fff",
        opacity: flashOpacity,
        pointerEvents: "none",
      }} />

      {/* ═══ Typing subtitle: "What else can it do?" ═══ */}
      {frame > 700 && frame < 1050 && (() => {
        const typingText = "What else can it do?";
        const typingStart = 720;
        const visibleChars = Math.floor(
          interpolate(frame, [typingStart, typingStart + 80], [0, typingText.length], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          })
        );
        const textOpacity = interpolate(frame, [700, 720, 1000, 1050], [0, 1, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div style={{
            position: "absolute",
            left: "50%", bottom: 100,
            transform: "translateX(-50%)",
            opacity: textOpacity,
            fontFamily: "'Inter', sans-serif",
            fontSize: 30, fontWeight: 300,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.1em",
          }}>
            {typingText.slice(0, visibleChars)}
            {visibleChars < typingText.length && visibleChars > 0 && (
              <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: "#a855f7" }}>◌</span>
            )}
          </div>
        );
      })()}

      {/* ═══ Vignette ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
