# Sequence 4: THE CHAOS & ORDER — Motion Graphics phức tạp
**File**: `src/sequences/Seq04_ChaosOrder.tsx`  
**Frames**: 3450–4800 (45 giây)

---

## Kịch bản hình ảnh

### Beat 1: Hạt particle bùng nổ (Frame 3450–3900, 15 giây)
- Grid 10×10 = 100 hình tròn nhỏ (SVG `<circle>` hoặc div) xuất hiện từ tâm
- Dùng **GSAP Advanced Grid Stagger** để tạo hiệu ứng sóng lan tỏa

```js
tl.from(".particle", {
  scale: 0,
  autoAlpha: 0,
  duration: 0.8,
  stagger: {
    grid: [10, 10],        // Grid 10x10
    from: "center",        // Lan tỏa từ trung tâm
    amount: 1.5,           // Tổng 1.5s cho toàn bộ stagger
    ease: "power2.out"     // Hạt ở rìa xuất hiện chậm hơn
  },
  ease: "back.out(1.7)"
});
```

### Beat 2: Xoáy dữ liệu (Frame 3900–4350, 15 giây)
- 100 hạt bắt đầu xoay tròn quanh tâm → tạo cơn lốc
- Mỗi hạt có quỹ đạo khác nhau (dùng function-based values)
- Màu sắc biến đổi liên tục qua gradient

```js
// Xoáy - mỗi hạt có bán kính và tốc độ riêng
tl.to(".particle", {
  rotation: (i) => 360 + (i % 5) * 72,    // Góc khác nhau
  x: (i) => Math.cos(i * 0.63) * (150 + i * 3),
  y: (i) => Math.sin(i * 0.63) * (150 + i * 3),
  duration: 3,
  stagger: {
    each: 0.02,
    from: "edges"
  },
  ease: "power1.inOut"
});

// Biến đổi màu sắc
tl.to(".particle", {
  backgroundColor: (i) => {
    const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
    return colors[i % colors.length];
  },
  duration: 2,
  stagger: 0.03,
  ease: "none"
}, "<");
```

### Beat 3: Hội tụ thành khối (Frame 4350–4650, 10 giây)
- Tất cả hạt co lại, hội tụ về tâm tạo hình tròn lớn phát sáng
- Camera giả lập lùi ra (scale container nhỏ dần)

```js
// Hội tụ
tl.to(".particle", {
  x: 0, y: 0,
  scale: 0.3,
  duration: 2,
  stagger: {
    grid: [10, 10],
    from: "edges",         // Rìa co vào trước
    amount: 1
  },
  ease: "power4.in"        // Tăng tốc mạnh → hội tụ bùng nổ
});

// Camera pull-back
tl.to(".chaos-container", {
  scale: 0.5,
  duration: 3,
  ease: "power2.inOut"
}, "<");

// Phát sáng tại tâm
tl.to(".core-glow", {
  boxShadow: "0 0 120px 60px rgba(139,92,246,0.8)",
  scale: 1.5,
  duration: 1.5,
  ease: "expo.out"
}, ">-0.5");
```

### Beat 4: Chuyển cảnh (Frame 4650–4800, 5 giây)
- Khối năng lượng co lại thành 1 điểm sáng nhỏ
- Flash trắng → chuẩn bị cho Seq05

```js
tl.to(".core-glow", {
  scale: 0.05,
  duration: 1,
  ease: "power4.in"
})
.to(".flash", { autoAlpha: 1, duration: 0.1 })
.to(".flash", { autoAlpha: 0, duration: 0.5 });
```

---

## Thư viện sử dụng

| Thư viện | API cụ thể | Mục đích |
|----------|-----------|----------|
| `gsap` core | `stagger: { grid, from, amount }` | Grid stagger sóng lan tỏa |
| `gsap` core | Function-based values `(i) => ...` | Quỹ đạo xoáy riêng biệt mỗi hạt |
| `gsap` core | `ease: "power4.in"` | Tăng tốc cực mạnh cho hiệu ứng hút |
| `@remotion/shapes` | `<Circle>` | Vẽ 100 hạt particle |
| `@remotion/noise` | `noise3D()` | Xáo trộn vị trí particle thêm organic |
| `remotion` | `useCurrentFrame()` | Bind timeline progress |
