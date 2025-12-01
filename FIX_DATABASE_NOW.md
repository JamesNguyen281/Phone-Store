# SỬA LỖI DATABASE NGAY

## Vấn đề
Trang web không hiển thị đơn hàng vì tên bảng trong database đã bị đổi.

## Giải pháp - Làm theo 3 bước:

### Bước 1: Mở Supabase Dashboard
1. Vào https://supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng </> bên trái)

### Bước 2: Chạy script khôi phục
1. Click **New query**
2. Copy toàn bộ nội dung file `restore-table-names.sql`
3. Paste vào SQL Editor
4. Click **Run** (hoặc Ctrl+Enter)
5. Đợi kết quả hiển thị "Hoàn thành! Tên bảng đã được khôi phục."

### Bước 3: Refresh trang web
1. Quay lại trang web
2. Hard refresh (Ctrl + Shift + R)
3. Vào tab "Quản lý đơn hàng"
4. Click "Làm mới"

## Kết quả mong đợi
- Đơn hàng hiển thị bình thường
- Tab "Hàng tồn" hoạt động
- Có thể tạo đơn hàng mới từ trang khách

## Nếu vẫn lỗi
Liên hệ để được hỗ trợ thêm.
