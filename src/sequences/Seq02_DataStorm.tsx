import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";
import { seededRandom, bassAmplitude, screenShake } from "../utils/glitch";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 2: THE DATA STORM — Audio-Reactive Chaos
   1350 frames (45s @ 30fps)

   Beat 1 (0–300):     Code rain spawn — chars radial dispersion
   Beat 2 (300–750):   Deep zoom tunnel + Glassmorphism bass-reactive
   Beat 3 (750–1100):  Vortex convergence
   Beat 4 (1100–1350): Implosion flash → silence → transition
   ═══════════════════════════════════════════════════════════ */

const CODE_CHARS = "0123456789abcdef{}();=>const let var async await function return import export class new this null undefined true false".split("");
const PARTICLE_COUNT = 150;
const COLORS = ["#6366f1", "#818cf8", "#a78bfa", "#c084fc", "#e879f9", "#22c55e", "#f472b6"];

interface CodeParticle {
  char: string;
  angle: number;
  speed: number;
  orbitRadius: number;
  size: number;
  color: string;
  delay: number; // appearance delay in frames
}

function generateParticles(): CodeParticle[] {
  const particles: CodeParticle[] = [];
  let seed = 77;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      char: CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)],
      angle: rand() * Math.PI * 2,
      speed: 0.3 + rand() * 1.5,
      orbitRadius: 100 + rand() * 700,
      size: 12 + rand() * 16,
      color: COLORS[i % COLORS.length],
      delay: rand() * 200,
    });
  }
  return particles;
}

/* ─── Glass panel configs ─── */
const PANELS = [
  { label: "NEURAL_NET.sys", z: -800, x: -300, y: -100, w: 350, h: 220 },
  { label: "AGENT_CORE.exe", z: -1200, x: 280, y: 50, w: 320, h: 200 },
  { label: "DATA_STREAM.io", z: -500, x: -50, y: 180, w: 380, h: 240 },
  { label: "MEMORY_POOL.db", z: -1600, x: 150, y: -200, w: 300, h: 180 },
];

export const Seq02_DataStorm: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => generateParticles(), []);
  const timeSec = frame / 30;

  const masterOpacity = interpolate(
    frame, [0, 10, 1310, 1350], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const centerX = 960;
  const centerY = 540;

  /* ═══ Beat 1: Code chars radial dispersion (0–300) ═══ */
  const disperseProgress = interpolate(frame, [0, 250], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Beat 2: Deep zoom (300–750) ═══ */
  const zoomProgress = interpolate(frame, [300, 750], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cameraZ = interpolate(zoomProgress, [0, 1], [0, 600]);

  /* ═══ Beat 3: Vortex (750–1100) ═══ */
  const vortexProgress = interpolate(frame, [750, 1100], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Beat 4: Implosion (1100–1350) ═══ */
  const implodeProgress = interpolate(frame, [1100, 1250], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const implodeEased = 1 - Math.pow(1 - implodeProgress, 3);

  /* ═══ Bass simulation ═══ */
  const bass = bassAmplitude(frame);

  /* ═══ Silence frames before flash (Contrast Timing — EXTENDED) ═══ */
  const silenceOpacity =
    frame >= 1248 && frame <= 1253 ? 0 : 1;

  /* ═══ Flash ═══ */
  const flashOpacity = interpolate(frame, [1252, 1260, 1290, 1350], [0, 0.95, 0.3, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Screen shake on bass hits — CRANKED ×3 ═══ */
  let shakeX = 0;
  let shakeY = 0;
  // Shake every ~13 frames (simulated bass hits)
  for (let hitFrame = 0; hitFrame < 1100; hitFrame += 13) {
    if (Math.abs(frame - hitFrame) < 12) {
      const s = screenShake(frame, hitFrame, 6 + bass * 12, 10);
      shakeX += s.x;
      shakeY += s.y;
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06060c",
        opacity: masterOpacity * silenceOpacity,
        overflow: "hidden",
      }}
    >
      {/* ═══ Content with shake + perspective ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          perspective: 800,
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* ═══ Code particles ═══ */}
        {particles.map((p, idx) => {
          const appearFrame = p.delay;
          const pAppear = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });

          if (pAppear <= 0) return null;

          // Phase 1: Radial dispersion from center
          const disperseRadius = p.orbitRadius * disperseProgress;
          const angle = p.angle + timeSec * p.speed;

          // Phase 3: Vortex — spiral inward
          const vortexRadius = disperseRadius * (1 - vortexProgress * 0.85);
          const vortexAngle = angle + vortexProgress * Math.PI * 6;

          // Phase 4: Implode to center
          const currentRadius = vortexRadius * (1 - implodeEased * 0.95);
          const currentAngle = vortexAngle + implodeEased * Math.PI * 4;

          const x = centerX + Math.cos(currentAngle) * currentRadius;
          const y = centerY + Math.sin(currentAngle) * currentRadius;

          // Size shrinks during implosion
          const currentSize = p.size * pAppear * (1 - implodeEased * 0.7);

          // Z-depth variation for tunnel feel
          const pz = Math.sin(angle * 2 + idx) * 200;

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translateZ(${pz + cameraZ}px) scale(${currentSize / 14})`,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 14,
                color: p.color,
                opacity: pAppear * (1 - implodeEased * 0.5) * (0.4 + 0.6 * Math.abs(Math.sin(angle))),
                textShadow: `0 0 ${8 + bass * 16}px ${p.color}aa`,
                pointerEvents: "none",
              }}
            >
              {/* Change char more aggressively for chaos */}
              {frame % 5 < 2
                ? CODE_CHARS[Math.floor(seededRandom(frame * 10 + idx) * CODE_CHARS.length)]
                : p.char}
            </div>
          );
        })}

        {/* ═══ Glassmorphism panels — deep zoom ═══ */}
        {frame > 300 &&
          PANELS.map((panel, i) => {
            const panelAppear = interpolate(frame, [320 + i * 60, 380 + i * 60], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const panelZ = panel.z + cameraZ + (vortexProgress > 0 ? vortexProgress * 500 : 0);
            const panelOpacity = panelAppear * (1 - implodeEased);

            // Bass-reactive border — CRANKED
            const borderWidth = 1.5 + bass * 6;
            const blurIntensity = 12 + bass * 12;

            if (panelOpacity <= 0) return null;

            return (
              <div
                key={panel.label}
                style={{
                  position: "absolute",
                  left: centerX + panel.x - panel.w / 2,
                  top: centerY + panel.y - panel.h / 2,
                  width: panel.w,
                  height: panel.h,
                  transform: `translateZ(${panelZ}px) rotateY(${Math.sin(timeSec + i) * 12}deg)`,
                  opacity: panelOpacity,
                  // Glassmorphism — NEON BLOOM CRANKED
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: `blur(${blurIntensity}px)`,
                  WebkitBackdropFilter: `blur(${blurIntensity}px)`,
                  border: `${borderWidth}px solid rgba(139,92,246,${0.2 + bass * 0.4})`,
                  borderRadius: 12,
                  boxShadow: `
                    0 0 ${15 + bass * 30}px rgba(139,92,246,${0.15 + bass * 0.25}),
                    0 0 ${40 + bass * 60}px rgba(139,92,246,${0.05 + bass * 0.15}),
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    inset 0 0 ${10 + bass * 20}px rgba(139,92,246,${0.03 + bass * 0.08})
                  `,
                  padding: 16,
                }}
              >
                {/* Panel header */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: `rgba(139,92,246,${0.6 + bass * 0.4})`,
                    letterSpacing: "0.15em",
                    marginBottom: 8,
                    textShadow: `0 0 ${6 + bass * 10}px rgba(139,92,246,${0.3 + bass * 0.3})`,
                  }}
                >
                  {panel.label}
                </div>
                {/* Fake data lines */}
                {[0, 1, 2, 3].map((line) => {
                  const lineOpacity = interpolate(
                    frame,
                    [380 + i * 60 + line * 15, 400 + i * 60 + line * 15],
                    [0, 0.4],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  return (
                    <div
                      key={line}
                      style={{
                        height: 6,
                        marginBottom: 6,
                        borderRadius: 3,
                        background: `linear-gradient(90deg, rgba(99,102,241,${lineOpacity}) ${20 + seededRandom(i * 10 + line) * 60}%, transparent)`,
                        width: `${40 + seededRandom(i * 5 + line) * 50}%`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}

        {/* ═══ Spiral arms during vortex ═══ */}
        {vortexProgress > 0.1 && implodeProgress < 0.8 && (
          <svg
            width={1920}
            height={1080}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {[0, 1, 2].map((arm) => {
              const points: string[] = [];
              for (let t = 0; t < 80; t++) {
                const a =
                  (t / 80) * Math.PI * 8 +
                  (arm * Math.PI * 2) / 3 +
                  timeSec * 1.5;
                const r =
                  (1 - t / 80) * 400 * (1 - implodeEased * 0.9);
                points.push(
                  `${centerX + Math.cos(a) * r},${centerY + Math.sin(a) * r}`
                );
              }
              return (
                <polyline
                  key={arm}
                  points={points.join(" ")}
                  fill="none"
                  stroke={`rgba(139,92,246,${0.06 * vortexProgress * (1 - implodeEased)})`}
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
        )}

        {/* ═══ Singularity core glow ═══ */}
        {vortexProgress > 0.3 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${0.3 + vortexProgress * 0.7 + implodeEased * 2})`,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(139,92,246,${0.3 + implodeEased * 0.7}) 0%, transparent 70%)`,
              boxShadow: `0 0 ${40 + vortexProgress * 60 + implodeEased * 100}px ${20 + implodeEased * 50}px rgba(139,92,246,${0.3 + implodeEased * 0.5})`,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* ═══ Flash ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#fff",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Scanlines ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Vignette ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 25%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
