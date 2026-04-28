/* ══════ SCENE 3 — DEFINE REAL PRODUCTIVITY (REDESIGNED) ══════
 * Duration: 11s (330f @ 30fps)
 * Fix: SVG behind text (proper z-index), better spatial layout
 * Text is the main actor, SVG supports without overlapping
 */
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { C, W, H, CX, CY, FONT } from '../constants';
import { springSnapIn, bracketGrow, fadeUpWeighted } from '../motion/primitives';

gsap.registerPlugin(useGSAP, DrawSVGPlugin);
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const Scene03_DefineProductivity: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const sec = frame / fps;
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  /* Layout positions */
  const heroY = H * 0.22;
  const wrongY = H * 0.40;
  const rightY = H * 0.40;
  const dividerTopY = H * 0.34;
  const dividerBotY = H * 0.48;
  const stackStartY = H * 0.56;
  const stackGap = 48;
  const bracketX = CX - 300;
  const underlineY = rightY + 30;
  const labelX = CX + 240;

  useGSAP(() => {
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    /* Hero appears at 0.5s */
    springSnapIn(tl, '.s3-hero', 0.5);

    /* "MORE THINGS" text appears at 1.0s */
    tl.fromTo('.s3-wrong',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power4.out' },
      1.0
    );

    /* Surprise at 3.6s: "MORE THINGS" crushes and falls off */
    tl.to('.s3-wrong', {
      scale: 0.2, y: 400, opacity: 0, duration: 0.5, ease: 'power4.in',
    }, 3.6);

    /* Divider line draws at 3.8s */
    tl.set('.s3-divider', { drawSVG: '50% 50%', opacity: 0.4 }, 3.5);
    tl.to('.s3-divider', { drawSVG: '0% 100%', duration: 0.5, ease: 'power2.out' }, 3.8);

    /* "RIGHT THINGS" replaces at 4.2s */
    springSnapIn(tl, '.s3-right', 4.2, { y: -15 });

    /* Yellow underline sweeps at 4.6s */
    tl.set('.s3-underline', { drawSVG: '0% 0%', opacity: 1 }, 4.5);
    tl.to('.s3-underline', { drawSVG: '0% 100%', duration: 0.35, ease: 'power4.out' }, 4.6);

    /* Support lines stagger in 5.0–6.2s */
    tl.fromTo('.s3-support-line',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power4.out', stagger: 0.2 },
      5.0
    );

    /* Bracket grows at 6.2s */
    bracketGrow(tl, '.s3-bracket', 6.2);

    /* Yellow labels pop at 6.6s */
    tl.fromTo('.s3-label',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(2)', stagger: 0.12 },
      6.6
    );

    /* Slight push-in for weight */
    tl.to('.s3-inner', { scale: 1.03, duration: 3, ease: 'power2.inOut' }, 4.0);

    /* EXIT 9.5s */
    tl.to('.s3-support-line, .s3-label', { opacity: 0, y: -20, duration: 0.3, stagger: 0.05 }, 9.5);
    tl.to('.s3-bracket', { scaleY: 0, opacity: 0, duration: 0.4 }, 9.5);
    tl.to('.s3-hero, .s3-right', { opacity: 0, duration: 0.25 }, 9.8);
    tl.to('.s3-underline, .s3-divider', { opacity: 0, duration: 0.2 }, 9.8);

  }, { scope: containerRef });

  useIsomorphicLayoutEffect(() => {
    if (tlRef.current) tlRef.current.seek(sec);
  }, [sec]);

  const supportLines = [
    'WITH ENOUGH CLARITY',
    'FOR LONG ENOUGH',
    'TO MAKE THEM COUNT.',
  ];

  return (
    <div ref={containerRef} style={{ width: W, height: H, position: 'relative', background: C.black, overflow: 'hidden' }}>
      <div className="s3-inner" style={{ width: '100%', height: '100%', position: 'relative', transformOrigin: 'center center' }}>

        {/* ═══ SVG LAYER — z-index 1, behind text ═══ */}
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {/* Center divider */}
          <line className="s3-divider"
            x1={CX} y1={dividerTopY} x2={CX} y2={dividerBotY}
            stroke={C.white} strokeWidth={1.5} opacity={0} />

          {/* Yellow underline under "RIGHT THINGS" */}
          <line className="s3-underline"
            x1={CX - 200} y1={underlineY} x2={CX + 200} y2={underlineY}
            stroke={C.yellow} strokeWidth={3} opacity={0} />

          {/* Left bracket grouping support lines */}
          <path className="s3-bracket"
            d={`M ${bracketX + 20} ${stackStartY - 10} L ${bracketX} ${stackStartY - 10} L ${bracketX} ${stackStartY + stackGap * 2 + 20} L ${bracketX + 20} ${stackStartY + stackGap * 2 + 20}`}
            fill="none" stroke={C.white} strokeWidth={2} opacity={0} />
        </svg>

        {/* ═══ TEXT LAYER — z-index 10, above SVG ═══ */}

        {/* Hero: REAL PRODUCTIVITY IS NOT DOING MORE THINGS */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', justifyContent: 'center',
          paddingTop: heroY - 30, zIndex: 10,
        }}>
          <div className="s3-hero" style={{
            maxWidth: '60%',
            fontFamily: FONT.hero, fontWeight: 900, fontSize: 48,
            color: C.white, textTransform: 'uppercase', letterSpacing: -1,
            lineHeight: 1.15, textAlign: 'center', opacity: 0,
          }}>
            REAL PRODUCTIVITY IS NOT DOING MORE THINGS.
          </div>
        </div>

        {/* "MORE THINGS" — red, will be crushed */}
        <div className="s3-wrong" style={{
          position: 'absolute', left: '50%', top: wrongY,
          transform: 'translateX(-50%)',
          fontFamily: FONT.hero, fontWeight: 900, fontSize: 38,
          color: C.red, textTransform: 'uppercase', letterSpacing: 2,
          textAlign: 'center', opacity: 0, zIndex: 10,
        }}>
          MORE THINGS
        </div>

        {/* "IT IS DOING THE RIGHT THINGS" — yellow, replacement */}
        <div className="s3-right" style={{
          position: 'absolute', left: '50%', top: rightY,
          transform: 'translateX(-50%)',
          fontFamily: FONT.hero, fontWeight: 900, fontSize: 36,
          color: C.yellow, textTransform: 'uppercase', letterSpacing: 1,
          textAlign: 'center', opacity: 0, zIndex: 10,
        }}>
          IT IS DOING THE RIGHT THINGS.
        </div>

        {/* Support stack */}
        {supportLines.map((line, i) => (
          <div key={`sl-${i}`} className="s3-support-line" style={{
            position: 'absolute', left: '50%', top: stackStartY + i * stackGap,
            transform: 'translateX(-50%)',
            fontFamily: FONT.support, fontWeight: 600, fontSize: 22,
            color: C.white, textTransform: 'uppercase',
            letterSpacing: 3, textAlign: 'center', opacity: 0, zIndex: 10,
          }}>
            {line}
          </div>
        ))}

        {/* Yellow labels — right side */}
        {[
          { text: 'CLARITY', y: stackStartY },
          { text: 'TIME', y: stackStartY + stackGap },
          { text: 'COUNT', y: stackStartY + stackGap * 2 },
        ].map((l, i) => (
          <div key={`lb-${i}`} className="s3-label" style={{
            position: 'absolute', left: labelX, top: l.y + 2,
            fontFamily: FONT.label, fontSize: 10, color: C.yellow,
            letterSpacing: 6, opacity: 0, zIndex: 10,
          }}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
};
