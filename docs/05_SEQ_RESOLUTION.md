# Sequence 5: THE RESOLUTION — Ending & Outro
**File**: `src/sequences/Seq05_Resolution.tsx`  
**Frames**: 4800–5400 (20 giây)

---

## Kịch bản hình ảnh

### Beat 1: Điểm sáng nổ tung (Frame 4800–4920, 4 giây)
- Từ điểm sáng nhỏ (thừa hưởng Seq04) → bùng nổ thành vòng sáng tròn lớn
- Ring of light mở rộng ra viền màn hình rồi biến mất

```js
tl.to(".explosion-ring", {
  scale: 20,               // Phóng to cực lớn
  autoAlpha: 0,
  duration: 1.2,
  ease: "expo.out"
});
```

### Beat 2: Slogan Impact (Frame 4920–5130, 7 giây)
- Slogan chính xuất hiện giữa màn hình: **"THE FUTURE IS AGENTIC"**
- Font: **Anton** hoặc **Bebas Neue**, cực to, cực dày
- Dùng **CSS Text Masking** → gradient/shimmer chạy bên dưới chữ

```css
.slogan {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(
    90deg,
    #6366f1 0%,
    #a855f7 25%,
    #ec4899 50%,
    #a855f7 75%,
    #6366f1 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

```js
// Slogan bay vào từ dưới
tl.from(".slogan", {
  y: 200,
  autoAlpha: 0,
  scale: 0.5,
  duration: 0.8,
  ease: "back.out(1.4)"
});

// Gradient shimmer chạy qua chữ
tl.to(".slogan", {
  backgroundPosition: "-200% 0",
  duration: 3,
  ease: "none"            // Shimmer chạy đều
}, "<");
```

- **SplitText** cho chữ: Mỗi ký tự scale từ 0 lên (vỡ ra từ vụ nổ)

```js
const split = SplitText.create(".slogan", { type: "chars" });
tl.from(split.chars, {
  scale: 0,
  rotation: () => gsap.utils.random(-90, 90),  // Góc ngẫu nhiên
  autoAlpha: 0,
  duration: 0.6,
  stagger: {
    each: 0.04,
    from: "center"         // Từ giữa ra 2 bên
  },
  ease: "back.out(2)"
}, "<");
```

### Beat 3: Subtitle + Fade to Black (Frame 5130–5400, 9 giây)
- Subtitle nhỏ hơn hiện bên dưới: `"Powered by AI. Driven by Purpose."`
- Toàn bộ mờ dần về đen trong 3 giây cuối (90 frames cuối)

```js
// Subtitle
tl.from(".subtitle-outro", {
  autoAlpha: 0,
  y: 20,
  duration: 0.8,
  ease: "power2.out"
});

// Fade to black (dùng Remotion interpolate cho chính xác)
// Trong JSX:
const fadeOpacity = interpolate(
  frame,
  [5310, 5400],            // 3 giây cuối
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<AbsoluteFill style={{ opacity: fadeOpacity }}>
  {/* Nội dung */}
</AbsoluteFill>
```

---

## Thư viện sử dụng

| Thư viện | API cụ thể | Mục đích |
|----------|-----------|----------|
| `gsap` core | `back.out`, `expo.out` | Impact animation cho slogan |
| `gsap/SplitText` | `SplitText.create()`, `stagger from: "center"` | Chữ vỡ ra từ vụ nổ |
| `gsap` utils | `gsap.utils.random()` | Góc rotation ngẫu nhiên cho chars |
| `remotion` | `interpolate()` | Fade to black chính xác tới frame |
| `@remotion/google-fonts` | Anton / Bebas Neue | Font impact cực nặng |
| CSS | `-webkit-background-clip: text` | Gradient shimmer masking |
