# KHÔI PHỤC DATABASE VỀ TRẠNG THÁI BAN ĐẦU

## Vấn đề
Migration `20251201150000_align_with_mysql_schema.sql` đã đổi tên các bảng:
- `don_hang` → `hoa_don`
- `chi_tiet_don_hang` → `chi_tiet_hoa_don`
- `dien_thoai` → `san_pham`
- `hang_dien_thoai` → `hang`

Điều này làm code không hoạt động vì code đang dùng tên bảng cũ.

## Giải pháp

### Cách 1: Reset toàn bộ database (KHUYẾN NGHỊ)

1. Vào Supabase Dashboard
2. Vào **Database** → **Migrations**
3. Chọn **Reset database** hoặc xóa tất cả migrations
4. Chạy lại migrations từ đầu (chỉ giữ lại các migration cần thiết)

### Cách 2: Chạy SQL để đổi tên lại

Chạy SQL sau trên Supabase SQL Editor:

```sql
-- Đổi tên bảng về như cũ
ALTER TABLE IF EXISTS hoa_don RENAME TO don_hang;
ALTER TABLE IF EXISTS chi_tiet_hoa_don RENAME TO chi_tiet_don_hang;
ALTER TABLE IF EXISTS san_pham RENAME TO dien_thoai;
ALTER TABLE IF EXISTS hang RENAME TO hang_dien_thoai;

-- Đổi tên cột trong hang_dien_thoai
ALTER TABLE IF EXISTS hang_dien_thoai RENAME COLUMN ma_hang TO id;
```

### Cách 3: Xóa và tạo lại project Supabase

Nếu 2 cách trên không được:
1. Backup dữ liệu quan trọng
2. Xóa project Supabase hiện tại
3. Tạo project mới
4. Chạy lại migrations (đã xóa migration lỗi)

## Sau khi khôi phục

Kiểm tra tên bảng bằng query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Kết quả mong đợi:
- don_hang ✓
- chi_tiet_don_hang ✓
- dien_thoai ✓
- hang_dien_thoai ✓
- khach_hang ✓
- nhan_vien ✓
- tai_khoan ✓
