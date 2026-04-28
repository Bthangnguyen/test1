import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/* ═══════════════════════════════════════════════════
   LPC SPRITE COMPONENT
   Hiển thị và animate nhân vật từ bộ thư viện LPC chuẩn
   Kích thước mỗi frame: 64x64px
   ═══════════════════════════════════════════════════ */

export type LPCAction = 
  | "spellcast_up" | "spellcast_left" | "spellcast_down" | "spellcast_right"
  | "thrust_up" | "thrust_left" | "thrust_down" | "thrust_right"
  | "walk_up" | "walk_left" | "walk_down" | "walk_right"
  | "slash_up" | "slash_left" | "slash_down" | "slash_right"
  | "shoot_up" | "shoot_left" | "shoot_down" | "shoot_right"
  | "die";

// Bản đồ ánh xạ hành động với số hàng (row) trong LPC sheet chuẩn 13x21
const ACTION_ROW_MAP: Record<LPCAction, number> = {
  spellcast_up: 0,
  spellcast_left: 1,
  spellcast_down: 2,
  spellcast_right: 3,
  thrust_up: 4,
  thrust_left: 5,
  thrust_down: 6,
  thrust_right: 7,
  walk_up: 8,
  walk_left: 9,
  walk_down: 10,
  walk_right: 11,
  slash_up: 12,
  slash_left: 13,
  slash_down: 14,
  slash_right: 15,
  shoot_up: 16,
  shoot_left: 17,
  shoot_down: 18,
  shoot_right: 19,
  die: 20
};

// Số lượng khung hình cho mỗi hành động
const ACTION_FRAMES: Record<LPCAction, number> = {
  spellcast_up: 7, spellcast_left: 7, spellcast_down: 7, spellcast_right: 7,
  thrust_up: 8, thrust_left: 8, thrust_down: 8, thrust_right: 8,
  walk_up: 9, walk_left: 9, walk_down: 9, walk_right: 9,
  slash_up: 6, slash_left: 6, slash_down: 6, slash_right: 6,
  shoot_up: 13, shoot_left: 13, shoot_down: 13, shoot_right: 13,
  die: 6
};

interface LPCSpriteProps {
  src: string;
  action: LPCAction;
  scale?: number;
  style?: React.CSSProperties;
  playing?: boolean;
  speedMultiplier?: number;
}

export const LPCSprite: React.FC<LPCSpriteProps> = ({
  src,
  action,
  scale = 1,
  style = {},
  playing = true,
  speedMultiplier = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const row = ACTION_ROW_MAP[action];
  const maxFrames = ACTION_FRAMES[action];
  
  // Tính toán khung hình hiện tại dựa trên số frame của Remotion
  // Nếu không playing, luôn dừng ở frame 0 (thường là tư thế đứng im)
  let currentSpriteFrame = 0;
  if (playing) {
    // Mỗi giây (fps) sẽ chạy được (10 * speedMultiplier) frames của animation
    const animationFps = 10 * speedMultiplier; 
    currentSpriteFrame = Math.floor((frame / fps) * animationFps) % maxFrames;
  }

  // Tọa độ cắt ảnh trên spritesheet
  const bgX = -(currentSpriteFrame * 64);
  const bgY = -(row * 64);

  return (
    <div
      style={{
        width: 64,
        height: 64,
        backgroundImage: `url('${src}')`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "832px 1344px", // Standard LPC full sheet size
        imageRendering: "pixelated",
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        // Tạo viền mỏng nhẹ cho pixel art nổi bật trên nền tối
        filter: "drop-shadow(2px 0 0 rgba(0,0,0,0.5)) drop-shadow(-2px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 2px 0 rgba(0,0,0,0.5)) drop-shadow(0 -2px 0 rgba(0,0,0,0.5))",
        ...style,
      }}
    />
  );
};
