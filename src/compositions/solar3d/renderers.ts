/* Render functions for celestial objects — uses Camera-based projection */

import { Camera, Projected, project, hash } from './math3d';
import { PlanetDef } from './planets';

// ═══ STARS ═══
export function renderStars(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  for (let i = 0; i < 400; i++) {
    const sx = hash(i * 13 + 7) * w;
    const sy = hash(i * 29 + 3) * h;
    const sr = 0.3 + hash(i * 41) * 1.0;
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * (1 + hash(i * 17) * 3) + hash(i * 53) * 6.28));
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,210,255,${tw * 0.4})`;
    ctx.fill();
  }
}

// ═══ SUN ═══
export function renderSun(ctx: CanvasRenderingContext2D, proj: Projected, time: number) {
  if (proj.depth < 1) return;
  const r = Math.max(4, 8 * proj.scale);
  const { x, y } = proj;

  // Corona
  const c3 = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 5);
  c3.addColorStop(0, 'rgba(255,200,50,0.12)');
  c3.addColorStop(0.5, 'rgba(255,150,30,0.04)');
  c3.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(x, y, r * 5, 0, Math.PI * 2);
  ctx.fill();

  // Glow
  const c1 = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2);
  c1.addColorStop(0, 'rgba(255,230,100,0.3)');
  c1.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.arc(x, y, r * 2, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const sg = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 1, x, y, r);
  sg.addColorStop(0, '#fffae0');
  sg.addColorStop(0.4, '#ffd040');
  sg.addColorStop(0.8, '#ff9920');
  sg.addColorStop(1, '#ee6600');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = sg;
  ctx.fill();
}

// ═══ GENERIC PLANET ═══
export function renderPlanet(ctx: CanvasRenderingContext2D, proj: Projected, planet: PlanetDef, time: number) {
  if (proj.depth < 1) return;
  const r = Math.max(2, planet.size * proj.scale);
  const { x, y } = proj;

  // Glow
  const gl = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
  gl.addColorStop(0, planet.color + '22');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();

  // Saturn ring
  if (planet.hasRing && r > 2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 2.2, r * 0.5, 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(210,190,140,0.4)';
    ctx.lineWidth = Math.max(1, r * 0.15);
    ctx.stroke();
    ctx.restore();
  }

  // Body
  const pg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  pg.addColorStop(0, lighten(planet.color, 50));
  pg.addColorStop(0.6, planet.color);
  pg.addColorStop(1, darken(planet.color, 60));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = pg;
  ctx.fill();

  // Label
  if (r > 4) {
    ctx.font = `${Math.max(9, Math.min(14, r))}px "Inter", sans-serif`;
    ctx.fillStyle = `rgba(200,210,230,${Math.min(0.7, r * 0.06)})`;
    ctx.textAlign = 'center';
    ctx.fillText(planet.name, x, y + r + 14);
  }
}

// ═══ ORBITAL RING ═══
export function renderOrbitalRing(ctx: CanvasRenderingContext2D, orbitR: number, cam: Camera, w: number, h: number) {
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    const p = project({ x: Math.cos(a) * orbitR, y: 0, z: Math.sin(a) * orbitR }, cam, w, h);
    if (p.depth < 1) { started = false; continue; }
    if (!started) { ctx.moveTo(p.x, p.y); started = true; }
    else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

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
