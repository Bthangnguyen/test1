/* ══════ SCENE 2 — EXHAUSTED / UNSURE (REDESIGNED) ══════
 * Duration: 8s15f (255f @ 30fps)
 * Unified diagnostic panel: meter + dots + labels all connected
 * Visual concept: One centered energy-drain dashboard
 */
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { C, W, H, CX, CY, FONT } from '../constants';
import { springSnapIn, fadeUpWeighted } from '../motion/primitives';

gsap.registerPlugin(useGSAP, DrawSVGPlugin);
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const Scene02_Exhausted: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const sec = frame / fps;
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  /* Layout constants */
  const panelX = CX;
  const panelY = CY + 30;
  const panelW = 600;
  const panelH = 260;
  const meterY = panelY - 30;
  const meterX1 = panelX - panelW / 2 + 40;
  const meterX2 = panelX + panelW / 2 - 40;
  const dotsY = panelY + 50;

  useGSAP(() => {
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    /* Panel frame draws on 0.2s */
    tl.set('.s2-panel-frame', { drawSVG: '0% 0%', opacity: 0.4 }, 0);
    tl.to('.s2-panel-frame', { drawSVG: '0% 100%', duration: 0.6, ease: 'power2.out' }, 0.2);

    /* Hero snap-in at 0.4s — above panel */
    springSnapIn(tl, '.s2-hero', 0.4);

    /* Meter background line at 0.8s */
    tl.set('.s2-meter-bg', { drawSVG: '0% 0%', opacity: 0.3 }, 0.5);
    tl.to('.s2-meter-bg', { drawSVG: '0% 100%', duration: 0.5, ease: 'power2.out' }, 0.8);

    /* Meter fill drains: starts full, shrinks to 20% (linear-mechanical) */
    tl.set('.s2-meter-fill', { opacity: 0.9 }, 1.0);
    tl.fromTo('.s2-meter-fill',
      { drawSVG: '0% 100%' },
      { drawSVG: '0% 18%', duration: 1.8, ease: 'linear' },
      1.3
    );

    /* "ENERGY DOWN" label appears as meter drains */
    tl.fromTo('.s2-label-energy',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' },
      2.0
    );

    /* Connector line between meter and dots */
    tl.set('.s2-connector', { drawSVG: '0% 0%', opacity: 0.2 }, 2.5);
    tl.to('.s2-connector', { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out' }, 2.8);

    /* Progress dots appear connected along bottom of panel */
    tl.fromTo('.s2-dot',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2)', stagger: 0.15 },
      3.0
    );
    /* Dot labels */
    tl.fromTo('.s2-dot-label',
      { opacity: 0 },
      { opacity: 0.5, duration: 0.2, stagger: 0.15 },
      3.2
    );

    /* "PROGRESS UNCLEAR" label */
    tl.fromTo('.s2-label-progress',
      { opacity: 0, x: 10 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' },
      3.5
    );

    /* Support text fade-up at 3.8s */
    fadeUpWeighted(tl, '.s2-support', 3.8);

    /* SURPRISE at 5.0s: all 3 dots light up, then 2 die */
    tl.to('.s2-dot', { fill: C.white, opacity: 1, duration: 0.15, ease: 'power2.out' }, 5.0);
    tl.to('.s2-dot-1, .s2-dot-2', { fill: `${C.gray}44`, opacity: 0.2, duration: 0.25, ease: 'power2.in' }, 5.3);
    /* Question marker pulses */
    tl.fromTo('.s2-question',
      { opacity: 0 },
      { opacity: 0.5, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 5 },
      5.5
    );

    /* EXIT: Everything collapses 7.0s */
    tl.to('.s2-panel-frame, .s2-meter-bg, .s2-meter-fill, .s2-connector', {
      drawSVG: '50% 50%', opacity: 0, duration: 0.4,
    }, 7.0);
    tl.to('.s2-dot', { scale: 0, opacity: 0, duration: 0.3, ease: 'power4.in' }, 7.1);
    tl.to('.s2-hero, .s2-support, .s2-label-energy, .s2-label-progress, .s2-dot-label, .s2-question', {
      opacity: 0, duration: 0.2,
    }, 7.2);

    /* Bridge: last dot expands to yellow */
    tl.fromTo('.s2-bridge',
      { scale: 0, opacity: 0 },
      { scale: 1.5, opacity: 1, fill: C.yellow, duration: 0.3, ease: 'expo.out' },
      7.7
    );

  }, { scope: containerRef });

  useIsomorphicLayoutEffect(() => {
    if (tlRef.current) tlRef.current.seek(sec);
  }, [sec]);

  return (
    <div ref={containerRef} style={{ width: W, height: H, position: 'relative', background: C.black, overflow: 'hidden' }}>

      {/* ═══ HERO TEXT — above panel ═══ */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', justifyContent: 'center',
        paddingTop: H * 0.14, zIndex: 10,
      }}>
        <div className="s2-hero" style={{
          fontFamily: FONT.hero, fontWeight: 900, fontSize: 80,
          color: C.white, textTransform: 'uppercase', letterSpacing: -3,
          textAlign: 'center', opacity: 0,
        }}>EXHAUSTED.</div>
      </div>

      {/* ═══ DIAGNOSTIC PANEL — all elements inside ═══ */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>

        {/* Panel outline frame */}
        <rect className="s2-panel-frame"
          x={panelX - panelW / 2} y={panelY - panelH / 2}
          width={panelW} height={panelH}
          rx={3} fill="none" stroke={C.white} strokeWidth={1} opacity={0} />

        {/* Meter bar: background track */}
        <line className="s2-meter-bg"
          x1={meterX1} y1={meterY} x2={meterX2} y2={meterY}
          stroke={`${C.gray}44`} strokeWidth={4} strokeLinecap="square" opacity={0} />

        {/* Meter bar: fill (red, drains left) */}
        <line className="s2-meter-fill"
          x1={meterX1} y1={meterY} x2={meterX2} y2={meterY}
          stroke={C.red} strokeWidth={4} strokeLinecap="square" opacity={0} />

        {/* Connector: vertical line from meter to dots */}
        <line className="s2-connector"
          x1={panelX} y1={meterY + 10} x2={panelX} y2={dotsY - 10}
          stroke={`${C.gray}33`} strokeWidth={1} opacity={0} />

        {/* Progress dots — 3 in a row, connected by line */}
        <line x1={panelX - 60} y1={dotsY} x2={panelX + 60} y2={dotsY}
          stroke={`${C.gray}22`} strokeWidth={1} />
        {[0, 1, 2].map(i => (
          <circle key={`dot-${i}`}
            className={`s2-dot s2-dot-${i}`}
            cx={panelX - 60 + i * 60} cy={dotsY}
            r={7} fill={i === 0 ? C.white : `${C.gray}44`}
            opacity={0}
          />
        ))}

        {/* Bridge dot (for transition) */}
        <circle className="s2-bridge"
          cx={panelX} cy={panelY}
          r={8} fill={C.yellow} opacity={0}
        />
      </svg>

      {/* Dot labels */}
      {['1', '2', '3'].map((n, i) => (
        <div key={`dl-${i}`} className="s2-dot-label" style={{
          position: 'absolute',
          left: panelX - 60 + i * 60 - 4, top: dotsY + 14,
          fontFamily: FONT.label, fontSize: 9, color: C.gray,
          letterSpacing: 2, opacity: 0,
        }}>{n}</div>
      ))}

      {/* Question marker next to dots */}
      <div className="s2-question" style={{
        position: 'absolute', left: panelX + 90, top: dotsY - 12,
        fontFamily: FONT.hero, fontSize: 22, fontWeight: 900,
        color: C.red, opacity: 0,
      }}>?</div>

      {/* Label: ENERGY DOWN — left of meter */}
      <div className="s2-label-energy" style={{
        position: 'absolute', left: meterX1 - 5, top: meterY - 22, opacity: 0,
        fontFamily: FONT.label, fontSize: 10, color: C.red,
        letterSpacing: 4,
      }}>ENERGY DOWN</div>

      {/* Label: PROGRESS UNCLEAR — right of dots */}
      <div className="s2-label-progress" style={{
        position: 'absolute', left: panelX + 80, top: dotsY + 14, opacity: 0,
        fontFamily: FONT.label, fontSize: 10, color: C.gray,
        letterSpacing: 4,
      }}>PROGRESS UNCLEAR</div>

      {/* Support text — below panel */}
      <div className="s2-support" style={{
        position: 'absolute',
        left: '50%', top: panelY + panelH / 2 + 40, transform: 'translateX(-50%)',
        width: '46%',
        fontFamily: FONT.support, fontWeight: 600, fontSize: 20,
        color: C.gray, textTransform: 'uppercase',
        letterSpacing: 2, lineHeight: 1.5, textAlign: 'center',
        opacity: 0,
      }}>BUT STILL UNSURE WHAT ACTUALLY MOVED FORWARD.</div>
    </div>
  );
};
