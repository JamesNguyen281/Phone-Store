# Hướng dẫn Migration Database từ MySQL sang Supabase

## Tổng quan

Dự án đã được chuyển đổi từ schema MySQL sang Supabase PostgreSQL với các thay đổi chính:

### Cấu trúc bảng mới:

1. **tai_khoan** - Quản lý tài khoản người dùng
2. **nhan_vien** - Thông tin nhân viên (vai_tro: 0=ADMIN, 1=NHAN VIEN)
3. **khach_hang** - Thông tin khách hàng
4. **hang** - Hãng điện thoại (Apple, Samsung, Xiaomi, OPPO, Vivo)
5. **loai_san_pham** - Loại sản phẩm (Điện thoại, Phụ kiện, v.v.)
6. **san_pham** - Sản phẩm (trang_thai: 0=Ngừng, 1=Đang kinh doanh; tinh_trang: 0=Cũ, 1=Mới, 2=Trưng bày)
7. **thuoc_tinh_san_pham** - Thuộc tính chi tiết sản phẩm
8. **hoa_don** - Hóa đơn (phan_loai: 0=Nhập, 1=Bán; trang_thai: 0=Nháp, 1=Đã thanh toán, 2=Hủy)
9. **chi_tiet_hoa_don** - Chi tiết hóa đơn

## Các bước thực hiện

### 1. Cài đặt Supabase CLI (nếu chưa có)

```bash
npm install -g supabase
```

### 2. Khởi tạo Supabase project (nếu chưa có)

```bash
cd project
supabase init
```

### 3. Link với Supabase project của bạn

```bash
supabase link --project-ref your-project-ref
```

Hoặc nếu chạy local:

```bash
supabase start
```

### 4. Áp dụng migrations

Migrations đã được tạo sẵn trong thư mục `supabase/migrations/`:

- `20251201150000_align_with_mysql_schema.sql` - Chuyển đổi schema
- `20251201150100_seed_data.sql` - Dữ liệu mẫu

Chạy lệnh:

```bash
supabase db push
```

Hoặc áp dụng từng migration:

```bash
supabase db reset
```

### 5. Kiểm tra database

```bash
supabase db diff
```

## Dữ liệu mẫu

Sau khi chạy migration, database sẽ có:

### Tài khoản nhân viên:
- **Admin**: admin@example.com / 123456 (vai_tro: 0)
- **Nhân viên 1**: nvban1@example.com / 123456
- **Nhân viên 2**: nvban2@example.com / 123456
- **Nhân viên 3**: nvkho1@example.com / 123456
- **Nhân viên 4**: nvketoan@example.com / 123456

### Tài khoản khách hàng:
- a@example.com - Nguyễn Văn A
- b@example.com - Trần Thị B
- c@example.com - Lê Văn C
- d@example.com - Phạm Thị D
- e@example.com - Hoàng Văn E

### Sản phẩm:
- iPhone 13 128GB - 18,000,000 VNĐ
- Samsung Galaxy A54 - 8,500,000 VNĐ
- Xiaomi Redmi 12 - 4,500,000 VNĐ
- OPPO Reno 10 - 11,000,000 VNĐ
- Vivo Y36 - 6,500,000 VNĐ
- Tai nghe Apple Earpods - 550,000 VNĐ

## Cấu hình môi trường

Đảm bảo file `.env` có các biến sau:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Thay đổi trong code

### TypeScript Types

File `src/types/index.ts` đã được cập nhật với:
- Các type mới phù hợp với schema MySQL
- Backward compatibility với tên cũ (DienThoai, HangDienThoai, v.v.)

### CartContext

File `src/contexts/CartContext.tsx` đã được cập nhật:
- Sử dụng `san_pham` thay vì `dien_thoai`
- Sử dụng `ma_sp` thay vì `id`

### Supabase Client

File `src/lib/supabase.ts` đã được cập nhật với Database types mới.

## Row Level Security (RLS)

Các policies đã được thiết lập:

### Public access:
- Xem tất cả hãng điện thoại
- Xem tất cả loại sản phẩm
- Xem sản phẩm đang kinh doanh (trang_thai = 1)
- Xem thuộc tính sản phẩm

### Authenticated users:
- Khách hàng: Xem đơn hàng của mình
- Nhân viên: Xem và quản lý tất cả đơn hàng, sản phẩm
- Admin: Quản lý hãng, loại sản phẩm

## Chạy ứng dụng

```bash
npm install
npm run dev
```

## Troubleshooting

### Lỗi migration
Nếu gặp lỗi khi chạy migration:

```bash
supabase db reset --debug
```

### Xem logs
```bash
supabase logs
```

### Kiểm tra schema
```bash
supabase db dump --schema public
```

## Lưu ý quan trọng

1. **UUID vs VARCHAR**: Supabase sử dụng UUID cho primary keys thay vì VARCHAR như MySQL
2. **TINYINT vs SMALLINT**: PostgreSQL không có TINYINT, đã chuyển sang SMALLINT
3. **LONGBLOB vs TEXT**: Hình ảnh lưu dưới dạng URL (TEXT) thay vì BLOB
4. **AUTO_INCREMENT**: PostgreSQL sử dụng SERIAL hoặc UUID với gen_random_uuid()
5. **Enum types**: Sử dụng số nguyên (0, 1, 2) thay vì text enum để dễ so sánh

## Các bước tiếp theo

1. Cập nhật các component React để sử dụng types mới
2. Kiểm tra và cập nhật các query Supabase
3. Test các chức năng CRUD
4. Cập nhật authentication flow
5. Test RLS policies

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- Supabase Dashboard: https://app.supabase.com
- Logs trong Supabase Dashboard
- File migrations trong `supabase/migrations/`
