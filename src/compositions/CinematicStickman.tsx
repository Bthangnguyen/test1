import React, { useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from "remotion";
import gsap from "gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const Cloud = ({ x, y, scale, opacity }: { x: number; y: number; scale: number; opacity: number }) => (
  <svg className="cloud" style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, opacity }} width="200" height="100" viewBox="0 0 200 100">
    <path fill="#FFF" d="M 50 60 Q 50 30 80 30 Q 90 10 120 15 Q 150 15 150 40 Q 180 40 180 70 L 40 70 Q 20 70 30 50 Z" />
  </svg>
);

export const CinematicStickman: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const sparks = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: random(`sparkX-${i}`) * -400 - 50,
    y: random(`sparkY-${i}`) * 600 - 300,
    rot: random(`sparkR-${i}`) * 720,
    scale: random(`sparkS-${i}`) * 1.5 + 0.5,
  })), []);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap.timeline({ paused: true });

      // Khởi tạo ban đầu
      gsap.set(".stickman", { x: -200, scaleX: 1 });
      gsap.set([".arm", ".leg", ".lower-arm", ".lower-leg", ".torso"], { rotation: 0 });
      gsap.set(".camera-container", { scale: 1, x: 0, transformOrigin: "center center" });
      gsap.set(".wall", { x: 0 });

      tl.current.to(".cloud", { x: -300, duration: 14, ease: "none" }, 0);

      // =========================
      // Phase 1A: The Walk (0 -> 2.5s)
      // =========================
      tl.current.addLabel("walk", 0);
      tl.current.fromTo(".stickman", { x: -200 }, { x: 600, duration: 2.5, ease: "none" }, "walk");
      tl.current.to(".torso", { rotation: 5, duration: 0.25 }, "walk");
      
      // Upper Limbs (Dương = ra sau, Âm = ra trước)
      tl.current.fromTo(".arm.left",  { rotation: -30 }, { rotation: 30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");
      tl.current.fromTo(".arm.right", { rotation: 30 }, { rotation: -30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");
      tl.current.fromTo(".leg.left",  { rotation: 30 }, { rotation: -30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");
      tl.current.fromTo(".leg.right", { rotation: -30 }, { rotation: 30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");

      // Lower Limbs (Knees & Elbows)
      tl.current.fromTo(".lower-arm.left",  { rotation: -45 }, { rotation: 0, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");
      tl.current.fromTo(".lower-arm.right", { rotation: 0 }, { rotation: -45, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");
      tl.current.fromTo(".lower-leg.left",  { rotation: 45 }, { rotation: 0, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");
      tl.current.fromTo(".lower-leg.right", { rotation: 0 }, { rotation: 45, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "walk");

      // =========================
      // Phase 1B: The Sprint (2.5s -> 4.0s)
      // =========================
      tl.current.addLabel("sprint", 2.5);
      tl.current.to(".stickman", { x: 1650, duration: 1.5, ease: "power2.in" }, "sprint");
      tl.current.to(".torso", { rotation: 25, duration: 0.2 }, "sprint");
      
      // Upper Limbs (Đánh biên độ cực đại)
      tl.current.fromTo(".arm.left",  { rotation: -80 }, { rotation: 80, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");
      tl.current.fromTo(".arm.right", { rotation: 80 }, { rotation: -80, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");
      tl.current.fromTo(".leg.left",  { rotation: 70 }, { rotation: -70, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");
      tl.current.fromTo(".leg.right", { rotation: -70 }, { rotation: 70, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");

      // Lower Limbs (Gập vuông góc)
      tl.current.fromTo(".lower-arm.left",  { rotation: -90 }, { rotation: -10, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");
      tl.current.fromTo(".lower-arm.right", { rotation: -10 }, { rotation: -90, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");
      tl.current.fromTo(".lower-leg.left",  { rotation: 90 }, { rotation: 0, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");
      tl.current.fromTo(".lower-leg.right", { rotation: 0 }, { rotation: 90, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "sprint");

      // =========================
      // Phase 2: The Impact & Stun (4.0s -> 6.0s)
      // =========================
      tl.current.addLabel("impact", 4.0);
      tl.current.to(".wall", { x: 15, duration: 0.05, repeat: 7, yoyo: true, ease: "rough" }, "impact");
      
      sparks.forEach((spark) => {
        tl.current!.fromTo(`.spark-${spark.id}`,
          { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0 },
          { x: spark.x, y: spark.y, rotation: spark.rot, scale: spark.scale, opacity: 0, duration: 0.8, ease: "power3.out" },
          "impact"
        );
      });

      tl.current.to(".camera-container", { scale: 2.5, x: -1600, duration: 1.5, ease: "power2.out" }, "impact");
      tl.current.to(".torso", { rotation: -50, duration: 1.5, ease: "back.out(1)" }, "impact");
      tl.current.to(".hat", { rotation: -30, y: -15, duration: 0.2, yoyo: true, repeat: 1 }, "impact");
      
      // Chân văng dội ngược
      tl.current.to(".leg.left", { rotation: -80, duration: 0.5, ease: "power2.out" }, "impact");
      tl.current.to(".lower-leg.left", { rotation: 0, duration: 0.5, ease: "power2.out" }, "impact");
      tl.current.to(".leg.right", { rotation: 20, duration: 0.5, ease: "power2.out" }, "impact");
      tl.current.to(".lower-leg.right", { rotation: 60, duration: 0.5, ease: "power2.out" }, "impact");
      
      // Tay đánh loạn xạ
      tl.current.fromTo([".arm.left", ".arm.right"], { rotation: -160 }, { rotation: 160, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "impact");
      tl.current.fromTo([".lower-arm.left", ".lower-arm.right"], { rotation: -45 }, { rotation: 45, duration: 0.15, repeat: 9, yoyo: true, ease: "sine.inOut" }, "impact");

      // Stun Stars
      tl.current.to(".stun-stars", { opacity: 1, duration: 0.2 }, "impact+=0.3");
      tl.current.to(".stars-wrapper", { rotation: 360, duration: 1.7, ease: "none", repeat: 1 }, "impact+=0.3");

      // =========================
      // Phase 3: The Recovery (6.0s -> 7.5s)
      // =========================
      tl.current.addLabel("recovery", 6.0);
      tl.current.to(".stun-stars", { opacity: 0, duration: 0.2 }, "recovery");
      tl.current.to(".camera-container", { scale: 1, x: 0, duration: 1.5, ease: "power3.inOut" }, "recovery");
      tl.current.to([".torso", ".leg.left", ".leg.right", ".arm.left", ".arm.right", ".lower-arm.left", ".lower-arm.right", ".lower-leg.left", ".lower-leg.right"], 
        { rotation: 0, duration: 1.2, ease: "bounce.out" }, "recovery"
      );

      // =========================
      // Phase 4: The Turn & Return (7.5s -> 10.0s)
      // =========================
      tl.current.addLabel("return", 7.5);
      tl.current.set(".stickman", { scaleX: -1 }, "return");
      tl.current.to(".stickman", { x: 960, duration: 2.5, ease: "power2.out" }, "return");
      
      tl.current.to(".torso", { rotation: 5, duration: 0.25 }, "return");
      
      // Upper Limbs Return
      tl.current.fromTo(".arm.left",  { rotation: -30 }, { rotation: 30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");
      tl.current.fromTo(".arm.right", { rotation: 30 }, { rotation: -30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");
      tl.current.fromTo(".leg.left",  { rotation: 30 }, { rotation: -30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");
      tl.current.fromTo(".leg.right", { rotation: -30 }, { rotation: 30, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");

      // Lower Limbs Return
      tl.current.fromTo(".lower-arm.left",  { rotation: -45 }, { rotation: 0, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");
      tl.current.fromTo(".lower-arm.right", { rotation: 0 }, { rotation: -45, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");
      tl.current.fromTo(".lower-leg.left",  { rotation: 45 }, { rotation: 0, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");
      tl.current.fromTo(".lower-leg.right", { rotation: 0 }, { rotation: 45, duration: 0.5, repeat: 4, yoyo: true, ease: "sine.inOut" }, "return");

      // =========================
      // Phase 5: The Zero State & Breathing (10.0s -> 14.0s)
      // =========================
      tl.current.addLabel("idle", 10.0);
      tl.current.to([".torso", ".leg.left", ".leg.right", ".arm.left", ".arm.right", ".lower-arm.left", ".lower-arm.right", ".lower-leg.left", ".lower-leg.right"], 
        { rotation: 0, duration: 0.5, ease: "power2.out" }, "idle"
      );
      tl.current.to(".torso", { scaleY: 1.02, y: -2, duration: 1.5, ease: "sine.inOut", repeat: 3, yoyo: true }, "idle+=0.5");

    }, containerRef);

    return () => ctx.revert();
  }, [sparks]);

  useIsomorphicLayoutEffect(() => {
    if (tl.current) {
      tl.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <AbsoluteFill ref={containerRef} style={{ background: "linear-gradient(to bottom, #FF512F, #DD2476)", overflow: "hidden" }}>
      <div className="camera-container" style={{ width: "100%", height: "100%", position: "relative" }}>
        
        <div style={{ position: "absolute", top: "35%", left: "40%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)", transform: "translate(-50%, -50%)" }} />
        <Cloud x={100} y={150} scale={1.8} opacity={0.3} />
        <Cloud x={900} y={100} scale={1.2} opacity={0.2} />
        <Cloud x={1500} y={250} scale={2} opacity={0.4} />

        {sparks.map(spark => (
          <div key={spark.id} className={`spark spark-${spark.id}`} 
            style={{ 
              position: "absolute", left: 1670, bottom: "45%", width: 12, height: 12, 
              backgroundColor: "#FFF", borderRadius: "50%", opacity: 0, 
              boxShadow: "0 0 15px #FFF, 0 0 30px #FFD700", zIndex: 20 
            }} 
          />
        ))}

        <div className="wall" style={{ position: "absolute", left: 1670, top: 0, width: 250, height: "100%", zIndex: 10 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="brick" width="100" height="40" patternUnits="userSpaceOnUse">
                <rect width="100" height="40" fill="#1A252C" />
                <rect x="2" y="2" width="96" height="16" fill="#2C3E50" rx="2" />
                <rect x="-48" y="22" width="96" height="16" fill="#2C3E50" rx="2" />
                <rect x="52" y="22" width="96" height="16" fill="#2C3E50" rx="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brick)" />
            <rect width="10" height="100%" fill="#111820" />
          </svg>
        </div>
        
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: "35%", overflow: "visible" }}>
          <svg width="100%" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111" />
                <stop offset="100%" stopColor="#000" />
              </linearGradient>
            </defs>
            <rect y="0" width="100%" height="100%" fill="url(#groundGrad)" />
            {Array.from({ length: 195 }).map((_, i) => {
              const h = random(`grass-${i}`) * 20 + 8;
              const sway = random(`sway-${i}`) * 10 - 5;
              return <path key={i} d={`M ${i * 10} 1 Q ${i * 10 + sway} -${h} ${i * 10 + 6} 1 Z`} fill="#111" />
            })}
          </svg>
        </div>

        <div className="stickman" style={{ position: "absolute", left: 0, bottom: "35%" }}>
          <div
            className="torso"
            style={{
              position: "absolute", bottom: 0, left: -8, width: 16, height: 120,
              backgroundColor: "#FFD700", borderRadius: 8, transformOrigin: "50% 108px",
              zIndex: 10, boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
            }}
          >
            <div
              className="head"
              style={{
                position: "absolute", top: -45, left: -12, width: 40, height: 40,
                borderRadius: "50%", backgroundColor: "#FFD700", boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
              }}
            >
              <div className="stun-stars" style={{ position: "absolute", top: -35, left: -20, width: 80, height: 20, opacity: 0 }}>
                <div className="stars-wrapper" style={{ position: "absolute", width: "100%", height: "100%" }}>
                  <div style={{ position: "absolute", left: 10, top: 0, fontSize: 24 }}>💫</div>
                  <div style={{ position: "absolute", left: 35, top: -15, fontSize: 24 }}>💫</div>
                  <div style={{ position: "absolute", left: 60, top: 0, fontSize: 24 }}>💫</div>
                </div>
              </div>
              <div
                className="hat"
                style={{
                  position: "absolute", top: -20, left: 5, width: 30, height: 25,
                  backgroundColor: "#111", borderRadius: "5px 5px 0 0", transformOrigin: "bottom center",
                }}
              >
                <div style={{ position: "absolute", bottom: 0, left: -10, width: 50, height: 4, backgroundColor: "#111", borderRadius: 2 }} />
                <div style={{ position: "absolute", bottom: 4, left: 0, width: 30, height: 5, backgroundColor: "#FF2D55" }} />
              </div>
              <div 
                className="eye" 
                style={{ 
                  position: "absolute", top: 15, right: 6, width: 14, height: 6, 
                  backgroundColor: "#00E5FF", borderRadius: "3px 8px 8px 3px", boxShadow: "0 0 12px #00E5FF" 
                }} 
              />
            </div>

            {/* BACKGROUND LIMBS */}
            <div
              className="arm left"
              style={{
                position: "absolute", top: 8, left: 1, width: 14, height: 35,
                backgroundColor: "#D4AF37", borderRadius: 7, transformOrigin: "7px 7px", zIndex: -1,
              }}
            >
              <div className="lower-arm left" style={{
                position: "absolute", top: 28, left: 1, width: 12, height: 35,
                backgroundColor: "#D4AF37", borderRadius: 6, transformOrigin: "6px 6px"
              }} />
            </div>
            <div
              className="leg left"
              style={{
                position: "absolute", top: 104, left: 0, width: 16, height: 45,
                backgroundColor: "#D4AF37", borderRadius: 8, transformOrigin: "8px 8px", zIndex: -1,
              }}
            >
              <div className="lower-leg left" style={{
                position: "absolute", top: 37, left: 1, width: 14, height: 45,
                backgroundColor: "#D4AF37", borderRadius: 7, transformOrigin: "7px 7px"
              }} />
            </div>

            {/* FOREGROUND LIMBS */}
            <div
              className="leg right"
              style={{
                position: "absolute", top: 104, left: 0, width: 16, height: 45,
                backgroundColor: "#FFD700", borderRadius: 8, transformOrigin: "8px 8px", zIndex: 2,
                boxShadow: "0 0 5px rgba(255, 215, 0, 0.4)",
              }}
            >
              <div className="lower-leg right" style={{
                position: "absolute", top: 37, left: 1, width: 14, height: 45,
                backgroundColor: "#FFD700", borderRadius: 7, transformOrigin: "7px 7px",
                boxShadow: "0 0 5px rgba(255, 215, 0, 0.4)",
              }} />
            </div>
            <div
              className="arm right"
              style={{
                position: "absolute", top: 8, left: 1, width: 14, height: 35,
                backgroundColor: "#FFD700", borderRadius: 7, transformOrigin: "7px 7px", zIndex: 2,
                boxShadow: "0 0 5px rgba(255, 215, 0, 0.4)",
              }}
            >
              <div className="lower-arm right" style={{
                position: "absolute", top: 28, left: 1, width: 12, height: 35,
                backgroundColor: "#FFD700", borderRadius: 6, transformOrigin: "6px 6px",
                boxShadow: "0 0 5px rgba(255, 215, 0, 0.4)",
              }} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
