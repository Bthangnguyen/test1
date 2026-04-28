import React from "react";
import {
  useCurrentFrame,
  AbsoluteFill,
  interpolate,
} from "remotion";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 3: THE SYSTEM — Glassmorphism UI
   Frames: 0–1350 (45 giây @ 30fps)
   ═══════════════════════════════════════════════════════════ */

const CODE_TEXT = `const agent = new AgenticAI({
  model: "gpt-5-turbo",
  tools: [search, code, reason],
  memory: "persistent",
  autonomy: 0.95
});

await agent.execute({
  task: "Optimize everything",
  constraints: ["cost < $0.01"],
  feedback: "self-improving"
});`;

const PANEL_CONFIG = [
  { label: "NEURAL CORE", rotY: -25, rotX: 10, z: -150, xOff: -380, delay: 0 },
  { label: "AGENT MESH", rotY: 20, rotX: -8, z: -100, xOff: 380, delay: 0.4 },
  { label: "MAIN TERMINAL", rotY: 0, rotX: 3, z: 50, xOff: 0, delay: 0.8 },
];

/* ─── Glassmorphism Panel sub-component ─── */
const GlassPanel: React.FC<{
  label: string;
  progress: number;
  floatPhase: number;
  rotY: number;
  rotX: number;
  z: number;
  xOff: number;
  children?: React.ReactNode;
}> = ({ label, progress, floatPhase, rotY, rotX, z, xOff, children }) => {
  const floatY = Math.sin(floatPhase) * 12;
  const floatRotX = Math.sin(floatPhase * 0.7) * 2;
  const floatRotY = Math.cos(floatPhase * 0.5) * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 420,
        height: 300,
        transform: `
          translate(-50%, -50%)
          translateX(${xOff * progress}px)
          translateY(${floatY}px)
          translateZ(${z * progress}px)
          rotateY(${(rotY + floatRotY) * progress}deg)
          rotateX(${(rotX + floatRotX) * progress}deg)
          scale(${interpolate(progress, [0, 1], [0.5, 1])})
        `,
        opacity: progress,
        // Glassmorphism CSS
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          backgroundColor: "#22c55e",
          boxShadow: "0 0 8px #22c55e88",
        }} />
        {label}
      </div>

      {/* Panel content */}
      {children}

      {/* Decorative corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 40, height: 40,
        borderRight: "2px solid rgba(99,102,241,0.3)",
        borderTop: "2px solid rgba(99,102,241,0.3)",
        borderRadius: "0 16px 0 0",
      }} />
    </div>
  );
};

export const Seq03_GlassUI: React.FC = () => {
  const frame = useCurrentFrame();

  /* ─── Master fade ─── */
  const masterOpacity = interpolate(
    frame, [0, 20, 1310, 1350], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* ═══ Beat 1: Camera zoom in (0–300) ═══ */
  const zoomProgress = interpolate(frame, [0, 240], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const zoomScale = interpolate(zoomProgress, [0, 1], [0.3, 1]);
  const zoomBlur = interpolate(zoomProgress, [0, 0.5, 1], [8, 2, 0]);

  /* ═══ Beat 2: Panels appear (300–750) ═══ */
  const panelElements = PANEL_CONFIG.map((panel, i) => {
    const panelStart = 300 + panel.delay * 90;
    const panelProgress = interpolate(frame, [panelStart, panelStart + 90], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const floatPhase = (frame / 30) * 1.2 + i * 2.1;

    const isMainPanel = i === 2;

    return (
      <GlassPanel
        key={panel.label}
        label={panel.label}
        progress={panelProgress}
        floatPhase={floatPhase}
        rotY={panel.rotY}
        rotX={panel.rotX}
        z={panel.z}
        xOff={panel.xOff}
      >
        {isMainPanel ? (
          /* ═══ Beat 3: Code typing on main panel ═══ */
          <CodeTyping frame={frame} startFrame={600} />
        ) : i === 0 ? (
          /* Neural metrics on panel 1 */
          <MetricsDisplay frame={frame} startFrame={450} />
        ) : (
          /* Agent status on panel 2 */
          <AgentStatus frame={frame} startFrame={500} />
        )}
      </GlassPanel>
    );
  });

  /* ═══ Beat 4: Panels shatter out (1100–1350) ═══ */
  const shatterProgress = interpolate(frame, [1100, 1300], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ─── Background gradient blob ─── */
  const blobRotation = (frame / 30) * 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#08080f",
        opacity: masterOpacity,
        overflow: "hidden",
        perspective: 1200,
      }}
    >
      {/* ═══ Glass shard entrance effect (0–250) ═══ */}
      {frame < 250 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 40 }).map((_, i) => {
            const shardProgress = interpolate(frame, [0, 200], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const angle = (i / 40) * Math.PI * 2;
            const radius = 600 * (1 - shardProgress);
            const sx = 960 + Math.cos(angle + i * 0.3) * radius;
            const sy = 540 + Math.sin(angle + i * 0.3) * radius;
            const shardOpacity = interpolate(frame, [0, 30, 180, 250], [0, 0.5, 0.3, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div key={`shard-${i}`} style={{
                position: "absolute",
                left: sx, top: sy,
                width: 8 + (i % 5) * 4,
                height: 3 + (i % 3) * 2,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 1,
                transform: `rotate(${angle * 57 + i * 15}deg)`,
                opacity: shardOpacity,
                boxShadow: "0 0 6px rgba(167,139,250,0.3)",
              }} />
            );
          })}
        </div>
      )}

      {/* ═══ Typing text on scene ═══ */}
      {frame > 400 && frame < 1200 && (() => {
        const typingText = "The system that builds itself";
        const typingStart = 420;
        const visibleChars = Math.floor(
          interpolate(frame, [typingStart, typingStart + 90], [0, typingText.length], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          })
        );
        const textOpacity = interpolate(frame, [400, 420, 1100, 1200], [0, 1, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div style={{
            position: "absolute",
            left: "50%", top: 50,
            transform: "translateX(-50%)",
            opacity: textOpacity,
            fontFamily: "'Inter', sans-serif",
            fontSize: 28, fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.12em",
            zIndex: 50,
          }}>
            {typingText.slice(0, visibleChars)}
            {visibleChars < typingText.length && visibleChars > 0 && (
              <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: "#a78bfa" }}>◌</span>
            )}
          </div>
        );
      })()}

      {/* ═══ Animated background blobs ═══ */}
      <div style={{
        position: "absolute",
        width: 600, height: 600,
        left: "20%", top: "30%",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        transform: `rotate(${blobRotation}deg) translateX(50px)`,
      }} />
      <div style={{
        position: "absolute",
        width: 500, height: 500,
        right: "15%", bottom: "20%",
        background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        transform: `rotate(${-blobRotation * 0.7}deg) translateY(30px)`,
      }} />

      {/* ═══ 3D Panel container ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoomScale})`,
          filter: `blur(${zoomBlur}px)`,
          transformOrigin: "center center",
          // Shatter: scale up & spread
          ...(shatterProgress > 0 && {
            transform: `scale(${zoomScale + shatterProgress * 0.8})`,
            opacity: 1 - shatterProgress,
          }),
        }}
      >
        {panelElements}
      </div>

      {/* ═══ Vignette ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};

/* ─── Sub-components ─── */

const CodeTyping: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const visibleLength = Math.floor(
    interpolate(frame, [startFrame, startFrame + 450], [0, CODE_TEXT.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })
  );
  const cursorBlink = Math.sin(frame * 0.25) > 0;

  return (
    <pre style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.6,
      color: "rgba(167,139,250,0.9)",
      margin: 0,
      whiteSpace: "pre-wrap",
    }}>
      {CODE_TEXT.slice(0, visibleLength)}
      <span style={{ opacity: cursorBlink ? 1 : 0, color: "#6366f1" }}>▌</span>
    </pre>
  );
};

const MetricsDisplay: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const metrics = [
    { label: "Accuracy", value: 97.3, unit: "%" },
    { label: "Latency", value: 12, unit: "ms" },
    { label: "Throughput", value: 1.2, unit: "M/s" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {metrics.map((m, i) => {
        const progress = interpolate(frame, [startFrame + i * 30, startFrame + i * 30 + 45], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div key={m.label} style={{ opacity: progress }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, color: "#a78bfa" }}>
              {(m.value * progress).toFixed(1)}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>{m.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AgentStatus: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const agents = ["Researcher", "Coder", "Reviewer", "Deployer"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {agents.map((name, i) => {
        const progress = interpolate(frame, [startFrame + i * 25, startFrame + i * 25 + 30], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div key={name} style={{
            display: "flex", alignItems: "center", gap: 10, opacity: progress,
            fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: progress > 0.5 ? "#22c55e" : "#ef4444",
              boxShadow: `0 0 6px ${progress > 0.5 ? "#22c55e" : "#ef4444"}88`,
            }} />
            {name}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {progress > 0.5 ? "ACTIVE" : "INIT..."}
            </span>
          </div>
        );
      })}
    </div>
  );
};
