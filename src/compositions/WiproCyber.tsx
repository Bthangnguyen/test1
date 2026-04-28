import React, { useRef, useLayoutEffect, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
gsap.registerPlugin(useGSAP, CustomEase, DrawSVGPlugin, MotionPathPlugin, MorphSVGPlugin, SplitText, ScrambleTextPlugin);

/* ══════ CONSTANTS ══════ */
const C = {
  cyan: "#00E5FF", cyanDark: "#0091EA",
  magenta: "#FF2D55", magentaDark: "#C0214A",
  amber: "#FFB300", amberDark: "#FF8F00",
  purple: "#7C4DFF", purpleDark: "#651FFF",
  teal: "#00BFA5", white: "#FFFFFF",
};
const CX = 960, CY = 540;

/* ══════ UTILITIES ══════ */
const topoPath = (r: number, wobble: number) => {
  const pts: string[] = [];
  for (let a = 0; a <= 360; a += 5) {
    const rad = (a * Math.PI) / 180;
    const w = Math.sin(rad * 3 + wobble) * 15 + Math.cos(rad * 5 + wobble * 0.7) * 10;
    pts.push(`${a === 0 ? "M" : "L"}${(CX + (r + w) * Math.cos(rad)).toFixed(1)},${(CY + (r + w) * Math.sin(rad)).toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
};

const circularPath = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;

/* ══════ CUBE GEOMETRY ══════ */
const CUBE_SIZE = 65;
const cubeVerts = (() => {
  const v: { x: number; y: number; z: number }[] = [];
  for (let ix = -1; ix <= 1; ix++)
    for (let iy = -1; iy <= 1; iy++)
      for (let iz = -1; iz <= 1; iz++)
        v.push({ x: ix * CUBE_SIZE, y: iy * CUBE_SIZE, z: iz * CUBE_SIZE });
  return v;
})();

const cubeEdges = (() => {
  const edges: [number, number][] = [];
  for (let i = 0; i < cubeVerts.length; i++)
    for (let j = i + 1; j < cubeVerts.length; j++) {
      const a = cubeVerts[i], b = cubeVerts[j];
      const d = [Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z)];
      if (d.filter(v => v > 0).length === 1 && d.every(v => v <= CUBE_SIZE)) edges.push([i, j]);
    }
  return edges;
})();

const project3d = (v: { x: number; y: number; z: number }, ry: number, rx: number, explodeY = 0) => {
  let { x, y, z } = v;
  // Add explode offset based on layer
  if (y < 0) y -= explodeY;
  else if (y > 0) y += explodeY;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const x2 = x * cy + z * sy, z2 = -x * sy + z * cy;
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const y2 = y * cx - z2 * sx, z3 = y * sx + z2 * cx;
  const s = 500 / (500 + z3);
  return { px: CX + x2 * s, py: CY + y2 * s, s };
};

/* ══════ ORBIT CONFIG ══════ */
const orbits = [
  { color: C.cyan, type: "hex" as const, r: 240, dur: 4, size: 26, dir: 1 },
  { color: C.magenta, type: "tri" as const, r: 190, dur: 3.2, size: 20, dir: -1 },
  { color: C.amber, type: "circle" as const, r: 300, dur: 5, size: 18, dir: 1 },
  { color: C.purple, type: "hex" as const, r: 150, dur: 2.8, size: 16, dir: -1 },
  { color: C.teal, type: "tri" as const, r: 350, dur: 6, size: 22, dir: 1 },
  { color: C.magenta, type: "circle" as const, r: 270, dur: 3.5, size: 20, dir: -1 },
];

/* ══════ SUB-COMPONENTS ══════ */
const GridBG = () => (
  <svg className="grid-bg" width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
    {Array.from({ length: 55 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 20} x2={1920} y2={i * 20} stroke={C.cyan} strokeWidth={0.5} />
    ))}
    {Array.from({ length: 97 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={1080} stroke={C.cyan} strokeWidth={0.5} />
    ))}
  </svg>
);

const ShapeSVG = ({ type, size, color }: { type: string; size: number; color: string }) => {
  if (type === "hex") {
    const pts = Array.from({ length: 6 }).map((_, i) => {
      const a = (i * 60 - 30) * Math.PI / 180;
      return `${size * Math.cos(a)},${size * Math.sin(a)}`;
    }).join(" ");
    return <svg width={size * 2 + 4} height={size * 2 + 4} viewBox={`${-size - 2} ${-size - 2} ${size * 2 + 4} ${size * 2 + 4}`}><polygon points={pts} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
  }
  if (type === "tri") {
    const pts = Array.from({ length: 3 }).map((_, i) => {
      const a = (i * 120 - 90) * Math.PI / 180;
      return `${size * Math.cos(a)},${size * Math.sin(a)}`;
    }).join(" ");
    return <svg width={size * 2 + 4} height={size * 2 + 4} viewBox={`${-size - 2} ${-size - 2} ${size * 2 + 4} ${size * 2 + 4}`}><polygon points={pts} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
  }
  return <svg width={size * 2 + 4} height={size * 2 + 4} viewBox={`${-size - 2} ${-size - 2} ${size * 2 + 4} ${size * 2 + 4}`}><circle cx={0} cy={0} r={size} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
};

/* ══════════════════════════════════════ */
/* ══════ MAIN COMPONENT ══════════════ */
/* ══════════════════════════════════════ */
export const WiproCyber: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const sec = frame / fps;

  // Easing functions matching GSAP (computed inline to avoid 1-frame lag)
  const easeP1InOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeP2Out = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeP2InOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  // Cube rotation — computed directly from time, matching GSAP timeline
  const cubeRotProgress = easeP1InOut(clamp01((sec - 9.0) / 3.0));
  const cubeRotY = cubeRotProgress * Math.PI * 2;
  const cubeRotX = cubeRotProgress * Math.PI * 0.6;
  // Explode: 0→80 at 10.2s (0.7s, power2.out), then 80→0 at 11.0s (0.5s, power2.inOut)
  const explodeInT = clamp01((sec - 10.2) / 0.7);
  const explodeOutT = clamp01((sec - 11.0) / 0.5);
  const cubeExplodeY = easeP2Out(explodeInT) * 80 * (1 - easeP2InOut(explodeOutT));

  // Module 8: Chromatic Aberration offset at phase transitions
  const chromaticOffset = (() => {
    const transitions = [3.9, 7.6, 11.6, 17.0];
    for (const t of transitions) {
      const d = Math.abs(sec - t);
      if (d < 0.25) return (1 - d / 0.25) * 4;
    }
    return 0;
  })();

  // Module 1: Particle positions (deterministic) — BOOSTED
  const particleCount = 80;
  const particleData = Array.from({ length: particleCount }).map((_, i) => {
    const seed = i * 137.508;
    const baseX = (seed * 7.31) % 1920;
    const baseY = (seed * 13.17) % 1080;
    const speed = 12 + (i % 7) * 6;
    const yPos = (baseY - sec * speed + 2200) % 1120 - 20;
    return { x: baseX, y: yPos, size: 2 + (i % 4), color: i % 5 === 0 ? C.magenta : i % 7 === 0 ? C.amber : C.cyan, op: 0.2 + Math.sin(sec * 2 + seed) * 0.25 };
  });

  // Module 7: Inner Cube (smaller, rotates opposite)
  const INNER_SIZE = 35;
  const innerVerts = (() => {
    const v: { x: number; y: number; z: number }[] = [];
    for (let ix = -1; ix <= 1; ix++)
      for (let iy = -1; iy <= 1; iy++)
        for (let iz = -1; iz <= 1; iz++)
          v.push({ x: ix * INNER_SIZE, y: iy * INNER_SIZE, z: iz * INNER_SIZE });
    return v;
  })();
  const innerEdges = (() => {
    const edges: [number, number][] = [];
    for (let i = 0; i < innerVerts.length; i++)
      for (let j = i + 1; j < innerVerts.length; j++) {
        const a = innerVerts[i], b = innerVerts[j];
        const d = [Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z)];
        if (d.filter(v => v > 0).length === 1 && d.every(v => v <= INNER_SIZE)) edges.push([i, j]);
      }
    return edges;
  })();
  const innerRotY = -cubeRotY * 1.5;
  const innerRotX = -cubeRotX * 0.8;
  const innerExplode = -cubeExplodeY * 0.5;
  const innerProjected = innerVerts.map(v => project3d(v, innerRotY, innerRotX, innerExplode));

  // Module 5: Constellation lines between orbit shapes
  const constellationLines = (() => {
    if (sec < 12.3 || sec > 16.5) return [];
    const lines: { x1: number; y1: number; x2: number; y2: number; op: number }[] = [];
    const positions = orbits.map((o, i) => {
      const elapsed = sec - 12.3;
      const angle = (elapsed / o.dur) * Math.PI * 2 * o.dir;
      return { x: CX + o.r * Math.cos(angle), y: CY + o.r * Math.sin(angle) };
    });
    for (let i = 0; i < positions.length; i++)
      for (let j = i + 1; j < positions.length; j++) {
        const dist = Math.hypot(positions[i].x - positions[j].x, positions[i].y - positions[j].y);
        if (dist < 350) lines.push({ x1: positions[i].x, y1: positions[i].y, x2: positions[j].x, y2: positions[j].y, op: (1 - dist / 350) * 0.5 });
      }
    return lines;
  })();

  useGSAP(() => {
    const master = gsap.timeline({ paused: true });
    tlRef.current = master;

    /* ─── GRID PULSE ─── */
    master.to(".grid-bg", { opacity: 0.15, duration: 0.1, yoyo: true, repeat: 1 }, 1.5);
    master.to(".grid-bg", { opacity: 0.12, duration: 0.1, yoyo: true, repeat: 1 }, 4.4);
    master.to(".grid-bg", { opacity: 0.18, duration: 0.15, yoyo: true, repeat: 1 }, 9.8);
    master.to(".grid-bg", { opacity: 0.15, duration: 0.1, yoyo: true, repeat: 1 }, 17.3);

    /* ═══ PHASE 1: TOPO WAVE (0–4s) ═══ */
    master.set(".topo-ring", { drawSVG: "0% 0%", opacity: 1 }, 0);
    master.to(".topo-ring", {
      drawSVG: "0% 100%", duration: 2.2, ease: "expo.out", stagger: 0.08
    }, 0.2);
    for (let i = 0; i < 12; i++) {
      master.to(`#topo-ring-${i}`, {
        morphSVG: { shape: `#topo-target-${i}`, type: "rotational" },
        duration: 2.0, ease: "sine.inOut", yoyo: true, repeat: 1
      }, 1.5);
    }
    master.fromTo(".wipro-logo", { scale: 0.5, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)"
    }, 2.0);

    /* ═══ PHASE 2: IDENTITY FRAME (4–8s) ═══ */
    master.to(".topo-ring", { opacity: 0, duration: 0.3, stagger: { each: 0.02, from: "end" } }, 3.8);
    master.to(".wipro-logo", { scale: 0.3, opacity: 0, duration: 0.3 }, 3.8);
    master.set(".frame-line", { drawSVG: "50% 50%", opacity: 1 }, 4.2);
    master.to(".frame-line", {
      drawSVG: "0% 100%", duration: 0.7, ease: "power4.out", stagger: 0.08
    }, 4.4);
    master.fromTo(".frame-dot", { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.25, ease: "back.out(2.5)", stagger: 0.04
    }, 5.0);
    // Module 3: SplitText per-char reveal for identity text
    const splitIdentity = SplitText.create(".identity-text", { type: "chars" });
    master.set(".identity-text", { opacity: 1 }, 5.5);
    master.from(splitIdentity.chars, {
      opacity: 0, y: 30, scale: 0, rotationX: -90,
      duration: 0.35, ease: "back.out(1.5)",
      stagger: { each: 0.025, from: "start" }
    }, 5.5);
    // Module 4: Circuit traces
    master.set(".circuit-trace", { drawSVG: "0% 0%", opacity: 0.5 }, 5.2);
    master.to(".circuit-trace", {
      drawSVG: "0% 100%", duration: 1.0, ease: "power2.out", stagger: { each: 0.1, from: "random" }
    }, 5.3);
    master.fromTo(".circuit-node", { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.2, ease: "back.out(3)", stagger: 0.06
    }, 5.8);

    /* ═══ PHASE 3: CUBE (8–12s) ═══ */
    master.to(".frame-line", { drawSVG: "50% 50%", opacity: 0, duration: 0.4, stagger: 0.05 }, 7.5);
    master.to(".frame-dot", { scale: 3, opacity: 0, duration: 0.3, stagger: { each: 0.02, from: "random" } }, 7.6);
    master.to(".identity-text", { y: -20, opacity: 0, duration: 0.3 }, 7.5);
    master.to([".circuit-trace", ".circuit-node"], { opacity: 0, duration: 0.3 }, 7.5);
    master.fromTo(".cube-dot", { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.5, ease: "expo.out", stagger: { amount: 0.4, from: "random" }
    }, 8.2);
    master.set(".cube-edge", { drawSVG: "0% 0%", opacity: 0.6 }, 8.3);
    master.to(".cube-edge", {
      drawSVG: "0% 100%", duration: 0.6, ease: "expo.out", stagger: { amount: 0.4, from: "random" }
    }, 8.6);

    /* ═══ PHASE 4: ORBIT (12–17s) ═══ */
    master.to([".cube-dot", ".cube-edge"], { opacity: 0, scale: 0, duration: 0.4, stagger: { amount: 0.2, from: "center" } }, 11.6);
    master.fromTo(".orbit-center", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "expo.out" }, 12.0);
    master.fromTo(".orbit-shape-wrap", { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)", stagger: 0.07
    }, 12.2);
    orbits.forEach((o, i) => {
      master.to(`.orbit-shape-wrap-${i}`, {
        motionPath: { path: `#orbit-path-${i}`, align: `#orbit-path-${i}`, alignOrigin: [0.5, 0.5] },
        duration: o.dur, ease: "none", repeat: 3
      }, 12.3);
      master.to(`.orbit-shape-inner-${i}`, {
        rotation: 720 * o.dir, duration: o.dur * 3, ease: "none"
      }, 12.3);
    });
    master.fromTo(".orbit-ghost", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.02 }, 12.6);

    /* ═══ PHASE 5: BRAND REVEAL (17–20s) ═══ */
    master.to(".orbit-shape-wrap", { x: CX, y: CY, scale: 0, opacity: 0, duration: 0.5, ease: "power4.in", stagger: 0.03 }, 16.5);
    master.to(".orbit-ghost", { opacity: 0, duration: 0.2 }, 16.5);
    master.to(".orbit-center", { scale: 2.5, opacity: 0, duration: 0.4, ease: "power2.out" }, 16.8);
    master.set(".final-circle", { drawSVG: "0% 0%", opacity: 1 }, 17.2);
    master.to(".final-circle", { drawSVG: "0% 100%", duration: 0.6, ease: "power4.out" }, 17.2);
    // Module 3: ScrambleText for WIPRO
    master.to(".final-logo-text", {
      opacity: 1, duration: 0.1
    }, 17.5);
    master.to(".final-logo-text", {
      scrambleText: { text: "WIPRO", chars: "01!@#$%&XYZABC", revealDelay: 0.3, speed: 0.4 },
      duration: 1.2
    }, 17.5);
    master.fromTo(".final-glow", { drawSVG: "50% 50%", opacity: 0 }, {
      drawSVG: "0% 100%", opacity: 0.7, duration: 0.3, ease: "expo.out", stagger: 0.03
    }, 17.6);
    // Module 3: SplitText for CyberSecurity
    const splitFinal = SplitText.create(".final-text", { type: "chars" });
    master.set(".final-text", { opacity: 1 }, 18.2);
    master.from(splitFinal.chars, {
      opacity: 0, scale: 0, rotation: "random(-180,180)",
      duration: 0.3, ease: "back.out(2)",
      stagger: { each: 0.025, from: "center" }
    }, 18.2);
    master.to(".grid-bg", { opacity: 0.12, duration: 0.3 }, 17.8);

  }, { scope: containerRef });

  // Module 6: Debris particles at phase transitions (deterministic parabolic)
  const debrisData = (() => {
    const transitions = [3.9, 7.6, 11.6, 17.0];
    const result: { x: number; y: number; rot: number; op: number; color: string; size: number }[] = [];
    const colors = [C.cyan, C.magenta, C.amber, C.purple];
    transitions.forEach((t, ti) => {
      const elapsed = sec - t;
      if (elapsed < 0 || elapsed > 0.8) return;
      for (let i = 0; i < 15; i++) {
        const seed = ti * 100 + i;
        const angle = ((seed * 137.508) % 360) * Math.PI / 180;
        const vel = 250 + (seed % 200);
        const grav = 500;
        const x = CX + Math.cos(angle) * vel * elapsed;
        const y = CY + Math.sin(angle) * vel * elapsed + 0.5 * grav * elapsed * elapsed;
        const rot = elapsed * (200 + seed % 400);
        const op = Math.max(0, 1 - elapsed / 0.8);
        result.push({ x, y, rot, op, color: colors[i % 4], size: 4 + (i % 3) * 2 });
      }
    });
    return result;
  })();

  useIsomorphicLayoutEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  // Projected cube — driven by inline easing math (zero lag)
  const projected = cubeVerts.map(v => project3d(v, cubeRotY, cubeRotX, cubeExplodeY));

  // Topo ring colors (gradient from inner=cyan to outer=teal)
  const topoColors = Array.from({ length: 12 }).map((_, i) => {
    const t = i / 11;
    return `hsl(${180 + t * 20}, 100%, ${60 - t * 15}%)`;
  });

  // Frame coordinates with corner gaps
  const G = 20; // gap at corners
  const FL = 640, FR = 1280, FT = 330, FB = 750;
  const frameLines = [
    { x1: FL + G, y1: FT, x2: FR - G, y2: FT },   // top
    { x1: FL + G, y1: FB, x2: FR - G, y2: FB },   // bottom
    { x1: FL, y1: FT + G, x2: FL, y2: FB - G },   // left
    { x1: FR, y1: FT + G, x2: FR, y2: FB - G },   // right
  ];
  const frameDots = [
    [FL + G, FT], [FR - G, FT], [FL + G, FB], [FR - G, FB],
    [FL, FT + G], [FL, FB - G], [FR, FT + G], [FR, FB - G],
  ];

  // Glow line colors
  const glowColors = [C.cyan, C.magenta, C.amber, C.purple, C.teal, C.cyan, C.magenta, C.amber, C.purple, C.teal, C.cyan, C.magenta];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* ═══ FLOWING COLOR BACKGROUND ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <defs>
            <filter id="aurora-blur"><feGaussianBlur stdDeviation={120} /></filter>
          </defs>
          {[
            { color: C.cyan,    r: 400, cx: 480, cy: 300, sx: 1.2, sy: 0.8, px: 0, py: 0 },
            { color: C.magenta, r: 350, cx: 1440, cy: 750, sx: 0.9, sy: 1.1, px: 1, py: 0.5 },
            { color: C.purple,  r: 450, cx: 960, cy: 540, sx: 0.7, sy: 0.6, px: 2, py: 1 },
            { color: C.amber,   r: 300, cx: 300, cy: 800, sx: 1.0, sy: 0.9, px: 3, py: 1.5 },
            { color: C.teal,    r: 380, cx: 1600, cy: 250, sx: 0.8, sy: 1.3, px: 4, py: 2 },
            { color: C.magenta, r: 320, cx: 960, cy: 900, sx: 1.1, sy: 0.7, px: 5, py: 2.5 },
          ].map((blob, i) => (
            <circle key={`aurora-${i}`}
              cx={blob.cx + Math.sin(sec * blob.sx + blob.px) * 200}
              cy={blob.cy + Math.cos(sec * blob.sy + blob.py) * 150}
              r={blob.r}
              fill={blob.color}
              opacity={0.12 + Math.sin(sec * 0.5 + i) * 0.04}
              filter="url(#aurora-blur)"
            />
          ))}
        </svg>
        <GridBG />

        {/* ═══ PHASE 1: TOPO WAVES ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          <defs>
            {Array.from({ length: 12 }).map((_, i) => (
              <path key={`tt-${i}`} id={`topo-target-${i}`} d={topoPath(80 + i * 28, i * 0.5 + 1.8)} />
            ))}
          </defs>
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={`tr-${i}`} id={`topo-ring-${i}`} className="topo-ring"
              d={topoPath(80 + i * 28, i * 0.5)}
              fill="none" stroke={topoColors[i]} strokeWidth={1.2} opacity={0}
            />
          ))}
        </svg>
        <div className="wipro-logo" style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 90, height: 90, borderRadius: "50%", border: `2px solid ${C.cyan}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: C.cyan,
          fontFamily: "'Inter',sans-serif", letterSpacing: 4, opacity: 0,
          boxShadow: `0 0 30px ${C.cyan}44, inset 0 0 20px ${C.cyan}22`
        }}>W</div>

        {/* ═══ PHASE 2: IDENTITY FRAME ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          {frameLines.map((l, i) => (
            <line key={`fl-${i}`} className="frame-line" {...l} stroke={C.cyan} strokeWidth={2} opacity={0}
                  style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
          ))}
          {frameDots.map(([cx, cy], i) => (
            <circle key={`fd-${i}`} className="frame-dot" cx={cx} cy={cy} r={4}
              fill={i % 2 === 0 ? C.cyan : C.white} opacity={0} />
          ))}
        </svg>
        <div className="identity-text" style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          fontSize: 26, fontWeight: 300, color: C.cyan, opacity: 0,
          fontFamily: "'Inter',sans-serif", letterSpacing: 7, textTransform: "uppercase",
          textShadow: `0 0 15px ${C.cyan}88`
        }}>Identity Management Center</div>

        {/* ═══ PHASE 3: CUBE WIREFRAME ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          {cubeEdges.map(([a, b], i) => {
            const pa = projected[a], pb = projected[b];
            return (
              <line key={`ce-${i}`} className="cube-edge"
                x1={pa.px} y1={pa.py} x2={pb.px} y2={pb.py}
                stroke={C.magenta} strokeWidth={1.5} opacity={0}
                style={{ filter: `drop-shadow(0 0 5px ${C.magenta})` }}
              />
            );
          })}
          {projected.map((p, i) => (
            <circle key={`cd-${i}`} className="cube-dot"
              cx={p.px} cy={p.py} r={2.5 * p.s}
              fill={i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.purple : C.white} opacity={0}
            />
          ))}
          {/* Module 7: Inner Cube */}
          {innerProjected.length > 0 && innerEdges.map(([a, b], i) => {
            const pa = innerProjected[a], pb = innerProjected[b];
            return (
              <line key={`ice-${i}`} className="cube-edge"
                x1={pa.px} y1={pa.py} x2={pb.px} y2={pb.py}
                stroke={C.cyan} strokeWidth={1} opacity={0}
                style={{ filter: `drop-shadow(0 0 3px ${C.cyan})` }}
              />
            );
          })}
          {innerProjected.map((p, i) => (
            <circle key={`icd-${i}`} className="cube-dot"
              cx={p.px} cy={p.py} r={2 * p.s}
              fill={C.cyan} opacity={0}
            />
          ))}
        </svg>

        {/* ═══ MODULE 4: CIRCUIT TRACES (Phase 2) ═══ */}
        <svg className="circuit-layer" width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          <polyline className="circuit-trace" points="660,330 660,270 580,270 580,210 500,210" fill="none" stroke={C.cyan} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="1280,330 1280,270 1360,270 1360,200 1440,200" fill="none" stroke={C.cyan} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="660,750 660,810 560,810 560,880 480,880" fill="none" stroke={C.magenta} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="1280,750 1280,830 1380,830 1380,900 1460,900" fill="none" stroke={C.magenta} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="640,350 560,350 560,420 480,420" fill="none" stroke={C.amber} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="1300,350 1380,350 1380,400 1460,400" fill="none" stroke={C.amber} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="640,730 540,730 540,660 460,660" fill="none" stroke={C.purple} strokeWidth={0.8} opacity={0.4} />
          <polyline className="circuit-trace" points="1300,730 1400,730 1400,680 1480,680" fill="none" stroke={C.purple} strokeWidth={0.8} opacity={0.4} />
          {/* Circuit nodes */}
          {[[500,210],[1440,200],[480,880],[1460,900],[480,420],[1460,400],[460,660],[1480,680]].map(([cx,cy], i) => (
            <rect key={`cn-${i}`} className="circuit-node" x={cx-4} y={cy-4} width={8} height={8}
              fill={[C.cyan,C.cyan,C.magenta,C.magenta,C.amber,C.amber,C.purple,C.purple][i]} opacity={0} />
          ))}
        </svg>

        {/* ═══ PHASE 4: ORBIT SYSTEM ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation={6} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {orbits.map((o, i) => (
            <path key={`op-${i}`} id={`orbit-path-${i}`}
              d={circularPath(CX, CY, o.r)}
              fill="none" stroke={C.white} strokeWidth={0.5} opacity={0.1}
            />
          ))}
          <circle className="orbit-center" cx={CX} cy={CY} r={10} fill={C.cyan} filter="url(#glow)" opacity={0} />
          {/* Module 5: Constellation lines */}
          {constellationLines.map((l, i) => (
            <line key={`cl-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={C.cyan} strokeWidth={0.8} opacity={l.op}
              style={{ filter: `drop-shadow(0 0 4px ${C.cyan})` }} />
          ))}
        </svg>
        {orbits.map((o, i) => (
          <div key={`os-${i}`}
            className={`orbit-shape-wrap orbit-shape-wrap-${i}`}
            style={{
              position: "absolute", left: CX - o.size, top: CY - o.size,
              width: o.size * 2, height: o.size * 2, opacity: 0, zIndex: 20,
            }}
          >
            <div className={`orbit-shape-inner-${i}`} style={{ width: "100%", height: "100%" }}>
              <ShapeSVG type={o.type} size={o.size} color={o.color} />
            </div>
          </div>
        ))}

        {/* ═══ PHASE 5: BRAND REVEAL ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          <circle className="final-circle" cx={CX} cy={CY} r={60}
            fill="none" stroke={C.cyan} strokeWidth={3} opacity={0}
            style={{ filter: `drop-shadow(0 0 10px ${C.cyan})` }} />
          {glowColors.map((c, i) => {
            const a = (i * 30) * Math.PI / 180;
            return (
              <line key={`gl-${i}`} className="final-glow"
                x1={CX + 75 * Math.cos(a)} y1={CY + 75 * Math.sin(a)}
                x2={CX + 130 * Math.cos(a)} y2={CY + 130 * Math.sin(a)}
                stroke={c} strokeWidth={2} opacity={0}
              />
            );
          })}
        </svg>
        <div className="final-logo-text" style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          fontSize: 18, fontWeight: 800, color: C.cyan, opacity: 0,
          fontFamily: "'Inter',sans-serif", letterSpacing: 5,
          textShadow: `0 0 15px ${C.cyan}88`
        }}>WIPRO</div>
        <div className="final-text" style={{
          position: "absolute", top: "60%", left: "50%", transform: "translate(-50%,0)",
          fontSize: 20, fontWeight: 300, color: C.magenta, opacity: 0,
          fontFamily: "'Inter',sans-serif", letterSpacing: 8, textTransform: "uppercase",
          textShadow: `0 0 10px ${C.magenta}88`
        }}>CyberSecurity</div>

        {/* ═══ MODULE 1: DATA PARTICLES ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, zIndex: 5 }}>
          {particleData.map((p, i) => (
            <circle key={`pt-${i}`} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={p.op} />
          ))}
        </svg>

        {/* ═══ MODULE 6: DEBRIS PARTICLES ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, zIndex: 15 }}>
          {debrisData.map((d, i) => (
            <polygon key={`db-${i}`}
              points={`0,${-d.size} ${d.size * 0.7},${d.size * 0.5} ${-d.size * 0.7},${d.size * 0.5}`}
              fill={d.color} opacity={d.op}
              transform={`translate(${d.x},${d.y}) rotate(${d.rot})`}
              style={{ filter: `drop-shadow(0 0 3px ${d.color})` }}
            />
          ))}
        </svg>

        {/* ═══ MODULE 2A: SCANLINES ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, zIndex: 90, pointerEvents: "none", mixBlendMode: "overlay" as const }}>
          <defs>
            <pattern id="scanlines" width="1920" height="3" patternUnits="userSpaceOnUse">
              <line x1={0} y1={0} x2={1920} y2={0} stroke="#000" strokeWidth={1} opacity={0.15} />
            </pattern>
          </defs>
          <rect width="1920" height="1080" fill="url(#scanlines)" />
        </svg>

        {/* ═══ MODULE 2B: VIGNETTE ═══ */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 91, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)"
        }} />

        {/* ═══ MODULE 2C: NOISE GRAIN ═══ */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, zIndex: 92, pointerEvents: "none", opacity: 0.04 }}>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency={0.65 + Math.sin(sec * 10) * 0.05} numOctaves={3} stitchTiles="stitch" />
          </filter>
          <rect width="1920" height="1080" filter="url(#noiseFilter)" />
        </svg>

        {/* ═══ MODULE 8: CHROMATIC ABERRATION ═══ */}
        {chromaticOffset > 0.1 && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 95, pointerEvents: "none",
            mixBlendMode: "screen" as const
          }}>
            <div style={{
              position: "absolute", inset: 0,
              boxShadow: `${chromaticOffset}px 0 0 ${C.magenta}33, ${-chromaticOffset}px 0 0 ${C.cyan}33`,
              border: `1px solid rgba(255,255,255,${chromaticOffset * 0.05})`
            }} />
            {/* Horizontal glitch lines */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = 100 + i * 200 + Math.sin(sec * 30 + i) * 20;
              return (
                <div key={`glitch-${i}`} style={{
                  position: "absolute", left: 0, top: y, width: "100%", height: 2,
                  background: `linear-gradient(90deg, transparent, ${C.cyan}${Math.round(chromaticOffset * 15).toString(16).padStart(2, '0')}, transparent)`,
                  transform: `translateX(${Math.sin(sec * 50 + i * 3) * chromaticOffset * 3}px)`
                }} />
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
