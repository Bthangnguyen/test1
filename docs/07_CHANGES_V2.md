# Kế Hoạch Chỉnh Sửa v2

## Tóm tắt thay đổi

### 1. Scene 1: Xóa TitleCard
- Bỏ `<TitleCard>` khỏi Seq01
- Giữ nguyên nội dung SPEED/DATA/AUTONOMY + subtitle

### 2. Scene 2: Xóa TitleCard + Thêm typing subtitle
- Bỏ `<TitleCard>` khỏi Seq02
- Thêm dòng typing ở dưới: `"What else can it do?"` (cursor dot nhấp nháy, giống style Seq01 subtitle)
- Xuất hiện sau khi tất cả bars + stats đã hiện xong (~frame 700)

### 3. Transition 2→3: Glass shatter → reassemble
- Cuối Seq02: Các cột biểu đồ VỠ thành hàng trăm mảnh nhỏ (glass shards), bay tán loạn
- Đầu Seq03: Các mảnh kính từ tán loạn → hội tụ lại → xếp thành 3 Glass Panel
- Kỹ thuật: Tạo array ~80 mảnh vỡ, animate position từ random → vị trí panel

### 4. Scene 3: Xóa TitleCard + typing trực tiếp trên scene
- Bỏ `<TitleCard>` khỏi Seq03
- Thêm dòng typing ở góc trên: `"The system that builds itself"` (cursor dot)
- Xuất hiện sau khi panels đã hình thành (~frame 500)

### 5. Scene 4: Black hole vortex
- Bỏ `<TitleCard>` khỏi Seq04
- Thay đổi physics: Particles bị HÚT vào vòng xoáy spiral (không xếp grid rồi xoáy)
- Vòng xoáy co dần → tất cả hạt bị nuốt vào tâm
- Khi nuốt xong → NỔ ra text "THE FUTURE" cực to
- Text "THE FUTURE" giữ 2 giây → fade → chuyển sang Seq05 "THE FUTURE IS AGENTIC"

### 6. Scene 5: Giữ nguyên (đã có "THE FUTURE IS AGENTIC")
- Bỏ TitleCard

## Thứ tự thực hiện
1. Xóa TitleCard khỏi Seq01, Seq03, Seq04, Seq05
2. Sửa Seq02: xóa TitleCard + thêm typing subtitle
3. Sửa Seq03: thêm typing trên scene + glass shard entrance
4. Rewrite Seq04: black hole vortex + "THE FUTURE" explosion
