/* Camera: Wide orbit → Earth Zoom → Close-up → Pull back
   Now returns camera pos + lookAt target for proper LookAt camera */

import { Vec3, vec3, lerp, smoothstep, lookAt, Camera } from './math3d';
import { PLANETS, getPlanetPos } from './planets';

export function getCamera(time: number, w: number, h: number): Camera {
  // Phase 1: Wide orbit around the system (0–12s)
  if (time < 12) {
    const a = time * 0.2;
    const pos = vec3(Math.sin(a) * 200, 120, Math.cos(a) * 200);
    return lookAt(pos, vec3(0, 0, 0), 800);
  }

  // Phase 2: Zoom into Earth (12–18s)
  if (time < 18) {
    const t = smoothstep(0, 1, (time - 12) / 6);
    const wideA = 12 * 0.2;
    const widePos = vec3(Math.sin(wideA) * 200, 120, Math.cos(wideA) * 200);

    const earthPos = getPlanetPos(PLANETS[2], 2, time);
    const closePos = vec3(earthPos.x + 15, earthPos.y + 5, earthPos.z + 20);
    const earthTarget = vec3(earthPos.x, earthPos.y, earthPos.z);

    const pos = vec3(lerp(widePos.x, closePos.x, t), lerp(widePos.y, closePos.y, t), lerp(widePos.z, closePos.z, t));
    const target = vec3(lerp(0, earthTarget.x, t), lerp(0, earthTarget.y, t), lerp(0, earthTarget.z, t));
    return lookAt(pos, target, lerp(800, 1200, t));
  }

  // Phase 3: Close-up orbit around Earth (18–26s)
  if (time < 26) {
    const earthPos = getPlanetPos(PLANETS[2], 2, time);
    const orbitA = (time - 18) * 0.5;
    const pos = vec3(
      earthPos.x + Math.cos(orbitA) * 15,
      earthPos.y + 4 + Math.sin(time * 0.4) * 2,
      earthPos.z + Math.sin(orbitA) * 15
    );
    return lookAt(pos, vec3(earthPos.x, earthPos.y, earthPos.z), 1200);
  }

  // Phase 4: Pull back (26–30s)
  const t = smoothstep(0, 1, (time - 26) / 4);
  const earthPos = getPlanetPos(PLANETS[2], 2, time);
  const pos = vec3(lerp(earthPos.x + 12, 0, t), lerp(5, 150, t), lerp(earthPos.z + 15, 250, t));
  const target = vec3(lerp(earthPos.x, 0, t), 0, lerp(earthPos.z, 0, t));
  return lookAt(pos, target, lerp(1200, 800, t));
}
