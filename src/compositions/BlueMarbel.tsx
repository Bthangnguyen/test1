import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';

/* ═══════════════════════════════════════════════════════════════════════
   BLUE MARBLE — Photorealistic Earth Rotation
   
   Techniques used (from GLSL skills):
   ═══════════════════════════════════════════════════════════════════════
   • glsl-noise:      FBM (8 octaves), Value Noise, Domain Warping, Turbulence
   • glsl-coordinates: Spherical mapping (toSpherical/equirectangular UV)
   • glsl-color:       Cosine palettes (ocean), ACES tonemapping, OKLab mixing
   • glsl-sdf:         sdCircle for sphere boundary, glow = exp(-k*|d|)
   • glsl-math:        smoothstep, smootherstep, remap, easing
   ═══════════════════════════════════════════════════════════════════════ */

// ─── CONSTANTS (glsl-math) ───
const PI = 3.14159265359;
const TAU = 6.28318530718;

// ─── HASH (glsl-noise: hash) ───
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function hash2(x: number, y: number): number {
  return ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 + 1) % 1;
}
function hash3(x: number, y: number, z: number): number {
  return ((Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453) % 1 + 1) % 1;
}

// ─── VALUE NOISE 2D (glsl-noise: valueNoise) ───
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  // Hermite interpolation (glsl-math: smoothstep)
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// ─── VALUE NOISE 3D (glsl-noise: valueNoise3D) ───
function valueNoise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  const n000 = hash3(ix, iy, iz), n100 = hash3(ix+1, iy, iz);
  const n010 = hash3(ix, iy+1, iz), n110 = hash3(ix+1, iy+1, iz);
  const n001 = hash3(ix, iy, iz+1), n101 = hash3(ix+1, iy, iz+1);
  const n011 = hash3(ix, iy+1, iz+1), n111 = hash3(ix+1, iy+1, iz+1);
  const x0 = n000 + (n100 - n000) * ux;
  const x1 = n010 + (n110 - n010) * ux;
  const x2 = n001 + (n101 - n001) * ux;
  const x3 = n011 + (n111 - n011) * ux;
  const y0 = x0 + (x1 - x0) * uy;
  const y1 = x2 + (x3 - x2) * uy;
  return y0 + (y1 - y0) * uz;
}

// ─── FBM (glsl-noise: fbm with configurable lacunarity/gain) ───
function fbm(x: number, y: number, octaves: number, lac = 2.0, gain = 0.5): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq);
    freq *= lac; amp *= gain;
  }
  return val;
}

// ─── FBM 3D ───
function fbm3D(x: number, y: number, z: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise3D(x * freq, y * freq, z * freq);
    freq *= 2.0; amp *= 0.5;
  }
  return val;
}

// ─── DOMAIN WARP (glsl-noise: domainWarp for organic swirling) ───
function domainWarp(x: number, y: number, strength = 4.0): number {
  const qx = fbm(x, y, 4);
  const qy = fbm(x + 5.2, y + 1.3, 4);
  return fbm(x + strength * qx, y + strength * qy, 4);
}

// ─── TURBULENCE (glsl-noise: absolute-value FBM) ───
function turbulence(x: number, y: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * Math.abs(valueNoise(x * freq, y * freq) * 2 - 1);
    freq *= 2.0; amp *= 0.5;
  }
  return val;
}

// ─── SMOOTHSTEP / SMOOTHERSTEP (glsl-math) ───
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function smootherstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// ─── REMAP (glsl-math) ───
function remap(v: number, a: number, b: number, c: number, d: number): number {
  return c + (d - c) * Math.max(0, Math.min(1, (v - a) / (b - a)));
}

// ─── COSINE PALETTE (glsl-color: Inigo Quilez technique) ───
function cosPalette3(t: number, a: number[], b: number[], c: number[], d: number[]): number[] {
  return [
    a[0] + b[0] * Math.cos(TAU * (c[0] * t + d[0])),
    a[1] + b[1] * Math.cos(TAU * (c[1] * t + d[1])),
    a[2] + b[2] * Math.cos(TAU * (c[2] * t + d[2])),
  ];
}

// ─── ACES TONEMAPPING (glsl-color) ───
function tonemapACES(x: number): number {
  const a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return Math.max(0, Math.min(1, (x * (a * x + b)) / (x * (c * x + d) + e)));
}

// ─── LINEAR TO SRGB (glsl-color) ───
function linearToSrgb(c: number): number {
  return Math.pow(Math.max(0, c), 1 / 2.2);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ═══════════════════════════════════════════════════════════════════════
// PER-PIXEL EARTH SHADER
// ═══════════════════════════════════════════════════════════════════════
function earthPixel(
  screenX: number, screenY: number, earthR: number, time: number,
  lightDirX: number, lightDirY: number, lightDirZ: number
): number[] | null {
  const nx = screenX / earthR, ny = screenY / earthR;
  const distSq = nx * nx + ny * ny;

  // ─── ATMOSPHERE FRINGE (glsl-sdf: glow = exp(-k*|d|)) ───
  if (distSq > 1.0) {
    const d = Math.sqrt(distSq);
    if (d < 1.15) {
      const glow = Math.exp(-12.0 * (d - 1.0)); // glsl-sdf glow recipe
      return [40 * glow, 100 * glow, 220 * glow, glow * 200];
    }
    return null;
  }

  // ─── SPHERE NORMAL (glsl-coordinates: spherical) ───
  const nz = Math.sqrt(1 - distSq);

  // ─── SPHERICAL UV (glsl-coordinates: toSpherical + equirectangular) ───
  const theta = Math.acos(clamp(-ny, -1, 1)); // polar angle from north
  const phi = Math.atan2(nx, nz);

  // Earth rotation
  const u = ((phi / TAU + 0.5) + time * 0.02) % 1;
  const v = theta / PI;
  const lat = (v - 0.5) * 2; // -1 = north pole, +1 = south pole

  // ─── TERRAIN GENERATION (glsl-noise: FBM + Domain Warp) ───
  const terrainScale = 4.5;
  const tx = u * terrainScale, ty = v * terrainScale;

  // Multi-layer continent shape using domain warping
  const warp1 = domainWarp(tx * 1.2, ty * 1.2, 3.0);
  const warp2 = fbm(tx * 2.5 + 100, ty * 2.5, 6);
  const terrain = warp1 * 0.7 + warp2 * 0.3;

  // Continental shelf threshold with smooth transition
  const coastline = smoothstep(0.44, 0.48, terrain);
  const isLand = terrain > 0.46;
  const isPolar = Math.abs(lat) > 0.82;
  const polarBlend = smoothstep(0.78, 0.88, Math.abs(lat));

  // ─── LIGHTING (Lambertian diffuse) ───
  const dotNL = nx * lightDirX + ny * lightDirY + nz * lightDirZ;
  const diffuse = clamp(dotNL, 0, 1);
  const ambient = 0.06;
  const light = ambient + diffuse * 0.94;

  // Terminator softness (glsl-math: smoothstep for soft shadow)
  const terminator = smootherstep(-0.1, 0.15, dotNL);

  let r: number, g: number, b: number;

  if (isPolar || polarBlend > 0.01) {
    // ─── POLAR ICE (turbulence for broken ice texture) ───
    const iceDetail = turbulence(u * 15, v * 15, 4);
    const iceR = 235 + iceDetail * 20;
    const iceG = 240 + iceDetail * 15;
    const iceB = 250;

    if (polarBlend >= 0.99) {
      r = iceR; g = iceG; b = iceB;
    } else {
      // Blend with whatever is underneath
      const underR = isLand ? 140 : 30;
      const underG = isLand ? 130 : 55;
      const underB = isLand ? 100 : 120;
      r = underR + (iceR - underR) * polarBlend;
      g = underG + (iceG - underG) * polarBlend;
      b = underB + (iceB - underB) * polarBlend;
    }
  } else if (isLand) {
    // ─── LAND BIOMES ───
    const elevation = (terrain - 0.46) * 8;
    const moisture = fbm(u * 12 + 20, v * 12, 5);
    const detail = fbm(u * 25 + 50, v * 25, 4); // fine surface detail
    const absLat = Math.abs(lat);

    if (absLat < 0.25) {
      // Tropical: Sahara desert (brown/tan) vs rainforest (green)
      if (moisture < 0.42) {
        // Desert - Sahara-like tan/brown (dominant in Blue Marble)
        r = 185 + detail * 30 + elevation * 15;
        g = 155 + detail * 25 + elevation * 10;
        b = 110 + detail * 15;
      } else if (moisture < 0.52) {
        // Semi-arid savanna
        r = 150 + detail * 20;
        g = 135 + detail * 25 + moisture * 20;
        b = 85 + detail * 10;
      } else {
        // Tropical forest
        r = 50 + detail * 30 + elevation * 10;
        g = 95 + moisture * 45 + detail * 20;
        b = 35 + detail * 15;
      }
    } else if (absLat < 0.5) {
      // Temperate
      if (moisture < 0.38) {
        // Steppe/dry
        r = 160 + detail * 25;
        g = 140 + detail * 20;
        b = 90 + detail * 15;
      } else {
        // Temperate forest
        r = 60 + detail * 25 + elevation * 15;
        g = 90 + moisture * 35 + detail * 20;
        b = 40 + detail * 12;
      }
    } else {
      // Tundra/boreal
      r = 110 + detail * 25 + elevation * 10;
      g = 115 + detail * 20;
      b = 95 + detail * 18;
    }

    // Mountain snow caps (high elevation)
    if (elevation > 0.35) {
      const snowBlend = smoothstep(0.35, 0.55, elevation);
      r += snowBlend * (230 - r) * 0.6;
      g += snowBlend * (235 - g) * 0.6;
      b += snowBlend * (240 - b) * 0.6;
    }

    // Coastline darkening (wet sand/mud)
    const coastDark = 1 - smoothstep(0.46, 0.5, terrain) * 0.15;
    r *= coastDark; g *= coastDark; b *= coastDark;

  } else {
    // ─── OCEAN (glsl-color: cosine palette for depth) ───
    const oceanDepth = clamp((0.46 - terrain) * 4, 0, 1);

    // Ocean cosine palette (from glsl-color: ocean preset)
    const oceanCol = cosPalette3(
      oceanDepth,
      [0.15, 0.25, 0.45],  // a: dark base
      [0.08, 0.12, 0.15],  // b: modulation amplitude
      [1.0, 0.7, 0.4],     // c: frequency
      [0.0, 0.15, 0.2]     // d: phase offset
    );

    r = oceanCol[0] * 255;
    g = oceanCol[1] * 255;
    b = oceanCol[2] * 255;

    // Ocean specular highlight (Blinn-Phong)
    const halfVec = Math.sqrt(lightDirX * lightDirX + lightDirY * lightDirY + (lightDirZ + 1) * (lightDirZ + 1));
    const hx = lightDirX / halfVec, hy = lightDirY / halfVec, hz = (lightDirZ + 1) / halfVec;
    const specDot = clamp(nx * hx + ny * hy + nz * hz, 0, 1);
    const spec = Math.pow(specDot, 80) * 0.6;
    r += spec * 200;
    g += spec * 210;
    b += spec * 220;

    // Shallow water (near coast) lighter blue-green
    const shallowBlend = smoothstep(0.42, 0.46, terrain);
    r += shallowBlend * 20;
    g += shallowBlend * 35;
    b += shallowBlend * 15;
  }

  // ─── CLOUDS (glsl-noise: domain-warped FBM for realistic swirls) ───
  // Multiple cloud layers at different altitudes and speeds
  const cloudU1 = u * 5.0 + time * 0.008;
  const cloudV1 = v * 3.5;

  // Primary cloud layer (large weather systems, cyclones)
  let cloud1 = domainWarp(cloudU1, cloudV1, 3.5);
  cloud1 = smoothstep(0.38, 0.65, cloud1);

  // Secondary wispy layer
  const cloudU2 = u * 8.0 + time * 0.012 + 100;
  const cloudV2 = v * 6.0;
  let cloud2 = fbm(cloudU2, cloudV2, 6, 2.2, 0.45);
  cloud2 = smoothstep(0.45, 0.7, cloud2) * 0.5;

  // High altitude thin cirrus
  const cloudU3 = u * 12 + time * 0.005 + 200;
  const cloudV3 = v * 8;
  let cloud3 = fbm(cloudU3, cloudV3, 4);
  cloud3 = smoothstep(0.52, 0.72, cloud3) * 0.25;

  // Combine cloud layers
  let totalCloud = clamp(cloud1 + cloud2 + cloud3, 0, 1);

  // Reduce clouds near poles (ice is already white)
  totalCloud *= (1 - polarBlend * 0.7);

  // Cloud shadow (slightly darker below clouds on land/ocean)
  const cloudShadow = 1 - totalCloud * 0.12;

  // Apply clouds: blend white over surface
  const cloudBright = 255;
  r = r * cloudShadow * (1 - totalCloud * 0.85) + cloudBright * totalCloud * 0.85;
  g = g * cloudShadow * (1 - totalCloud * 0.85) + cloudBright * totalCloud * 0.85;
  b = b * cloudShadow * (1 - totalCloud * 0.82) + (cloudBright - 5) * totalCloud * 0.82;

  // ─── APPLY LIGHTING ───
  r *= light * terminator;
  g *= light * terminator;
  b *= light * terminator;

  // Night side: very subtle blue ambient (Earth-shine)
  if (terminator < 0.5) {
    const nightAmbient = (1 - terminator * 2) * 0.04;
    r += nightAmbient * 15;
    g += nightAmbient * 20;
    b += nightAmbient * 40;
  }

  // ─── FRESNEL ATMOSPHERE (glsl-sdf: edge glow) ───
  const fresnel = Math.pow(1 - nz, 4.0);
  // Atmosphere color: blue on day side, slightly different on night
  const atmDay = terminator;
  r += fresnel * (20 + atmDay * 15);
  g += fresnel * (50 + atmDay * 30);
  b += fresnel * (140 + atmDay * 40);

  // ─── TONEMAPPING (glsl-color: ACES) ───
  r = tonemapACES(r / 255) * 255;
  g = tonemapACES(g / 255) * 255;
  b = tonemapACES(b / 255) * 255;

  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), 255];
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export const BlueMarble: React.FC = () => {
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

    // Black space
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Subtle stars
    for (let i = 0; i < 300; i++) {
      const sx = hash(i * 13 + 7) * width;
      const sy = hash(i * 29 + 3) * height;
      const sr = 0.3 + hash(i * 41) * 0.8;
      const tw = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(time * (1 + hash(i * 17)) + hash(i * 53) * TAU));
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, TAU);
      ctx.fillStyle = `rgba(220,225,255,${tw * 0.3})`;
      ctx.fill();
    }

    // Earth parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const earthRadius = Math.min(width, height) * 0.42; // Fill most of the frame

    // Light direction (upper-right, matching the Blue Marble photo)
    const lightAngle = -0.4;
    const lightElev = 0.3;
    const lx = Math.sin(lightAngle) * Math.cos(lightElev);
    const ly = -Math.sin(lightElev);
    const lz = Math.cos(lightAngle) * Math.cos(lightElev);

    // Adaptive sampling: higher resolution when Earth is large
    const step = earthRadius > 300 ? 1 : earthRadius > 150 ? 2 : 3;
    const iR = Math.ceil(earthRadius) + 10; // +10 for atmosphere fringe
    const sampledW = Math.ceil((iR * 2) / step);
    const sampledH = Math.ceil((iR * 2) / step);

    const imgData = ctx.createImageData(sampledW, sampledH);
    const data = imgData.data;

    for (let sy = 0; sy < sampledH; sy++) {
      for (let sx = 0; sx < sampledW; sx++) {
        const px = sx * step - iR;
        const py = sy * step - iR;
        const pixel = earthPixel(px, py, earthRadius, time, lx, ly, lz);
        const idx = (sy * sampledW + sx) * 4;
        if (pixel) {
          data[idx] = pixel[0];
          data[idx + 1] = pixel[1];
          data[idx + 2] = pixel[2];
          data[idx + 3] = pixel[3];
        }
      }
    }

    // Draw upscaled
    const off = new OffscreenCanvas(sampledW, sampledH);
    const offCtx = off.getContext('2d')!;
    offCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, centerX - iR, centerY - iR, iR * 2, iR * 2);
    ctx.restore();

    // ─── OUTER ATMOSPHERE GLOW (extra pass with gradient) ───
    const atmGrad = ctx.createRadialGradient(
      centerX, centerY, earthRadius * 0.98,
      centerX, centerY, earthRadius * 1.15
    );
    atmGrad.addColorStop(0, 'rgba(70,130,230,0.08)');
    atmGrad.addColorStop(0.5, 'rgba(50,100,200,0.03)');
    atmGrad.addColorStop(1, 'rgba(30,60,150,0)');
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, earthRadius * 1.15, 0, TAU);
    ctx.fill();

    // Fade in/out
    const fade = interpolate(frame, [0, 30, 870, 900], [1, 0, 0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    if (fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, width, height);
    }

  }, [frame, fps, width, height, time]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};
