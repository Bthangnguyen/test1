import React, { useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from "remotion";
import gsap from "gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PC = ["#FF6B9D", "#7B68EE", "#00E5FF", "#FFD700", "#FF4500", "#39FF14", "#FF2D55", "#00E5FF"];

export const GsapCollisionReassembly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const shards = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: random(`shard-x-${i}`) * 1600 - 800,
      y: random(`shard-y-${i}`) * 1600 - 800,
      rot: random(`shard-rot-${i}`) * 720 - 360,
      color: PC[i % PC.length],
    }));
  }, []);

  const acceptLetters = "ACCEPTANCE".split("");

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".ego-text", ".truth-text"], { xPercent: -50, yPercent: -50 });
      gsap.set(".shard", { xPercent: -50, yPercent: -50 });
      gsap.set(".accept-letter-container", { xPercent: -50, yPercent: -50 });

      tl.current = gsap.timeline({ paused: true });

      // Phase 1: High-Speed Collision
      tl.current.fromTo(
        ".truth-text",
        { x: 1000 },
        { x: 0, duration: 0.4, ease: "power4.in" }
      );

      // Phase 2: Mutual Destruction
      tl.current.to([".ego-text", ".truth-text"], { opacity: 0, duration: 0 }, ">");
      tl.current.to(".shard", { opacity: 1, duration: 0 }, "<");

      shards.forEach((shard, i) => {
        tl.current!.to(
          `#shard-${i}`,
          {
            x: shard.x,
            y: shard.y,
            rotationZ: shard.rot,
            duration: 1.2,
            ease: "expo.out",
          },
          "<"
        );
      });

      // Phase 3: The Reassembly (GHÉP LẠI THÀNH CHỮ)
      tl.current.addLabel("assemble", "+=0.3");

      // Các mảnh vỡ bay ngược từ vị trí random về vị trí của các chữ cái
      shards.forEach((shard, i) => {
        const targetLetter = i % acceptLetters.length;
        // Tính toán khoảng cách tọa độ X tương đối của từng chữ cái
        const targetX = (targetLetter - (acceptLetters.length - 1) / 2) * 90;
        const targetY = 0;

        tl.current!.to(
          `#shard-${i}`,
          {
            x: targetX,
            y: targetY,
            rotationZ: 0,
            duration: 0.8,
            ease: "back.inOut(1.2)",
          },
          "assemble"
        );
      });

      // Ngay khi các mảnh vỡ bay đến đích, cho chúng biến mất và hiện chữ lên thay thế
      tl.current.to(".shard", { opacity: 0, duration: 0.1 }, "assemble+=0.75");
      tl.current.fromTo(
        ".accept-letter",
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)", stagger: 0.03 },
        "assemble+=0.75"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [shards]);

  useIsomorphicLayoutEffect(() => {
    if (tl.current) {
      tl.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <AbsoluteFill ref={containerRef} style={{ background: "radial-gradient(ellipse at 50% 45%, #120628 0%, #0A0118 70%, #000 100%)", overflow: "hidden" }}>
      <svg style={{ position: "absolute", width: 1920, height: 1080, opacity: 0.03 }}>
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={0} y1={i * 56} x2={1920} y2={i * 56} stroke="#fff" strokeWidth={0.5} />)}
        {Array.from({ length: 35 }, (_, i) => <line key={`v${i}`} x1={i * 56} y1={0} x2={i * 56} y2={1080} stroke="#fff" strokeWidth={0.5} />)}
      </svg>

      <div
        className="ego-text"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          fontSize: 200,
          color: "#FF2D55",
          fontWeight: "bold",
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          textShadow: "0 0 60px rgba(255,45,85,0.4), 0 0 120px rgba(255,45,85,0.4)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        EGO
      </div>
      <div
        className="truth-text"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          fontSize: 80,
          color: "#00E5FF",
          fontWeight: "bold",
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          textShadow: "0 0 40px rgba(0,229,255,0.5), 0 0 80px rgba(0,229,255,0.5)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        TRUTH
      </div>

      {shards.map((shard) => (
        <div
          key={shard.id}
          id={`shard-${shard.id}`}
          className="shard"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 6,
            height: 6,
            backgroundColor: shard.color,
            boxShadow: `0 0 10px ${shard.color}`,
            opacity: 0,
            borderRadius: 2,
          }}
        />
      ))}

      <div
        className="accept-letter-container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {acceptLetters.map((letter, i) => (
          <div
            key={i}
            className="accept-letter"
            style={{
              fontSize: 120,
              color: "#FFD700",
              fontWeight: "bold",
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              letterSpacing: 10,
              opacity: 0,
              display: "inline-block",
              textShadow: "0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,215,0,0.4)",
            }}
          >
            {letter}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
