/* 3D Math with proper LookAt Camera */

export interface Vec3 { x: number; y: number; z: number; }

export function vec3(x: number, y: number, z: number): Vec3 { return { x, y, z }; }

function vSub(a: Vec3, b: Vec3): Vec3 { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function vAdd(a: Vec3, b: Vec3): Vec3 { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function vScale(a: Vec3, s: number): Vec3 { return { x: a.x * s, y: a.y * s, z: a.z * s }; }
function vDot(a: Vec3, b: Vec3): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
function vCross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function vNorm(a: Vec3): Vec3 {
  const l = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
  return l > 0.0001 ? { x: a.x / l, y: a.y / l, z: a.z / l } : { x: 0, y: 0, z: 1 };
}

export interface Camera {
  pos: Vec3;
  fwd: Vec3;
  right: Vec3;
  up: Vec3;
  fov: number;
}

// Build a camera looking from `pos` toward `target`
export function lookAt(pos: Vec3, target: Vec3, fov: number): Camera {
  const fwd = vNorm(vSub(target, pos));
  const worldUp = vec3(0, 1, 0);
  const right = vNorm(vCross(fwd, worldUp));
  const up = vCross(right, fwd);
  return { pos, fwd, right, up, fov };
}

export interface Projected { x: number; y: number; scale: number; depth: number; }

// Project world point to screen using camera
export function project(p: Vec3, cam: Camera, w: number, h: number): Projected {
  const rel = vSub(p, cam.pos);
  const depth = vDot(rel, cam.fwd);
  if (depth < 1) return { x: -9999, y: -9999, scale: 0, depth };
  const sx = vDot(rel, cam.right);
  const sy = vDot(rel, cam.up);
  const scale = cam.fov / depth;
  return {
    x: w / 2 + sx * scale,
    y: h / 2 - sy * scale,
    scale,
    depth,
  };
}

export function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
export function smoothstep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}
export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
