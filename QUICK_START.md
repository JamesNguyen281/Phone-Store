# Quick Start Guide - Hệ thống Quản lý Bán Điện thoại

## 🚀 Bắt đầu nhanh

### 1. Cài đặt dependencies

```bash
cd project
npm install
```

### 2. Cấu hình Supabase

#### Option A: Sử dụng Supabase Cloud

1. Tạo project tại [supabase.com](https://supabase.com)
2. Copy URL và Anon Key
3. Tạo file `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Áp dụng migrations:

```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Link với project
supabase link --project-ref your-project-ref

# Push migrations
npm run db:push
```

#### Option B: Chạy Supabase Local

```bash
# Khởi động Supabase local
npm run db:start

# Migrations sẽ tự động được áp dụng
```

File `.env`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### 3. Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt: http://localhost:5173

## 📊 Dữ liệu mẫu

Sau khi chạy migrations, bạn có thể đăng nhập với:

### Tài khoản Admin
- Email: `admin@example.com`
- Password: `123456`

### Tài khoản Nhân viên
- Email: `nvban1@example.com` / Password: `123456`
- Email: `nvban2@example.com` / Password: `123456`
- Email: `nvkho1@example.com` / Password: `123456`
- Email: `nvketoan@example.com` / Password: `123456`

### Tài khoản Khách hàng
- Email: `a@example.com` - Nguyễn Văn A
- Email: `b@example.com` - Trần Thị B
- Email: `c@example.com` - Lê Văn C
- Email: `d@example.com` - Phạm Thị D
- Email: `e@example.com` - Hoàng Văn E

## 🛠️ Scripts hữu ích

```bash
# Development
npm run dev              # Chạy dev server
npm run build            # Build production
npm run preview          # Preview production build
npm run typecheck        # Kiểm tra TypeScript

# Database
npm run db:start         # Khởi động Supabase local
npm run db:stop          # Dừng Supabase local
npm run db:reset         # Reset database và chạy lại migrations
npm run db:push          # Push migrations lên Supabase
npm run db:diff          # Xem sự khác biệt schema
npm run db:status        # Kiểm tra trạng thái Supabase
```

## 📁 Cấu trúc thư mục

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Đăng nhập, đăng ký
│   │   ├── Products/       # Quản lý sản phẩm
│   │   ├── Orders/         # Quản lý đơn hàng
│   │   ├── Shop/           # Giao diện shop
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Quản lý authentication
│   │   └── CartContext.tsx # Quản lý giỏ hàng
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   └── database-helpers.ts # Helper functions
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── App.tsx             # Main app component
├── supabase/
│   └── migrations/         # Database migrations
├── .env                    # Environment variables
└── package.json
```

## 🔑 Các tính năng chính

### Cho Khách hàng
- ✅ Xem danh sách sản phẩm
- ✅ Tìm kiếm, lọc sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng

### Cho Nhân viên
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý tồn kho
- ✅ Tạo hóa đơn bán/nhập
- ✅ Xem thống kê

### Cho Admin
- ✅ Tất cả quyền của nhân viên
- ✅ Quản lý hãng điện thoại
- ✅ Quản lý loại sản phẩm
- ✅ Quản lý tài khoản
- ✅ Xem báo cáo chi tiết

## 💡 Sử dụng Database Helpers

```typescript
import {
  getSanPhamDangKinhDoanh,
  timKiemSanPham,
  taoHoaDonBanHang,
  thongKeDoanhThu,
} from './lib/database-helpers';

// Lấy sản phẩm
const sanPham = await getSanPhamDangKinhDoanh();

// Tìm kiếm
const ketQua = await timKiemSanPham('iPhone');

// Tạo hóa đơn
const hoaDon = await taoHoaDonBanHang({
  maNv: 'nhan-vien-id',
  maKh: 'khach-hang-id',
  ghiChu: 'Bán lẻ',
  sanPham: [
    {
      maSp: 'san-pham-id',
      soLuong: 1,
      donGia: 18000000,
      giamGia: 0,
      baoHanh: 12,
    },
  ],
});

// Thống kê
const doanhThu = await thongKeDoanhThu('2025-01-01', '2025-01-31');
```

## 🔒 Row Level Security

Database đã được cấu hình RLS để bảo mật:

- **Public**: Xem sản phẩm, hãng, loại sản phẩm
- **Khách hàng**: Xem đơn hàng của mình
- **Nhân viên**: Quản lý sản phẩm, đơn hàng
- **Admin**: Toàn quyền

## 📚 Tài liệu tham khảo

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Chi tiết schema
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Hướng dẫn migration
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

## ❓ Troubleshooting

### Lỗi kết nối Supabase
```bash
# Kiểm tra .env file
cat .env

# Kiểm tra Supabase status
npm run db:status
```

### Lỗi migrations
```bash
# Reset database
npm run db:reset

# Hoặc xem logs
supabase logs
```

### Lỗi TypeScript
```bash
# Kiểm tra types
npm run typecheck
```

## 🎯 Các bước tiếp theo

1. ✅ Cài đặt và chạy project
2. ✅ Đăng nhập với tài khoản mẫu
3. ✅ Khám phá các tính năng
4. 📝 Tùy chỉnh giao diện
5. 📝 Thêm tính năng mới
6. 🚀 Deploy lên production

## 🤝 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `supabase logs`
2. Xem Supabase Dashboard
3. Kiểm tra browser console
4. Đọc tài liệu trong thư mục project

---

**Chúc bạn code vui vẻ! 🎉**
