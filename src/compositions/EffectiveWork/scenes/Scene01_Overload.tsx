/* ══════ SCENE 1 — OVERLOAD BOARD (REDESIGNED) ══════
 * Duration: 10s (300f @ 30fps)
 * Hero centered with flexbox, boxes scattered with random micro-motion
 * Tech-style: scan line, subtle grid, random jitter driven by frame math
 */
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { C, W, H, FONT } from '../constants';
import { springSnapIn, staggerSnapIn, maskRevealH, chipPop } from '../motion/primitives';

gsap.registerPlugin(useGSAP, DrawSVGPlugin);
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ─── Scattered clutter data ─── */
const clutter = [
  // Tab cards — spread across top and sides
  { type: 'tab', x: 180, y: 140, w: 150, h: 38, label: 'Q3 REPORT', color: C.white },
  { type: 'tab', x: 460, y: 100, w: 130, h: 38, label: 'BUDGET', color: C.white },
  { type: 'tab', x: 780, y: 160, w: 160, h: 38, label: 'FEEDBACK', color: C.white },
  { type: 'tab', x: 1140, y: 110, w: 140, h: 38, label: 'HIRING', color: C.white },
  { type: 'tab', x: 1420, y: 150, w: 170, h: 38, label: 'ROADMAP', color: C.white },
  { type: 'tab', x: 1700, y: 120, w: 130, h: 38, label: 'METRICS', color: C.white },
  // Task chips — left and right edges
  { type: 'task', x: 130, y: 380, w: 140, h: 30, label: 'REVIEW PR', color: C.gray },
  { type: 'task', x: 155, y: 440, w: 150, h: 30, label: 'UPDATE DOCS', color: C.gray },
  { type: 'task', x: 120, y: 500, w: 130, h: 30, label: 'FIX DEPLOY', color: C.gray },
  { type: 'task', x: 140, y: 560, w: 160, h: 30, label: 'WRITE TESTS', color: C.gray },
  { type: 'task', x: 1750, y: 370, w: 150, h: 30, label: 'SEND BRIEF', color: C.gray },
  { type: 'task', x: 1770, y: 430, w: 170, h: 30, label: 'APPROVE DESIGN', color: C.gray },
  { type: 'task', x: 1740, y: 490, w: 160, h: 30, label: 'SCHEDULE SYNC', color: C.gray },
  { type: 'task', x: 1760, y: 550, w: 140, h: 30, label: 'CHECK SLACK', color: C.gray },
  // Message pills — scattered at bottom and sides
  { type: 'msg', x: 220, y: 700, w: 170, h: 28, label: 'CAN WE TALK?', color: C.gray },
  { type: 'msg', x: 170, y: 760, w: 180, h: 28, label: 'URGENT: DEPLOY', color: C.red },
  { type: 'msg', x: 250, y: 820, w: 160, h: 28, label: 'QUICK QUESTION', color: C.gray },
  { type: 'msg', x: 500, y: 880, w: 150, h: 28, label: 'FYI ATTACHED', color: C.gray },
  { type: 'msg', x: 780, y: 910, w: 130, h: 28, label: 'THOUGHTS?', color: C.gray },
  { type: 'msg', x: 1100, y: 890, w: 140, h: 28, label: 'PLS REVIEW', color: C.gray },
  { type: 'msg', x: 1380, y: 870, w: 170, h: 28, label: 'MEETING MOVED', color: C.gray },
  { type: 'msg', x: 1650, y: 720, w: 150, h: 28, label: 'NEED INPUT', color: C.gray },
  { type: 'msg', x: 1700, y: 780, w: 140, h: 28, label: 'STATUS?', color: C.gray },
  { type: 'msg', x: 1680, y: 840, w: 160, h: 28, label: 'EOD PLEASE', color: C.red },
];

/* Deterministic pseudo-random per element */
const rand = (seed: number) => ((Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

export const Scene01_Overload: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const sec = frame / fps;
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    /* Hero snap-in at 0.2s */
    springSnapIn(tl, '.s1-hero', 0.2);

    /* Clutter accumulates 0.6–2.2s staggered */
    staggerSnapIn(tl, '.s1-clutter', 0.6, 0.05);

    /* Surprise: URGENT flashes at 2.8s */
    tl.fromTo('.s1-urgent-pulse',
      { opacity: 0, scale: 1.5, border: `2px solid ${C.red}` },
      { opacity: 1, scale: 1, duration: 0.2, ease: 'power4.out', stagger: 0.05 },
      2.8
    );
    tl.to('.s1-urgent-pulse', { opacity: 0, duration: 0.3, ease: 'power4.in' }, 3.2);

    /* Support text mask reveal at 4.0s */
    maskRevealH(tl, '.s1-support', 4.0, 0.6);

    /* Section labels */
    chipPop(tl, '.s1-label', 4.6);

    /* EXIT: Clutter compresses inward 8.5s */
    tl.to('.s1-clutter', {
      x: W / 2, y: H / 2, scale: 0, opacity: 0, duration: 0.8, ease: 'power4.in',
      stagger: { each: 0.015, from: 'random' },
    }, 8.5);
    tl.to('.s1-hero', { opacity: 0, duration: 0.2 }, 9.4);
    tl.to('.s1-support', { opacity: 0, duration: 0.15 }, 9.2);
    tl.to('.s1-label', { opacity: 0, duration: 0.15 }, 9.0);

  }, { scope: containerRef });

  useIsomorphicLayoutEffect(() => {
    if (tlRef.current) tlRef.current.seek(sec);
  }, [sec]);

  /* Tech scan line position */
  const scanY = (sec * 120) % (H + 40) - 20;

  return (
    <div ref={containerRef} style={{ width: W, height: H, position: 'relative', background: C.black, overflow: 'hidden' }}>

      {/* Tech background: subtle grid */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`gh-${i}`} x1={0} y1={i * 54} x2={W} y2={i * 54} stroke={C.white} strokeWidth={0.5} />
        ))}
        {Array.from({ length: 36 }).map((_, i) => (
          <line key={`gv-${i}`} x1={i * 54} y1={0} x2={i * 54} y2={H} stroke={C.white} strokeWidth={0.5} />
        ))}
      </svg>

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, top: scanY, width: W, height: 2,
        background: `linear-gradient(90deg, transparent, ${C.white}22, transparent)`,
        zIndex: 50,
      }} />

      {/* Scattered clutter elements with random micro-motion */}
      {clutter.map((c, i) => {
        const dx = Math.sin(sec * (0.8 + rand(i) * 1.2) + i * 1.3) * (4 + rand(i + 10) * 6);
        const dy = Math.cos(sec * (0.6 + rand(i + 5) * 1.0) + i * 0.9) * (3 + rand(i + 20) * 5);
        const rot = Math.sin(sec * 0.5 + i * 2.1) * (1 + rand(i) * 2);
        return (
          <div key={`cl-${i}`} className="s1-clutter" style={{
            position: 'absolute',
            left: c.x - c.w / 2 + dx, top: c.y - c.h / 2 + dy,
            width: c.w, height: c.h,
            border: `1px solid ${c.color}40`,
            borderRadius: c.type === 'task' ? 3 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transform: `rotate(${rot}deg)`,
          }}>
            <span style={{
              fontFamily: FONT.label, fontSize: c.type === 'tab' ? 10 : 9,
              color: c.color === C.red ? C.red : `${C.gray}99`,
              letterSpacing: 2, fontWeight: c.color === C.red ? 700 : 500,
            }}>
              {c.label}
            </span>
          </div>
        );
      })}

      {/* URGENT surprise pulse */}
      {[[-120, -50], [120, -50], [-80, 70], [80, 70]].map(([dx, dy], i) => (
        <div key={`urg-${i}`} className="s1-urgent-pulse" style={{
          position: 'absolute',
          left: W / 2 - 50 + dx, top: H / 2 + 70 + dy,
          padding: '3px 10px', border: `1.5px solid ${C.red}`, borderRadius: 2,
          opacity: 0, zIndex: 20,
        }}>
          <span style={{ fontFamily: FONT.label, fontSize: 11, color: C.red, letterSpacing: 4, fontWeight: 700 }}>
            URGENT
          </span>
        </div>
      ))}

      {/* Section labels */}
      {[
        { text: 'TABS', x: W / 2 - 340, y: 75 },
        { text: 'TASKS', x: 70, y: 340 },
        { text: 'MESSAGES', x: W / 2 - 50, y: H - 65 },
      ].map((l, i) => (
        <div key={`lbl-${i}`} className="s1-label" style={{
          position: 'absolute', left: l.x, top: l.y, opacity: 0, zIndex: 5,
        }}>
          <span style={{ fontFamily: FONT.label, fontSize: 10, color: `${C.gray}77`, letterSpacing: 8 }}>
            {l.text}
          </span>
        </div>
      ))}

      {/* ═══ HERO TEXT — centered with flexbox ═══ */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, pointerEvents: 'none',
      }}>
        <div className="s1-hero" style={{
          maxWidth: '50%',
          fontFamily: FONT.hero, fontWeight: 900, fontSize: 58,
          color: C.white, textTransform: 'uppercase',
          letterSpacing: -1, lineHeight: 1.12, textAlign: 'center',
          opacity: 0,
        }}>
          MOST PEOPLE ARE NOT BAD AT WORK.
        </div>
      </div>

      {/* ═══ SUPPORT TEXT ═══ */}
      <div className="s1-support" style={{
        position: 'absolute',
        left: '50%', top: '72%', transform: 'translateX(-50%)',
        width: '52%',
        fontFamily: FONT.support, fontWeight: 600, fontSize: 22,
        color: C.gray, textTransform: 'uppercase',
        letterSpacing: 2, lineHeight: 1.5, textAlign: 'center',
        opacity: 0, zIndex: 10,
        clipPath: 'inset(0 100% 0 0)',
      }}>
        THEY ARE JUST DROWNING IN TOO MANY TABS, TOO MANY TASKS, TOO MANY MESSAGES.
      </div>
    </div>
  );
};
