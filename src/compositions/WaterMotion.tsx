import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

/* ═══════════════════════════════════════════════════════════
   WATER MOTION — 10s (300 frames @ 30fps)
   Pure Canvas 2D — NO WebGL dependency
   
   Simulates ocean waves using layered sine functions
   with Perlin-like noise for organic feel.
   ═══════════════════════════════════════════════════════════ */

// Deterministic pseudo-random
function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

// Simple 1D noise interpolation
function noise1D(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f); // smoothstep
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

// FBM (Fractal Brownian Motion) 1D
function fbm1D(x: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise1D(x * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return val;
}

export const WaterMotion: React.FC = () => {
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

    // ═══ SKY GRADIENT ═══
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    skyGrad.addColorStop(0, '#0a0e27');   // Deep navy
    skyGrad.addColorStop(0.5, '#1a2a5e'); // Midnight blue
    skyGrad.addColorStop(1, '#2d4a7a');   // Horizon blue
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.45);

    // ═══ STARS ═══
    for (let i = 0; i < 80; i++) {
      const sx = hash(i * 13 + 7) * width;
      const sy = hash(i * 29 + 3) * height * 0.35;
      const sr = 0.5 + hash(i * 41) * 1.5;
      const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * (2 + hash(i * 17) * 3) + hash(i * 53) * 6.28));
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.6})`;
      ctx.fill();
    }

    // ═══ MOON ═══
    const moonX = width * 0.75;
    const moonY = height * 0.15;
    const moonR = 35;
    // Outer glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 4);
    moonGlow.addColorStop(0, 'rgba(200,220,255,0.15)');
    moonGlow.addColorStop(1, 'rgba(200,220,255,0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8);
    // Moon body
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fillStyle = '#e8eef5';
    ctx.fill();

    // ═══ WATER ═══
    const waterTop = height * 0.45;
    const waterHeight = height - waterTop;
    const LAYERS = 7;

    for (let layer = 0; layer < LAYERS; layer++) {
      const depth = layer / LAYERS; // 0 = back, 1 = front
      const yBase = waterTop + depth * waterHeight * 0.6;

      // Wave parameters vary by layer
      const waveAmp = 8 + depth * 20;
      const waveFreq = 0.003 + depth * 0.002;
      const speed = 0.4 + depth * 0.3;
      const fbmScale = 0.01 + depth * 0.005;

      // Color gets darker and more saturated at depth
      const r = Math.floor(10 + depth * 15);
      const g = Math.floor(40 + depth * 30 - depth * depth * 25);
      const b = Math.floor(80 + (1 - depth) * 80);
      const alpha = 0.4 + depth * 0.45;

      // Draw wave shape
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 2) {
        // Multiple sine waves for organic look
        let y = yBase;
        y += Math.sin(x * waveFreq + time * speed) * waveAmp;
        y += Math.sin(x * waveFreq * 2.3 + time * speed * 1.4 + layer * 0.7) * waveAmp * 0.4;
        y += Math.sin(x * waveFreq * 0.7 - time * speed * 0.6 + layer * 1.3) * waveAmp * 0.6;
        // FBM turbulence
        y += (fbm1D(x * fbmScale + time * speed * 0.5 + layer * 10, 4) - 0.5) * waveAmp * 1.2;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      // Water gradient fill
      const waterGrad = ctx.createLinearGradient(0, yBase - waveAmp, 0, height);
      waterGrad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
      waterGrad.addColorStop(0.5, `rgba(${Math.max(0, r - 8)},${Math.max(0, g - 15)},${Math.max(0, b - 10)},${alpha + 0.1})`);
      waterGrad.addColorStop(1, `rgba(${Math.max(0, r - 10)},${Math.max(0, g - 25)},${Math.max(0, b - 20)},${Math.min(1, alpha + 0.3)})`);
      ctx.fillStyle = waterGrad;
      ctx.fill();
    }

    // ═══ MOON REFLECTION on water ═══
    const reflectTop = waterTop + 10;
    for (let i = 0; i < 25; i++) {
      const ry = reflectTop + i * 12 + Math.sin(time * 2 + i * 0.5) * 3;
      const rWidth = Math.max(0.5, 3 + (i % 3) * 8 + Math.sin(time * 3 + i) * 4);
      const rx = moonX + Math.sin(time * 1.5 + i * 0.8) * (10 + i * 2);
      const rAlpha = 0.15 - i * 0.005;
      if (rAlpha <= 0 || ry > height) continue;

      ctx.beginPath();
      ctx.ellipse(rx, ry, rWidth, 1, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${rAlpha})`;
      ctx.fill();
    }

    // ═══ FOAM / whitecaps ═══
    for (let i = 0; i < 40; i++) {
      const fx = hash(i * 31 + 5) * width;
      const fLayer = Math.floor(hash(i * 47) * LAYERS);
      const fDepth = fLayer / LAYERS;
      const fy = waterTop + fDepth * waterHeight * 0.6;
      const waveOffset = Math.sin(fx * 0.005 + time * (0.4 + fDepth * 0.3)) * (8 + fDepth * 20);
      const foamY = fy + waveOffset - 2;
      const foamW = Math.max(0.5, 5 + hash(i * 67) * 25);
      const foamAlpha = (0.15 + hash(i * 89) * 0.15) * (0.5 + 0.5 * Math.sin(time * 2 + hash(i * 23) * 6.28));

      if (foamAlpha < 0.05) continue;
      ctx.beginPath();
      ctx.ellipse(fx, foamY, foamW, 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,240,${foamAlpha})`;
      ctx.fill();
    }

    // ═══ VIGNETTE ═══
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.8);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

  }, [frame, fps, width, height, time]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e27' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};
