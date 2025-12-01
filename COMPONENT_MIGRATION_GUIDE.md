# Hướng dẫn Migration Components

## Tổng quan

Các component hiện tại đang sử dụng tên cũ từ schema cũ. Để tương thích ngược, chúng ta đã tạo các type aliases trong `src/types/index.ts`.

## Các thay đổi chính

### 1. Tên bảng và trường

| Cũ | Mới | Ghi chú |
|----|-----|---------|
| `dien_thoai` | `san_pham` | Bảng sản phẩm |
| `hang_dien_thoai` | `hang` | Bảng hãng |
| `don_hang` | `hoa_don` | Bảng hóa đơn |
| `chi_tiet_don_hang` | `chi_tiet_hoa_don` | Chi tiết hóa đơn |
| `id` | `ma_sp`, `ma_hang`, etc. | Primary keys |
| `hang_id` | `ma_hang` | Foreign key |
| `ten_san_pham` | `ten_sp` | Tên sản phẩm |
| `gia_ban` | `gia_tien` | Giá tiền |
| `hinh_anh_url` | `hinh_anh` | Hình ảnh |
| `ma_trang_thai` | `trang_thai` | Trạng thái (số) |
| `ngay_dat` | `ngay_lap` | Ngày lập |

### 2. Enum values

#### Trạng thái hóa đơn
- Cũ: `'DANGXULY' | 'DAGIAO' | 'DAHUY'` (text)
- Mới: `0 | 1 | 2` (number)
  - 0 = Nháp
  - 1 = Đã thanh toán
  - 2 = Hủy

#### Tình trạng sản phẩm
- Cũ: `'MOI' | 'CU' | 'TRUNG_BAY'` (text)
- Mới: `0 | 1 | 2` (number)
  - 0 = Cũ
  - 1 = Mới
  - 2 = Trưng bày

## Cách sửa từng loại lỗi

### Lỗi 1: Property 'id' does not exist

**Lỗi:**
```typescript
product.id
hang.id
order.id
```

**Sửa:**
```typescript
product.ma_sp
hang.ma_hang
order.ma_hd
```

### Lỗi 2: Property 'hang_dien_thoai' does not exist

**Lỗi:**
```typescript
product.hang_dien_thoai?.ten_hang
```

**Sửa:**
```typescript
product.hang?.ten_hang
```

### Lỗi 3: Property 'ma_trang_thai' does not exist

**Lỗi:**
```typescript
order.ma_trang_thai === 'DAGIAO'
```

**Sửa:**
```typescript
order.trang_thai === 1 // 1 = Đã thanh toán
```

### Lỗi 4: Property 'dien_thoai' does not exist on CartItem

**Lỗi:**
```typescript
item.dien_thoai.id
item.dien_thoai.gia_tien
```

**Sửa:**
```typescript
item.san_pham.ma_sp || item.dien_thoai?.id
item.san_pham.gia_tien || item.dien_thoai?.gia_tien
```

### Lỗi 5: Các trường đã bị xóa

Các trường sau đã bị xóa khỏi `san_pham`:
- `chip` → Chuyển sang `thuoc_tinh_san_pham.chip_set`
- `ram` → Chuyển sang `thuoc_tinh_san_pham.ram`
- `bo_nho` → Chuyển sang `thuoc_tinh_san_pham.bo_nho`
- `man_hinh` → Chuyển sang `thuoc_tinh_san_pham.man_hinh`
- `camera` → Không còn (dùng `thuoc_tinh_san_pham`)
- `pin` → Chuyển sang `thuoc_tinh_san_pham.dung_luong_pin`
- `mau_sac` → Đã xóa

**Sửa:**
```typescript
// Cũ
product.chip
product.ram

// Mới - cần load thuoc_tinh
const { data } = await supabase
  .from('san_pham')
  .select(`
    *,
    thuoc_tinh:thuoc_tinh_san_pham(*)
  `)
  .eq('ma_sp', productId)
  .single();

// Sử dụng
data.thuoc_tinh?.chip_set
data.thuoc_tinh?.ram
```

### Lỗi 6: Các trường đã bị xóa khỏi hoa_don

Các trường sau đã bị xóa:
- `tong_tien` → Tính từ chi_tiet_hoa_don
- `dia_chi_giao_hang` → Đã xóa
- `so_dien_thoai_nhan` → Đã xóa
- `email_nhan` → Đã xóa
- `ngay_cap_nhat` → Đã xóa

**Sửa:**
```typescript
// Tính tổng tiền
const tongTien = chiTiet.reduce((total, item) => {
  return total + (item.so_luong * item.don_gia - item.giam_gia);
}, 0);

// Địa chỉ giao hàng - lấy từ khách hàng
order.khach_hang?.dia_chi
```

## Ví dụ migration component

### Before (Cũ):
```typescript
// ProductCard.tsx
const ProductCard = ({ product }: { product: DienThoai }) => {
  return (
    <div>
      <h3>{product.ten_san_pham}</h3>
      <p>{product.hang_dien_thoai?.ten_hang}</p>
      <p>{product.gia_ban.toLocaleString()} đ</p>
      <p>RAM: {product.ram}</p>
      <p>Chip: {product.chip}</p>
      <button onClick={() => addToCart(product.id)}>
        Thêm vào giỏ
      </button>
    </div>
  );
};
```

### After (Mới):
```typescript
// ProductCard.tsx
const ProductCard = ({ product }: { product: SanPham }) => {
  return (
    <div>
      <h3>{product.ten_sp}</h3>
      <p>{product.hang?.ten_hang}</p>
      <p>{product.gia_tien.toLocaleString()} đ</p>
      <p>RAM: {product.thuoc_tinh?.ram}</p>
      <p>Chip: {product.thuoc_tinh?.chip_set}</p>
      <button onClick={() => addToCart(product.ma_sp)}>
        Thêm vào giỏ
      </button>
    </div>
  );
};
```

## Query patterns

### Lấy sản phẩm với đầy đủ thông tin

```typescript
const { data: products } = await supabase
  .from('san_pham')
  .select(`
    *,
    hang:ma_hang(*),
    loai_san_pham:ma_loai(*),
    thuoc_tinh:thuoc_tinh_san_pham(*)
  `)
  .eq('trang_thai', 1);
```

### Lấy hóa đơn với chi tiết

```typescript
const { data: orders } = await supabase
  .from('hoa_don')
  .select(`
    *,
    nhan_vien:ma_nv(*),
    khach_hang:ma_kh(*),
    chi_tiet:chi_tiet_hoa_don(
      *,
      san_pham:ma_sp(
        *,
        hang:ma_hang(*)
      )
    )
  `);
```

## Checklist migration

Để migrate một component:

- [ ] Đổi import types từ `DienThoai` sang `SanPham`
- [ ] Đổi `product.id` thành `product.ma_sp`
- [ ] Đổi `product.hang_dien_thoai` thành `product.hang`
- [ ] Đổi `product.ten_san_pham` thành `product.ten_sp`
- [ ] Đổi `product.gia_ban` thành `product.gia_tien`
- [ ] Đổi `product.hinh_anh_url` thành `product.hinh_anh`
- [ ] Chuyển các trường chi tiết sang `product.thuoc_tinh.*`
- [ ] Đổi `order.ma_trang_thai` thành `order.trang_thai` (number)
- [ ] Đổi `order.ngay_dat` thành `order.ngay_lap`
- [ ] Xóa các trường không còn tồn tại
- [ ] Test component sau khi sửa

## Tạm thời giữ code cũ

Nếu muốn giữ code cũ hoạt động tạm thời, sử dụng type guards:

```typescript
const getProductId = (product: SanPham | DienThoai) => {
  return (product as any).ma_sp || (product as any).id;
};

const getProductName = (product: SanPham | DienThoai) => {
  return (product as any).ten_sp || (product as any).ten_san_pham;
};

const getProductPrice = (product: SanPham | DienThoai) => {
  return (product as any).gia_tien || (product as any).gia_ban;
};
```

## Công cụ hỗ trợ

### Find & Replace trong VS Code

1. Mở Find & Replace (Ctrl+Shift+H)
2. Enable regex (Alt+R)
3. Sử dụng các pattern sau:

```regex
# Tìm: product\.id
# Thay: product.ma_sp

# Tìm: \.hang_dien_thoai
# Thay: .hang

# Tìm: \.ten_san_pham
# Thay: .ten_sp

# Tìm: \.gia_ban
# Thay: .gia_tien

# Tìm: \.ma_trang_thai
# Thay: .trang_thai
```

## Lưu ý quan trọng

1. **Backup code** trước khi migration
2. **Test từng component** sau khi sửa
3. **Kiểm tra TypeScript errors**: `npm run typecheck`
4. **Test runtime** trong browser
5. **Kiểm tra database queries** hoạt động đúng

## Hỗ trợ

Nếu gặp lỗi không biết cách sửa:
1. Kiểm tra file `src/types/index.ts` để xem type definitions
2. Xem `DATABASE_SCHEMA.md` để hiểu cấu trúc database
3. Tham khảo `src/lib/database-helpers.ts` để xem query patterns
4. Chạy `npm run typecheck` để xem tất cả lỗi TypeScript
