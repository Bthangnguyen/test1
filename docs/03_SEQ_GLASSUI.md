# Sequence 3: THE SYSTEM — Glassmorphism UI
**File**: `src/sequences/Seq03_GlassUI.tsx`  
**Frames**: 2100–3450 (45 giây)

---

## Kịch bản hình ảnh

### Beat 1: Camera zoom xuyên (Frame 2100–2400, 10 giây)
- Scale container từ 0.3 → 1 (giả lập camera bay vào)
- Background gradient xoay chậm: `conic-gradient` rotate

```js
tl.from(".glass-scene", {
  scale: 0.3,
  autoAlpha: 0,
  duration: 2,
  ease: "expo.out"         // Bay vào cực mượt
});

// Background gradient xoay
tl.to(".bg-gradient", {
  rotation: 360,
  duration: 20,
  ease: "none"             // Xoay đều, chạy suốt scene
}, 0);
```

### Beat 2: Panel kính nổi lên (Frame 2400–2850, 15 giây)
- 3 panel Glassmorphism xuất hiện lần lượt, lệch góc 3D
- CSS bắt buộc cho mỗi panel:

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

- GSAP 3D float animation:
```js
// Panel 1: Nghiêng trái
tl.from(".panel-1", {
  rotateY: -40,
  rotateX: 15,
  z: -300,                 // Xa camera
  autoAlpha: 0,
  duration: 1.2,
  ease: "power3.out"
});

// Panel 2: Nghiêng phải
tl.from(".panel-2", {
  rotateY: 30,
  rotateX: -10,
  z: -200,
  autoAlpha: 0,
  duration: 1.2,
  ease: "power3.out"
}, "<0.4");                // Trễ 0.4s so với panel 1

// Panel 3: Chính diện
tl.from(".panel-3", {
  scale: 0.6,
  z: -400,
  autoAlpha: 0,
  duration: 1.2,
  ease: "power3.out"
}, "<0.4");

// Floating liên tục (dùng trong giới hạn timeline)
gsap.to(".panel-1", {
  y: "+=15", rotateX: "+=3",
  duration: 3, yoyo: true, repeat: 5,
  ease: "sine.inOut"
});
```

### Beat 3: Code typing trên panel (Frame 2850–3300, 15 giây)
- Panel chính hiện đoạn code Python/JS chạy dần (typing effect)
- Dùng `useCurrentFrame()` của Remotion để điều khiển substring

```tsx
// Remotion-native typing (KHÔNG dùng GSAP cho text typing)
const codeText = `const agent = new AgenticAI({
  model: "gpt-5-turbo",
  tools: [search, code, reason],
  memory: "persistent",
  autonomy: 0.95
});
agent.run("Optimize everything.");`;

const visibleLength = Math.floor(
  interpolate(frame - localStart, [0, 300], [0, codeText.length], {
    extrapolateRight: "clamp"
  })
);

// Render
<pre style={{ fontFamily: "'JetBrains Mono', monospace" }}>
  {codeText.slice(0, visibleLength)}
  <span className="cursor-blink">|</span>
</pre>
```

### Beat 4: Chuyển cảnh — Panel vỡ (Frame 3300–3450, 5 giây)
- 3 panel bay ra 3 hướng khác nhau + scale lên + fade out
- Chuẩn bị cho Seq04 (Chaos)

```js
tl.to(".panel-1", { x: -800, rotation: -30, autoAlpha: 0, duration: 1, ease: "power3.in" })
  .to(".panel-2", { x: 800, rotation: 20, autoAlpha: 0, duration: 1, ease: "power3.in" }, "<0.1")
  .to(".panel-3", { y: -600, scale: 2, autoAlpha: 0, duration: 1, ease: "power3.in" }, "<0.1");
```

---

## Thư viện sử dụng

| Thư viện | API cụ thể | Mục đích |
|----------|-----------|----------|
| `gsap` core | `rotateX/Y`, `z`, `yoyo` | 3D float & panel entrance |
| `@gsap/react` | `useGSAP()` | React lifecycle binding |
| `remotion` | `interpolate()`, `useCurrentFrame()` | Typing effect đồng bộ frame |
| `@remotion/google-fonts` | JetBrains Mono | Font code monospace |
| CSS | `backdrop-filter: blur()` | Glassmorphism effect |
| `@remotion/noise` | `noise2D()` | Background blob animation |
