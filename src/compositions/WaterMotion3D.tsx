import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

/* ═══════════════════════════════════════════════════════════
   WATER MOTION 3D — Canvas 2D with Perspective Projection
   10s (300 frames @ 30fps)
   
   Pseudo-3D ocean using scanline rendering with perspective
   foreshortening. Each horizontal line represents a water row
   at a certain depth — closer rows are taller/wider.
   ═══════════════════════════════════════════════════════════ */

function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

function noise1D(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

// Wave height at world position (x, z) at time t
function waveH(x: number, z: number, t: number): number {
  let h = 0;
  h += Math.sin(x * 0.08 + t * 1.0) * 1.0;
  h += Math.sin(z * 0.06 + t * 0.7) * 0.8;
  h += Math.sin((x + z) * 0.05 + t * 0.5) * 0.5;
  h += Math.sin((x - z * 0.7) * 0.12 + t * 1.3) * 0.3;
  h += Math.sin(x * 0.25 + z * 0.15 + t * 2.0) * 0.15;
  h += (noise1D(x * 0.1 + t * 0.3) - 0.5) * 0.4;
  h += (noise1D(z * 0.08 + t * 0.2 + 50) - 0.5) * 0.3;
  return h;
}

export const WaterMotion3D: React.FC = () => {
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

    // ═══ PARAMETERS ═══
    const horizonY = height * 0.38;         // Horizon line
    const waterStartY = horizonY;
    const cameraHeight = 4;
    const cameraTilt = 0.6;
    const camDriftX = Math.sin(time * 0.2) * 3;

    // ═══ SKY ═══
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#050a1a');
    skyGrad.addColorStop(0.4, '#0c1a40');
    skyGrad.addColorStop(0.7, '#152e5c');
    skyGrad.addColorStop(1, '#1f4070');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY + 2);

    // ═══ STARS ═══
    for (let i = 0; i < 120; i++) {
      const sx = hash(i * 13 + 7) * width;
      const sy = hash(i * 29 + 3) * horizonY * 0.85;
      const sr = 0.4 + hash(i * 41) * 1.2;
      const twinkle = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(time * (1.5 + hash(i * 17) * 4) + hash(i * 53) * 6.28));
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${twinkle * 0.5})`;
      ctx.fill();
    }

    // ═══ MOON ═══
    const moonX = width * 0.72;
    const moonY = height * 0.13;
    const moonR = 28;
    // Glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.3, moonX, moonY, moonR * 5);
    moonGlow.addColorStop(0, 'rgba(180,200,240,0.12)');
    moonGlow.addColorStop(0.5, 'rgba(140,170,220,0.04)');
    moonGlow.addColorStop(1, 'rgba(100,140,200,0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - moonR * 5, moonY - moonR * 5, moonR * 10, moonR * 10);
    // Body
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fillStyle = '#dde6f0';
    ctx.fill();

    // ═══ 3D WATER — Scanline Rendering ═══
    // Each screen row below horizon maps to a world-space z (depth)
    const totalRows = height - waterStartY;

    for (let screenRow = 0; screenRow < totalRows; screenRow++) {
      const screenY = waterStartY + screenRow;
      const t01 = screenRow / totalRows; // 0 = horizon, 1 = bottom of screen

      // Perspective: map screen row to world-space depth (z)
      // Near horizon = very far (large z), near bottom = close (small z)
      const z = cameraHeight / (t01 * cameraTilt + 0.01);
      const worldScale = 1.0 / (t01 * cameraTilt + 0.01); // How wide each pixel represents

      // For each pixel in this row, compute the wave color
      const rowImageData = ctx.createImageData(width, 1);
      const data = rowImageData.data;

      for (let screenX = 0; screenX < width; screenX++) {
        // Map screen X to world X (perspective)
        const worldX = (screenX - width / 2) / (width * 0.5) * z * 0.8 + camDriftX;

        // Wave height at this world position
        const h = waveH(worldX, z, time);

        // Normal approximation (for lighting)
        const hR = waveH(worldX + 0.5, z, time);
        const hU = waveH(worldX, z + 0.5, time);
        const nx = (h - hR) * 2;
        const nz = (h - hU) * 2;

        // Distance-based fog (farther = more fog)
        const distFog = Math.min(1, t01 < 0.05 ? 1.0 - t01 / 0.05 : 0);
        const depthFade = Math.max(0, 1 - t01 * 0.3);

        // Base water color (deep blue, varies by depth)
        let baseR = 8 + t01 * 20;
        let baseG = 30 + t01 * 50;
        let baseB = 70 + (1 - t01) * 60;

        // Specular highlight (moonlight reflection)
        const moonWorldX = (moonX - width / 2) / (width * 0.5) * z * 0.8;
        const distToMoonReflect = Math.abs(worldX - moonWorldX);
        const moonReflect = Math.max(0, 1 - distToMoonReflect / (2 + t01 * 8));
        const specular = moonReflect * moonReflect * (0.3 + nx * 0.5) * (0.5 + 0.5 * Math.sin(time * 3 + z * 0.5 + worldX * 0.3));

        // Wave shading: slopes facing "light" are brighter
        const shadeFactor = 0.7 + nx * 0.15 + nz * 0.1;

        baseR = baseR * shadeFactor + specular * 180;
        baseG = baseG * shadeFactor + specular * 200;
        baseB = baseB * shadeFactor + specular * 220;

        // Foam on wave crests
        if (h > 0.8) {
          const foamAmt = Math.min(1, (h - 0.8) * 2);
          baseR += foamAmt * (120 - baseR) * 0.3;
          baseG += foamAmt * (160 - baseG) * 0.3;
          baseB += foamAmt * (180 - baseB) * 0.3;
        }

        // Fog blend toward horizon
        const fogR = 15, fogG = 30, fogB = 60;
        baseR = baseR * (1 - distFog) + fogR * distFog;
        baseG = baseG * (1 - distFog) + fogG * distFog;
        baseB = baseB * (1 - distFog) + fogB * distFog;

        // Clamp
        const idx = screenX * 4;
        data[idx] = Math.max(0, Math.min(255, baseR));
        data[idx + 1] = Math.max(0, Math.min(255, baseG));
        data[idx + 2] = Math.max(0, Math.min(255, baseB));
        data[idx + 3] = 255;
      }

      ctx.putImageData(rowImageData, 0, screenY);
    }

    // ═══ HORIZON GLOW ═══
    const horizonGlow = ctx.createLinearGradient(0, horizonY - 15, 0, horizonY + 25);
    horizonGlow.addColorStop(0, 'rgba(30,60,100,0)');
    horizonGlow.addColorStop(0.5, 'rgba(40,70,120,0.15)');
    horizonGlow.addColorStop(1, 'rgba(30,60,100,0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, horizonY - 15, width, 40);

    // ═══ VIGNETTE ═══
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

  }, [frame, fps, width, height, time]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#050a1a' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};
