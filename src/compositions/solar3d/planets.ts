/* Planet definitions for the Solar System */

export interface PlanetDef {
  name: string;
  orbit: number;      // orbital radius (world units)
  size: number;        // planet radius (world units)
  color: string;       // base hex color
  period: number;      // orbital period relative to Earth=1
  moons: number;
  hasRing?: boolean;
  tilt?: number;       // axial tilt for visual
}

export const PLANETS: PlanetDef[] = [
  { name: 'Mercury',  orbit: 18,  size: 1.2,  color: '#b0b0b0', period: 0.24,  moons: 0 },
  { name: 'Venus',    orbit: 28,  size: 2.0,  color: '#e8c56d', period: 0.62,  moons: 0 },
  { name: 'Earth',    orbit: 40,  size: 2.1,  color: '#4a9eff', period: 1.0,   moons: 1, tilt: 23.5 },
  { name: 'Mars',     orbit: 52,  size: 1.6,  color: '#d45533', period: 1.88,  moons: 2 },
  { name: 'Jupiter',  orbit: 75,  size: 5.5,  color: '#c8a55a', period: 11.86, moons: 4 },
  { name: 'Saturn',   orbit: 95,  size: 4.5,  color: '#e8d48b', period: 29.46, moons: 3, hasRing: true },
  { name: 'Uranus',   orbit: 115, size: 3.0,  color: '#7ec8d4', period: 84.01, moons: 2 },
  { name: 'Neptune',  orbit: 135, size: 2.8,  color: '#3355cc', period: 164.8, moons: 1 },
];

// Get planet 3D position at a given time
export function getPlanetPos(planet: PlanetDef, idx: number, time: number) {
  const speedMul = (2 * Math.PI) / 6.0; // 1 Earth year = 6 seconds
  const angle = (time * speedMul) / planet.period + idx * 1.37; // offset per planet
  return {
    x: Math.cos(angle) * planet.orbit,
    y: 0,
    z: Math.sin(angle) * planet.orbit,
    angle,
  };
}
