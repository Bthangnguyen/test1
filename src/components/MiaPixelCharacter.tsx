import React from "react";

/* ═══════════════════════════════════════════════════
   MIA PIXEL CHARACTER — CSS Pixel Art (Terraria style)
   
   Mỗi pixel = 1 cell trong grid, scale lên bằng PIXEL_SIZE
   → Luôn đồng bộ với mọi background vì mình kiểm soát từng pixel
   → Animate thoải mái: breathing, walking, waving
   ═══════════════════════════════════════════════════ */

/* ─── Color Palette (Terraria-inspired) ─── */
const PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#8B5E3C", // hair brown
  2: "#F2C9A3", // skin peach
  3: "#2D1B12", // eyes dark
  4: "#4478B8", // dress blue
  5: "#E8E4D8", // apron off-white
  6: "#4A3020", // boots dark brown
  7: "#C44444", // hair ribbon red
  8: "#6B4226", // hair shadow
  9: "#3A6298", // dress shadow
};

/* ─── Pixel Data: 12 wide × 20 tall ─── */
/* Standing pensive pose — looking slightly right */
const MIA_STANDING: number[][] = [
  //0  1  2  3  4  5  6  7  8  9  10 11
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0], // 0:  hair top
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0], // 1:  hair
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], // 2:  hair + ponytail
  [0, 0, 0, 1, 8, 8, 8, 8, 1, 1, 1, 0], // 3:  hair lower + tail
  [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 1, 0], // 4:  forehead + tail
  [0, 0, 0, 2, 3, 2, 2, 3, 0, 0, 1, 0], // 5:  eyes + tail
  [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0], // 6:  mouth/chin
  [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0], // 7:  neck
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0], // 8:  dress shoulders
  [0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0], // 9:  dress upper
  [0, 0, 4, 4, 5, 5, 5, 4, 4, 0, 0, 0], // 10: dress + apron
  [0, 0, 4, 9, 5, 5, 5, 9, 4, 0, 0, 0], // 11: dress + apron shadow
  [0, 0, 4, 9, 5, 5, 5, 9, 4, 0, 0, 0], // 12: dress + apron
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0], // 13: dress lower
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0], // 14: dress skirt
  [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0], // 15: dress bottom
  [0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0], // 16: legs
  [0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0], // 17: legs
  [0, 0, 0, 6, 6, 0, 6, 6, 0, 0, 0, 0], // 18: boots
  [0, 0, 0, 6, 6, 0, 6, 6, 0, 0, 0, 0], // 19: boots
];

/* ─── Walk Frame 1 (left leg forward) ─── */
const MIA_WALK1: number[][] = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 8, 8, 8, 8, 1, 1, 1, 0],
  [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 1, 0],
  [0, 0, 0, 2, 3, 2, 2, 3, 0, 0, 1, 0],
  [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0],
  [0, 0, 4, 4, 5, 5, 5, 4, 4, 0, 0, 0],
  [0, 0, 4, 9, 5, 5, 5, 9, 4, 0, 0, 0],
  [0, 0, 4, 9, 5, 5, 5, 9, 4, 0, 0, 0],
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0], // legs spread
  [0, 0, 6, 6, 0, 0, 0, 0, 2, 0, 0, 0], // left boot forward
  [0, 0, 6, 6, 0, 0, 0, 6, 6, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 6, 6, 0, 0, 0],
];

/* ─── Walk Frame 2 (right leg forward) ─── */
const MIA_WALK2: number[][] = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 8, 8, 8, 8, 1, 1, 1, 0],
  [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 1, 0],
  [0, 0, 0, 2, 3, 2, 2, 3, 0, 0, 1, 0],
  [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0],
  [0, 0, 4, 4, 5, 5, 5, 4, 4, 0, 0, 0],
  [0, 0, 4, 9, 5, 5, 5, 9, 4, 0, 0, 0],
  [0, 0, 4, 9, 5, 5, 5, 9, 4, 0, 0, 0],
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0], // legs spread
  [0, 0, 0, 2, 0, 0, 0, 6, 6, 0, 0, 0], // right boot forward
  [0, 0, 6, 6, 0, 0, 0, 6, 6, 0, 0, 0],
  [0, 0, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const POSES = {
  standing: MIA_STANDING,
  walk1: MIA_WALK1,
  walk2: MIA_WALK2,
} as const;

export type MiaPose = keyof typeof POSES;

/* ─── Component Props ─── */
interface MiaPixelCharacterProps {
  pose?: MiaPose;
  pixelSize?: number;
  flipX?: boolean;
  style?: React.CSSProperties;
  breatheAmount?: number; // 0-1, controls breathing animation intensity
}

/* ─── Render ─── */
export const MiaPixelCharacter: React.FC<MiaPixelCharacterProps> = ({
  pose = "standing",
  pixelSize = 6,
  flipX = false,
  style = {},
  breatheAmount = 0,
}) => {
  const pixels = POSES[pose];
  const gridH = pixels.length;
  const gridW = pixels[0].length;

  return (
    <div
      style={{
        width: gridW * pixelSize,
        height: gridH * pixelSize,
        position: "relative",
        imageRendering: "pixelated",
        transform: `${flipX ? "scaleX(-1)" : ""} scaleY(${1 + breatheAmount * 0.015})`,
        transformOrigin: "bottom center",
        // Pixel-perfect outline
        filter: [
          `drop-shadow(${pixelSize}px 0 0 #1a1a2e)`,
          `drop-shadow(-${pixelSize}px 0 0 #1a1a2e)`,
          `drop-shadow(0 ${pixelSize}px 0 #1a1a2e)`,
          `drop-shadow(0 -${pixelSize}px 0 #1a1a2e)`,
        ].join(" "),
        ...style,
      }}
    >
      {pixels.map((row, y) =>
        row.map((colorIdx, x) => {
          if (colorIdx === 0) return null;
          return (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: x * pixelSize,
                top: y * pixelSize,
                width: pixelSize,
                height: pixelSize,
                backgroundColor: PALETTE[colorIdx],
              }}
            />
          );
        })
      )}
    </div>
  );
};
