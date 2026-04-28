/* ═══════════════════════════════════════════════════════════
   GLITCH UTILITIES — Deterministic per-frame FX engine
   All functions are PURE: same frame → same output (render-safe)
   ═══════════════════════════════════════════════════════════ */

/**
 * Seeded pseudo-random — deterministic per frame.
 * Same seed always produces the same value ∈ [0, 1).
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Multi-value seeded random — returns N values for a given frame.
 */
export function seededRandomN(seed: number, count: number): number[] {
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    values.push(seededRandom(seed + i * 1337.7));
  }
  return values;
}

/**
 * RGB Split — returns per-channel pixel offsets for glitch text.
 * intensity: typical range 0–20 (pixels).
 */
export function rgbSplit(frame: number, intensity: number) {
  return {
    r: {
      x: (seededRandom(frame * 3.1) - 0.5) * intensity * 2,
      y: (seededRandom(frame * 7.3) - 0.5) * intensity * 2,
    },
    g: {
      x: (seededRandom(frame * 5.7) - 0.5) * intensity * 2,
      y: (seededRandom(frame * 11.2) - 0.5) * intensity * 2,
    },
    b: {
      x: (seededRandom(frame * 13.9) - 0.5) * intensity * 2,
      y: (seededRandom(frame * 17.1) - 0.5) * intensity * 2,
    },
  };
}

/**
 * Screen shake — decaying oscillation after a trigger frame.
 * Returns {x, y} offset in pixels.
 */
export function screenShake(
  frame: number,
  triggerFrame: number,
  intensity: number,
  duration: number = 10
): { x: number; y: number } {
  const diff = frame - triggerFrame;
  if (diff < 0 || diff > duration) return { x: 0, y: 0 };
  const decay = Math.exp(-diff * 0.25);
  return {
    x: Math.sin(diff * 13.7) * intensity * decay,
    y: Math.cos(diff * 17.3) * intensity * decay,
  };
}

/**
 * Strobe — returns opacity value (0.05 or 1) synced to BPM.
 */
export function strobe(frame: number, bpm: number = 140): number {
  const beat = (frame / 30) * (bpm / 60);
  return Math.sin(beat * Math.PI * 4) > 0.3 ? 1 : 0.05;
}

/**
 * Simulated bass amplitude — sharp attack, fast decay.
 * Returns 0–1. Peaks every ~0.43s at 140 BPM.
 */
export function bassAmplitude(frame: number, bpm: number = 140): number {
  const t = frame / 30;
  const beat = (t * bpm / 60) % 1;
  return Math.pow(Math.max(0, 1 - beat * 3), 2);
}

/**
 * Scanline Y position — moves top-to-bottom continuously.
 */
export function scanlineY(frame: number, speed: number = 3): number {
  return (frame * speed) % 1080;
}

/**
 * Jitter — returns random offset for a specific element at a specific frame.
 * Uses element index as part of the seed for per-element variation.
 */
export function jitter(
  frame: number,
  elementIndex: number,
  intensity: number,
  frequency: number = 3
): { x: number; y: number } {
  // Only change every `frequency` frames for that choppy look
  const quantizedFrame = Math.floor(frame / frequency) * frequency;
  const seed = quantizedFrame * 100 + elementIndex;
  return {
    x: (seededRandom(seed) - 0.5) * intensity * 2,
    y: (seededRandom(seed + 500) - 0.5) * intensity * 2,
  };
}
