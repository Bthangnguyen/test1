import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';
import { project, vec3 } from './math3d';
import { PLANETS, getPlanetPos } from './planets';
import { getCamera } from './camera';
import { renderStars, renderSun, renderPlanet, renderOrbitalRing } from './renderers';
import { renderEarthGLSL } from './earthGLSL';

/* ═══════════════════════════════════════════════════════════
   SOLAR SYSTEM 3D — 30s (900 frames @ 30fps)
   Camera: Wide → Zoom Earth → Close-up → Pull back
   ═══════════════════════════════════════════════════════════ */

export const SolarSystem3D: React.FC = () => {
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

    const cam = getCamera(time, width, height);

    // Background
    const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
    bg.addColorStop(0, '#080814');
    bg.addColorStop(1, '#020206');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    renderStars(ctx, width, height, time);
    for (const p of PLANETS) renderOrbitalRing(ctx, p.orbit, cam, width, height);

    // Depth-sorted renderables
    type R = { depth: number; draw: () => void };
    const items: R[] = [];

    // Sun
    const sunP = project(vec3(0, 0, 0), cam, width, height);
    items.push({ depth: sunP.depth, draw: () => renderSun(ctx, sunP, time) });

    // Planets
    for (let i = 0; i < PLANETS.length; i++) {
      const planet = PLANETS[i];
      const pos = getPlanetPos(planet, i, time);
      const wp = vec3(pos.x, 0, pos.z);
      const proj = project(wp, cam, width, height);

      if (planet.name === 'Earth') {
        items.push({
          depth: proj.depth,
          draw: () => {
            if (proj.depth < 1) return;
            const screenR = Math.max(2, planet.size * proj.scale);
            renderEarthGLSL(ctx, proj.x, proj.y, screenR, time);
            // Moon
            const moonA = time * 2;
            const mOrb = planet.size * 3;
            const moonP = project(vec3(pos.x + Math.cos(moonA) * mOrb, 0, pos.z + Math.sin(moonA) * mOrb), cam, width, height);
            if (moonP.depth > 1) {
              const mr = Math.max(1, 0.6 * moonP.scale);
              ctx.beginPath();
              ctx.arc(moonP.x, moonP.y, mr, 0, Math.PI * 2);
              const mg = ctx.createRadialGradient(moonP.x - mr * 0.2, moonP.y - mr * 0.2, 0, moonP.x, moonP.y, mr);
              mg.addColorStop(0, '#e0e4ea');
              mg.addColorStop(1, '#777');
              ctx.fillStyle = mg;
              ctx.fill();
            }
          },
        });
      } else {
        items.push({
          depth: proj.depth,
          draw: () => {
            renderPlanet(ctx, proj, planet, time);
            for (let m = 0; m < planet.moons; m++) {
              const mA = time * 3 / (m + 1) + m * 2;
              const mOrb = planet.size * 2.5 + m * 2;
              const mP = project(vec3(pos.x + Math.cos(mA) * mOrb, 0, pos.z + Math.sin(mA) * mOrb), cam, width, height);
              if (mP.depth > 1) {
                ctx.beginPath();
                ctx.arc(mP.x, mP.y, Math.max(0.8, 0.4 * mP.scale), 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200,200,210,0.6)';
                ctx.fill();
              }
            }
          },
        });
      }
    }

    items.sort((a, b) => b.depth - a.depth);
    items.forEach((it) => it.draw());

    // HUD
    const ho = interpolate(frame, [0, 30, 870, 900], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = `rgba(180,190,220,${ho})`;
    ctx.textAlign = 'left';
    ctx.fillText('THE SOLAR SYSTEM', 40, 38);
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = `rgba(100,200,255,${ho * 0.7})`;
    const phaseLabel = time < 12 ? 'WIDE VIEW' : time < 18 ? 'ZOOM TO EARTH' : time < 26 ? 'EARTH CLOSE-UP' : 'PULL BACK';
    ctx.fillText(`${phaseLabel} | Earth Years: ${(time / 6).toFixed(1)}`, 40, 56);

    // Vignette
    const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    // Fade in/out
    const fade = interpolate(frame, [0, 25, 875, 900], [1, 0, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, width, height); }

  }, [frame, fps, width, height, time]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#020208' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};
