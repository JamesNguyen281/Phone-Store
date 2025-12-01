# Database Schema Reference

## Sơ đồ quan hệ

```
tai_khoan (1) ----< (1) nhan_vien
tai_khoan (1) ----< (1) khach_hang

hang (1) ----< (*) san_pham
loai_san_pham (1) ----< (*) san_pham

san_pham (1) ----< (1) thuoc_tinh_san_pham
san_pham (1) ----< (*) chi_tiet_hoa_don

nhan_vien (1) ----< (*) hoa_don
khach_hang (1) ----< (*) hoa_don

hoa_don (1) ----< (*) chi_tiet_hoa_don
```

## Chi tiết các bảng

### 1. tai_khoan
Quản lý tài khoản đăng nhập

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | Primary key |
| email | TEXT | Email đăng nhập (unique) |
| ma_vai_tro | TEXT | ADMIN / NHANVIEN / KHACHHANG |
| trang_thai | BOOLEAN | Kích hoạt hay không |
| mat_khau | TEXT | Mật khẩu (nên hash) |
| hinh_anh | TEXT | URL hình đại diện |
| ngay_tao | TIMESTAMP | Ngày tạo |
| ngay_cap_nhat | TIMESTAMP | Ngày cập nhật |

### 2. nhan_vien
Thông tin nhân viên

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | Primary key |
| tai_khoan_id | UUID | FK -> tai_khoan.id |
| ho_ten | TEXT | Họ tên |
| so_dien_thoai | TEXT | Số điện thoại |
| dia_chi | TEXT | Địa chỉ |
| nam_sinh | INTEGER | Năm sinh |
| hinh_anh | TEXT | URL hình ảnh |
| vai_tro | SMALLINT | 0=ADMIN, 1=NHAN VIEN |
| chuc_vu | TEXT | Chức vụ |
| ngay_vao_lam | DATE | Ngày vào làm |

### 3. khach_hang
Thông tin khách hàng

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | Primary key |
| tai_khoan_id | UUID | FK -> tai_khoan.id |
| ho_ten | TEXT | Họ tên (NOT NULL) |
| so_dien_thoai | TEXT | Số điện thoại (NOT NULL) |
| dia_chi | TEXT | Địa chỉ |
| email | TEXT | Email |

### 4. hang
Hãng điện thoại

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ma_hang | UUID | Primary key |
| ten_hang | TEXT | Tên hãng (unique, NOT NULL) |
| hinh_anh | TEXT | URL logo hãng |

**Dữ liệu mẫu**: Apple, Samsung, Xiaomi, OPPO, Vivo

### 5. loai_san_pham
Loại sản phẩm

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ma_loai | UUID | Primary key |
| ten_loai | TEXT | Tên loại (unique, NOT NULL) |

**Dữ liệu mẫu**: Điện thoại, Phụ kiện, Máy tính bảng, Smartwatch, Thiết bị âm thanh

### 6. san_pham
Sản phẩm

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ma_sp | UUID | Primary key |
| ma_hang | UUID | FK -> hang.ma_hang |
| ma_loai | UUID | FK -> loai_san_pham.ma_loai (NOT NULL) |
| ten_sp | TEXT | Tên sản phẩm (NOT NULL) |
| hinh_anh | TEXT | URL hình ảnh |
| tinh_trang | SMALLINT | 0=Cũ, 1=Mới, 2=Trưng bày |
| gia_tien | DECIMAL(15,2) | Giá tiền (NOT NULL) |
| trang_thai | SMALLINT | 0=Ngừng kinh doanh, 1=Đang kinh doanh |
| mo_ta | TEXT | Mô tả sản phẩm |
| so_luong_ton | INTEGER | Số lượng tồn kho |

**Indexes**: ten_sp, ma_hang, ma_loai

### 7. thuoc_tinh_san_pham
Thuộc tính chi tiết sản phẩm

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ma_tt | UUID | Primary key |
| ma_sp | UUID | FK -> san_pham.ma_sp |
| bo_nho | TEXT | Dung lượng bộ nhớ (128GB, 256GB) |
| ram | TEXT | RAM (4GB, 8GB) |
| chip_set | TEXT | Chipset (A15 Bionic, Snapdragon) |
| he_dieu_hanh | TEXT | Hệ điều hành (iOS, Android) |
| man_hinh | TEXT | Màn hình (6.1 inch OLED) |
| dung_luong_pin | TEXT | Pin (3227 mAh) |
| cong_sac | TEXT | Cổng sạc (Lightning, USB-C) |
| loai_phu_kien | TEXT | Loại phụ kiện (nếu là phụ kiện) |

### 8. hoa_don
Hóa đơn (bán và nhập)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ma_hd | UUID | Primary key |
| ma_nv | UUID | FK -> nhan_vien.id (nhân viên xử lý) |
| ma_kh | UUID | FK -> khach_hang.id (NULL nếu là hóa đơn nhập) |
| phan_loai | SMALLINT | 0=Nhập hàng, 1=Bán hàng |
| trang_thai | SMALLINT | 0=Nháp, 1=Đã thanh toán, 2=Hủy |
| ngay_lap | TIMESTAMP | Ngày lập hóa đơn (NOT NULL) |
| ghi_chu | TEXT | Ghi chú |

**Indexes**: ma_nv, ma_kh, ngay_lap

### 9. chi_tiet_hoa_don
Chi tiết hóa đơn

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ma_cthd | UUID | Primary key |
| ma_hd | UUID | FK -> hoa_don.ma_hd |
| ma_sp | UUID | FK -> san_pham.ma_sp |
| so_luong | INTEGER | Số lượng (NOT NULL) |
| don_gia | DECIMAL(15,2) | Đơn giá (NOT NULL) |
| giam_gia | DECIMAL(15,2) | Giảm giá (default 0) |
| bao_hanh | INTEGER | Thời gian bảo hành (tháng, default 0) |

**Indexes**: ma_hd, ma_sp

**Tính thành tiền**: `thanh_tien = (so_luong * don_gia) - giam_gia`

## Enum Values

### vai_tro (nhan_vien)
- `0` - ADMIN (quản trị viên)
- `1` - NHAN VIEN (nhân viên)

### tinh_trang (san_pham)
- `0` - Cũ
- `1` - Mới
- `2` - Trưng bày

### trang_thai (san_pham)
- `0` - Ngừng kinh doanh
- `1` - Đang kinh doanh

### phan_loai (hoa_don)
- `0` - Hóa đơn nhập hàng
- `1` - Hóa đơn bán hàng

### trang_thai (hoa_don)
- `0` - Nháp (chưa hoàn thành)
- `1` - Đã thanh toán
- `2` - Đã hủy

## Row Level Security (RLS)

### Public (không cần đăng nhập)
- ✅ Xem tất cả hãng điện thoại
- ✅ Xem tất cả loại sản phẩm
- ✅ Xem sản phẩm đang kinh doanh (trang_thai = 1)
- ✅ Xem thuộc tính sản phẩm

### Khách hàng (authenticated)
- ✅ Xem đơn hàng của mình
- ✅ Xem chi tiết đơn hàng của mình

### Nhân viên (authenticated + vai_tro = 1)
- ✅ Xem tất cả sản phẩm (kể cả ngừng kinh doanh)
- ✅ Xem tất cả đơn hàng
- ✅ Tạo và cập nhật đơn hàng
- ✅ Quản lý sản phẩm
- ✅ Quản lý thuộc tính sản phẩm

### Admin (authenticated + vai_tro = 0)
- ✅ Tất cả quyền của nhân viên
- ✅ Quản lý hãng điện thoại
- ✅ Quản lý loại sản phẩm
- ✅ Quản lý tài khoản

## Query Examples

### Lấy danh sách sản phẩm với thông tin hãng
```typescript
const { data, error } = await supabase
  .from('san_pham')
  .select(`
    *,
    hang:ma_hang(*),
    loai_san_pham:ma_loai(*),
    thuoc_tinh:thuoc_tinh_san_pham(*)
  `)
  .eq('trang_thai', 1);
```

### Lấy đơn hàng với chi tiết
```typescript
const { data, error } = await supabase
  .from('hoa_don')
  .select(`
    *,
    nhan_vien:ma_nv(*),
    khach_hang:ma_kh(*),
    chi_tiet:chi_tiet_hoa_don(
      *,
      san_pham:ma_sp(*)
    )
  `)
  .eq('ma_kh', khachHangId);
```

### Tạo hóa đơn mới
```typescript
// 1. Tạo hóa đơn
const { data: hoaDon, error: hdError } = await supabase
  .from('hoa_don')
  .insert({
    ma_nv: nhanVienId,
    ma_kh: khachHangId,
    phan_loai: 1, // Bán hàng
    trang_thai: 1, // Đã thanh toán
    ngay_lap: new Date().toISOString(),
    ghi_chu: 'Bán lẻ tại quầy'
  })
  .select()
  .single();

// 2. Thêm chi tiết
const { error: ctError } = await supabase
  .from('chi_tiet_hoa_don')
  .insert([
    {
      ma_hd: hoaDon.ma_hd,
      ma_sp: sanPhamId,
      so_luong: 1,
      don_gia: 18000000,
      giam_gia: 0,
      bao_hanh: 12
    }
  ]);

// 3. Cập nhật tồn kho
const { error: updateError } = await supabase
  .from('san_pham')
  .update({ 
    so_luong_ton: soLuongTon - 1 
  })
  .eq('ma_sp', sanPhamId);
```

## Migrations

Các file migration trong `supabase/migrations/`:

1. `20251201150000_align_with_mysql_schema.sql` - Schema chính
2. `20251201150100_seed_data.sql` - Dữ liệu mẫu

Chạy migrations:
```bash
npm run db:reset
```
