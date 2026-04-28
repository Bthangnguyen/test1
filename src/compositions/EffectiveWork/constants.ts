/* ══════ EFFECTIVE WORK — CONSTANTS ══════ */

export const C = {
  white: '#FFFFFF',
  gray: '#8E8E93',
  yellow: '#FFD84D',
  red: '#FF3B30',
  black: '#000000',
} as const;

export const FONT = {
  hero: "'Inter Tight', 'Inter', sans-serif",
  support: "'Inter Tight', 'Inter', sans-serif",
  label: "'Inter Tight', 'Inter', sans-serif",
} as const;

export const W = 1920;
export const H = 1080;
export const CX = W / 2;
export const CY = H / 2;

/* Safe zones */
export const SAFE = {
  padX: W * 0.08,   // 153.6
  padY: H * 0.09,   // 97.2
  heroMinX: W * 0.14,
  heroMaxX: W * 0.86,
  heroMinY: H * 0.18,
  heroMaxY: H * 0.82,
};

/* Scene frame counts @ 30fps */
export const SCENES = {
  s01: 300,   // 10s 0f
  s02: 255,   // 8s 15f
  s03: 330,   // 11s 0f
  s04: 300,   // 10s 0f
  s05: 315,   // 10s 15f
  s06: 300,   // 10s 0f
  s07: 285,   // 9s 15f
  s08: 255,   // 8s 15f
  s09: 360,   // 12s 0f
  s10: 225,   // 7s 15f
  s11: 285,   // 9s 15f
  s12: 390,   // 13s 0f
  s13: 255,   // 8s 15f
  s14: 330,   // 11s 0f
  s15: 360,   // 12s 0f
  s16: 300,   // 10s 0f
  s17: 360,   // 12s 0f
  s18: 420,   // 14s 0f
} as const;

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0);
export const FPS = 30;

/* Hero text style presets */
export const HERO_STYLE: React.CSSProperties = {
  fontFamily: FONT.hero,
  fontWeight: 900,
  fontSize: 64,
  color: C.white,
  textTransform: 'uppercase' as const,
  letterSpacing: -1,
  lineHeight: 1.1,
  textAlign: 'center' as const,
};

export const SUPPORT_STYLE: React.CSSProperties = {
  fontFamily: FONT.support,
  fontWeight: 600,
  fontSize: 28,
  color: C.gray,
  textTransform: 'uppercase' as const,
  letterSpacing: 2,
  lineHeight: 1.4,
  textAlign: 'center' as const,
};

export const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT.label,
  fontWeight: 600,
  fontSize: 14,
  color: C.gray,
  textTransform: 'uppercase' as const,
  letterSpacing: 6,
  lineHeight: 1,
};

import React from 'react';
