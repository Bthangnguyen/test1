import React, { useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, random } from "remotion";
import gsap from "gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ========== Stickman 2-Joint Rig ========== */
const StickmanRig = ({ id, cls, color, colorDark }: { id: string; cls: string; color: string; colorDark: string }) => (
  <div id={id} className={cls} style={{ position: "absolute", bottom: "22%", transformOrigin: "bottom center" }}>
    <div className={`torso ${cls}`} style={{
      position: "absolute", bottom: 0, left: -10, width: 20, height: 110,
      backgroundColor: color, borderRadius: 10, transformOrigin: "50% 98px", zIndex: 10,
      boxShadow: `0 0 12px ${color}66`,
    }}>
      {/* Đầu */}
      <div className={`head ${cls}`} style={{
        position: "absolute", top: -42, left: -13, width: 46, height: 46,
        borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 14px ${color}55`,
      }}>
        <div style={{ position: "absolute", top: 16, right: 8, width: 12, height: 5, backgroundColor: "#FFF", borderRadius: "2px 6px 6px 2px", boxShadow: "0 0 8px #FFF" }} />
      </div>

      {/* BG Limbs */}
      <div className={`arm left ${cls}`} style={{
        position: "absolute", top: 8, left: 3, width: 14, height: 34,
        backgroundColor: colorDark, borderRadius: 7, transformOrigin: "7px 7px", zIndex: -1,
      }}>
        <div className={`lower-arm left ${cls}`} style={{
          position: "absolute", top: 28, left: 1, width: 12, height: 34,
          backgroundColor: colorDark, borderRadius: 6, transformOrigin: "6px 6px",
        }} />
      </div>
      <div className={`leg left ${cls}`} style={{
        position: "absolute", top: 92, left: 1, width: 16, height: 42,
        backgroundColor: colorDark, borderRadius: 8, transformOrigin: "8px 8px", zIndex: -1,
      }}>
        <div className={`lower-leg left ${cls}`} style={{
          position: "absolute", top: 36, left: 1, width: 14, height: 42,
          backgroundColor: colorDark, borderRadius: 7, transformOrigin: "7px 7px",
        }} />
      </div>

      {/* FG Limbs */}
      <div className={`leg right ${cls}`} style={{
        position: "absolute", top: 92, left: 1, width: 16, height: 42,
        backgroundColor: color, borderRadius: 8, transformOrigin: "8px 8px", zIndex: 2,
        boxShadow: `0 0 5px ${color}44`,
      }}>
        <div className={`lower-leg right ${cls}`} style={{
          position: "absolute", top: 36, left: 1, width: 14, height: 42,
          backgroundColor: color, borderRadius: 7, transformOrigin: "7px 7px",
          boxShadow: `0 0 5px ${color}44`,
        }} />
      </div>
      <div className={`arm right ${cls}`} style={{
        position: "absolute", top: 8, left: 3, width: 14, height: 34,
        backgroundColor: color, borderRadius: 7, transformOrigin: "7px 7px", zIndex: 2,
        boxShadow: `0 0 5px ${color}44`,
      }}>
        <div className={`lower-arm right ${cls}`} style={{
          position: "absolute", top: 28, left: 1, width: 12, height: 34,
          backgroundColor: color, borderRadius: 6, transformOrigin: "6px 6px",
          boxShadow: `0 0 5px ${color}44`,
        }} />
      </div>
    </div>
  </div>
);

export const HeroStrikeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Energy Particles (deterministic)
  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    startX: (random(`epX-${i}`) - 0.5) * 800,
    startY: (random(`epY-${i}`) - 0.5) * 500,
    size: random(`epS-${i}`) * 10 + 4,
    hue: Math.round(random(`epH-${i}`) * 60 + 30), // Vàng cam
  })), []);

  // Mảnh vỡ đối thủ
  const shards = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: (random(`shX-${i}`) - 0.5) * 600,
    y: random(`shY-${i}`) * -400 - 50,
    rot: random(`shR-${i}`) * 720 - 360,
    w: random(`shW-${i}`) * 16 + 6,
    h: random(`shH-${i}`) * 20 + 6,
  })), []);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap.timeline({ paused: true });
      const master = tl.current;

      // Reset
      gsap.set("#hero", { x: 300, scale: 1, scaleX: 1, scaleY: 1, transformOrigin: "bottom center" });
      gsap.set("#target", { x: 1200, scale: 1, rotation: 0, opacity: 1, transformOrigin: "bottom center" });
      gsap.set(".energy-particle", { opacity: 0 });
      gsap.set("#flash-overlay", { opacity: 0 });
      gsap.set([".arm", ".leg", ".lower-arm", ".lower-leg", ".torso", ".head"], { rotation: 0 });
      gsap.set(".target-shard", { opacity: 0 });

      // ================================================
      // SCENE 1: Nạp Năng Lượng (Power Up) — 0s → ~2s
      // ================================================
      const createPowerUpScene = () => {
        const t = gsap.timeline();
        // Gồng mình, co lại
        t.to("#hero", { scale: 0.85, duration: 1, ease: "power2.out" }, 0);
        // Rung lắc
        t.to("#hero", { x: "+=8", repeat: 14, yoyo: true, duration: 0.05 }, 0);
        // Tay siết chặt (gập cùi chỏ)
        t.to([".arm.left.hero", ".arm.right.hero"], { rotation: -90, duration: 0.3 }, 0);
        t.to([".lower-arm.left.hero", ".lower-arm.right.hero"], { rotation: -120, duration: 0.3 }, 0);
        // Chân dạng chuẩn bị
        t.to(".leg.left.hero", { rotation: -20, duration: 0.3 }, 0);
        t.to(".leg.right.hero", { rotation: 20, duration: 0.3 }, 0);
        t.to([".lower-leg.left.hero", ".lower-leg.right.hero"], { rotation: 15, duration: 0.3 }, 0);

        // Hạt năng lượng hút vào cơ thể
        particles.forEach((p, i) => {
          t.fromTo(`.ep-${i}`,
            { x: p.startX, y: p.startY, opacity: 0, scale: 1 },
            { x: 0, y: 0, opacity: 1, scale: 0, duration: 0.8, ease: "back.in(2)" },
            0.3 + i * 0.04
          );
        });

        // Aura sáng lên
        t.fromTo(".hero-aura", { opacity: 0, scale: 0.5 }, { opacity: 0.6, scale: 1.5, duration: 1.2, ease: "power2.out" }, 0.3);
        t.to(".hero-aura", { opacity: 0.8, scale: 1.8, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, 1);

        return t;
      };

      // ================================================
      // SCENE 2: Tuyệt Kỹ Đột Kích (The Strike) — ~2.2s → ~3s
      // ================================================
      const createStrikeScene = () => {
        const t = gsap.timeline();
        // Lao vút tới
        t.to("#hero", { x: 1150, scaleX: 2, scaleY: 0.6, scale: 1, duration: 0.25, ease: "expo.in" }, 0);
        // Tay phải đấm
        t.to(".arm.right.hero", { rotation: -160, duration: 0.15 }, 0);
        t.to(".lower-arm.right.hero", { rotation: 30, duration: 0.15 }, 0);
        // Chân kéo theo
        t.to(".leg.left.hero", { rotation: 60, duration: 0.15 }, 0);
        t.to(".lower-leg.left.hero", { rotation: -30, duration: 0.15 }, 0);
        t.to(".leg.right.hero", { rotation: -40, duration: 0.15 }, 0);
        // Torso đổ tới
        t.to(".torso.hero", { rotation: 15, duration: 0.15 }, 0);

        // Va chạm: bật lại hình dáng
        t.to("#hero", { scaleX: 1, scaleY: 1, duration: 0.1, ease: "elastic.out(1, 0.3)" }, 0.25);
        // Target bị đẩy lùi
        t.to("#target", { x: "+=60", scale: 1.3, duration: 0.1, ease: "power4.out" }, 0.25);
        t.to(".torso.target", { rotation: -40, duration: 0.15 }, 0.25);
        t.to([".arm.left.target", ".arm.right.target"], { rotation: 100, duration: 0.15 }, 0.25);
        t.to([".lower-arm.left.target", ".lower-arm.right.target"], { rotation: -60, duration: 0.15 }, 0.25);

        // Flash overlay
        t.to("#flash-overlay", { opacity: 1, duration: 0.05, yoyo: true, repeat: 1 }, 0.25);

        // Camera shake
        t.to(".camera-container", { x: -20, y: 15, duration: 0.04, yoyo: true, repeat: 5 }, 0.25);
        t.to(".camera-container", { x: 0, y: 0, duration: 0.1 }, 0.5);

        // Aura tắt
        t.to(".hero-aura", { opacity: 0, duration: 0.1 }, 0.25);

        return t;
      };

      // ================================================
      // SCENE 3: Thu Hồi Kình Lực (Cooldown & Return) — ~3.7s → ~6s
      // ================================================
      const createCooldownScene = () => {
        const t = gsap.timeline();

        // Target gục ngã + vỡ nát
        t.to("#target", { y: "+=80", opacity: 0, rotation: 45, duration: 0.8, ease: "power2.in" }, 0);
        t.to(".torso.target", { rotation: 60, duration: 0.4 }, 0);
        t.to([".leg.left.target", ".leg.right.target"], { rotation: -50, duration: 0.4 }, 0);

        // Mảnh vỡ bắn ra
        shards.forEach((s) => {
          t.fromTo(`.shard-${s.id}`,
            { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 },
            { x: s.x, y: s.y, rotation: s.rot, scale: 0, opacity: 0, duration: 1, ease: "power3.out" },
            0.2
          );
        });

        // Hero hồi phục tư thế
        t.to([".arm.right.hero", ".arm.left.hero", ".lower-arm.right.hero", ".lower-arm.left.hero",
              ".leg.left.hero", ".leg.right.hero", ".lower-leg.left.hero", ".lower-leg.right.hero",
              ".torso.hero"], { rotation: 0, duration: 0.5, ease: "power2.out" }, 0.3);

        // Lướt về vị trí cũ
        t.to("#hero", { x: 960, duration: 1.5, ease: "power3.inOut" }, 0.5);

        // Idle breathing
        t.to(".torso.hero", { scaleY: 1.02, duration: 1, yoyo: true, repeat: 1, ease: "sine.inOut" }, 2.2);

        return t;
      };

      // ================================================
      // LẮP RÁP MASTER TIMELINE
      // ================================================
      master.add(createPowerUpScene())
            .add(createStrikeScene(), "+=0.2")  // Nghỉ 0.2s sau nạp năng lượng
            .add(createCooldownScene(), "+=0.5"); // Dừng 0.5s sau khi đánh trúng

    }, containerRef);

    return () => ctx.revert();
  }, [particles, shards]);

  useIsomorphicLayoutEffect(() => {
    if (tl.current) {
      tl.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#08080F" }}>
      <div ref={containerRef} className="camera-container" style={{ width: "100%", height: "100%", position: "relative" }}>

        {/* Nền sàn đấu */}
        <div style={{ position: "absolute", bottom: "22%", width: "100%", height: 3, background: "linear-gradient(to right, transparent, #444, transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: "22%", background: "linear-gradient(to bottom, #0D0D15, #050508)" }} />

        {/* Grid lines nền */}
        <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.06 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="1080" stroke="#FFF" strokeWidth="1" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 100} x2="1920" y2={i * 100} stroke="#FFF" strokeWidth="1" />
          ))}
        </svg>

        {/* Hero Aura */}
        <div className="hero-aura" style={{
          position: "absolute", bottom: "22%", left: 300, marginLeft: -100,
          width: 200, height: 200, borderRadius: "50%", opacity: 0,
          background: "radial-gradient(circle, #FFD70088 0%, #FF8C0044 40%, transparent 70%)",
          transform: "translateY(-50%)", filter: "blur(20px)",
        }} />

        {/* Energy Particles */}
        {particles.map(p => (
          <div key={p.id} className={`energy-particle ep-${p.id}`} style={{
            position: "absolute", bottom: "32%", left: 300,
            width: p.size, height: p.size, borderRadius: "50%", opacity: 0,
            backgroundColor: `hsl(${p.hue}, 100%, 60%)`,
            boxShadow: `0 0 ${p.size * 2}px hsl(${p.hue}, 100%, 50%)`,
          }} />
        ))}

        {/* Hero (Vàng) */}
        <StickmanRig id="hero" cls="hero" color="#FFD700" colorDark="#D4AF37" />

        {/* Target (Đỏ tía) */}
        <StickmanRig id="target" cls="target" color="#FF2D55" colorDark="#C4224A" />

        {/* Mảnh vỡ Target */}
        {shards.map(s => (
          <div key={s.id} className={`target-shard shard-${s.id}`} style={{
            position: "absolute", bottom: "32%", left: 1260,
            width: s.w, height: s.h, opacity: 0,
            backgroundColor: "#FF2D55", borderRadius: 2,
            boxShadow: "0 0 8px #FF2D5566",
          }} />
        ))}

        {/* Flash Overlay */}
        <div id="flash-overlay" style={{
          position: "absolute", inset: 0, backgroundColor: "#FFF", opacity: 0, zIndex: 50,
        }} />

      </div>
    </AbsoluteFill>
  );
};
