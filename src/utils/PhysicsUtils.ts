/* ═══════════════════════════════════════════════════════════
   PHYSICS UTILS — "The Architecture of Thought"
   Pure, deterministic math functions. No Math.random().
   ═══════════════════════════════════════════════════════════ */

/** Deterministic pseudo-random from seed (same as glitch.ts) */
export function seededRandom(seed: number): number {
  const s = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Manual expo.inOut easing: stillness → sudden state change */
export function expoInOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < 0.5) {
    return Math.pow(2, 20 * t - 10) / 2;
  }
  return (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/** Manual power4.out easing: explosive start, hard settle */
export function power4Out(t: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
}

/** Manual back.out easing with overshoot */
export function backOut(t: number, overshoot = 1.7): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 + (overshoot + 1) * Math.pow(c - 1, 3) + overshoot * Math.pow(c - 1, 2);
}

/** Shockwave ring parameters at given frame */
export function shockwave(
  frame: number,
  triggerFrame: number,
  maxRadius: number,
  duration: number
): { radius: number; opacity: number } {
  const diff = frame - triggerFrame;
  if (diff < 0 || diff > duration) return { radius: 0, opacity: 0 };
  const t = diff / duration;
  const eased = power4Out(t);
  return {
    radius: eased * maxRadius,
    opacity: (1 - eased) * 0.7,
  };
}

/** Damped oscillation — for heartbeat/noise line */
export function dampedOscillation(
  x: number,
  freq: number,
  amplitude: number,
  phase: number
): number {
  return Math.sin(x * freq + phase) * amplitude;
}

/** Multi-layer noise for organic feel */
export function layeredNoise(
  x: number,
  frame: number,
  amplitude: number
): number {
  return (
    Math.sin(x * 0.02 + frame * 0.08) * amplitude * 0.5 +
    Math.sin(x * 0.05 + frame * 0.12) * amplitude * 0.3 +
    Math.sin(x * 0.11 + frame * 0.05) * amplitude * 0.2 +
    seededRandom(Math.floor(x * 0.1) + frame * 7) * amplitude * 0.4 -
    amplitude * 0.2
  );
}

/** Screen shake — decaying oscillation */
export function screenShake(
  frame: number,
  triggerFrame: number,
  intensity: number,
  duration: number
): { x: number; y: number } {
  const diff = frame - triggerFrame;
  if (diff < 0 || diff > duration) return { x: 0, y: 0 };
  const decay = Math.exp(-diff * 0.3);
  return {
    x: Math.sin(diff * 13.7) * intensity * decay,
    y: Math.cos(diff * 17.3) * intensity * decay,
  };
}

/** Simple gravity physics step */
export function gravityStep(
  y: number,
  vy: number,
  g: number,
  dt = 1
): { y: number; vy: number } {
  const newVy = vy + g * dt;
  const newY = y + newVy * dt;
  return { y: newY, vy: newVy };
}

/** Collision bounce — invert velocity with damping */
export function collisionBounce(
  vy: number,
  restitution = 0.65
): number {
  return -vy * restitution;
}
