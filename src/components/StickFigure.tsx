import React from "react";
import { COLORS } from "../motion/tokens";

type HeadType = "circle" | "star" | "wrench" | "gear" | "crown" | "heart";
type Posture = "upright" | "slouched" | "working" | "extending";

interface Props {
  headType?: HeadType;
  posture?: Posture;
  scale?: number;
  opacity?: number;
  style?: React.CSSProperties;
  armExtend?: boolean;
}

const HEAD_RENDERERS: Record<HeadType, () => React.ReactElement> = {
  circle: () => <circle cx={50} cy={25} r={18} fill={COLORS.figure} />,
  star: () => (
    <g transform="translate(50,25)">
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={0} y1={-20} x2={0} y2={-8}
          stroke={COLORS.figure} strokeWidth={3} strokeLinecap="round"
          transform={`rotate(${i * 72})`}
        />
      ))}
      <circle cx={0} cy={0} r={6} fill={COLORS.figure} />
    </g>
  ),
  wrench: () => (
    <g transform="translate(35,8)">
      <rect x={12} y={10} width={6} height={28} rx={2} fill={COLORS.figure} />
      <circle cx={15} cy={8} r={10} fill="none" stroke={COLORS.figure} strokeWidth={4} />
      <rect x={10} y={32} width={10} height={8} rx={2} fill={COLORS.figure} />
    </g>
  ),
  gear: () => (
    <g transform="translate(50,25)">
      <circle cx={0} cy={0} r={10} fill="none" stroke={COLORS.figure} strokeWidth={3} />
      <circle cx={0} cy={0} r={4} fill={COLORS.figure} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={-3} y={-18} width={6} height={8} rx={1} fill={COLORS.figure}
          transform={`rotate(${i * 60})`}
        />
      ))}
    </g>
  ),
  crown: () => (
    <g transform="translate(32,8)">
      <polygon points="0,28 5,8 12,20 18,0 24,20 31,8 36,28" fill="none" stroke={COLORS.figure} strokeWidth={3} strokeLinejoin="round" />
      <rect x={0} y={26} width={36} height={6} rx={2} fill={COLORS.figure} />
    </g>
  ),
  heart: () => (
    <g transform="translate(50,25)">
      <path d="M0,6 C0,-6 -14,-10 -14,0 C-14,10 0,18 0,18 C0,18 14,10 14,0 C14,-10 0,-6 0,6 Z"
        fill={COLORS.figure} />
    </g>
  ),
};

export const StickFigure: React.FC<Props> = ({
  headType = "circle",
  posture = "upright",
  scale = 1,
  opacity = 1,
  style,
  armExtend = false,
}) => {
  const bodyTilt = posture === "slouched" ? 25 : posture === "working" ? 15 : 0;
  const armAngle = posture === "working" ? -40 : armExtend ? -60 : -25;
  const rightArmAngle = armExtend ? 50 : 25;

  return (
    <svg width={100 * scale} height={200 * scale} viewBox="0 0 100 200" style={{ ...style, opacity }}>
      {/* Head */}
      {HEAD_RENDERERS[headType]()}

      {/* Neck */}
      <line x1={50} y1={43} x2={50} y2={55} stroke={COLORS.figure} strokeWidth={3} strokeLinecap="round" />

      {/* Body */}
      <g transform={`rotate(${bodyTilt}, 50, 55)`}>
        <line x1={50} y1={55} x2={50} y2={120} stroke={COLORS.figure} strokeWidth={4} strokeLinecap="round" />

        {/* Left arm */}
        <line x1={50} y1={70} x2={50 + Math.cos(armAngle * Math.PI / 180) * 45} y2={70 - Math.sin(armAngle * Math.PI / 180) * 45}
          stroke={COLORS.figure} strokeWidth={3} strokeLinecap="round" />

        {/* Right arm */}
        <line x1={50} y1={70} x2={50 + Math.cos(rightArmAngle * Math.PI / 180) * 45} y2={70 + Math.sin(rightArmAngle * Math.PI / 180) * 45}
          stroke={COLORS.figure} strokeWidth={3} strokeLinecap="round" />

        {/* Left leg */}
        <line x1={50} y1={120} x2={30} y2={180} stroke={COLORS.figure} strokeWidth={3} strokeLinecap="round" />

        {/* Right leg */}
        <line x1={50} y1={120} x2={70} y2={180} stroke={COLORS.figure} strokeWidth={3} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/** Small secondary figure — 60% scale for crowd/group */
export const SmallFigure: React.FC<{ x?: number; opacity?: number; posture?: Posture }> = ({
  x = 0, opacity = 0.7, posture = "upright",
}) => (
  <div style={{ position: "absolute", left: x, bottom: 0, opacity }}>
    <StickFigure headType="circle" posture={posture} scale={0.6} />
  </div>
);
