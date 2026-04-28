# Sequence 2: THE LOGIC — Data Visualization
**File**: `src/sequences/Seq02_DataViz.tsx`  
**Frames**: 900–2100 (40 giây)

---

## Kịch bản hình ảnh

### Beat 1: Mạng lưới mạch điện (Frame 900–1200, 10 giây)
- Từ điểm sáng trung tâm (thừa hưởng từ Seq01), các đường line SVG tỏa ra tạo thành grid
- Mỗi đường line có hiệu ứng "dòng điện chạy" bằng `stroke-dashoffset`

```js
// Vẽ grid line bằng SVG path
// Dùng DrawSVGPlugin để reveal dần
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin);

tl.from(".grid-line", {
  drawSVG: "0%",           // Bắt đầu từ 0, vẽ dần ra
  duration: 1.5,
  stagger: {
    each: 0.08,
    from: "center"         // Tỏa ra từ trung tâm
  },
  ease: "power2.out"
});

// Hiệu ứng dòng điện chạy liên tục
tl.to(".circuit-pulse", {
  strokeDashoffset: -200,  // Animate offset để dot chạy trên line
  duration: 2,
  ease: "none"             // Tốc độ đều
}, "<");
```

**Remotion alternative (nếu không dùng DrawSVG):**
```js
import { interpolate } from "remotion";
import { evolvePath } from "@remotion/paths";

// Dùng @remotion/paths để tính stroke progress
const progress = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp" });
const { strokeDasharray, strokeDashoffset } = evolvePath(progress, pathLength);
```

### Beat 2: Biểu đồ cột mọc lên (Frame 1200–1650, 15 giây)
- 7 cột hình chữ nhật mọc từ dưới lên, chiều cao ngẫu nhiên (40%–100%)
- Mỗi cột có gradient màu khác nhau (xanh dương → tím → hồng)
- Dùng `@remotion/shapes` cho các thanh Rectangle

```js
// Component AnimatedBar
const barHeights = [40, 65, 80, 55, 95, 72, 100]; // Phần trăm

tl.from(".bar", {
  scaleY: 0,               // Scale từ 0 lên 1
  transformOrigin: "bottom center",
  duration: 0.8,
  stagger: 0.12,           // Mỗi cột cách 0.12s
  ease: "back.out(1.7)"    // Nảy nhẹ khi chạm đỉnh
});
```

### Beat 3: Số liệu bắn ra (Frame 1650–1950, 10 giây)
- Khi mỗi cột chạm đỉnh, text con số bắn lên phía trên:
  - `"10x"`, `"100B"`, `"GPT-5"`, `"1T tokens"`, v.v.
- Text nảy lên theo `back.out`

```js
tl.from(".stat-label", {
  y: 40,
  autoAlpha: 0,
  scale: 0.5,
  duration: 0.6,
  stagger: 0.15,
  ease: "back.out(2.5)"    // Nảy mạnh, overshoot rõ
});
```

### Beat 4: Chuyển cảnh (Frame 1950–2100, 5 giây)
- Toàn bộ biểu đồ scale nhỏ dần (camera zoom out giả lập)
- Mờ dần, chuẩn bị cho Seq03

```js
tl.to(".dataviz-container", {
  scale: 0.3,
  autoAlpha: 0,
  duration: 1.5,
  ease: "power3.in"
});
```

---

## Thư viện sử dụng

| Thư viện | API cụ thể | Mục đích |
|----------|-----------|----------|
| `gsap` core | `timeline()`, `stagger`, `back.out` | Điều khiển bar chart & stat labels |
| `gsap/DrawSVGPlugin` | `drawSVG: "0%"` | Vẽ grid line tỏa ra từ tâm |
| `@remotion/paths` | `evolvePath()` | Fallback SVG stroke animation |
| `@remotion/shapes` | `<Rect>` | Vẽ các cột biểu đồ |
| `@remotion/noise` | `noise2D()` | Hiệu ứng nhiễu hạt nền (grain) |
| `remotion` | `interpolate()` | Map frame → giá trị chiều cao cột |
