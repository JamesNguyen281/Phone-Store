# ✅ CHECKLIST SỬA LỖI NHANH

## ⚠️ Vấn đề hiện tại
- [ ] Không thấy đơn hàng trong tab "Quản lý đơn hàng"
- [ ] Đơn hàng mới từ trang khách không hiển thị
- [ ] Lỗi "column don_hang.ngay_lao does not exist"

## 🔧 Nguyên nhân
Migration đã đổi tên bảng `don_hang` → `hoa_don` làm code không hoạt động.

## 🚀 Giải pháp (5 phút)

### 1️⃣ Mở Supabase SQL Editor
- Vào https://supabase.com → Project → SQL Editor

### 2️⃣ Chạy script
- Mở file `restore-table-names.sql`
- Copy toàn bộ nội dung
- Paste vào SQL Editor
- Click **Run**

### 3️⃣ Kiểm tra kết quả
Bạn sẽ thấy:
```
✓ Đã đổi hoa_don -> don_hang
✓ Đã đổi chi_tiet_hoa_don -> chi_tiet_don_hang
✓ Đã đổi san_pham -> dien_thoai
✓ Đã đổi hang -> hang_dien_thoai
✓ Hoàn thành! Tên bảng đã được khôi phục.
```

### 4️⃣ Refresh trang web
- Ctrl + Shift + R (hard refresh)
- Vào "Quản lý đơn hàng"
- Click "Làm mới"

## ✅ Kết quả
- [x] Đơn hàng hiển thị đầy đủ
- [x] Có thể tạo đơn mới
- [x] Tab "Hàng tồn" hoạt động
- [x] Đồng bộ với trang khách

## 📝 Lưu ý
- Migration lỗi đã được xóa: `20251201150000_align_with_mysql_schema.sql`
- Code đang dùng tên bảng gốc: `don_hang`, `chi_tiet_don_hang`, `dien_thoai`, `hang_dien_thoai`
- Không cần thay đổi code
