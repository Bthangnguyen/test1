import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════════
   HUD OVERLAY — GSAP-driven UI elements
   Uses GSAP timeline scrubbed to Remotion frame position
   for deterministic, frame-accurate rendering.
   ═══════════════════════════════════════════════════════════ */

const ACCENT = '#00e5ff';
const ACCENT2 = '#ff4d00';
const DIM = 'rgba(0,229,255,0.15)';

// Boot messages
const BOOT_LINES = [
  '> Initializing neural pathways...',
  '> Loading memory banks... OK',
  '> Calibrating perception matrix...',
  '> Core temperature: NOMINAL',
  '> STATUS: READY',
];

export const HUDOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const time = frame / fps;
  const progress = frame / durationInFrames;

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Build GSAP timeline once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({ paused: true });

    // ═══ Scene 1: Boot (0% - 33%) ═══
    // HUD corners fade in
    tl.fromTo('.hud-corner', { opacity: 0, scale: 0.5 }, {
      opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'expo.out',
    }, 0);

    // Boot text lines appear one by one
    tl.fromTo('.boot-line', { opacity: 0, x: -30 }, {
      opacity: 1, x: 0, duration: 0.4, stagger: 0.3, ease: 'power2.out',
    }, 0.3);

    // Grid lines sweep in
    tl.fromTo('.grid-line', { scaleX: 0 }, {
      scaleX: 1, duration: 0.6, stagger: 0.1, ease: 'expo.inOut',
    }, 0.5);

    // ═══ Scene 2: Core Online (33% - 66%) ═══
    // Boot text fades out
    tl.to('.boot-line', {
      opacity: 0, x: 30, duration: 0.3, stagger: 0.05, ease: 'power2.in',
    }, 4.5);

    // "CORE ONLINE" slams in
    tl.fromTo('.core-title', { opacity: 0, scale: 2.5, y: -20 }, {
      opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.5)',
    }, 5.2);

    // Subtitle
    tl.fromTo('.core-subtitle', { opacity: 0, y: 15 }, {
      opacity: 0.6, y: 0, duration: 0.4, ease: 'power2.out',
    }, 5.8);

    // Status bars fill
    tl.fromTo('.status-bar-fill', { scaleX: 0 }, {
      scaleX: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out',
    }, 6.0);

    // ═══ Scene 3: Assimilate (66% - 100%) ═══
    // Everything except final text flies out
    tl.to('.hud-corner', {
      opacity: 0, scale: 0.3, duration: 0.5, stagger: 0.08, ease: 'power3.in',
    }, 10.5);

    tl.to('.grid-line', {
      scaleX: 0, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'expo.in',
    }, 10.5);

    tl.to('.core-title', {
      opacity: 0, y: -40, duration: 0.4, ease: 'power2.in',
    }, 10.8);

    tl.to('.core-subtitle', {
      opacity: 0, duration: 0.3,
    }, 10.8);

    tl.to('.status-bar-fill', {
      scaleX: 0, duration: 0.3, ease: 'power2.in',
    }, 10.6);

    // Final text
    tl.fromTo('.final-text', { opacity: 0 }, {
      opacity: 1, duration: 0.6, ease: 'power1.out',
    }, 12.0);

    // Fade everything
    tl.to('.final-text', {
      opacity: 0, duration: 1.0,
    }, 14.0);

    tlRef.current = tl;

    return () => { tl.kill(); };
  }, []);

  // Scrub timeline to current frame
  useEffect(() => {
    if (tlRef.current) {
      const totalDuration = tlRef.current.duration();
      const ratio = time / 15; // 15 second video
      tlRef.current.progress(Math.min(1, ratio));
    }
  }, [time]);

  // Camera shake during core ignition (frames 150-170)
  const shakeX = frame >= 150 && frame < 170
    ? Math.sin(frame * 17) * Math.exp(-(frame - 150) * 0.15) * 6 : 0;
  const shakeY = frame >= 150 && frame < 170
    ? Math.cos(frame * 23) * Math.exp(-(frame - 150) * 0.15) * 4 : 0;

  return (
    <div ref={containerRef} style={{
      position: 'absolute', inset: 0,
      fontFamily: "'Courier New', monospace",
      color: ACCENT,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
      overflow: 'hidden',
    }}>

      {/* ═══ HUD Corners ═══ */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
        const isTop = pos.includes('top');
        const isLeft = pos.includes('left');
        return (
          <div key={pos} className="hud-corner" style={{
            position: 'absolute',
            [isTop ? 'top' : 'bottom']: 30,
            [isLeft ? 'left' : 'right']: 40,
            width: 60, height: 60,
            borderTop: isTop ? `2px solid ${ACCENT}` : 'none',
            borderBottom: !isTop ? `2px solid ${ACCENT}` : 'none',
            borderLeft: isLeft ? `2px solid ${ACCENT}` : 'none',
            borderRight: !isLeft ? `2px solid ${ACCENT}` : 'none',
            opacity: 0,
          }} />
        );
      })}

      {/* ═══ Grid Lines ═══ */}
      {[0.25, 0.5, 0.75].map((pos, i) => (
        <div key={`gl${i}`} className="grid-line" style={{
          position: 'absolute', left: 0, right: 0,
          top: `${pos * 100}%`, height: 1,
          backgroundColor: DIM, transformOrigin: 'left center',
          transform: 'scaleX(0)',
        }} />
      ))}

      {/* ═══ Boot Text ═══ */}
      <div style={{ position: 'absolute', left: 80, top: 120 }}>
        {BOOT_LINES.map((line, i) => (
          <div key={`bl${i}`} className="boot-line" style={{
            fontSize: 14, marginBottom: 8, opacity: 0,
            color: i === BOOT_LINES.length - 1 ? '#00ff88' : ACCENT,
            letterSpacing: 1,
          }}>{line}</div>
        ))}
      </div>

      {/* ═══ Core Title ═══ */}
      <div className="core-title" style={{
        position: 'absolute', left: '50%', top: '42%',
        transform: 'translate(-50%, -50%)',
        fontSize: 72, fontWeight: 900, letterSpacing: 12,
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        color: '#fff', textShadow: `0 0 40px ${ACCENT}, 0 0 80px rgba(0,229,255,0.3)`,
        opacity: 0,
      }}>CORE ONLINE</div>

      {/* ═══ Core Subtitle ═══ */}
      <div className="core-subtitle" style={{
        position: 'absolute', left: '50%', top: '52%',
        transform: 'translateX(-50%)',
        fontSize: 16, letterSpacing: 6, color: ACCENT, opacity: 0,
      }}>NEURAL NETWORK ACTIVATED</div>

      {/* ═══ Status Bars ═══ */}
      <div style={{ position: 'absolute', right: 80, bottom: 100, width: 200 }}>
        {['MEMORY', 'CPU', 'SYNC'].map((label, i) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, marginBottom: 3, color: 'rgba(0,229,255,0.5)' }}>{label}</div>
            <div style={{ width: '100%', height: 3, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 1 }}>
              <div className="status-bar-fill" style={{
                width: '100%', height: '100%', borderRadius: 1,
                backgroundColor: i === 2 ? ACCENT2 : ACCENT,
                transformOrigin: 'left center', transform: 'scaleX(0)',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Final Text ═══ */}
      <div className="final-text" style={{
        position: 'absolute', left: '50%', top: '48%',
        transform: 'translateX(-50%)',
        fontSize: 28, letterSpacing: 8, fontWeight: 300,
        color: '#e0e0e0', opacity: 0,
      }}>SYSTEM OPTIMIZED</div>
    </div>
  );
};
