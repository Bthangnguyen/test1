import React, { useMemo } from "react";
import {
  useCurrentFrame,
  AbsoluteFill,
  interpolate,
} from "remotion";

/* ═══════════════════════════════════════════════════════════
   SEQUENCE 4: BLACK HOLE VORTEX → "THE FUTURE" EXPLOSION
   Frames: 0–1350 (45s @ 30fps)
   
   Phase 1 (0–300):    Particles appear scattered
   Phase 2 (300–900):  Spiral into black hole vortex
   Phase 3 (900–1050): All sucked into singularity
   Phase 4 (1050–1200): EXPLODE → "THE FUTURE" text
   Phase 5 (1200–1350): Hold text → fade to Seq05
   ═══════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 80;
const COLORS = ["#6366f1", "#818cf8", "#a78bfa", "#c084fc", "#e879f9", "#f472b6", "#ec4899"];

interface Particle {
  startX: number;
  startY: number;
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
  size: number;
  color: string;
}

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  let seed = 42;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      startX: rand() * 1920,
      startY: rand() * 1080,
      orbitRadius: 200 + rand() * 500,
      orbitSpeed: 0.4 + rand() * 1.2,
      phase: rand() * Math.PI * 2,
      size: 6 + rand() * 14,
      color: COLORS[i % COLORS.length],
    });
  }
  return particles;
}

export const Seq04_ChaosOrder: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => generateParticles(), []);
  const timeSec = frame / 30;

  const masterOpacity = interpolate(
    frame, [0, 20, 1310, 1350], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const centerX = 960;
  const centerY = 540;

  /* ═══ Phase 1: Appear scattered (0–300) ═══ */
  const appearProgress = interpolate(frame, [0, 250], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Phase 2: Spiral vortex (300–900) ═══ */
  const vortexProgress = interpolate(frame, [300, 900], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Phase 3: Singularity collapse (900–1050) ═══ */
  const collapseProgress = interpolate(frame, [900, 1050], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const collapseEased = 1 - Math.pow(1 - collapseProgress, 3); // power3.in feel

  /* ═══ Phase 4: Explosion (1050–1200) ═══ */
  const explosionTrigger = frame >= 1050;
  const explosionProgress = interpolate(frame, [1050, 1100], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ "THE FUTURE" text ═══ */
  const textProgress = interpolate(frame, [1060, 1100], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const textScale = textProgress < 1
    ? 0.3 + textProgress * 0.7 * (1.15 - 0.15 * textProgress)
    : 1;
  const textOpacity = interpolate(frame, [1060, 1080, 1280, 1350], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Explosion flash ═══ */
  const flashOpacity = interpolate(frame, [1050, 1060, 1080, 1120], [0, 0.95, 0.4, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Singularity glow (grows as particles converge) ═══ */
  const singularityGlow = interpolate(frame, [600, 1050], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /* ═══ Explosion ring ═══ */
  const ringProgress = interpolate(frame, [1055, 1120], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: "#06060c",
      opacity: masterOpacity,
      overflow: "hidden",
    }}>
      {/* ═══ Background: dark void ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 30% 30% at 50% 50%, rgba(99,102,241,${0.03 + singularityGlow * 0.08}) 0%, transparent 70%)`,
      }} />

      {/* ═══ Particles ═══ */}
      {!explosionTrigger && particles.map((p, idx) => {
        // Phase 1: Appear at random positions
        const particleAppearDelay = (idx / PARTICLE_COUNT) * 200;
        const pAppear = interpolate(frame, [particleAppearDelay, particleAppearDelay + 30], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        // Phase 2: Spiral vortex — particles orbit the center, radius shrinks over time
        const currentOrbitRadius = p.orbitRadius * (1 - vortexProgress * 0.7) * (1 - collapseEased * 0.95);
        const angle = timeSec * p.orbitSpeed + p.phase + vortexProgress * Math.PI * 4;

        // Position: blend from start position to orbit position
        const orbitX = centerX + Math.cos(angle) * currentOrbitRadius;
        const orbitY = centerY + Math.sin(angle) * currentOrbitRadius;

        const x = interpolate(vortexProgress, [0, 0.3], [p.startX, orbitX], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const y = interpolate(vortexProgress, [0, 0.3], [p.startY, orbitY], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        // During vortex, use orbit position directly
        const finalX = vortexProgress > 0.3 ? orbitX : x;
        const finalY = vortexProgress > 0.3 ? orbitY : y;

        // Size shrinks as it approaches singularity
        const pSize = p.size * pAppear * (1 - collapseEased * 0.8);

        // Trail effect: slight opacity variation based on speed
        const trailOpacity = 0.6 + 0.4 * Math.sin(angle * 2);

        return (
          <div key={idx} style={{
            position: "absolute",
            left: finalX - pSize / 2,
            top: finalY - pSize / 2,
            width: pSize,
            height: pSize,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: pAppear * trailOpacity * (1 - collapseEased * 0.5),
            boxShadow: `0 0 ${6 + vortexProgress * 10}px ${p.color}88`,
          }} />
        );
      })}

      {/* ═══ Singularity core glow ═══ */}
      {singularityGlow > 0 && !explosionTrigger && (
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${0.3 + singularityGlow * 0.7})`,
          width: 60, height: 60,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(139,92,246,${0.4 + singularityGlow * 0.5}) 0%, transparent 70%)`,
          boxShadow: `0 0 ${40 + singularityGlow * 80}px ${20 + singularityGlow * 40}px rgba(139,92,246,${singularityGlow * 0.5})`,
        }} />
      )}

      {/* ═══ Vortex spiral lines (visual guide) ═══ */}
      {vortexProgress > 0.1 && !explosionTrigger && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[0, 1, 2].map(arm => {
            const points: string[] = [];
            for (let t = 0; t < 60; t++) {
              const a = (t / 60) * Math.PI * 6 + (arm * Math.PI * 2 / 3) + timeSec * 0.5;
              const r = (1 - t / 60) * 350 * (1 - collapseEased * 0.9);
              points.push(`${centerX + Math.cos(a) * r},${centerY + Math.sin(a) * r}`);
            }
            return (
              <polyline key={arm}
                points={points.join(" ")}
                fill="none"
                stroke={`rgba(139,92,246,${0.08 * vortexProgress})`}
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
      )}

      {/* ═══ Explosion ring ═══ */}
      {ringProgress > 0 && ringProgress < 1 && (
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${ringProgress * 20})`,
          width: 80, height: 80,
          borderRadius: "50%",
          border: "3px solid rgba(139,92,246,0.7)",
          boxShadow: "0 0 40px rgba(139,92,246,0.4)",
          opacity: 1 - ringProgress,
        }} />
      )}

      {/* ═══ "THE FUTURE" text ═══ */}
      {textOpacity > 0 && (
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${textScale})`,
          opacity: textOpacity,
          fontFamily: "'Anton', 'Impact', sans-serif",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "0.08em",
          background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #a855f7, #6366f1)",
          backgroundSize: "200% 100%",
          backgroundPosition: `${interpolate(frame, [1060, 1350], [100, -100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}% 0`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 40px rgba(99,102,241,${textProgress * 0.5}))`,
          textAlign: "center",
        }}>
          THE FUTURE
        </div>
      )}

      {/* ═══ Flash ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "#fff",
        opacity: flashOpacity,
        pointerEvents: "none",
      }} />

      {/* ═══ Vignette ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
