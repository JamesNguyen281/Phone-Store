# SỬA LỖI TẠO NGƯỜI DÙNG - HIỂN THỊ N/A

## 🐛 Vấn đề:
Khi tạo nhân viên mới, tài khoản được tạo thành công nhưng hiển thị "N/A" ở cột Họ tên.

## 🔍 Nguyên nhân:
RLS (Row Level Security) trên bảng `nhan_vien` và `khach_hang` chặn việc insert dữ liệu.

## ✅ Giải pháp:

### Bước 1: Chạy migrations để sửa RLS policies

```bash
# Di chuyển vào thư mục project
cd project

# Chạy migration sửa RLS cho nhan_vien
npx supabase migration up --file 20251202100000_fix_nhan_vien_rls.sql

# Chạy migration sửa RLS cho khach_hang
npx supabase migration up --file 20251202100001_fix_khach_hang_rls.sql
```

### Bước 2: Hoặc chạy trực tiếp SQL trong Supabase Dashboard

1. Vào Supabase Dashboard
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy và chạy nội dung từ 2 file migration:
   - `supabase/migrations/20251202100000_fix_nhan_vien_rls.sql`
   - `supabase/migrations/20251202100001_fix_khach_hang_rls.sql`

### Bước 3: Sửa dữ liệu cũ (nếu có user bị N/A)

Nếu đã có user bị thiếu thông tin, bạn cần thêm thủ công:

```sql
-- Thêm thông tin cho nhân viên bị thiếu
INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, chuc_vu)
VALUES (
  'USER_ID_TỪ_BẢNG_TAI_KHOAN',
  'Tên nhân viên',
  'Số điện thoại',
  'Địa chỉ',
  'Chức vụ'
);
```

## 📋 Policies mới:

### Bảng `nhan_vien`:
- ✅ Admin có thể INSERT, UPDATE, SELECT
- ✅ Nhân viên có thể SELECT tất cả, UPDATE chính mình
- ✅ Nhân viên có thể xem thông tin của chính mình

### Bảng `khach_hang`:
- ✅ Admin có thể INSERT, UPDATE, SELECT
- ✅ Khách hàng có thể tự đăng ký (INSERT chính mình)
- ✅ Khách hàng có thể UPDATE thông tin của chính mình
- ✅ Nhân viên có thể SELECT tất cả khách hàng

## 🧪 Kiểm tra:

Sau khi chạy migration, thử tạo user mới:
1. Đăng nhập bằng tài khoản Admin
2. Vào "Người dùng" → "Thêm người dùng"
3. Điền đầy đủ thông tin
4. Tạo tài khoản
5. Kiểm tra xem có hiển thị đầy đủ thông tin không

## 🔧 Debug:

Nếu vẫn lỗi, mở Console (F12) và xem log:
- Tìm dòng "Error creating nhan_vien:" hoặc "Error creating khach_hang:"
- Copy lỗi và báo lại để được hỗ trợ
