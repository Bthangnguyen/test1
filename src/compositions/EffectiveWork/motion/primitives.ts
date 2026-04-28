/* ══════ MOTION PRIMITIVES — FIXED ══════ */
import gsap from 'gsap';

type TL = gsap.core.Timeline;

/** Hero text snap-in with overshoot */
export const springSnapIn = (tl: TL, target: string, time: number, from?: Partial<{ y: number; scale: number; x: number }>) => {
  tl.fromTo(target,
    { opacity: 0, y: from?.y ?? 40, scale: from?.scale ?? 0.92, x: from?.x ?? 0 },
    { opacity: 1, y: 0, scale: 1, x: 0, duration: 0.4, ease: 'back.out(1.7)' },
    time
  );
};

/** Hard-replace: text disappears then new text snaps in */
export const hardReplace = (tl: TL, outTarget: string, inTarget: string, time: number) => {
  tl.to(outTarget, { opacity: 0, scale: 0.85, duration: 0.15, ease: 'power4.in' }, time);
  tl.fromTo(inTarget,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.25, ease: 'power4.out' },
    time + 0.18
  );
};

/** SVG line draw-on via DrawSVG */
export const lineDraw = (tl: TL, target: string, time: number, dur = 0.6) => {
  tl.set(target, { drawSVG: '0% 0%', opacity: 1 }, time);
  tl.to(target, { drawSVG: '0% 100%', duration: dur, ease: 'power2.out' }, time);
};

/** Bracket grow from center */
export const bracketGrow = (tl: TL, target: string, time: number, dur = 0.5) => {
  tl.fromTo(target,
    { scaleY: 0, opacity: 0, transformOrigin: 'center center' },
    { scaleY: 1, opacity: 1, duration: dur, ease: 'power3.out' },
    time
  );
};

/** Box expand from center point */
export const boxExpand = (tl: TL, target: string, time: number, dur = 0.4) => {
  tl.fromTo(target,
    { scale: 0, opacity: 0, transformOrigin: 'center center' },
    { scale: 1, opacity: 1, duration: dur, ease: 'power4.out' },
    time
  );
};

/** Small chip pop with overshoot */
export const chipPop = (tl: TL, target: string, time: number) => {
  tl.fromTo(target,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2.5)' },
    time
  );
};

/** Aggressive intrusion slide (notifications, alerts) */
export const intrusionSlide = (tl: TL, target: string, time: number, fromX: number) => {
  tl.fromTo(target,
    { x: fromX, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
    time
  );
};

/** Fragment split: object breaks apart */
export const fragmentSplit = (tl: TL, targets: string[], time: number, offsets: number[]) => {
  targets.forEach((t, i) => {
    tl.to(t, { x: `+=${offsets[i]}`, duration: 0.3, ease: 'power4.out' }, time);
  });
};

/** Lines retract inward to a point */
export const retractToPoint = (tl: TL, target: string, time: number) => {
  tl.to(target, { drawSVG: '50% 50%', opacity: 0, duration: 0.4, ease: 'expo.out' }, time);
};

/** Node brief brightness pulse */
export const nodePulse = (tl: TL, target: string, time: number) => {
  tl.to(target, { opacity: 1, duration: 0.15, ease: 'sine.inOut', yoyo: true, repeat: 1 }, time);
};

/** Slight logic pan (2-4% shift) */
export const logicPanSmall = (tl: TL, target: string, time: number, xPct = -2, dur = 2) => {
  tl.to(target, { xPercent: xPct, duration: dur, ease: 'power2.inOut' }, time);
};

/** Underline sweep under word */
export const underlineSweep = (tl: TL, target: string, time: number) => {
  tl.set(target, { drawSVG: '0% 0%', opacity: 1 }, time);
  tl.to(target, { drawSVG: '0% 100%', duration: 0.35, ease: 'power4.out' }, time);
};

/** Arrow path loops back to node */
export const loopReturnPath = (tl: TL, target: string, path: string, time: number, dur = 2) => {
  tl.to(target, {
    motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
    duration: dur, ease: 'linear',
  }, time);
};

/** Multiple elements collapse to single point */
export const collapseToNode = (tl: TL, target: string, cx: number, cy: number, time: number) => {
  tl.to(target, { x: cx, y: cy, scale: 0, opacity: 0, duration: 0.5, ease: 'power4.in' }, time);
};

/** Mask reveal (clip-path wipe) */
export const maskRevealH = (tl: TL, target: string, time: number, dur = 0.5) => {
  tl.fromTo(target,
    { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
    { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: dur, ease: 'power4.out' },
    time
  );
};

/** Fade up with weight */
export const fadeUpWeighted = (tl: TL, target: string, time: number, dur = 0.5) => {
  tl.fromTo(target,
    { y: 25, opacity: 0 },
    { y: 0, opacity: 1, duration: dur, ease: 'power4.out' },
    time
  );
};

/** Staggered accumulation (for multiple elements snapping in) */
export const staggerSnapIn = (tl: TL, target: string, time: number, stag = 0.06) => {
  tl.fromTo(target,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)', stagger: { each: stag, from: 'random' } },
    time
  );
};
