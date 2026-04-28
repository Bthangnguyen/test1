# Kế Hoạch Nâng Cấp: Transitions + Title Cards + Seq02 Rework

## Vấn đề hiện tại
1. **Transitions đứt gãy**: Các scene cắt nối cứng, không có liên kết thị giác
2. **Thiếu context**: Người xem không biết mỗi phần đang nói về gì
3. **Seq02 quá hiền**: Biểu đồ cột mọc lên nhẹ nhàng, chưa thể hiện sự "phá hủy" của AI

---

## A. Hệ thống Title Card (Áp dụng cho cả 5 Sequence)

Mỗi Sequence sẽ có một **Title Card** xuất hiện ở đầu, format thống nhất:
- Số thứ tự nhỏ: `01 /` (font nhỏ, mờ)
- Tiêu đề lớn: `THE HOOK` (font to, sáng, có shimmer)
- Subtitle mô tả: `"When speed becomes the only language"` (font nhỏ, fade in sau)
- Xuất hiện trong **90 frames đầu** (3 giây), fade out trước khi nội dung chính bắt đầu

```
Seq01: 01 / THE HOOK          → "When speed becomes the only language"
Seq02: 02 / THE EXPLOSION     → "Computational power beyond comprehension"  
Seq03: 03 / THE SYSTEM        → "Intelligence as infrastructure"
Seq04: 04 / THE SINGULARITY   → "From chaos, order emerges"
Seq05: 05 / THE FUTURE        → "What comes next is inevitable"
```

### Kỹ thuật:
- Dùng Remotion `interpolate()` cho typing effect của subtitle
- Dùng CSS `background-clip: text` cho shimmer trên tiêu đề
- Tạo component `TitleCard.tsx` tái sử dụng cho cả 5 scene

---

## B. Hệ thống Transition (Giữa mỗi cặp Scene)

### Transition 1→2: "Singularity Burst"
**Concept**: Điểm sáng cuối Seq01 (sau khi text bị hút vào) NỔ TUNG thành grid lines của Seq02

**Kỹ thuật trong `Seq01_TheHook.tsx` (cuối scene):**
- Frame 820–900: Điểm sáng co lại → nổ → tạo ra các tia sáng radial
- Các tia sáng biến thành đường grid line → chuyển tiếp mượt vào Seq02

**Kỹ thuật trong `Seq02_DataViz.tsx` (đầu scene):**  
- Frame 0–60: Grid lines đã có sẵn ở trạng thái "đang nổ ra từ tâm"
- Tạo hiệu ứng liền mạch với flash trắng cuối Seq01

### Transition 2→3: "Data Collapse to Glass"
**Concept**: Biểu đồ cột vỡ thành mảnh kính → các mảnh xếp lại thành Glass Panel

**Kỹ thuật trong `Seq02_DataViz.tsx` (cuối scene):**
- Frame 1100–1200: Các cột biểu đồ vỡ nứt, co nhỏ, biến thành hình chữ nhật mờ
- Scale nhỏ dần + blur tăng

**Kỹ thuật trong `Seq03_GlassUI.tsx` (đầu scene):**
- Frame 0–90: Các mảnh kính từ tâm bay ra → biến hình thành 3 Glass Panel
- Background blob từ tối → sáng dần

### Transition 3→4: "Glass Shatter to Particles"
**Concept**: 3 panel kính vỡ nổ → mỗi mảnh vỡ biến thành 1 hạt particle trong grid 10×10

**Kỹ thuật trong `Seq03_GlassUI.tsx` (cuối scene):**
- Frame 1200–1350: Panel vỡ thành ~30 mảnh mỗi panel, bay ra ngoài

**Kỹ thuật trong `Seq04_ChaosOrder.tsx` (đầu scene):**
- Frame 0–60: 100 hạt particle bay vào từ viền màn hình (như thể là mảnh vỡ)
- Ngay sau đó bắt đầu xếp thành grid

### Transition 4→5: "Core Implosion"
**Concept**: Core glow cuối Seq04 co lại → im lặng 0.5s → NỔ thành explosion ring của Seq05

**Kỹ thuật**: Đã có sẵn (flash cuối Seq04 → ring đầu Seq05), chỉ cần tinh chỉnh timing

---

## C. Seq02 Rework: "THE EXPLOSION"

### Thay đổi tổng thể
Biểu đồ hiện tại quá "nhẹ nhàng kiểu thuyết trình". Cần biến nó thành:
- Các cột **phóng lên như tên lửa**, kèm **vệt lửa (trail)** và **rung lắc màn hình**
- Khi cột cuối cùng chạm đỉnh → **MÀN HÌNH NỨT VỠ** (crack overlay)
- Con số thống kê **đập vào** chứ không "nổi lên" nhẹ nhàng

### Chi tiết Beat mới cho Seq02:

**Beat 1 (0–300): Grid + Title Card**
- Title card: `02 / THE EXPLOSION`
- Grid lines tỏa ra từ tâm (giữ nguyên)

**Beat 2 (300–750): Bars LAUNCH (không phải "grow")**
- Mỗi cột phóng lên cực nhanh (duration 0.3s thay vì 0.8s)
- Kèm **motion trail** (vệt sáng phía dưới cột)
- Mỗi lần cột chạm đỉnh → **screen shake** nhẹ (transform: translate random ±3px trong 5 frames)
- Cột cuối (AGI) cao nhất, phóng lên chậm hơn nhưng MẠNH hơn, kèm **flash nhỏ**

**Beat 3 (750–950): Stats SLAM**
- Con số bắn ra **từ trên xuống** (không phải từ dưới lên)
- Scale từ 3 → 1 + blur → sharp (giống cú đập búa)
- Kèm **shockwave ring** nhỏ quanh mỗi con số

**Beat 4 (950–1050): Screen Crack**
- Overlay crack texture (CSS radial gradient giả vết nứt)
- Toàn bộ scene rung mạnh hơn (±8px)
- Ánh sáng đỏ/cam xen lẫn (danger color shift)

**Beat 5 (1050–1200): Collapse transition sang Seq03**
- Mọi thứ co vào tâm + blur mạnh
- Flash trắng → Seq03

---

## D. File cần thay đổi

| File | Thay đổi |
|------|----------|
| `[NEW] src/components/TitleCard.tsx` | Component title card tái sử dụng |
| `[MODIFY] src/sequences/Seq01_TheHook.tsx` | Thêm Title Card + cải thiện ending transition |
| `[REWRITE] src/sequences/Seq02_DataViz.tsx` | Viết lại hoàn toàn với explosion theme |
| `[MODIFY] src/sequences/Seq03_GlassUI.tsx` | Thêm Title Card + shard entrance |
| `[MODIFY] src/sequences/Seq04_ChaosOrder.tsx` | Thêm Title Card + particle entrance từ viền |
| `[MODIFY] src/sequences/Seq05_Resolution.tsx` | Thêm Title Card |

## E. Thứ tự thực hiện
1. Tạo `TitleCard.tsx`
2. Rewrite `Seq02_DataViz.tsx` (thay đổi lớn nhất)
3. Cập nhật Seq01 (title card + ending)
4. Cập nhật Seq03 (title card + entrance)
5. Cập nhật Seq04 (title card + entrance)
6. Cập nhật Seq05 (title card)
7. Test full video `AutomationEra-FULL`
