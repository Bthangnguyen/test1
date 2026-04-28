import React, { useRef, useLayoutEffect, useEffect } from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, random } from "remotion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register ALL the powerful plugins requested
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

gsap.registerPlugin(
  useGSAP, CustomEase, ScrambleTextPlugin, MotionPathPlugin, 
  Physics2DPlugin, SplitText, TextPlugin, MorphSVGPlugin, 
  DrawSVGPlugin, Flip, CustomBounce, CustomWiggle, 
  InertiaPlugin, Observer
);

CustomEase.create("anime-slash", "M0,0 C0.05,0.95 0.1,1 1,1");

const WaterDrop = () => (
  <svg width="40" height="56" viewBox="0 0 40 56">
    <defs>
      <radialGradient id="dropGrad" cx="35%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#B3E5FC" />
        <stop offset="50%" stopColor="#29B6F6" />
        <stop offset="100%" stopColor="#0277BD" />
      </radialGradient>
    </defs>
    <path d="M20 2 Q20 2 35 30 A18 18 0 1 1 5 30 Q20 2 20 2 Z" fill="url(#dropGrad)" />
    <ellipse cx="14" cy="28" rx="5" ry="8" fill="rgba(255,255,255,0.35)" transform="rotate(-20 14 28)" />
  </svg>
);

const ParallaxBackground = () => (
  <div className="parallax-bg" style={{ position: "absolute", inset: -1000, zIndex: -10 }}>
    <div className="bg-sky" style={{ position: "absolute", inset: 0, background: "linear-gradient(#050510, #151525)" }} />
    <div className="bg-mountains" style={{ position: "absolute", bottom: "30%", width: "200%", height: 300, background: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 1000 300\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 300 L200 100 L400 300 L600 50 L800 300 L1000 150 L1000 300 Z\" fill=\"%230D0D18\"/></svg>') repeat-x", opacity: 0.8 }} />
    <div className="bg-city" style={{ position: "absolute", bottom: "20%", width: "200%", height: 200, background: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 500 200\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"50\" y=\"50\" width=\"60\" height=\"150\" fill=\"%23080811\"/><rect x=\"120\" y=\"100\" width=\"40\" height=\"100\" fill=\"%23080811\"/><rect x=\"180\" y=\"20\" width=\"80\" height=\"180\" fill=\"%23080811\"/><rect x=\"300\" y=\"80\" width=\"50\" height=\"120\" fill=\"%23080811\"/><rect x=\"380\" y=\"120\" width=\"90\" height=\"80\" fill=\"%23080811\"/></svg>') repeat-x" }} />
  </div>
);

const BrickWall = () => {
  const bricks = [];
  const rows = 12;
  const cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isOffset = r % 2 === 0;
      bricks.push(
        <div 
          key={`brick-${r}-${c}`} 
          className="brick" 
          data-r={r} data-c={c}
          style={{
            position: "absolute",
            width: 30, height: 15,
            bottom: "20%", marginBottom: r * 16,
            left: -480 + c * 32 + (isOffset ? 15 : 0),
            backgroundColor: "#4A220A",
            border: "1px solid #2B1405",
            borderRadius: 2,
            boxShadow: "inset 0 0 5px #00000088",
            zIndex: 5
          }}
        />
      );
    }
  }
  return <>{bricks}</>;
};

const StickmanRig = ({ cls, color, colorDark, weapon }: { cls: string; color: string; colorDark: string, weapon?: React.ReactNode }) => (
  <div className={cls} style={{ position: "absolute", bottom: "20%", left: "50%", marginLeft: -8, transformOrigin: "bottom center", zIndex: 10 }}>
    <div className="aura" style={{ position: "absolute", inset: -100, background: `radial-gradient(circle, ${color} 0%, transparent 60%)`, opacity: 0, mixBlendMode: "screen", zIndex: -1 }} />
    <div className="torso" style={{
      position: "absolute", bottom: 0, left: 0, width: 16, height: 100,
      backgroundColor: color, borderRadius: 8, transformOrigin: "50% 88px", zIndex: 10,
      boxShadow: `0 0 8px ${color}`,
    }}>
      <div className="head" style={{
        position: "absolute", top: -35, left: -12, width: 40, height: 40,
        borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 10px ${color}`,
      }}>
        <div style={{ position: "absolute", top: 14, right: 7, width: 10, height: 5, backgroundColor: "#FFF", borderRadius: "2px 6px 6px 2px", boxShadow: "0 0 6px #FFF" }} />
      </div>
      <div className="arm left" style={{ position: "absolute", top: 6, left: 1, width: 12, height: 32, backgroundColor: colorDark, borderRadius: 6, transformOrigin: "6px 6px", zIndex: -1 }}>
        <div className="lower-arm left" style={{ position: "absolute", top: 26, left: 1, width: 10, height: 32, backgroundColor: colorDark, borderRadius: 5, transformOrigin: "5px 5px" }} />
      </div>
      <div className="leg left" style={{ position: "absolute", top: 84, left: 0, width: 14, height: 40, backgroundColor: colorDark, borderRadius: 7, transformOrigin: "7px 7px", zIndex: -1 }}>
        <div className="lower-leg left" style={{ position: "absolute", top: 34, left: 1, width: 12, height: 40, backgroundColor: colorDark, borderRadius: 6, transformOrigin: "6px 6px" }} />
      </div>
      <div className="leg right" style={{ position: "absolute", top: 84, left: 0, width: 14, height: 40, backgroundColor: color, borderRadius: 7, transformOrigin: "7px 7px", zIndex: 2, boxShadow: `0 0 4px ${color}` }}>
        <div className="lower-leg right" style={{ position: "absolute", top: 34, left: 1, width: 12, height: 40, backgroundColor: color, borderRadius: 6, transformOrigin: "6px 6px", boxShadow: `0 0 4px ${color}` }} />
      </div>
      <div className="arm right" style={{ position: "absolute", top: 6, left: 1, width: 12, height: 32, backgroundColor: color, borderRadius: 6, transformOrigin: "6px 6px", zIndex: 2, boxShadow: `0 0 4px ${color}` }}>
        <div className="lower-arm right" style={{ position: "absolute", top: 26, left: 1, width: 10, height: 32, backgroundColor: color, borderRadius: 5, transformOrigin: "5px 5px", boxShadow: `0 0 4px ${color}` }}>
          {weapon}
        </div>
      </div>
    </div>
  </div>
);

const poses = {
  idle: { torso: 0, armL: 15, lowerArmL: 5, armR: -15, lowerArmR: 5, legL: 15, lowerLegL: 5, legR: -15, lowerLegR: 5 },
  combatIdle: { torso: -10, armL: -30, lowerArmL: -90, armR: -45, lowerArmR: -90, legL: 30, lowerLegL: 10, legR: -30, lowerLegR: 20 },
  dashForward: { torso: 30, armL: -80, lowerArmL: -10, armR: -60, lowerArmR: -20, legL: 60, lowerLegL: 20, legR: -60, lowerLegR: 40 }, 
  clashBlock: { torso: -20, armL: -90, lowerArmL: -90, armR: -90, lowerArmR: -90, legL: 40, lowerLegL: 20, legR: -40, lowerLegR: 20 }, 
  grappleGrab: { torso: -10, armL: -90, lowerArmL: 0, armR: -80, lowerArmR: 0, legL: 30, lowerLegL: 10, legR: -30, lowerLegR: 10 },
  grappleThrow: { torso: 45, armL: 90, lowerArmL: 0, armR: 90, lowerArmR: 0, legL: -20, lowerLegL: 10, legR: 40, lowerLegR: 20 }, 
  wallSmashVictim: { torso: 70, armL: 120, lowerArmL: -20, armR: 140, lowerArmR: -30, legL: 60, lowerLegL: 40, legR: 80, lowerLegR: 30 }, 
  aerialJump: { torso: 10, armL: 40, lowerArmL: -30, armR: 40, lowerArmR: -30, legL: -60, lowerLegL: 10, legR: 20, lowerLegR: 40 }, 
  aerialKick1: { torso: -20, armL: -40, lowerArmL: -20, armR: 40, lowerArmR: -30, legL: 40, lowerLegL: 10, legR: -90, lowerLegR: 0 },
  aerialKick2: { torso: 20, armL: 40, lowerArmL: -30, armR: -40, lowerArmR: -20, legL: -90, lowerLegL: 0, legR: 40, lowerLegR: 10 },
  aerialSmashDown: { torso: 40, armL: -160, lowerArmL: 0, armR: -140, lowerArmR: 0, legL: 10, lowerLegL: 20, legR: -160, lowerLegR: 0 }, 
  hurtGround: { torso: 90, armL: 100, lowerArmL: -20, armR: 80, lowerArmR: -20, legL: 70, lowerLegL: 10, legR: 80, lowerLegR: 10 },
  kneel: { torso: 45, armL: 20, lowerArmL: 0, armR: 20, lowerArmR: 0, legL: -60, lowerLegL: 90, legR: 30, lowerLegR: 90 },
  powerCharge: { torso: 10, armL: -150, lowerArmL: -40, armR: -150, lowerArmR: -40, legL: 40, lowerLegL: 40, legR: -40, lowerLegR: 40 }, 
  worldCleaverWindup: { torso: -30, armL: -170, lowerArmL: -10, armR: -160, lowerArmR: -10, legL: 30, lowerLegL: 10, legR: -30, lowerLegR: 20 },
  worldCleaverStrike: { torso: 60, armL: 120, lowerArmL: 0, armR: 110, lowerArmR: 0, legL: -20, lowerLegL: 10, legR: 50, lowerLegR: 10 },
  hurtPunchR: { torso: 40, armL: 80, lowerArmL: -40, armR: 60, lowerArmR: -30, legL: -10, lowerLegL: 20, legR: -30, lowerLegR: 20 }
};

const applyPose = (tl: gsap.core.Timeline, cls: string, pose: any, time: string | number, duration = 0.2, ease = "power2.out") => {
  if (pose.torso !== undefined) tl.to(`.${cls} .torso`, { rotation: pose.torso, duration, ease }, time);
  if (pose.armL !== undefined) tl.to(`.${cls} .arm.left`, { rotation: pose.armL, duration, ease }, time);
  if (pose.lowerArmL !== undefined) tl.to(`.${cls} .lower-arm.left`, { rotation: pose.lowerArmL, duration, ease }, time);
  if (pose.armR !== undefined) tl.to(`.${cls} .arm.right`, { rotation: pose.armR, duration, ease }, time);
  if (pose.lowerArmR !== undefined) tl.to(`.${cls} .lower-arm.right`, { rotation: pose.lowerArmR, duration, ease }, time);
  if (pose.legL !== undefined) tl.to(`.${cls} .leg.left`, { rotation: pose.legL, duration, ease }, time);
  if (pose.lowerLegL !== undefined) tl.to(`.${cls} .lower-leg.left`, { rotation: pose.lowerLegL, duration, ease }, time);
  if (pose.legR !== undefined) tl.to(`.${cls} .leg.right`, { rotation: pose.legR, duration, ease }, time);
  if (pose.lowerLegR !== undefined) tl.to(`.${cls} .lower-leg.right`, { rotation: pose.lowerLegR, duration, ease }, time);
};

export const StickmanFightComplex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const particles = Array.from({ length: 50 }).map((_, i) => ({
    x: random(`px-${i}`) * 800 - 400,
    y: random(`py-${i}`) * -600 - 50,
    scale: random(`ps-${i}`) * 2 + 0.5,
  }));

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true });
    const master = tl.current;

    // Phase 1: High-Speed Clash
    const getClashTl = () => {
      const t = gsap.timeline();
      t.set(".stickman-a", { opacity: 1, scaleY: 1, x: -300, scaleX: 1 });
      t.set(".stickman-b", { opacity: 1, scaleY: 1, x: 300, scaleX: -1 });
      applyPose(t, "stickman-a", poses.combatIdle, 0, 0);
      applyPose(t, "stickman-b", poses.combatIdle, 0, 0);

      t.to(".stickman-a", { x: -30, duration: 0.3, ease: "power3.in" }, 1.0);
      applyPose(t, "stickman-a", poses.dashForward, 1.0, 0.3);
      t.to(".stickman-b", { x: 30, duration: 0.3, ease: "power3.in" }, 1.0);
      applyPose(t, "stickman-b", poses.dashForward, 1.0, 0.3);

      applyPose(t, "stickman-a", poses.clashBlock, 1.3, 0.05);
      applyPose(t, "stickman-b", poses.clashBlock, 1.3, 0.05);

      t.set([".stickman-a", ".stickman-b"], { opacity: 0 }, 1.4);
      t.set(".stickman-a", { x: -150, y: -200, opacity: 1 }, 1.5);
      t.set(".stickman-b", { x: -50, y: -200, opacity: 1 }, 1.5);
      
      t.set([".stickman-a", ".stickman-b"], { opacity: 0 }, 1.6);
      t.set(".stickman-a", { x: 50, y: -150, opacity: 1 }, 1.7);
      t.set(".stickman-b", { x: 150, y: -150, opacity: 1 }, 1.7);
      
      t.set([".stickman-a", ".stickman-b"], { opacity: 0 }, 1.8);
      t.set(".stickman-a", { x: -50, y: -300, opacity: 1 }, 1.9);
      t.set(".stickman-b", { x: 50, y: -300, opacity: 1 }, 1.9);
      t.to([".stickman-a", ".stickman-b"], { y: 0, duration: 0.3, ease: "power2.in" }, 1.9);
      
      applyPose(t, "stickman-a", poses.combatIdle, 1.9, 0.3);
      applyPose(t, "stickman-b", poses.combatIdle, 1.9, 0.3);
      return t;
    };

    // Phase 2: Grapple & Wall Smash
    const getGrappleTl = () => {
      const t = gsap.timeline();
      applyPose(t, "stickman-b", poses.grappleGrab, 2.3, 0.1);
      t.to(".stickman-b", { x: -20, duration: 0.1 }, 2.3);
      applyPose(t, "stickman-a", poses.hurtPunchR, 2.35, 0.1);
      t.to(".stickman-a", { x: -20, duration: 0.1 }, 2.35);

      applyPose(t, "stickman-b", poses.grappleThrow, 2.6, 0.2);
      applyPose(t, "stickman-a", poses.wallSmashVictim, 2.6, 0.1);
      t.to(".stickman-a", { x: -600, y: -80, duration: 0.5, ease: "power2.out" }, 2.6);

      // --- UPGRADE: Use Physics2DPlugin for bricks ---
      t.to(".brick", {
        physics2D: (i, target) => {
          const seed = parseInt(target.dataset.r) * 10 + parseInt(target.dataset.c);
          return {
            velocity: 300 + random(`bv-${seed}`) * 500,
            angle: 160 + random(`ba-${seed}`) * 40, // Flying left-upish
            gravity: 800,
            friction: 0.05
          };
        },
        rotation: (i, target) => {
          const seed = parseInt(target.dataset.r) * 10 + parseInt(target.dataset.c);
          return (random(`br-${seed}`) - 0.5) * 1440;
        },
        opacity: 0,
        duration: 2,
        ease: "none"
      }, 2.8);

      return t;
    };

    const getAerialTl = () => {
      const t = gsap.timeline();
      t.to(".stickman-a", { y: -350, rotation: 180, duration: 0.5, ease: "power2.out" }, 3.1);

      t.set(".stickman-b", { scaleX: -1 }, 3.2);
      applyPose(t, "stickman-b", poses.aerialJump, 3.2, 0.2);
      t.to(".stickman-b", { x: -500, y: -200, duration: 0.4, ease: "power2.out" }, 3.2);

      applyPose(t, "stickman-b", poses.aerialKick1, 3.5, 0.1);
      t.to(".stickman-a", { y: -450, rotation: 360, duration: 0.3, ease: "power2.out" }, 3.5);

      applyPose(t, "stickman-b", poses.aerialKick2, 3.65, 0.1);
      t.to(".stickman-a", { y: -500, rotation: 540, duration: 0.3, ease: "power2.out" }, 3.65);

      applyPose(t, "stickman-b", poses.aerialSmashDown, 3.9, 0.1);
      t.to(".stickman-b", { y: -150, duration: 0.2, ease: "power4.in" }, 3.95);
      t.to(".stickman-a", { y: 0, rotation: 1080, duration: 0.2, ease: "power4.in" }, 3.95);
      applyPose(t, "stickman-a", poses.hurtGround, 4.1, 0.05);

      t.to(".stickman-b", { y: 0, x: -400, duration: 0.5, ease: "bounce.out" }, 5.0);
      applyPose(t, "stickman-b", poses.combatIdle, 5.0, 0.5);

      applyPose(t, "stickman-a", poses.kneel, 5.5, 1.0, "power1.inOut");
      t.to(".stickman-a", { y: -20, duration: 1.0, ease: "power1.inOut" }, 5.5);
      return t;
    };

    const getUltimateTl = () => {
      const t = gsap.timeline();
      applyPose(t, "stickman-b", poses.powerCharge, 6.0, 0.5);
      t.fromTo(".stickman-b .aura", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 2, duration: 1.0, ease: "power2.in" }, 6.0);
      
      t.set(".sword", { opacity: 1 }, 7.0);
      applyPose(t, "stickman-b", poses.worldCleaverWindup, 7.0, 0.3);

      t.to(".stickman-b", { x: -800, duration: 0.2, ease: "anime-slash" }, 7.8);
      applyPose(t, "stickman-b", poses.worldCleaverStrike, 7.8, 0.15);

      t.set(".stickman-a", { opacity: 0 }, 7.85);
      t.set([".stickman-a-top", ".stickman-a-bottom"], { opacity: 1, x: -600, y: -20 }, 7.85);
      t.to(".stickman-a-top", { x: -400, y: -200, rotation: 360, duration: 0.8, ease: "power2.out" }, 7.85);
      t.to(".stickman-a-bottom", { y: 150, rotation: -90, duration: 0.5, ease: "power2.in" }, 7.85);
      return t;
    };

    const getVfxTl = () => {
      const t = gsap.timeline();
      t.set(".spark", { opacity: 0 });
      t.set(".spark", { x: 0, y: -40, opacity: 1, scale: 0.5 }, 1.3);
      t.to(".spark", { scale: 3, opacity: 0, duration: 0.2 }, 1.3);
      t.set(".spark", { x: -100, y: -200, opacity: 1, scale: 0.5 }, 1.5);
      t.to(".spark", { scale: 2, opacity: 0, duration: 0.2 }, 1.5);
      t.set(".spark", { x: 100, y: -150, opacity: 1, scale: 0.5 }, 1.7);
      t.to(".spark", { scale: 2, opacity: 0, duration: 0.2 }, 1.7);
      
      t.set(".i-2", { x: -550, y: -300 }, 3.5);
      t.fromTo(".i-2", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1.5, duration: 0.1, yoyo: true, repeat: 1 }, 3.5);
      t.set(".i-3", { x: -550, y: -400 }, 3.65);
      t.fromTo(".i-3", { opacity: 0, scale: 0 }, { opacity: 1, scale: 2, duration: 0.1, yoyo: true, repeat: 1 }, 3.65);

      t.set(".i-4", { x: -600, y: 0 }, 4.15); 
      t.fromTo(".i-4", { opacity: 0, scale: 0 }, { opacity: 1, scale: 3, duration: 0.15, yoyo: true, repeat: 1 }, 4.15);
      t.fromTo(".dust-cloud-big", { opacity: 0, scale: 0.5, x: -600, y: 20 }, { opacity: 0.9, scale: 5, duration: 0.8, ease: "power2.out" }, 4.15);
      t.to(".dust-cloud-big", { opacity: 0, duration: 0.5 }, 5.5);

      t.fromTo(".anime-slash-line", { opacity: 0, scaleX: 0, x: -800, y: -50, rotation: 10 }, { opacity: 1, scaleX: 6, duration: 0.1, ease: "anime-slash" }, 7.8);
      t.to(".anime-slash-line", { opacity: 0, duration: 0.1 }, 7.9);
      t.fromTo(".screen-invert", { opacity: 0 }, { opacity: 1, duration: 0.1, yoyo: true, repeat: 3 }, 7.85);

      // --- UPGRADE: Use MotionPath for blood particles ---
      t.to(".blood-particle", { opacity: 1, duration: 0.05 }, 7.85);
      t.to(".blood-particle", {
        motionPath: (i) => ({
          path: [
            { x: -600, y: -50 },
            { x: -600 + particles[i].x * 0.4, y: -50 + particles[i].y * 1.5 },
            { x: -600 + particles[i].x, y: -50 + particles[i].y }
          ],
          curviness: 1.5
        }),
        scale: (i) => particles[i].scale,
        rotation: (i) => (random(`br-${i}`) - 0.5) * 720,
        duration: 0.8,
        ease: "power2.out",
        stagger: { amount: 0.05, from: "start" },
      }, 7.85);
      t.to(".blood-particle", { opacity: 0, duration: 0.3 }, 8.3);

      // --- UPGRADE: Use SplitText and ScrambleText for Fatality ---
      t.set(".fatality-text", { opacity: 1 }, 7.9);
      t.to(".fatality-text", {
        duration: 1.5,
        scrambleText: { text: "FATALITY", chars: "XO!@#$%&*01", speed: 0.5 },
        scale: 1.5,
        color: "#FF1100",
        ease: "power4.out"
      }, 7.9);

      return t;
    };

    const getCameraTl = () => {
      const t = gsap.timeline();
      t.to(".camera-container", { x: 5, y: -5, duration: 0.05, yoyo: true, repeat: 5 }, 1.3);
      t.to(".camera-container", { x: 350, duration: 0.8, ease: "power2.out" }, 2.6);
      t.to(".bg-city", { x: -100, duration: 0.8, ease: "power2.out" }, 2.6);
      t.to(".bg-mountains", { x: -200, duration: 0.8, ease: "power2.out" }, 2.6);
      t.to(".camera-container", { y: 20, duration: 0.05, yoyo: true, repeat: 5 }, 2.8);
      t.to(".camera-container", { y: -10, duration: 0.05, yoyo: true, repeat: 3 }, 3.5);
      t.to(".camera-container", { y: -15, duration: 0.05, yoyo: true, repeat: 3 }, 3.65);
      t.to(".camera-container", { scale: 1.1, x: 350, y: 50, duration: 0.05, yoyo: true, repeat: 9, ease: "rough" }, 4.15);
      t.to(".camera-container", { scale: 1, x: 350, y: 0, duration: 0.3 }, 4.65);
      t.to(".camera-container", { scale: 1.2, x: 500, y: 50, duration: 1.5, ease: "power1.inOut" }, 6.0);
      t.to(".bg-city", { x: -150, duration: 1.5, ease: "power1.inOut" }, 6.0);
      t.to(".camera-container", { scale: 1.3, x: 450, y: 80, rotation: 3, duration: 0.05, yoyo: true, repeat: 11, ease: "none" }, 7.85);
      t.to(".camera-container", { scale: 1, x: 350, y: 0, rotation: 0, duration: 0.5 }, 8.4);
      return t;
    };

    master.add(getClashTl(), 0)
          .add(getGrappleTl(), 0)
          .add(getAerialTl(), 0)
          .add(getUltimateTl(), 0)
          .add(getVfxTl(), 0)
          .add(getCameraTl(), 0);

  }, { scope: containerRef });

  useIsomorphicLayoutEffect(() => {
    if (tl.current) {
      tl.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div ref={containerRef} className="camera-container" style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
        
        <ParallaxBackground />

        <div style={{ position: "absolute", bottom: "20%", width: "200%", height: "4px", backgroundColor: "#333", boxShadow: "0 0 15px #22222288" }} />
        <div style={{ position: "absolute", bottom: 0, width: "200%", height: "20%", background: "linear-gradient(to bottom, #111118, #08080C)" }} />

        <BrickWall />

        <StickmanRig cls="stickman-a" color="#FF2D55" colorDark="#C0214A" />

        <div className="stickman-a-top" style={{ position: "absolute", bottom: "20%", left: "50%", marginLeft: -8, opacity: 0, zIndex: 10 }}>
          <div style={{ width: 16, height: 50, backgroundColor: "#FF2D55", borderRadius: "8px 8px 0 0" }}>
            <div style={{ position: "absolute", top: -35, left: -12, width: 40, height: 40, backgroundColor: "#FF2D55", borderRadius: "50%" }} />
          </div>
        </div>
        <div className="stickman-a-bottom" style={{ position: "absolute", bottom: "20%", left: "50%", marginLeft: -8, opacity: 0, zIndex: 10 }}>
          <div style={{ width: 16, height: 50, backgroundColor: "#FF2D55", borderRadius: "0 0 8px 8px" }} />
        </div>

        <StickmanRig cls="stickman-b" color="#00E5FF" colorDark="#00ACC1" weapon={
          <div className="sword" style={{
            position: "absolute", top: 25, left: 5,
            width: 250, height: 8, opacity: 0,
            background: "linear-gradient(to right, #FFF, #00E5FF)",
            borderRadius: 4, boxShadow: "0 0 25px #00E5FF, 0 0 50px #FFF",
            transformOrigin: "left center",
            rotation: -20
          }} />
        } />

        <div className="spark" style={{ position: "absolute", bottom: "20%", left: "50%", width: 100, height: 100, marginLeft: -50, background: "radial-gradient(circle, #FFF 0%, #00E5FF 20%, transparent 70%)", mixBlendMode: "screen", opacity: 0, zIndex: 15 }} />
        <div className="i-2" style={{ position: "absolute", bottom: "20%", left: "50%", width: 120, height: 120, marginLeft: -60, background: "radial-gradient(circle, #FFF 0%, #00E5FF 20%, transparent 70%)", mixBlendMode: "screen", opacity: 0, zIndex: 15 }} />
        <div className="i-3" style={{ position: "absolute", bottom: "20%", left: "50%", width: 150, height: 150, marginLeft: -75, background: "radial-gradient(circle, #FFF 0%, #00E5FF 20%, transparent 70%)", mixBlendMode: "screen", opacity: 0, zIndex: 15 }} />
        <div className="i-4" style={{ position: "absolute", bottom: "20%", left: "50%", width: 400, height: 150, marginLeft: -200, background: "radial-gradient(circle, #FFF 0%, #FF2D55 30%, transparent 70%)", mixBlendMode: "screen", opacity: 0, zIndex: 15 }} />
        <div className="dust-cloud-big" style={{ position: "absolute", bottom: "20%", left: "50%", marginLeft: -100, width: 200, height: 60, backgroundColor: "#555", borderRadius: "50%", filter: "blur(16px)", opacity: 0, zIndex: 12 }} />
        
        {particles.map((_, i) => (
          <div key={`blood-${i}`} className="blood-particle" style={{
            position: "absolute", bottom: "20%", left: "50%", marginLeft: 0, 
            width: 8, height: 8, backgroundColor: "#FF0000", borderRadius: "50%",
            boxShadow: "0 0 8px #FF0000", opacity: 0, zIndex: 20
          }} />
        ))}
        
        <div className="anime-slash-line" style={{ position: "absolute", bottom: "20%", left: "50%", marginLeft: -400, width: 800, height: 8, backgroundColor: "#FFF", boxShadow: "0 0 40px #00E5FF", rotation: 45, opacity: 0, zIndex: 25 }} />
        
        <div className="fatality-text" style={{ 
          position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, 0)", 
          fontSize: 100, fontWeight: 900, fontFamily: "sans-serif", zIndex: 101,
          textShadow: "0 0 30px #FF0000, 5px 5px 0 #000", color: "#FFF", opacity: 0
        }}>
          FATALITY
        </div>

      </div>
      
      <div className="screen-invert" style={{ position: "absolute", inset: 0, backdropFilter: "invert(100%) hue-rotate(180deg)", zIndex: 100, opacity: 0, pointerEvents: "none" }} />
      <div className="screen-flash" style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", zIndex: 100, opacity: 0, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
