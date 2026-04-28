import React, { useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════
   CANVAS SHADER BACKGROUND
   GLSL-style FBM noise + SDF circle rendered on Canvas 2D
   Driven by Remotion frame for deterministic output.
   ═══════════════════════════════════════════════════════════ */

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function noise2D(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix + iy * 157.0);
  const b = hash(ix + 1 + iy * 157.0);
  const c = hash(ix + (iy + 1) * 157.0);
  const d = hash(ix + 1 + (iy + 1) * 157.0);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm2D(x: number, y: number, octaves: number): number {
  let v = 0, a = 0.5, fx = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * noise2D(x * fx, y * fx);
    fx *= 2.0; a *= 0.5;
  }
  return v;
}

// Cosine palette (from glsl-color skill)
function cosPalette(t: number, a: number[], b: number[], c: number[], d: number[]): number[] {
  return [
    a[0] + b[0] * Math.cos(6.28318 * (c[0] * t + d[0])),
    a[1] + b[1] * Math.cos(6.28318 * (c[1] * t + d[1])),
    a[2] + b[2] * Math.cos(6.28318 * (c[2] * t + d[2])),
  ];
}

interface Props {
  width: number;
  height: number;
  time: number;
  /** 0=boot, 1=ignition, 2=assimilate */
  phase: number;
  phaseProgress: number;
}

export const CanvasShaderBackground: React.FC<Props> = ({ width, height, time, phase, phaseProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample every 4th pixel for performance, then scale
    const step = 3;
    const sw = Math.ceil(width / step);
    const sh = Math.ceil(height / step);
    const imgData = ctx.createImageData(sw, sh);
    const data = imgData.data;

    // Core glow intensity ramps up across phases
    const coreIntensity = phase === 0 ? phaseProgress * 0.3
      : phase === 1 ? 0.3 + phaseProgress * 0.7
      : 1.0;

    // Scanline intensity for phase 2
    const scanlineStr = phase === 2 ? phaseProgress : 0;

    for (let sy = 0; sy < sh; sy++) {
      for (let sx = 0; sx < sw; sx++) {
        const px = (sx / sw - 0.5) * 2.0 * (width / height);
        const py = (sy / sh - 0.5) * 2.0;

        // FBM noise field
        const n = fbm2D(px * 1.5 + time * 0.15, py * 1.5 + time * 0.1, 5);

        // SDF Circle (core)
        const dist = Math.sqrt(px * px + py * py);
        const sdfCircle = dist - 0.25 * coreIntensity;

        // Glow ring
        const glow = 0.008 / (Math.abs(sdfCircle) + 0.003) * coreIntensity;

        // Color palette: Neon blue / purple
        const palA = [0.05, 0.05, 0.1];
        const palB = [0.4, 0.3, 0.5];
        const palC = [1.0, 0.8, 0.6];
        const palD = [0.0, 0.33, 0.67];
        const col = cosPalette(n * 0.8 + time * 0.1 + dist * 0.5, palA, palB, palC, palD);

        // Core accent (cyan-white inside)
        const coreMask = Math.max(0, 1 - dist / (0.3 * coreIntensity + 0.01));
        const coreGlow = coreMask * coreMask * coreIntensity;

        // Scanlines (phase 2)
        const scanline = scanlineStr > 0
          ? (Math.sin(sy * 3.0 + time * 8) * 0.5 + 0.5) * scanlineStr * 0.15
          : 0;

        // Energy flow lines
        const flow = Math.sin(py * 12 + time * 4 + n * 6) * 0.5 + 0.5;
        const flowMask = Math.max(0, flow - 0.7) * 3.0 * coreIntensity * 0.2;

        let r = (col[0] * (n * 0.4 + 0.1) + glow * 0.3 + coreGlow * 0.6 + flowMask * 0.2 + scanline) * 255;
        let g = (col[1] * (n * 0.3 + 0.05) + glow * 0.6 + coreGlow * 0.9 + flowMask * 0.8 + scanline * 0.5) * 255;
        let b = (col[2] * (n * 0.5 + 0.15) + glow * 1.0 + coreGlow * 1.0 + flowMask * 1.0 + scanline * 0.3) * 255;

        const idx = (sy * sw + sx) * 4;
        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    // Draw small image then scale up
    const offCanvas = new OffscreenCanvas(sw, sh);
    const offCtx = offCanvas.getContext('2d')!;
    offCtx.putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offCanvas, 0, 0, width, height);

    // Vignette overlay
    const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

  }, [width, height, time, phase, phaseProgress]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};
