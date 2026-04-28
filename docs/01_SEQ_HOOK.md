# Sequence 1: THE HOOK — Kinetic Typography
**File**: `src/sequences/Seq01_TheHook.tsx`  
**Frames**: 0–900 (30 giây)

---

## Kịch bản hình ảnh (Storyboard)

### Beat 1: Bóng tối (Frame 0–90, 3 giây)
- Màn hình đen hoàn toàn `#0a0a0a`
- Một cursor nhấp nháy (blinking) ở giữa màn hình
- **GSAP**: `gsap.to(cursor, { autoAlpha: 0, repeat: 3, yoyo: true, duration: 0.4 })`

### Beat 2: Từ khóa bùng nổ (Frame 90–450, 12 giây)
- 3 từ khóa lần lượt **văng vào** từ các góc khác nhau:
  - `"TỐC ĐỘ"` — từ góc trên trái → trung tâm
  - `"DỮ LIỆU"` — từ góc dưới phải → trung tâm
  - `"TỰ ĐỘNG"` — từ dưới lên → trung tâm
- Mỗi từ xuất hiện cách nhau ~3 giây

**GSAP chi tiết cho mỗi từ:**
```js
// Ví dụ cho "TỐC ĐỘ"
tl.from(".word-speed", {
  x: -1200,           // bay từ ngoài màn hình bên trái
  y: -600,            // từ trên cao
  scale: 3,           // to gấp 3 lần
  autoAlpha: 0,
  filter: "blur(20px)",
  duration: 1.2,
  ease: "expo.out"    // Giảm tốc mạnh khi tới đích
})
.to(".word-speed", {
  filter: "blur(0px)", // Sắc nét dần
  scale: 1.5,
  duration: 0.5,
  ease: "power2.out"
}, "<0.3");            // Bắt đầu 0.3s sau khi bay vào
```

**Remotion integration:**
```js
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useGSAP } from "@gsap/react";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

useGSAP(() => {
  const tl = gsap.timeline();
  // ... build timeline
  tl.progress(frame / 900); // Bind tới Remotion frame
}, { dependencies: [frame] });
```

### Beat 3: Xếp thành câu (Frame 450–720, 9 giây)
- 3 từ khóa di chuyển từ vị trí ngẫu nhiên → xếp thành 1 hàng ngang
- Bên dưới hiện subtitle: `"Kỷ nguyên Agentic AI đã bắt đầu"`
- Subtitle dùng **SplitText** stagger từng chữ cái:

```js
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const split = SplitText.create(".subtitle", { type: "chars" });
tl.from(split.chars, {
  autoAlpha: 0,
  y: 30,
  stagger: 0.03,       // Mỗi chữ cách nhau 0.03s
  duration: 0.4,
  ease: "back.out(1.7)" // Nảy nhẹ khi xuất hiện
});
```

### Beat 4: Hút vào tâm (Frame 720–900, 6 giây)
- Toàn bộ text bị hút về 1 điểm sáng ở trung tâm
- Điểm sáng phát ra flash trắng rồi fade

```js
tl.to(".all-text", {
  scale: 0,
  autoAlpha: 0,
  x: "50%",
  y: "50%",
  duration: 1.5,
  ease: "power4.in",     // Tăng tốc dần (hút vào)
  stagger: 0.05
})
.to(".flash-overlay", {
  autoAlpha: 1,
  duration: 0.15
})
.to(".flash-overlay", {
  autoAlpha: 0,
  duration: 0.5
});
```

---

## Thư viện sử dụng

| Thư viện | API cụ thể | Mục đích |
|----------|-----------|----------|
| `gsap` core | `gsap.timeline()`, `gsap.to/from` | Điều khiển toàn bộ animation |
| `gsap/SplitText` | `SplitText.create()`, `.chars` | Tách subtitle thành từng chữ |
| `@gsap/react` | `useGSAP()` | Bind GSAP vào React lifecycle |
| `remotion` | `useCurrentFrame()`, `interpolate()` | Đồng bộ frame với GSAP |
| `@remotion/google-fonts` | `loadFont()` | Font chữ Impact/Black |

## Font chữ
- Từ khóa lớn: **Anton** hoặc **Bebas Neue** (Google Fonts, UltraBold)
- Subtitle: **Inter** hoặc **Space Grotesk** (sạch, hiện đại)
