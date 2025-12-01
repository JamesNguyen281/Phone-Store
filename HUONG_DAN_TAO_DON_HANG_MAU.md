# 📦 HƯỚNG DẪN TẠO ĐƠN HÀNG MẪU

## 🎯 Mục đích
Tạo dữ liệu đơn hàng mẫu để test chức năng xem đơn hàng và in hóa đơn.

---

## 📋 Cách 1: Chạy SQL Script (Nhanh nhất)

### Bước 1: Mở Supabase Dashboard
1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng </> ở sidebar)

### Bước 2: Copy và chạy script
1. Mở file `create_sample_order.sql` trong project
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Click **Run** hoặc nhấn `Ctrl + Enter`

### Bước 3: Kiểm tra kết quả
- Nếu thành công, bạn sẽ thấy thông báo: "Đã tạo đơn hàng mẫu thành công!"
- Refresh trang web và vào "Đơn hàng của tôi" để xem

---

## 📋 Cách 2: Đặt hàng thông thường (Đầy đủ nhất)

### Bước 1: Đăng nhập với tài khoản khách hàng
```
Email: customer@example.com (hoặc tài khoản khách hàng bạn đã tạo)
Password: 123456
```

### Bước 2: Mua hàng
1. Vào trang **"Mua sắm"**
2. Chọn sản phẩm bạn muốn
3. Click **"Thêm vào giỏ"**
4. Vào **Giỏ hàng** (icon giỏ hàng ở góc phải)
5. Click **"Đặt hàng"**
6. Điền thông tin giao hàng:
   - Địa chỉ: `789 Láng Hạ, Phường Láng Hạ, Quận Đống Đa, Hà Nội`
   - Số điện thoại: `0987654321`
   - Ghi chú: `Giao hàng giờ hành chính`
7. Click **"Xác nhận đặt hàng"**

### Bước 3: Admin duyệt đơn (nếu cần)
1. Đăng xuất khách hàng
2. Đăng nhập với tài khoản admin
3. Vào **"Đơn hàng"**
4. Tìm đơn hàng vừa tạo
5. Cập nhật trạng thái thành **"Đã giao"**

### Bước 4: Xem đơn hàng
1. Đăng xuất admin
2. Đăng nhập lại với tài khoản khách hàng
3. Vào **"Đơn hàng của tôi"**
4. Click **"Chi tiết"** hoặc **"Hóa đơn"**

---

## 🔍 Kiểm tra dữ liệu trong database

### Kiểm tra có đơn hàng không:
```sql
SELECT 
  dh.id,
  dh.ngay_dat,
  kh.ho_ten,
  dh.tong_tien,
  dh.ma_trang_thai
FROM don_hang dh
LEFT JOIN khach_hang kh ON dh.khach_hang_id = kh.id
WHERE dh.khach_hang_id IS NOT NULL
ORDER BY dh.ngay_dat DESC;
```

### Kiểm tra chi tiết đơn hàng:
```sql
SELECT 
  ct.id,
  ct.don_hang_id,
  dt.ten_sp,
  ct.so_luong,
  ct.gia_tien,
  ct.thanh_tien
FROM chi_tiet_don_hang ct
LEFT JOIN dien_thoai dt ON ct.dien_thoai_id = dt.id
ORDER BY ct.don_hang_id DESC;
```

---

## ⚠️ Xử lý lỗi thường gặp

### Lỗi: "Không tìm thấy khách hàng"
**Nguyên nhân:** Chưa có tài khoản khách hàng trong database

**Giải pháp:**
1. Đăng ký tài khoản mới từ trang web
2. Hoặc chạy SQL:
```sql
-- Tạo tài khoản
INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai, mat_khau)
VALUES ('customer@example.com', 'KHACHHANG', true, '123456')
RETURNING id;

-- Lấy ID vừa tạo và tạo khách hàng
INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
VALUES ('<TAI_KHOAN_ID>', 'Nguyễn Văn A', '0987654321', 'Hà Nội', 'customer@example.com');
```

### Lỗi: "Không tìm thấy sản phẩm"
**Nguyên nhân:** Chưa có sản phẩm trong database

**Giải pháp:**
1. Đăng nhập admin
2. Vào "Quản lý sản phẩm"
3. Thêm ít nhất 1 sản phẩm

### Lỗi: "Cannot read properties of undefined"
**Nguyên nhân:** Đơn hàng có nhưng thiếu chi tiết sản phẩm

**Giải pháp:**
- Chạy lại script `create_sample_order.sql`
- Hoặc đặt hàng mới từ trang web

---

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, hãy:
1. Mở Console (F12)
2. Chụp màn hình lỗi
3. Gửi cho developer để được hỗ trợ
