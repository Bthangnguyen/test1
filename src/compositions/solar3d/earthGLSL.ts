/* EARTH RENDERER — GLSL-quality per-pixel rendering on Canvas 2D
   Uses: Spherical Mapping, FBM Noise, Domain Warping, Cosine Palette
   From skills: glsl-noise, glsl-coordinates, glsl-color */

// ═══ NOISE ENGINE (from glsl-noise skill) ═══
function hash2(x: number, y: number): number {
  return ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 + 1) % 1;
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// FBM (from glsl-noise skill: fbm recipe)
function fbm(x: number, y: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq);
    freq *= 2.0; amp *= 0.5;
  }
  return val;
}

// Domain Warp (from glsl-noise skill: domainWarp recipe)
function domainWarp(x: number, y: number): number {
  const qx = fbm(x, y, 4);
  const qy = fbm(x + 5.2, y + 1.3, 4);
  return fbm(x + 4 * qx, y + 4 * qy, 4);
}

// Cosine palette (from glsl-color skill)
function cosPal(t: number, a: number, b: number, c: number, d: number): number {
  return a + b * Math.cos(6.28318 * (c * t + d));
}

interface EarthPixelResult { r: number; g: number; b: number; a: number; }

// ═══ COMPUTE SINGLE EARTH PIXEL ═══
// Maps screen pixel -> sphere UV -> terrain/ocean/cloud/atmosphere
function computeEarthPixel(
  sx: number, sy: number, // screen coords relative to Earth center
  earthR: number,         // screen radius
  time: number
): EarthPixelResult | null {
  // Normalize to [-1, 1] within sphere
  const nx = sx / earthR, ny = sy / earthR;
  const distSq = nx * nx + ny * ny;
  if (distSq > 1.0) {
    // Atmosphere fringe
    const d = Math.sqrt(distSq);
    if (d < 1.3) {
      const atm = (1 - (d - 1) / 0.3);
      return { r: 60 * atm, g: 140 * atm, b: 255 * atm, a: atm * atm * 0.4 * 255 };
    }
    return null;
  }

  // Sphere normal (from glsl-coordinates: spherical mapping)
  const nz = Math.sqrt(1 - distSq);

  // Spherical UV (from glsl-coordinates: toSpherical + equirectangular)
  const theta = Math.acos(ny); // polar angle
  const phi = Math.atan2(nx, nz); // azimuthal

  // Rotate with time (Earth rotation)
  const u = (phi / (2 * Math.PI) + 0.5 + time * 0.03) % 1;
  const v = theta / Math.PI;

  // ═══ TERRAIN (FBM + Domain Warping from glsl-noise skill) ═══
  const terrainScale = 5.0;
  const terrain = domainWarp(u * terrainScale, v * terrainScale);
  const isLand = terrain > 0.48;
  const isIce = v < 0.1 || v > 0.9;

  // ═══ COLOR ═══
  let r: number, g: number, b: number;

  if (isIce) {
    // Polar ice caps
    r = 220 + fbm(u * 8, v * 8, 3) * 30;
    g = 230 + fbm(u * 8 + 10, v * 8, 3) * 20;
    b = 245;
  } else if (isLand) {
    // Land: varies by latitude (tropical=green, desert=tan, tundra=grey)
    const latFactor = Math.abs(v - 0.5) * 2; // 0=equator, 1=pole
    const elevation = (terrain - 0.48) * 10;
    const moisture = fbm(u * 10 + 20, v * 10, 3);

    if (latFactor < 0.3 && moisture > 0.4) {
      // Tropical forest
      r = 20 + elevation * 15;
      g = 90 + moisture * 60 + elevation * 10;
      b = 20 + elevation * 5;
    } else if (latFactor < 0.5) {
      // Temperate
      r = 60 + elevation * 30;
      g = 100 + moisture * 40;
      b = 30 + elevation * 10;
    } else if (moisture < 0.35) {
      // Desert
      r = 180 + elevation * 20;
      g = 150 + elevation * 15;
      b = 80 + elevation * 10;
    } else {
      // Tundra
      r = 100 + elevation * 20;
      g = 110 + elevation * 15;
      b = 90 + elevation * 10;
    }

    // Mountain highlights (high elevation)
    if (elevation > 0.3) {
      const mtn = (elevation - 0.3) * 3;
      r += mtn * 60; g += mtn * 55; b += mtn * 50;
    }
  } else {
    // Ocean: depth-based color (cosine palette from glsl-color skill)
    const depth = (0.48 - terrain) * 5;
    r = cosPal(depth, 10, 15, 1.0, 0.6) * 0.8;
    g = cosPal(depth, 40, 40, 0.8, 0.4);
    b = cosPal(depth, 120, 60, 0.6, 0.2);

    // Ocean specular highlight
    const specAngle = nx * 0.5 + ny * 0.3 + nz * 0.8;
    if (specAngle > 0.85) {
      const spec = (specAngle - 0.85) * 6;
      r += spec * 80; g += spec * 90; b += spec * 100;
    }
  }

  // ═══ CLOUDS (separate FBM layer, from glsl-noise: cloud recipe) ═══
  const cloudU = u * 6 + time * 0.01;
  const cloudV = v * 4;
  let cloud = fbm(cloudU, cloudV, 6);
  cloud = Math.max(0, (cloud - 0.35) * 3); // threshold like smoothstep
  r = r * (1 - cloud * 0.7) + 255 * cloud * 0.7;
  g = g * (1 - cloud * 0.7) + 255 * cloud * 0.7;
  b = b * (1 - cloud * 0.7) + 255 * cloud * 0.7;

  // ═══ DAY/NIGHT TERMINATOR ═══
  const sunDir = nx * 0.7 + nz * 0.7; // simplified sun direction
  const daylight = Math.max(0, Math.min(1, sunDir * 2 + 0.3));
  const nightFactor = 1 - daylight;

  r *= (daylight * 0.85 + 0.15);
  g *= (daylight * 0.85 + 0.15);
  b *= (daylight * 0.85 + 0.15);

  // ═══ CITY LIGHTS on night side ═══
  if (nightFactor > 0.3 && isLand && !isIce) {
    const cityNoise = fbm(u * 30, v * 30, 3);
    if (cityNoise > 0.6) {
      const cityBright = (cityNoise - 0.6) * 8 * nightFactor;
      r += cityBright * 255;
      g += cityBright * 200;
      b += cityBright * 80;
    }
  }

  // ═══ FRESNEL (atmosphere edge glow, from glsl-sdf: edge detection) ═══
  const fresnel = Math.pow(1 - nz, 3);
  r += fresnel * 30;
  g += fresnel * 80;
  b += fresnel * 180;

  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b)),
    a: 255,
  };
}

// ═══ MAIN RENDER FUNCTION ═══
export function renderEarthGLSL(
  ctx: CanvasRenderingContext2D,
  centerX: number, centerY: number,
  screenRadius: number, time: number
) {
  if (screenRadius < 3) return;

  // For large radii, sample every Nth pixel for performance
  const step = screenRadius > 200 ? 2 : screenRadius > 100 ? 3 : 4;
  const r = Math.ceil(screenRadius);
  const size = r * 2 + 1;
  const sampledW = Math.ceil(size / step);
  const sampledH = Math.ceil(size / step);

  const imgData = ctx.createImageData(sampledW, sampledH);
  const data = imgData.data;

  for (let sy = 0; sy < sampledH; sy++) {
    for (let sx = 0; sx < sampledW; sx++) {
      const px = (sx * step - r);
      const py = (sy * step - r);
      const pixel = computeEarthPixel(px, py, screenRadius, time);

      const idx = (sy * sampledW + sx) * 4;
      if (pixel) {
        data[idx] = pixel.r;
        data[idx + 1] = pixel.g;
        data[idx + 2] = pixel.b;
        data[idx + 3] = pixel.a;
      }
      // else: transparent
    }
  }

  // Scale up sampled image
  const off = new OffscreenCanvas(sampledW, sampledH);
  const offCtx = off.getContext('2d')!;
  offCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(off, centerX - r, centerY - r, size, size);
  ctx.restore();
}
