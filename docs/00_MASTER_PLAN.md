# THE AUTOMATION ERA — Master Production Plan

## Thông số kỹ thuật
- **Thời lượng**: 3 phút (180 giây)
- **FPS**: 30 → **Tổng**: 5,400 frames
- **Kích thước**: 1920×1080
- **Stack**: Remotion + GSAP + Tailwind CSS

## Chiến lược chia module
5,400 frames chia thành 5 Sequence độc lập, ghép bằng `<Series>` của Remotion.

| # | Tên | Thời gian | Frames | File |
|---|-----|-----------|--------|------|
| 1 | The Hook (Kinetic Typography) | 0:00–0:30 | 0–900 | `Seq01_TheHook.tsx` |
| 2 | The Logic (Data Visualization) | 0:30–1:10 | 900–2100 | `Seq02_DataViz.tsx` |
| 3 | The System (Glassmorphism UI) | 1:10–1:55 | 2100–3450 | `Seq03_GlassUI.tsx` |
| 4 | The Chaos & Order (MG phức tạp) | 1:55–2:40 | 3450–4800 | `Seq04_ChaosOrder.tsx` |
| 5 | The Resolution (Outro) | 2:40–3:00 | 4800–5400 | `Seq05_Resolution.tsx` |

## Cấu trúc thư mục
```
src/
├── sequences/
│   ├── Seq01_TheHook.tsx
│   ├── Seq02_DataViz.tsx
│   ├── Seq03_GlassUI.tsx
│   ├── Seq04_ChaosOrder.tsx
│   └── Seq05_Resolution.tsx
├── hooks/
│   └── useSplitChars.ts        # Custom SplitText thay thế
├── components/
│   ├── GlassPanel.tsx           # Glassmorphism panel tái sử dụng
│   ├── GridCircle.tsx           # Hạt particle cho Seq04
│   └── AnimatedBar.tsx          # Cột biểu đồ cho Seq02
└── AutomationEraMain.tsx        # Master composition ghép 5 Sequence
```

## Quy tắc GSAP trong Remotion
1. **Không dùng `repeat: -1`** → Remotion render từng frame, vòng lặp vô hạn sẽ gây lỗi.
2. **Dùng `useGSAP()` + `useCurrentFrame()`** → Bind GSAP timeline `.progress()` với `frame / durationInFrames`.
3. **Chỉ animate transform** (`x`, `y`, `scale`, `rotation`, `autoAlpha`) → Tối ưu GPU.
4. **SplitText miễn phí** từ GSAP v3.13+ (sau khi Webflow mua lại) → Import thẳng từ `gsap/SplitText`.

## Workflow thực thi
1. Code Seq01 → Preview → QA → Chốt
2. Code Seq02 → Preview → QA → Chốt
3. ... lặp lại cho Seq03–05
4. Ghép Master → Full render test

## Chi tiết từng Sequence
Xem file `01_SEQ_HOOK.md` đến `05_SEQ_RESOLUTION.md` trong cùng thư mục.
