# HAI FORM CHÍNH - QUẢN LÝ BÁN HÀNG VÀ NHẬP HÀNG

## 1. FORM QUẢN LÝ BÁN HÀNG (POSView)
**File:** `src/components/Sales/POSView.tsx`

### Chức năng:
- ✅ Chọn/thêm mới khách hàng
- ✅ Tìm kiếm và chọn sản phẩm từ danh sách
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Nhập số lượng, giảm giá cho từng sản phẩm
- ✅ Tự động tính thành tiền
- ✅ Chọn phương thức thanh toán (Tiền mặt/Chuyển khoản/Thẻ)
- ✅ Ghi chú đơn hàng

### Xử lý dữ liệu:
- Tạo bản ghi trong `don_hang`
- Tạo chi tiết trong `chi_tiet_don_hang`
- Tạo hóa đơn trong `hoa_don` với `phan_loai = 'BAN'`
- **Tự động trừ tồn kho** trong bảng `dien_thoai`

### Truy cập:
Menu "Bán hàng" → Tab "Bán hàng tại quầy"

---

## 2. FORM QUẢN LÝ NHẬP HÀNG (ImportManagement)
**File:** `src/components/Inventory/ImportManagement.tsx`

### Chức năng:
- ✅ Chọn sản phẩm cần nhập
- ✅ Nhập số lượng và đơn giá nhập
- ✅ Tự động tính thành tiền
- ✅ Ghi chú phiếu nhập
- ✅ Xem lịch sử nhập hàng
- ✅ Xem chi tiết phiếu nhập
- ✅ Xóa phiếu nhập (tự động điều chỉnh tồn kho)
- ✅ Hiển thị tồn kho hiện tại

### Xử lý dữ liệu:
- Tạo bản ghi trong `don_hang`
- Tạo chi tiết trong `chi_tiet_don_hang`
- Tạo hóa đơn trong `hoa_don` với `phan_loai = 'NHAP'`
- **Tự động cộng tồn kho** trong bảng `dien_thoai`

### Truy cập:
Menu "Kho hàng" → "Quản lý nhập hàng"

---

## CẤU TRÚC DỮ LIỆU

### Bảng hoa_don:
- `phan_loai = 'BAN'` → Hóa đơn bán hàng
- `phan_loai = 'NHAP'` → Phiếu nhập hàng

### Luồng dữ liệu:
```
BÁN HÀNG:
Khách hàng → Chọn sản phẩm → Giỏ hàng → Thanh toán
→ don_hang + chi_tiet_don_hang + hoa_don (BAN)
→ TRỪ tồn kho

NHẬP HÀNG:
Chọn sản phẩm → Danh sách nhập → Lưu phiếu
→ don_hang + chi_tiet_don_hang + hoa_don (NHAP)
→ CỘNG tồn kho
```

---

## 3. TAB HÀNG TỒN (PendingOrders)
**File:** `src/components/Sales/PendingOrders.tsx`

### Chức năng:
- ✅ Hiển thị tất cả đơn hàng chưa giao (trạng thái ≠ DAGIAO và ≠ DAHUY)
- ✅ Xem chi tiết từng đơn hàng
- ✅ Xác nhận "Đã giao" → Tự động trừ tồn kho → Đơn biến mất khỏi danh sách
- ✅ Hủy đơn hàng → Đơn biến mất khỏi danh sách
- ✅ Kiểm tra tồn kho trước khi giao hàng

### Truy cập:
Menu "Bán hàng" → Tab "Hàng tồn"

---

## TRẠNG THÁI HIỆN TẠI
✅ Cả 2 form chính đã hoạt động đầy đủ
✅ Tab "Hàng tồn" hiển thị đơn hàng chưa giao
✅ Tự động trừ tồn kho khi xác nhận đã giao
✅ Đơn hàng tự động biến mất khỏi "Hàng tồn" khi đã giao
✅ Không có lỗi TypeScript
✅ Dev server đang chạy
✅ Đã xóa toàn bộ phần Nhà cung cấp (bảng, component, UI)
✅ Các tab khác không bị ảnh hưởng
