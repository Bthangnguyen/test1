import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

/* ═══════════════════════════════════════════════════════════
   SOLAR SYSTEM SIMULATION
   30s (900 frames @ 30fps) — Canvas 2D

   Accurate relative orbital speeds, sizes (artistically scaled),
   with glowing sun, star field, orbital paths, and planet labels.
   ═══════════════════════════════════════════════════════════ */

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Planet data: name, orbitRadius, size, color, orbitalPeriod (relative to Earth=1)
const PLANETS = [
  { name: 'Mercury',  orbit: 70,  size: 4,   color: '#b0b0b0', period: 0.24,  moons: 0 },
  { name: 'Venus',    orbit: 105, size: 7,   color: '#e8c56d', period: 0.62,  moons: 0 },
  { name: 'Earth',    orbit: 145, size: 7.5, color: '#4a9eff', period: 1.0,   moons: 1 },
  { name: 'Mars',     orbit: 190, size: 5.5, color: '#d45533', period: 1.88,  moons: 2 },
  { name: 'Jupiter',  orbit: 260, size: 18,  color: '#c8a55a', period: 11.86, moons: 4 },
  { name: 'Saturn',   orbit: 340, size: 15,  color: '#e8d48b', period: 29.46, moons: 3, hasRing: true },
  { name: 'Uranus',   orbit: 410, size: 10,  color: '#7ec8d4', period: 84.01, moons: 2 },
  { name: 'Neptune',  orbit: 470, size: 9.5, color: '#3355cc', period: 164.8, moons: 1 },
];

export const SolarSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = width / 2;
    const cy = height / 2;

    // ═══ BACKGROUND: Deep space ═══
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.7);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(0.5, '#060610');
    bgGrad.addColorStop(1, '#020208');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // ═══ STARS ═══
    for (let i = 0; i < 300; i++) {
      const sx = hash(i * 13 + 7) * width;
      const sy = hash(i * 29 + 3) * height;
      const sr = 0.3 + hash(i * 41) * 1.2;
      const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * (1 + hash(i * 17) * 3) + hash(i * 53) * 6.28));
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,210,255,${twinkle * 0.5})`;
      ctx.fill();
    }

    // ═══ ORBITAL PATHS ═══
    for (const planet of PLANETS) {
      ctx.beginPath();
      ctx.arc(cx, cy, planet.orbit, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ═══ SUN ═══
    // Outer corona
    const coronaR = 45 + Math.sin(time * 2) * 3;
    const corona3 = ctx.createRadialGradient(cx, cy, 10, cx, cy, coronaR * 3);
    corona3.addColorStop(0, 'rgba(255,200,50,0.08)');
    corona3.addColorStop(0.5, 'rgba(255,150,30,0.03)');
    corona3.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = corona3;
    ctx.fillRect(cx - coronaR * 3, cy - coronaR * 3, coronaR * 6, coronaR * 6);

    // Inner glow
    const corona1 = ctx.createRadialGradient(cx, cy, 5, cx, cy, coronaR * 1.5);
    corona1.addColorStop(0, 'rgba(255,230,100,0.25)');
    corona1.addColorStop(0.6, 'rgba(255,180,50,0.08)');
    corona1.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = corona1;
    ctx.beginPath();
    ctx.arc(cx, cy, coronaR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Sun body
    const sunR = 28;
    const sunGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, sunR);
    sunGrad.addColorStop(0, '#fffae0');
    sunGrad.addColorStop(0.3, '#ffd040');
    sunGrad.addColorStop(0.7, '#ff9920');
    sunGrad.addColorStop(1, '#ee6600');
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Sun surface texture
    for (let i = 0; i < 8; i++) {
      const a = hash(i * 67) * Math.PI * 2 + time * 0.3;
      const r = 8 + hash(i * 43) * 15;
      const spotX = cx + Math.cos(a) * r;
      const spotY = cy + Math.sin(a) * r;
      const spotR = 3 + hash(i * 31) * 5;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,100,0,${0.15 + hash(i * 89) * 0.1})`;
      ctx.fill();
    }

    // ═══ PLANETS ═══
    // Speed multiplier (1 Earth year = 6 seconds in our sim)
    const speedMul = (2 * Math.PI) / 6.0;

    for (const planet of PLANETS) {
      const angle = (time * speedMul) / planet.period + hash(PLANETS.indexOf(planet) * 77) * Math.PI * 2;
      const px = cx + Math.cos(angle) * planet.orbit;
      const py = cy + Math.sin(angle) * planet.orbit;

      // Planet shadow (away from sun)
      const toSunAngle = Math.atan2(cy - py, cx - px);

      // Saturn ring (behind planet)
      if ((planet as any).hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(0.4); // Tilt
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.size * 2.2, planet.size * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(210,190,140,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.size * 1.7, planet.size * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(190,170,120,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Planet glow
      const glowGrad = ctx.createRadialGradient(px, py, planet.size * 0.5, px, py, planet.size * 2.5);
      glowGrad.addColorStop(0, `${planet.color}33`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(px, py, planet.size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Planet body
      const pGrad = ctx.createRadialGradient(
        px - planet.size * 0.3, py - planet.size * 0.3, 1,
        px, py, planet.size
      );
      pGrad.addColorStop(0, lighten(planet.color, 40));
      pGrad.addColorStop(0.7, planet.color);
      pGrad.addColorStop(1, darken(planet.color, 50));
      ctx.beginPath();
      ctx.arc(px, py, planet.size, 0, Math.PI * 2);
      ctx.fillStyle = pGrad;
      ctx.fill();

      // Earth special: blue + green patches + white clouds
      if (planet.name === 'Earth') {
        // Green land
        for (let j = 0; j < 3; j++) {
          const la = hash(j * 19 + 100) * Math.PI * 2 + time * 0.2;
          const lr = planet.size * 0.5;
          const lx = px + Math.cos(la) * lr;
          const ly = py + Math.sin(la) * lr;
          ctx.beginPath();
          ctx.arc(lx, ly, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(40,160,60,0.5)';
          ctx.fill();
        }
      }

      // Moons
      for (let m = 0; m < planet.moons; m++) {
        const moonOrbit = planet.size * 2.5 + m * 6;
        const moonAngle = time * 3 / (m + 1) + m * 2.1;
        const mx = px + Math.cos(moonAngle) * moonOrbit;
        const my = py + Math.sin(moonAngle) * moonOrbit;
        ctx.beginPath();
        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,200,210,0.7)';
        ctx.fill();
      }

      // Planet label
      ctx.font = '11px "Inter", "Helvetica Neue", sans-serif';
      ctx.fillStyle = 'rgba(200,210,230,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, px, py + planet.size + 14);
    }

    // ═══ TITLE ═══
    const titleOp = frame < 90 ? frame / 90 : frame > 840 ? (900 - frame) / 60 : 1;
    ctx.font = 'bold 18px "Inter", "Helvetica Neue", sans-serif';
    ctx.fillStyle = `rgba(180,190,220,${titleOp * 0.6})`;
    ctx.textAlign = 'left';
    ctx.fillText('THE SOLAR SYSTEM', 40, 40);

    // Time indicator
    const earthYears = (time / 6).toFixed(1);
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = `rgba(100,200,255,${titleOp * 0.5})`;
    ctx.fillText(`Earth Years: ${earthYears}`, 40, 62);

    // ═══ VIGNETTE ═══
    const vig = ctx.createRadialGradient(cx, cy, width * 0.3, cx, cy, width * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

  }, [frame, fps, width, height, time]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#020208' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};

// Color helpers
function lighten(hex: string, amt: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}
function darken(hex: string, amt: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `rgb(${r},${g},${b})`;
}
