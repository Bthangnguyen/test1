# THE DIGITAL SINGULARITY — Aggressive Cyber-Motion Blueprint

## Triết lý cốt lõi: Chaotic Order
**Contrast Timing**: 1–2 frame im lặng tuyệt đối trước mỗi cú burst.
**Seeded Randomness**: Mọi `Math.random()` thay bằng hàm `seededRandom(frame)` — deterministic, render frame nào cũng cho kết quả giống nhau.

## Hàm nền tảng (NEW: `src/utils/glitch.ts`)

```ts
// Seeded random — deterministic per frame
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// RGB Split offset — returns {r, g, b} offsets
export function rgbSplit(frame: number, intensity: number) {
  return {
    r: { x: seededRandom(frame * 3.1) * intensity - intensity/2, 
         y: seededRandom(frame * 7.3) * intensity - intensity/2 },
    g: { x: seededRandom(frame * 5.7) * intensity - intensity/2, 
         y: seededRandom(frame * 11.2) * intensity - intensity/2 },
    b: { x: seededRandom(frame * 13.9) * intensity - intensity/2, 
         y: seededRandom(frame * 17.1) * intensity - intensity/2 },
  };
}

// Screen shake — decaying oscillation
export function screenShake(frame: number, triggerFrame: number, intensity: number) {
  const diff = frame - triggerFrame;
  if (diff < 0 || diff > 10) return { x: 0, y: 0 };
  const decay = Math.exp(-diff * 0.4);
  return {
    x: Math.sin(diff * 13.7) * intensity * decay,
    y: Math.cos(diff * 17.3) * intensity * decay,
  };
}

// Strobe — returns opacity 0 or 1 based on rhythm
export function strobe(frame: number, bpm: number = 140) {
  const beat = (frame / 30) * (bpm / 60);
  return Math.sin(beat * Math.PI * 4) > 0.3 ? 1 : 0.05;
}

// Simulated bass amplitude (no audio file needed)
export function bassAmplitude(frame: number) {
  const t = frame / 30;
  // Simulated bass hits every ~0.43s (140 BPM)
  const beat = (t * 140 / 60) % 1;
  return Math.pow(Math.max(0, 1 - beat * 3), 2); // sharp attack, fast decay
}
```

---

## Cấu trúc thư mục mới

```
src/
├── utils/
│   └── glitch.ts              # seededRandom, rgbSplit, screenShake, strobe, bassAmplitude
├── components/
│   ├── GlitchText.tsx         # RGB Split text (3 layer R-G-B offset)
│   ├── GlassPanel.tsx         # Glassmorphism panel (giữ lại)
│   ├── TitleCard.tsx          # Giữ lại cho reference
│   └── CodeRain.tsx           # Matrix-style code rain
├── sequences/
│   ├── Seq01_TheBreach.tsx    # Kinetic Overload
│   ├── Seq02_DataStorm.tsx    # Audio-Reactive Chaos
│   └── Seq03_CrashRebirth.tsx # Shards & Massive Typography
└── AutomationEraMain.tsx      # Master: 3 sequences via <Series>
```

---

## SEQUENCE 1: THE BREACH (0:00–0:45 = 1350 frames)

### Concept: Chữ KHÔNG "hiện ra", nó "ĐẤM" vào màn hình.

### Beat 1: Static noise boot (0–60, 2 giây)
- Fullscreen TV static (noise) pattern
- Dùng `seededRandom(frame * pixel_index)` để render grid 192×108 pixel noise
- Strobe flash mỗi 3 frame

### Beat 2: Glitch text PUNCH (60–600, 18 giây)
**6 từ xuất hiện từng cái, mỗi cái "đấm" vào screen:**
```
"SPEED" → "DATA" → "AUTONOMY" → "INTELLIGENCE" → "SINGULARITY" → "NOW"
```

**Mỗi từ:**
1. **Frame N**: Im lặng hoàn toàn (1 frame đen)
2. **Frame N+1**: Từ xuất hiện NGAY LẬP TỨC ở full size (không fade, không scale)
3. **Frame N+1 → N+5**: RGB Split 15px, screen shake ±8px, strobe flash
4. **Frame N+5 → N+30**: RGB Split giảm dần 15→0, shake decay
5. **Frame N+30 → N+80**: Từ hold position, nhấp nháy glitch micro (mỗi 5 frame)
6. **Frame N+80**: Từ "xé" ra (scale nhanh + blur) → chuẩn bị từ tiếp theo

**Kỹ thuật GlitchText component:**
```tsx
// 3 lớp text chồng nhau: Red channel, Green channel, Blue channel
<div style={{ position: "relative" }}>
  {/* Red layer */}
  <div style={{
    position: "absolute",
    color: "red", mixBlendMode: "screen",
    transform: `translate(${rgbSplit.r.x}px, ${rgbSplit.r.y}px)`,
  }}>{text}</div>
  {/* Green layer */}
  <div style={{
    position: "absolute",
    color: "lime", mixBlendMode: "screen",
    transform: `translate(${rgbSplit.g.x}px, ${rgbSplit.g.y}px)`,
  }}>{text}</div>
  {/* Blue layer */}
  <div style={{
    position: "absolute",
    color: "blue", mixBlendMode: "screen",
    transform: `translate(${rgbSplit.b.x}px, ${rgbSplit.b.y}px)`,
  }}>{text}</div>
</div>
```

### Beat 3: Compound slam (600–900, 10 giây)
- Tất cả 6 từ xuất hiện cùng lúc, xếp dọc giữa màn hình
- Mỗi 10 frame: random jitter toàn bộ (dx, dy = ±3px per word)
- Scanline overlay di chuyển từ trên xuống liên tục
- Bass pulse: scale toàn bộ 1.0 → 1.05 theo `bassAmplitude()`

### Beat 4: Breach shatter (900–1350, 15 giây)
- Screen chia thành grid 4×4 = 16 mảnh
- Mỗi mảnh xoay `rotateX`, `rotateY` ngẫu nhiên (seeded)
- Các mảnh bay ra ngoài viewport theo hướng radial
- 3 frame cuối: flash trắng

---

## SEQUENCE 2: THE DATA STORM (0:45–1:30 = 1350 frames)

### Concept: Cơn bão mã code xoay cuồng + Glassmorphism audio-reactive

### Beat 1: Code rain spawn (0–300, 10 giây)
- 200+ ký tự code random (0-9, a-f, {, }, =, ;, //) bay ra từ tâm theo vòng tròn
- Dùng `stagger: { amount: 2, from: "center" }` pattern trong Remotion
- Mỗi ký tự có orbit radius khác nhau + speed khác nhau

### Beat 2: Deep zoom tunnel (300–750, 15 giây)
- CSS `perspective: 800px` + GSAP `z` translation
- Các tầng dữ liệu (text layers) lao về phía camera (z: -2000 → 200)
- Glassmorphism panels xuất hiện ở xa, lao tới gần, bay qua camera
- Border-width co giãn theo `bassAmplitude()`:
  ```
  borderWidth = 1 + bassAmplitude(frame) * 4 // 1px → 5px theo nhịp bass
  ```
- Background blur intensity dao động theo bass

### Beat 3: Vortex convergence (750–1100, ~12 giây)
- Tất cả ký tự + panel bị hút vào vortex xoáy
- Spiral arm SVG (3 cánh) xoay tăng tốc
- Radius co dần → singularity

### Beat 4: Implosion flash (1100–1350, ~8 giây)
- Tất cả bị nuốt vào 1 điểm
- 2 frame im lặng tuyệt đối (đen hoàn toàn)
- FLASH → chuyển Seq03

---

## SEQUENCE 3: THE CRASH & REBIRTH (1:30–3:00 = 2700 frames)

### Concept: Màn hình VỠ → mảnh kính phản chiếu → Massive Typography

### Beat 1: Screen shatter (0–300, 10 giây)
- Grid 8×8 = 64 mảnh (dùng CSS `clip-path: polygon()`)
- Mỗi mảnh chứa 1 phần của nền gradient
- Mỗi mảnh `rotateX`, `rotateY` độc lập, rung theo bass
- Mảnh ở tâm giữ nguyên, mảnh ở rìa bay ra xa hơn

### Beat 2: Shard messages (300–1200, 30 giây)
- Trên mỗi mảnh kính lớn, hiện 1 từ/cụm từ:
  ```
  "ADAPT" / "EVOLVE" / "TRANSCEND" / "OVERRIDE" / "INFINITE"
  "NEURAL" / "QUANTUM" / "SWARM" / "GENESIS" / "APEX"
  ```
- Chữ trên mỗi mảnh có micro-glitch riêng (RGB split nhẹ 2-3px)
- Mảnh float nhẹ nhàng (sin/cos oscillation) — tạo hiệu ứng kính lơ lửng
- Background scanlines chạy liên tục

### Beat 3: Massive word — "SINGULARITY" (1200–2100, 30 giây)
- Tất cả mảnh co lại → merge → màn hình liền lại
- 1 từ duy nhất `"SINGULARITY"` chiếm 80% viewport
- Font size: 200px+, font-weight: 900
- Text được MASK bởi animated noise pattern:
  ```css
  background: url(noise-canvas) moving;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ```
  (Noise = grid seededRandom thay đổi mỗi frame)
- Shimmer gradient chạy ngang qua text
- Micro camera shake liên tục (±1px)

### Beat 4: Final collapse → black (2100–2700, 20 giây)
- "SINGULARITY" vỡ thành chars (mỗi char bay riêng)
- Chars hội tụ → text "THE FUTURE IS AGENTIC" xuất hiện
- Hold 3 giây → fade to black

---

## Bảng tổng hợp API sử dụng

| Kỹ thuật | API / Thư viện | Mục đích |
|----------|----------------|----------|
| Seeded Random | Custom `glitch.ts` | Deterministic noise per frame |
| RGB Split | CSS `mixBlendMode: "screen"` + transform offset | Glitch text 3 channel |
| Screen Shake | Custom function + Remotion `interpolate` | Camera rung theo bass |
| Strobe | Custom `strobe()` → opacity | Nhấp nháy theo BPM |
| Bass Simulation | Custom `bassAmplitude()` | Fake audio reactivity |
| Deep Zoom | CSS `perspective` + `translateZ` | Tunnel xuyên data |
| Grid Stagger | `stagger: { grid: [8,8], from: "center" }` pattern | Shard animation |
| Clip-path | CSS `clip-path: polygon()` | Cắt screen thành mảnh |
| Noise Mask | Canvas-like seededRandom grid + `background-clip: text` | Noise texture trên chữ |
| Spiral Arms | SVG `<polyline>` tính toán per frame | Vortex visual |
| `@remotion/noise` | `noise2D()` / `noise3D()` | Organic particle movement |
| Remotion `interpolate` | Frame-accurate value mapping | Mọi animation timing |

## Thứ tự thực hiện
1. Tạo `src/utils/glitch.ts` (nền tảng)
2. Tạo `src/components/GlitchText.tsx`
3. Viết `Seq01_TheBreach.tsx`
4. Viết `Seq02_DataStorm.tsx`
5. Viết `Seq03_CrashRebirth.tsx`
6. Cập nhật `AutomationEraMain.tsx` & `Root.tsx`
7. Full preview test
